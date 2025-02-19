import { sql } from 'drizzle-orm';
import { pgTable, varchar, integer, text } from 'drizzle-orm/pg-core';
import { company } from './company';

export const service = pgTable("service", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  avgTime: integer("avg_time").notNull(),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => company.id, { onDelete: "cascade" }),
});
