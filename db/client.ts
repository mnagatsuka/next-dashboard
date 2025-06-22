import { drizzle, type NodePgDatabase } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'

export type PostgresDBClient = NodePgDatabase<typeof schema> & {
  $client: Pool
}

let db: PostgresDBClient | null = null

export const getDb = (connectionString: string): PostgresDBClient => {
  if (db !== null) {
    return db
  }

  const pool = new Pool({
    connectionString,
    ssl: process.env.NODE_ENV === 'production',
  })

  const instance = drizzle(pool, { schema })
  db = Object.assign(instance, { $client: pool })

  return db
}
