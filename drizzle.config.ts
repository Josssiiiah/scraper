require("dotenv").config();

import type { Config } from "drizzle-kit";

let config: Config;

if (process.env.NODE_ENV === "production") {
  // Production: Turso configuration
  console.log("Using Turso config for drizzle-kit");
  config = {
    schema: "./src/database/schema.ts",
    out: "./migrations",
    dialect: "turso", // Use 'turso' dialect for production
    dbCredentials: {
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    },
  };
} else {
  // Development: Local SQLite configuration
  console.log("Using local SQLite config for drizzle-kit");
  config = {
    schema: "./src/database/schema.ts",
    out: "./migrations",
    dialect: "sqlite", // Use 'sqlite' dialect for local development
    dbCredentials: {
      url: "file:local.db", // Point directly to the local file
    },
  };
}

export default config;
