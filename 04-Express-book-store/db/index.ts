import { drizzle } from "drizzle-orm/node-postgres";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const db = drizzle(connectionString);
export default db;