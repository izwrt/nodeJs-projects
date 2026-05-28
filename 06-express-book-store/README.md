# 04-Express-book-store

This project is a RESTful API built with **Express.js**, **TypeScript**, and **Drizzle ORM** (using PostgreSQL). It demonstrates core backend engineering concepts like database design, relational mapping, and Full-Text Search.

## What You Will Learn Here

### 1. Drizzle ORM & Schema Design (`drizzle/schema.ts`)
We define our tables entirely in TypeScript using Drizzle.
- **UUIDs**: We use UUIDs instead of standard auto-incrementing integers for security and scale (`id: uuid().primaryKey().defaultRandom()`).
- **Foreign Keys**: The `books` table references the `author` table, enforcing data integrity (`authorId: uuid().references(() => authorTable.id)`). This prevents you from adding a book for an author that doesn't exist, and prevents deleting an author who still has books.

### 2. Indexes & Full-Text Search
In `drizzle/schema.ts`, you will see custom GIN indexes:
```ts
index("books_title_idx").using('gin', sql`to_tsvector('english', ${table.title})`)
```
This is a Generalized Inverted Index (GIN). Unlike standard B-Tree indexes (which are good for exact matches like `id = 5`), a GIN index breaks text down into tokens (words). This allows for lightning-fast keyword searches (e.g., searching "magic" instantly finds "Harry Potter and the Magic Wand") even on tables with millions of rows.

### 3. Controller Logic & Error Handling
Look inside `controllers/` to see how we handle HTTP requests safely:
- **Separation of Concerns**: The difference between a `400 Bad Request` (the user messed up, e.g., missing an ID) and a `404 Not Found` (the request was valid, but the database returned no data).
- **Array Destructuring**: Queries like `.returning()` always return an array, even if you insert/delete just one row. We use `const [result] = ...` to easily grab that single row.
- **JOINs**: In `book.controller.ts`, we use `.leftJoin()` to combine Books and Authors in a single query, which is much faster than making two separate database calls.

## How to Run

1. Make sure your PostgreSQL database is running (e.g., via Docker).
2. Set your `DATABASE_URL` in a `.env` file.
3. Push the schema to the database:
   ```bash
   npm run db:push
   ```
4. Start the server:
   ```bash
   npm start
   ```