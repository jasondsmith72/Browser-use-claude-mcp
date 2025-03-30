import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { z } from 'zod';
import { setupLogger, createContextLogger } from '../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'BrowseWebpageTool');

/**
 * Input schema for browse webpage tool
 */
const BrowseWebpageInputSchema = z.object({
  url: z.string().url('A valid URL is required'),
  waitForSelector: z.string().optional(),
  timeout: z.number().optional(),
  sessionId: z.string().optional(),
});

/**
 * Type for browse webpage tool input
 */
type BrowseWebpageInput = z.infer<typeof BrowseWebpageInputSchema>;

/**
 * Output schema for browse webpage tool
 */
const BrowseWebpageOutputSchema = z.object({
  title: z.string(),
  url: z.string(),
  content: z.string(),
  sessionId: z.string(),
});

/**
 * Type for browse webpage tool output
 */
type BrowseWebpageOutput = z.infer<typeof BrowseWebpageOutputSchema>;

/**
 * Register the browse webpage tool with the MCP server
 * @param server The MCP server instance
 * @param browserManager The browser manager instance
 */
export function registerBrowseWebpageTool(
  server: Server,
  browserManager: BrowserManager
): void {
  logger.info('Registering browse_webpage tool');
  
  server.registerToolDefinition({
    name: 'browse_webpage',
    description: 'Navigate to a webpage and extract its content',
    parameters: BrowseWebpageInputSchema,
  });
  
  server.registerToolImplementation({
    name: 'browse_webpage',
    handler: async (params: BrowseWebpageInput): Promise<BrowseWebpageOutput> => {
      logger.info(`Browsing webpage: ${params.url}`);
      
      try {
        // Get page from browser manager
        const { page, sessionId } = await browserManager.getPage(params.sessionId);
        
        // Navigate to the URL
        const timeout = params.timeout || 30000;
        const response = await page.goto(params.url, {
          waitUntil: 'networkidle2',
          timeout,
        });
        
        if (!response) {
          throw new Error(`Failed to load: ${params.url}`);
        }
        
        if (!response.ok()) {
          throw new Error(`HTTP error: ${response.status()} ${response.statusText()}`);
        }
        
        // Wait for selector if specified
        if (params.waitForSelector) {
          await page.waitForSelector(params.waitForSelector, { timeout });
        }
        
        // Extract page information
        const title = await page.title();
        const currentUrl = page.url();
        
        // Extract content from the page
        const content = await page.evaluate(() => {
          // Main content selectors to try
          const mainSelectors = [
            'main',
            'article',
            '#main',
            '#content',
            '.main',
            '.content',
            '.article',
          ];
          
          // Try to find main content
          for (const selector of mainSelectors) {
            const element = document.querySelector(selector);
            if (element && element.textContent && element.textContent.trim().length > 500) {
              return element.textContent.trim();
            }
          }
          
          // Fallback to body content
          const bodyText = document.body.textContent || '';
          return bodyText.trim();
        });
        
        // Clean up the content
        const cleanedContent = content
          .replace(/\\s+/g, ' ')
          .replace(/\\n+/g, '\\n')
          .trim();
        
        logger.info(`Successfully browsed webpage: ${params.url}`);
        
        return {
          title,
          url: currentUrl,
          content: cleanedContent,
          sessionId,
        };
      } catch (error) {
        logger.error(`Error browsing webpage: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    },
  });
}

export default registerBrowseWebpageTool;
