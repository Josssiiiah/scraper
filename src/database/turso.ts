import { createClient, type Client } from "@libsql/client";
import dotenv from "dotenv";
import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

dotenv.config();

let client: Client;

if (process.env.NODE_ENV === "production") {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      "TURSO_DATABASE_URL environment variable not set for production"
    );
  }

  client = createClient({
    url: url,
    authToken: authToken,
  });
  console.log("Connected to Turso database (Production)");
} else {
  // Development environment: Use a local SQLite file
  const authToken = process.env.TURSO_AUTH_TOKEN;

  client = createClient({
    url: "file:local.db", // Use a local file named 'local.db'
  });

  console.log("Connected to local SQLite database (Development)");
}

// Initialize Drizzle ORM with the client and the schema
export const db = drizzle(client, { schema });
