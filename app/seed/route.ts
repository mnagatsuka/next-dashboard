import bcrypt from 'bcrypt';
import { getDb } from '@/db/client';
import * as schema from '@/db/schema';

import { invoices, customers, revenue, users } from '../lib/placeholder-data';

const dbUrl = process.env.DB_URL ?? '';

// Initialize the Drizzle ORM client
const db = getDb(dbUrl);

async function seedUsers() {
  console.log('Seeding users...');
  const insertedUsers = await Promise.all(
    users.map(async (user) => {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      try {
        await db.insert(schema.users).values({
          id: user.id,
          name: user.name,
          email: user.email,
          password: hashedPassword,
        }).onConflictDoNothing();
        return `Inserted user: ${user.email}`;
      } catch (error) {
        console.error(`Failed to insert user ${user.email}:`, error);
        return `Failed to insert user: ${user.email}`;
      }
    }),
  );
  console.log('Users seeded:', insertedUsers.filter(s => s.startsWith('Inserted')).length, 'users inserted/skipped.');
  return insertedUsers;
}

async function seedCustomers() {
  console.log('Seeding customers...');
  const insertedCustomers = await Promise.all(
    customers.map(async (customer) => {
      try {
        await db.insert(schema.customers).values({
          id: customer.id,
          name: customer.name,
          email: customer.email,
          image_url: customer.image_url,
        }).onConflictDoNothing();
        return `Inserted customer: ${customer.name}`;
      } catch (error) {
        console.error(`Failed to insert customer ${customer.name}:`, error);
        return `Failed to insert customer: ${customer.name}`;
      }
    }),
  );
  console.log('Customers seeded:', insertedCustomers.filter(s => s.startsWith('Inserted')).length, 'customers inserted/skipped.');
  return insertedCustomers;
}

async function seedInvoices() {
  console.log('Seeding invoices...');
  const insertedInvoices = await Promise.all(
    invoices.map(async (invoice) => {
      try {
        await db.insert(schema.invoices).values({
          id: invoice.id,
          customer_id: invoice.customer_id,
          amount: invoice.amount,
          status: invoice.status,
          date: invoice.date,
        }).onConflictDoNothing();
        return `Inserted invoice for customer ID: ${invoice.customer_id}`;
      } catch (error) {
        console.error(`Failed to insert invoice for customer ID ${invoice.customer_id}:`, error);
        return `Failed to insert invoice for customer ID: ${invoice.customer_id}`;
      }
    }),
  );
  console.log('Invoices seeded:', insertedInvoices.filter(s => s.startsWith('Inserted')).length, 'invoices inserted/skipped.');
  return insertedInvoices;
}

async function seedRevenue() {
  console.log('Seeding revenue...');
  const insertedRevenue = await Promise.all(
    revenue.map(async (rev) => {
      try {
        await db.insert(schema.revenue).values({
          month: rev.month,
          revenue: rev.revenue,
        }).onConflictDoNothing();
        return `Inserted revenue for month: ${rev.month}`;
      } catch (error) {
        console.error(`Failed to insert revenue for month ${rev.month}:`, error);
        return `Failed to insert revenue for month: ${rev.month}`;
      }
    }),
  );
  console.log('Revenue seeded:', insertedRevenue.filter(s => s.startsWith('Inserted')).length, 'revenue entries inserted/skipped.');
  return insertedRevenue;
}

export async function GET() {
  try {
    console.log('Clearing existing data from tables...');
    // DELETE IN DEPENDENCY ORDER: Children first, then parents.
    // Invoices depend on Customers/Users, so delete invoices first.
    await db.delete(schema.invoices);
    await db.delete(schema.customers);
    await db.delete(schema.users);
    await db.delete(schema.revenue); // Revenue is independent, order doesn't strictly matter for it.
    console.log('Tables cleared (data deleted).');

    await seedUsers();
    await seedCustomers();
    await seedInvoices();
    await seedRevenue();

    console.log('Database seeded successfully!');
    return Response.json({ message: 'Database seeded successfully' });
  } catch (error) {
    console.error('Error seeding database:', error);
    // Provide more specific error details if possible
    let errorMessage = 'An unknown error occurred during seeding.';
    if (error instanceof Error) {
        errorMessage = error.message;
        // If it's a Drizzle error, it might have a cause or specific properties
        // For example, if it's a 'pg' error, it might have `detail` or `code`
        // console.error('Full error object:', error); // Uncomment for more detailed debugging
    } else if (typeof error === 'object' && error !== null && 'detail' in error) {
        // Attempt to extract detail from a postgres-like error object
        errorMessage = (error as any).detail;
    }
    return Response.json({ error: errorMessage }, { status: 500 });
  } finally {
    // (db.$client as Pool).end(); // Uncomment if you face issues with lingering connections after seeding
  }
}