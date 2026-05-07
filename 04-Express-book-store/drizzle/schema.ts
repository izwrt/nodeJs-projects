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
});

export const booksTable = pgTable("books", {
  id: uuid().primaryKey().defaultRandom(),
  title: varchar({ length: 85 }).notNull(),
  description: text(),
  authorId: uuid().references(() => authorTable.id),
}, (table) => ({
  searchIndexOnTitle: index("books_title_idx").using('gin', sql`to_tsvector('english', ${table.title})`),
}));

