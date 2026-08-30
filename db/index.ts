import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Server-only Drizzle client. Never import this from a client component —
// DATABASE_URL points at the Supabase transaction pooler and must not reach
// the browser bundle.
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is not set. Copy .env.local.example to .env.local and fill in your Supabase connection string (see CLAUDE.md section 4).",
  );
}

// `prepare: false` is required against Supabase's transaction pooler
// (pgbouncer in transaction mode does not support prepared statements).
const client = postgres(process.env.DATABASE_URL, { prepare: false });

export const db = drizzle(client, { schema });
