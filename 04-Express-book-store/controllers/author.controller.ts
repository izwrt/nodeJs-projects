import type{Request, Response} from 'express';
import 'dotenv/config';
import db from '../db/index.js';
import { authorTable } from '../drizzle/schema.js';
import { eq } from 'drizzle-orm';

type AuthorDetails = {
    firstName: string,
    lastName: string,
    email: string,
}

export const getAllAuthors = async(req: Request, res: Response) => {
    try{
    const Authors = await db.select().from(authorTable);

    return res.status(200).json(Authors);
    } catch (err){
        console.error('Failed to fetch authors', err);
        return res.status(500).json({ error: "Internal server error" });
    }
    
}

export const getAutherById = async(req: Request<{id: string}>, res: Response) => {
    const id = req.params.id;
    
    try{
        const [Author] = await db
        .select()
        .from(authorTable)
        .where(eq(authorTable.id, id));

        if(!Author) return res.status(400).json({error: "Author not found"});

        return res.status(200).json(Author);
    }catch (err){
        console.error("Error on fetching Author for: getAutherById", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const postAuthor = async (req: Request<{}, {}, AuthorDetails>, res: Response) => {
    const authorDetails = req.body;

    if (!authorDetails.firstName || !authorDetails.lastName || !authorDetails.email) {
        return res.status(400).json({ error: "Missing required fields (firstName, lastName, email)" });
    }

    try {
         const [result] = await db
         .insert(authorTable)
         .values(authorDetails)
         .returning({id: authorTable.id})

        if (!result) return res.status(500).json({ error: "Failed to insert author" }); 
        
        return res.status(201).json({ message: "The author had been added", id: result.id })
    } catch (err) {
        console.error("Error while inserting the data.", err);
        return res.status(500).json({ error: "Internal server error" });
    }
}

export const deleteAuthor = async(req: Request<{id: string}>, res: Response) => {
    const { id } = req.params;

    if(!id) return res.status(400).json({ error: "id is required" });

    try{
        const [result] = await db.delete(authorTable).where(eq(authorTable.id, id)).returning({id: authorTable.id});

    if (!result) return res.status(400).json({ error: "Author not found." });

    return res.status(200).json({ message: `The auther with id ${result.id} has been deleted.` });
    } catch(err) {
        console.error('Error during the deletion', err);
        return res.status(500).json( {message: "Internal server error" })
    }
}