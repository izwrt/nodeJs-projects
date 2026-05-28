import { index, pgTable, text } from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const t = pgTable('t', { a: text() }, (table) => [
  index('idx').using('gin', sql`to_tsvector('english', ${table.a})`)
]);