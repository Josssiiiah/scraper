import { Elysia, t } from "elysia";
import { FinlightApi } from "finlight-client";
// import { dbPlugin } from "../plugins/db"; // Remove direct plugin import
import { appSetup } from "../../setup"; // Import the base setup
import { articles as articlesTableSchema } from "../database/schema"; // Import the articles table schema

// Initialize Finlight Client
const finlightClient = new FinlightApi({
  apiKey: process.env.FINLIGHT_API_KEY || "",
});

// Start routes from appSetup
export const articlesRoutes = new Elysia()
  .use(appSetup) // Use the base setup
  .get(
    "/fetch-article",
    async ({ query }) => {
      const { q, page, pageSize } = query;

      try {
        const articles = await finlightClient.articles.getBasicArticles({
          query: q!,
          page: page,
          pageSize: pageSize,
        });
        return articles;
      } catch (error) {
        console.error("Error fetching articles from Finlight:", error);
        return { error: "Failed to fetch articles" };
      }
    },
    {
      query: t.Object({
        q: t.Optional(
          t.String({
            description: "Search query for articles",
            default: "Donald Trump",
          })
        ),
        page: t.Optional(t.Numeric({ description: "Page number", default: 1 })),
        pageSize: t.Optional(
          t.Numeric({ description: "Number of results per page", default: 1 })
        ),
      }),
      detail: {
        summary: "/fetch-article",
        description:
          "Pass a query, page number, and page size to fetch articles.",
        tags: ["finlight"],
      },
    }
  )
  .get(
    "/fetch-and-save-article",
    async ({ query, db }) => {
      const { q, page, pageSize } = query;

      try {
        const finlightResponse = await finlightClient.articles.getBasicArticles(
          {
            query: q!,
            page: page,
            pageSize: pageSize,
          }
        );

        // Accessing articles via the 'articles' property
        const articlesToProcess = finlightResponse.articles;

        if (!articlesToProcess || articlesToProcess.length === 0) {
          return {
            message: "No articles found matching the query.",
            savedArticles: [],
          };
        }

        const savedArticles = [];
        const errors = [];

        for (const article of articlesToProcess) {
          const { title, source, link } = article;

          if (!title || !source || !link) {
            console.error("Skipping article due to missing data:", article);
            errors.push({
              message:
                "Skipped article due to missing required fields (title, source, or link).",
              article,
            });
            continue; // Skip this article and proceed to the next
          }

          try {
            const [savedArticle] = await db
              .insert(articlesTableSchema)
              .values({
                title: title,
                name: source, // Using 'source' from API for 'name' column
                link: link,
              })
              .returning(); // Return the inserted row
            savedArticles.push(savedArticle);
          } catch (dbError) {
            console.error(
              "Error saving article to database:",
              dbError,
              "Article:",
              article
            );
            errors.push({
              message: "Failed to save article to database.",
              error: dbError,
              article,
            });
          }
        }

        // Return the successfully saved articles and any errors encountered
        return { savedArticles, errors };
      } catch (error) {
        console.error("Error fetching and saving article:", error);
        // Consider more specific error handling based on potential issues (API vs DB)
        if (error instanceof Error) {
          return {
            error: `Failed to fetch and save article: ${error.message}`,
          };
        }
        return {
          error:
            "An unknown error occurred while fetching and saving the article.",
        };
      }
    },
    {
      query: t.Object({
        q: t.Optional(
          t.String({
            summary: "/fetch-article",
            description: "Search query for articles",
            default: "Technology", // Changed default query for variety
          })
        ),
        page: t.Optional(t.Numeric({ description: "Page number", default: 1 })),
        // Defaulting pageSize to 1 as we intend to save one article
        pageSize: t.Optional(
          t.Numeric({ description: "Number of results per page", default: 1 })
        ),
      }),
      detail: {
        summary: "/fetch-and-save-article",
        description:
          "Pass a query, page number, and page size to fetch an article and store its details.",
        tags: ["finlight"],
      },
    }
  );
