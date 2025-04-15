import { relations } from "drizzle-orm";
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";

export const articles = sqliteTable("articles", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  title: text("title").notNull(),
  name: text("name").notNull(),
  link: text("link").notNull(),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .defaultNow(),
});

export const table = {
  articles,
} as const;

export type Table = typeof table;
