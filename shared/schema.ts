import { pgTable, text, serial, integer } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const purchases = pgTable("purchases", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  price: integer("price").notNull(), // Store price in cents
  link: text("link").notNull(),
  order: integer("order").notNull(),
});

export const insertPurchaseSchema = createInsertSchema(purchases)
  .omit({ id: true })
  .extend({
    link: z.string().url("Please enter a valid URL"),
    price: z.number().min(0, "Price must be positive"),
  });

export type InsertPurchase = z.infer<typeof insertPurchaseSchema>;
export type Purchase = typeof purchases.$inferSelect;