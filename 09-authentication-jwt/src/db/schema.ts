import { pgTable, text, uuid, varchar, timestamp } from "drizzle-orm/pg-core";

export const usersTable = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  salt: text().notNull()
});

export const userSessions = pgTable("user_sessions", {
  id:uuid("id").primaryKey().defaultRandom(),
  userId: uuid().notNull().references(() => usersTable.id),
  createdAt: timestamp().defaultNow().notNull()
});