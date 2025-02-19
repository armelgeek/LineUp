import { sql } from "drizzle-orm";
import { pgTable, varchar, text, timestamp } from "drizzle-orm/pg-core";
import { company } from "./company";

export const post = pgTable("post", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  companyId: varchar("company_id", { length: 36 }).notNull().references(() => company.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at").defaultNow(),
});