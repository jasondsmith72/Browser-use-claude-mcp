import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { z } from 'zod';
import { setupLogger, createContextLogger } from '../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'SearchWebTool');

/**
 * Input schema for search web tool
 */
const SearchWebInputSchema = z.object({
  query: z.string().min(1, 'Search query is required'),
  numResults: z.number().min(1).max(10).default(5).optional(),
  site: z.string().optional(),
  sessionId: z.string().optional(),
});

/**
 * Type for search web tool input
 */
type SearchWebInput = z.infer<typeof SearchWebInputSchema>;

/**
 * Type for a search result item
 */
interface SearchResultItem {
  title: string;
  url: string;
  snippet: string;
}

/**
 * Output schema for search web tool
 */
const SearchWebOutputSchema = z.object({
  query: z.string(),
  results: z.array(z.object({
    title: z.string(),
    url: z.string(),
    snippet: z.string(),
  })),
  sessionId: z.string(),
});

/**
 * Type for search web tool output
 */
type SearchWebOutput = z.infer<typeof SearchWebOutputSchema>;

/**
 * Register the search web tool with the MCP server
 * @param server The MCP server instance
 * @param browserManager The browser manager instance
 */
export function registerSearchWebTool(
  server: Server,
  browserManager: BrowserManager
): void {
  logger.info('Registering search_web tool');
  
  server.registerToolDefinition({
    name: 'search_web',
    description: 'Search the web for information',
    parameters: SearchWebInputSchema,
  });
  
  server.registerToolImplementation({
    name: 'search_web',
    handler: async (params: SearchWebInput): Promise<SearchWebOutput> => {
      logger.info(`Searching web for: ${params.query}`);
      
      try {
        // Get page from browser manager
        const { page, sessionId } = await browserManager.getPage(params.sessionId);
        
        // Prepare the search URL
        let searchUrl = `https://www.google.com/search?q=${encodeURIComponent(params.query)}`;
        
        // Add site restriction if specified
        if (params.site) {
          searchUrl += `+site:${encodeURIComponent(params.site)}`;
        }
        
        // Navigate to the search URL
        await page.goto(searchUrl, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });
        
        // Wait for the search results to load
        await page.waitForSelector('#search', { timeout: 10000 });
        
        // Extract search results
        const results = await page.evaluate((numResults: number) => {
          const searchResults: SearchResultItem[] = [];
          
          // Find all search result items
          const resultElements = document.querySelectorAll('#search .g');
          
          for (let i = 0; i < Math.min(resultElements.length, numResults); i++) {
            const element = resultElements[i];
            
            // Extract title and URL
            const titleElement = element.querySelector('h3');
            const linkElement = element.querySelector('a');
            const snippetElement = element.querySelector('.VwiC3b');
            
            if (titleElement && linkElement && snippetElement) {
              const title = titleElement.textContent || '';
              const url = linkElement.getAttribute('href') || '';
              const snippet = snippetElement.textContent || '';
              
              if (title && url && snippet) {
                searchResults.push({
                  title,
                  url,
                  snippet,
                });
              }
            }
          }
          
          return searchResults;
        }, params.numResults || 5);
        
        logger.info(`Successfully searched web for: ${params.query} (Found ${results.length} results)`);
        
        return {
          query: params.query,
          results,
          sessionId,
        };
      } catch (error) {
        logger.error(`Error searching web: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    },
  });
}

export default registerSearchWebTool;
