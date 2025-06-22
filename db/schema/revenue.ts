import { pgTable, text, integer } from 'drizzle-orm/pg-core';

export const revenue = pgTable('revenue', {
  month: text('month').primaryKey(), // Assuming month is unique and acts as a key (e.g., 'Jan', 'Feb')
  revenue: integer('revenue').notNull(), // Storing as integer (e.g., cents)
});
