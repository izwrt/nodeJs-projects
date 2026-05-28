import "dotenv/config";
import { eq, sql } from "drizzle-orm";
import type { Request, Response } from "express";
import db from "../db/index.js";
import { authorTable, booksTable } from "../drizzle/schema.js";

type CreateBookBody = {
  title: string;
  authorId: string;      // uuid string
  description?: string;
};

//Interfaces
export const getBooks = async (req: Request, res: Response) => {
  try{
      const search = req.query.search;

      if (search) {
        const books = await db
        .select().from(booksTable)
        .where(sql`to_tsvector('english', ${booksTable.title}) @@ to_tsquery('english', ${search})`);

        return res.json(books)
      }

      const books = await db.select().from(booksTable);
      res.setHeader("X-App-Version", "1.0");
      res.status(200).json(books);
  } catch (error) {
    console.error("getBooks", error);
  }

}

export const getBookById = async (req: Request<{ id: string }>, res: Response) => {
  try {
    const id = req.params.id;
    if (!id) return res.status(400).json({ error: "id is required" });

    // Using leftJoin to grab the book AND its related author details in one efficient query
    const [book] = await db.select().from(booksTable).leftJoin(authorTable, eq(booksTable.authorId, authorTable.id)).where(eq(booksTable.id, id)).limit(1);
    
    if (!book) return res.status(404).json({ error: "Book not found" });
    return res.status(200).json(book);
  } catch (error) {
    console.error("getBookById", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const postBook = async (req: Request<CreateBookBody>, res:Response) => {
  const { title, authorId, description} = req.body;

  if(!title?.trim() || !authorId?.trim()){
    return res.status(400).json( {error: 'Field required.'})
  } 

  try{
    // We use .returning() to get the generated UUID back from the database
    // Drizzle returning() always returns an array, so we destructure the first item: [result]
    const [result] = await db.insert(booksTable).values({ title, authorId, description }).returning({ id: booksTable.id });

    if (!result) return res.status(500).json({ error: "Insert failed" });
    
    return res.status(201).json({ message: "Book is created success", id: result.id });
  } catch(error){
    console.error("Error on inserting the data", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

export const deleteBookById = async (req: Request<{ id: string }>, res:Response) => {
  const id = req.params.id;
  if (!id) return res.status(400).json({ error: "id is required" });

  try{
    const [result] = await db
      .delete(booksTable)
      .where(eq(booksTable.id, id))
      .returning({ id: booksTable.id });

    if (!result) return res.status(404).json({ error: "Book not found." });

    return res.status(200).json({ message: `The book with id ${result.id} has been deleted.` });
  }catch(err){
    console.error("Error on deleting please enter the valid Id", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}