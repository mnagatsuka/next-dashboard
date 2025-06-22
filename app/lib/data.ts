import { sql } from "drizzle-orm";
import { getDb } from "@/db/client";
import { customers, invoices, revenue } from "@/db/schema";
import type {
  CustomerField,
  FormattedCustomersTable,
  InvoiceForm,
  InvoicesTable,
  Revenue,
} from "./definitions";
import { formatCurrency } from "./utils";

const dbUrl = process.env.DB_URL;
if (!dbUrl) {
  throw new Error("DB_URL environment variable is not set.");
}
const db = getDb(dbUrl);

export async function fetchRevenue(): Promise<Revenue[]> {
  try {
    console.log("Fetching revenue data...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await db
      .select({
        month: revenue.month,
        revenue: revenue.revenue,
      })
      .from(revenue);

    console.log("Data fetch completed after 3 seconds.");

    return data;
  } catch (error) {
    console.error("Database Error (fetchRevenue):", error);
    throw new Error("Failed to fetch revenue data.");
  }
}

export async function fetchLatestInvoices() {
  try {
    console.log("Fetching latest invoices data...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const data = await db
      .select({
        id: invoices.id,
        amount: invoices.amount,
        name: customers.name,
        image_url: customers.image_url,
        email: customers.email,
      })
      .from(invoices)
      .innerJoin(customers, sql`${invoices.customer_id} = ${customers.id}`)
      .orderBy(sql`${invoices.date} DESC`)
      .limit(5);

    console.log("Data fetch completed after 3 seconds.");

    const latestInvoices = data.map((invoice) => ({
      ...invoice,
      amount: formatCurrency(invoice.amount),
    }));
    return latestInvoices;
  } catch (error) {
    console.error("Database Error (fetchLatestInvoices):", error);
    throw new Error("Failed to fetch the latest invoices.");
  }
}

export async function fetchCardData() {
  try {
    console.log("Fetching card data...");
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const [invoiceCountResult] = await db.select({ count: sql<number>`count(*)` }).from(invoices);

    const [customerCountResult] = await db.select({ count: sql<number>`count(*)` }).from(customers);

    const [invoiceStatusResult] = await db
      .select({
        paid: sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.amount} else 0 end)`.as(
          "paid",
        ),
        pending:
          sql<number>`sum(case when ${invoices.status} = 'pending' then ${invoices.amount} else 0 end)`.as(
            "pending",
          ),
      })
      .from(invoices);

    console.log("Data fetch completed after 3 seconds.");

    const numberOfInvoices = Number(invoiceCountResult.count ?? "0");
    const numberOfCustomers = Number(customerCountResult.count ?? "0");
    const totalPaidInvoices = formatCurrency(invoiceStatusResult.paid ?? "0");
    const totalPendingInvoices = formatCurrency(invoiceStatusResult.pending ?? "0");

    return {
      numberOfCustomers,
      numberOfInvoices,
      totalPaidInvoices,
      totalPendingInvoices,
    };
  } catch (error) {
    console.error("Database Error (fetchCardData):", error);
    throw new Error("Failed to fetch card data.");
  }
}

const ITEMS_PER_PAGE = 6;
export async function fetchFilteredInvoices(
  query: string,
  currentPage: number,
): Promise<InvoicesTable[]> {
  const offset = (currentPage - 1) * ITEMS_PER_PAGE;

  try {
    const invoicesData = await db
      .select({
        id: invoices.id,
        amount: invoices.amount,
        date: invoices.date,
        status: invoices.status,
        name: customers.name,
        email: customers.email,
        image_url: customers.image_url,
      })
      .from(invoices)
      .innerJoin(customers, sql`${invoices.customer_id} = ${customers.id}`)
      .where(
        sql`
          ${customers.name} ILIKE ${`%${query}%`} OR
          ${customers.email} ILIKE ${`%${query}%`} OR
          ${invoices.amount}::text ILIKE ${`%${query}%`} OR
          ${invoices.date}::text ILIKE ${`%${query}%`} OR
          ${invoices.status} ILIKE ${`%${query}%`}
        `,
      )
      .orderBy(sql`${invoices.date} DESC`)
      .limit(ITEMS_PER_PAGE)
      .offset(offset);

    return invoicesData as InvoicesTable[];
  } catch (error) {
    console.error("Database Error (fetchFilteredInvoices):", error);
    throw new Error("Failed to fetch invoices.");
  }
}

export async function fetchInvoicesPages(query: string): Promise<number> {
  try {
    const [data] = await db
      .select({
        count: sql<number>`count(*)`,
      })
      .from(invoices)
      .innerJoin(customers, sql`${invoices.customer_id} = ${customers.id}`)
      .where(
        sql`
          ${customers.name} ILIKE ${`%${query}%`} OR
          ${customers.email} ILIKE ${`%${query}%`} OR
          ${invoices.amount}::text ILIKE ${`%${query}%`} OR
          ${invoices.date}::text ILIKE ${`%${query}%`} OR
          ${invoices.status} ILIKE ${`%${query}%`}
        `,
      );

    const totalPages = Math.ceil(Number(data.count) / ITEMS_PER_PAGE);
    return totalPages;
  } catch (error) {
    console.error("Database Error (fetchInvoicesPages):", error);
    throw new Error("Failed to fetch total number of invoices.");
  }
}

export async function fetchInvoiceById(id: string): Promise<InvoiceForm | undefined> {
  try {
    const [invoiceData] = await db
      .select({
        id: invoices.id,
        customer_id: invoices.customer_id,
        amount: invoices.amount,
        status: invoices.status,
      })
      .from(invoices)
      .where(sql`${invoices.id} = ${id}`);

    if (!invoiceData) {
      return undefined;
    }

    return {
      ...invoiceData,
      amount: invoiceData.amount / 100,
    };
  } catch (error) {
    console.error("Database Error (fetchInvoiceById):", error);
    throw new Error("Failed to fetch invoice.");
  }
}

export async function fetchCustomers(): Promise<CustomerField[]> {
  try {
    const customersData = await db
      .select({
        id: customers.id,
        name: customers.name,
      })
      .from(customers)
      .orderBy(sql`${customers.name} ASC`);

    return customersData;
  } catch (err) {
    console.error("Database Error (fetchCustomers):", err);
    throw new Error("Failed to fetch all customers.");
  }
}

export async function fetchFilteredCustomers(query: string): Promise<FormattedCustomersTable[]> {
  try {
    const data = await db
      .select({
        id: customers.id,
        name: customers.name,
        email: customers.email,
        image_url: customers.image_url,
        total_invoices: sql<number>`count(${invoices.id})`.as("total_invoices"),
        total_pending:
          sql<number>`sum(case when ${invoices.status} = 'pending' then ${invoices.amount} else 0 end)`.as(
            "total_pending",
          ),
        total_paid:
          sql<number>`sum(case when ${invoices.status} = 'paid' then ${invoices.amount} else 0 end)`.as(
            "total_paid",
          ),
      })
      .from(customers)
      .leftJoin(invoices, sql`${customers.id} = ${invoices.customer_id}`)
      .where(
        sql`
          ${customers.name} ILIKE ${`%${query}%`} OR
          ${customers.email} ILIKE ${`%${query}%`}
        `,
      )
      .groupBy(customers.id, customers.name, customers.email, customers.image_url)
      .orderBy(sql`${customers.name} ASC`);

    const customersFormatted = data.map((customer) => ({
      ...customer,
      total_pending: formatCurrency(customer.total_pending),
      total_paid: formatCurrency(customer.total_paid),
    }));

    return customersFormatted as FormattedCustomersTable[];
  } catch (err) {
    console.error("Database Error (fetchFilteredCustomers):", err);
    throw new Error("Failed to fetch customer table.");
  }
}
