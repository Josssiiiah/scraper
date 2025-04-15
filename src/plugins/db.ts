import Elysia from "elysia";
import { db } from "../database/turso"; // Import the Drizzle instance

// Decorate the context with the Drizzle instance
export const dbPlugin = new Elysia({ name: "db" }).decorate("db", db);
