import { drizzle } from 'drizzle-orm/node-postgres';

const connection = process.env.DATABASE_URL;
if(!connection) {
    throw new Error("Database URL is not set")
}

const db = drizzle(connection);

export default db;
