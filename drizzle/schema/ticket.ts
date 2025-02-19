import { sql } from 'drizzle-orm';
import { pgTable, varchar, text, timestamp } from 'drizzle-orm/pg-core';
import { Post } from './post';
import { service } from './service';

export const ticket = pgTable("ticket", {
  id: varchar("id", { length: 36 }).primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id", { length: 36 }).notNull().references(() => service.id, { onDelete: "cascade" }),
  num: text("num").notNull().unique(),
  nameComplete: text("name_complete").notNull(),
  status: text("status").default("PENDING"),
  createdAt: timestamp("created_at").defaultNow(),
  postId: varchar("post_id", { length: 36 }).references(() => Post.id, { onDelete: "cascade" }),
  postName: text("post_name"),
});
