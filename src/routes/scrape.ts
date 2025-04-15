import { Elysia } from "elysia"; // Keep Elysia import
import { appSetup } from "../../setup"; // Import the base setup
import { articles as articlesTableSchema } from "../database/schema"; // Need schema for DB query

// Define interfaces for results and errors (can be shared or moved)
interface ScrapedResult {
  articleId: number;
  title: string | null;
  link: string;
  scrapedContent: string;
}

interface ScrapeError {
  articleId?: number;
  link?: string;
  error: string;
}

// Start routes from appSetup
export const scrapeRoutes = new Elysia()
  .use(appSetup) // Use the base setup which includes db and scraper plugins
  .get(
    "/scrape/all",
    // Destructure db and scrapeUrl from context
    async ({ db, scrapeUrl }) => {
      const scrapedResults: ScrapedResult[] = [];
      const errors: ScrapeError[] = [];

      try {
        // 1. Fetch articles from the database
        const articles = await db.select().from(articlesTableSchema);

        if (!articles || articles.length === 0) {
          return {
            message: "No articles found in the database to scrape.",
            scrapedResults,
            errors,
          };
        }

        // 2. Iterate and scrape each article
        for (const article of articles) {
          if (!article.link) {
            console.warn(
              `Skipping article ID ${article.id} due to missing link.`
            );
            errors.push({ articleId: article.id, error: "Missing link" });
            continue;
          }

          try {
            // Use the scrapeUrl function from the plugin
            const content = await scrapeUrl(article.link);
            scrapedResults.push({
              articleId: article.id,
              title: article.title,
              link: article.link,
              scrapedContent: content.substring(0, 500) + "...", // Truncate
            });
          } catch (scrapeError: any) {
            console.error(
              `Failed to scrape article ${article.id} (${article.link}):`,
              scrapeError.message
            );
            errors.push({
              articleId: article.id,
              link: article.link,
              error: `Scraping failed: ${scrapeError.message}`,
            });
            // Optional: Add delay or different handling for failed scrapes
            await new Promise((resolve) => setTimeout(resolve, 500)); // Shorter delay between attempts
          }
        }

        return { scrapedResults, errors };
      } catch (error: any) {
        console.error("Error in /scrape/all route handler:", error);
        return {
          message: "An unexpected error occurred during the scraping process.",
          error: error.message || "Unknown error",
          scrapedResults: [],
          errors: [{ error: error.message || "Unknown database/setup error" }],
        };
      }
    },
    {
      detail: {
        summary: "/scrape/all",
        description:
          "Fetches all articles from DB, then uses scraper plugin via appSetup to scrape each link.",
        tags: ["scraping"],
      },
    }
  );
