import Elysia from "elysia";
import puppeteer from "puppeteer-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

// Apply the stealth plugin to puppeteer
puppeteer.use(StealthPlugin());

// Interfaces can be moved to routes or a shared types file if preferred
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

// Define the scraper plugin - remove dbPlugin usage
export const scraperPlugin = new Elysia({ name: "scraper" })
  // .use(dbPlugin) // REMOVED
  .decorate("scrapeUrl", async (url: string): Promise<string> => {
    let browser = null; // Initialize browser to null
    try {
      // Launch browser inside try block for better error handling if launch fails
      browser = await puppeteer.launch({
        headless: true,
        args: ["--no-sandbox", "--disable-setuid-sandbox"], // Add common args for compatibility
      });
      const page = await browser.newPage();
      console.log(`Scraper navigating to: ${url}`);
      await page.setViewport({ width: 1280, height: 800 });
      await page.goto(url, { waitUntil: "networkidle2", timeout: 60000 });

      const content = await page.evaluate(() => {
        const mainContent = document.querySelector(
          "main, article, .main-content, #main, #content"
        );
        if (mainContent) return (mainContent as HTMLElement).innerText;
        // More robust fallback
        return (document.body as HTMLElement)?.innerText || "";
      });

      // Close the page and browser quickly after getting content
      await page.close();
      await browser.close();
      console.log(`Scraper finished for: ${url}`);
      return content;
    } catch (error: any) {
      console.error(`Error scraping URL ${url}:`, error);
      // Ensure browser is closed even if an error occurs before return
      if (browser) {
        await browser.close();
      }
      // Re-throw or return an error indicator as needed by the caller
      // Throwing the error to be caught by the route handler
      throw new Error(`Failed to scrape ${url}: ${error.message}`);
    }
  });
// REMOVED scrapeAllArticles decorator
