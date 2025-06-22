import { relations } from 'drizzle-orm';
import { users } from './users';
import { customers } from './customers';
import { invoices } from './invoices';

export const usersRelations = relations(users, ({ many }) => ({
  // Define user relations here if any, e.g., orders: many(orders)
  // Based on your types, no direct relations from users are immediately apparent.
}));

export const customersRelations = relations(customers, ({ many }) => ({
  invoices: many(invoices), // A customer can have many invoices
}));

export const invoicesRelations = relations(invoices, ({ one }) => ({
  customer: one(customers, {
    fields: [invoices.customer_id],
    references: [customers.id],
  }), // An invoice belongs to one customer
}));