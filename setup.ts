import { Elysia } from "elysia";
import { dbPlugin } from "./src/plugins/db";
import { scraperPlugin } from "./src/plugins/scraper";

/**
 * Base Elysia setup with core plugins integrated.
 * Use this instance as the starting point for your routes
 * to ensure essential services like database and scraping are available.
 */
export const appSetup = new Elysia({ name: "setup" })
  .use(dbPlugin)
  .use(scraperPlugin);
