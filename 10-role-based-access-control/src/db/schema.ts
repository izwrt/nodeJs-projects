import { pgTable, text, uuid, varchar, timestamp, pgEnum } from "drizzle-orm/pg-core";

export const roleEnum = pgEnum("role",["USER", "ADMIN"]);

export const usersTable = pgTable("user", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: text("password").notNull(),
  role: roleEnum("role").notNull().default("USER"),
  salt: text().notNull()
});

export const userSessions = pgTable("user_sessions", {
  id:uuid("id").primaryKey().defaultRandom(),
  userId: uuid().notNull().references(() => usersTable.id),
  createdAt: timestamp().defaultNow().notNull()
});