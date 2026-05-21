import { uuid, integer, pgTable, varchar } from "drizzle-orm/pg-core";

export const usersTable = pgTable("user", {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length:255 }).notNull(),
    age: integer().notNull(),
    email: varchar({ length: 255 }).notNull().unique()
});