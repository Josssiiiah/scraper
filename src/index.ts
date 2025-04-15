import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { config } from "dotenv";
// Remove direct plugin imports as they are handled by setup.ts
// import { dbPlugin } from "./plugins/db";
// import { scraperPlugin } from "./plugins/scraper"; // Not needed here
import { articlesRoutes } from "./routes/articles";
import { scrapeRoutes } from "./routes/scrape";
import { appSetup } from "../setup";
// Load environment variables
config();

const app = new Elysia()
  .use(swagger())
  // Core plugins (db, scraper) are now included via appSetup within the routes
  // .use(dbPlugin) // REMOVED
  // .use(scraperPlugin) // REMOVED
  // .use(appSetup) // REMOVED - Routes use it internally
  .use(articlesRoutes) // Uses appSetup internally
  .use(scrapeRoutes) // Uses appSetup internally
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
console.log(`📚 Swagger documentation available at /swagger`);
