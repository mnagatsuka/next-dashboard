import { pgTable, text, timestamp, integer } from 'drizzle-orm/pg-core';
import { customers } from './customers';

// Ensure invoiceStatusEnum is NOT here
// Removed: export const invoiceStatusEnum = pgEnum('invoice_status', ['pending', 'paid']);

export const invoices = pgTable('invoices', {
  id: text('id').primaryKey().notNull(),
  customer_id: text('customer_id')
    .notNull()
    .references(() => customers.id, { onDelete: 'cascade' }),
  amount: integer('amount').notNull(),
  date: timestamp('date', { mode: 'string' }).notNull(),
  status: text('status').notNull(), // <--- MUST BE TEXT
});