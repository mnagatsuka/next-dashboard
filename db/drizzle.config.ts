import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'


// Ensure NODE_ENV is correctly captured from the process environment
const CURRENT_NODE_ENV = process.env.NODE_ENV;
console.log(`[Drizzle Config] Process NODE_ENV is: ${CURRENT_NODE_ENV ?? 'undefined'}`);

// Determine which .env file to load based on NODE_ENV
// If NODE_ENV is not set, we'll default to .env.local for local development
const envToLoad = CURRENT_NODE_ENV ? `.env.${CURRENT_NODE_ENV}` : '.env.local';
console.log(`[Drizzle Config] Attempting to load .env file from: ${envToLoad}`);

// Load the environment variables from the determined .env file
config({ path: envToLoad });

// Verify DB_URL after loading the .env file. This will show if the file was read correctly.
console.log(`[Drizzle Config] DB_URL after loading .env file: ${process.env.DB_URL ?? 'undefined'}`);


export default defineConfig({
  schema: './schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DB_URL || 'postgresql://postgres:postgres@localhost:65432/local',
  },
})
