import { integer, pgTable, uuid, varchar, text, index } from "drizzle-orm/pg-core";
import { sql } from 'drizzle-orm';
// Keep schemas centralized here for drizzle-kit.
// (Avoid importing from TS files that use `.js` import specifiers.)

export const userTable = pgTable("users", {
  id: integer().primaryKey(),
  name: varchar({ length: 255 }).notNull(),
  email: varchar({ length: 255 }).notNull().unique(),
});

export const authorTable = pgTable("author", {
  id: uuid().primaryKey().defaultRandom(),
  firstName: varchar({ length: 55 }).notNull(),
  lastName: varchar({ length: 55 }).notNull(),
  email: varchar({ length: 255 }).unique().notNull(),
}, (table) => ({
  // GIN Index for Full-Text Search on the author's first name
  searchIndexOnFistName: index("index_first_name_idx").using('gin', sql`to_tsvector('english', ${table.firstName})`)
}));

export const booksTable = pgTable("books", {
  id: uuid().primaryKey().defaultRandom(),
  title: varchar({ length: 85 }).notNull(),
  description: text(),
  // Foreign Key constraint: A book MUST belong to a valid author in authorTable
  authorId: uuid().references(() => authorTable.id),
}, (table) => ({
  // GIN Index for lightning-fast keyword searches on book titles
  searchIndexOnTitle: index("books_title_idx").using('gin', sql`to_tsvector('english', ${table.title})`),
}));
