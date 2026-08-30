import { defineConfig } from "drizzle-kit";
import { config } from "dotenv";

// dotenv/config only auto-loads `.env` — Next.js convention is `.env.local`.
config({ path: ".env.local" });

// `generate` only diffs the schema file and does not need a live connection,
// so we don't hard-fail here — only `migrate` / `push` / `studio` actually
// dial DATABASE_URL, and postgres itself will error clearly if it's blank.
if (!process.env.DATABASE_URL) {
  console.warn(
    "[drizzle.config] DATABASE_URL is not set — fine for `db:generate`, but `db:migrate`/`db:push`/`db:studio` will fail. See .env.example.",
  );
}

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL ?? "",
  },
  strict: true,
  verbose: true,
});
