import "dotenv/config";
import { defineConfig } from "prisma/config";

// Prisma CLI (generate, migrate) requires SQLite to use a file: URL.
// On Vercel, DATABASE_URL is libsql://... so we use a placeholder for the CLI.
const url = process.env.DATABASE_URL ?? "";
const cliUrl = url.startsWith("file:") ? url : "file:./dev.db";

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    url: cliUrl,
  },
});
