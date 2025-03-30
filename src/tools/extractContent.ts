import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { z } from 'zod';
import { setupLogger, createContextLogger } from '../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'ExtractContentTool');

/**
 * Input schema for extract content tool
 */
const ExtractContentInputSchema = z.object({
  selectors: z.record(z.string()).optional(),
  extractHtml: z.boolean().default(false).optional(),
  extractText: z.boolean().default(true).optional(),
  extractLinks: z.boolean().default(false).optional(),
  extractTables: z.boolean().default(false).optional(),
  sessionId: z.string().optional(),
});

/**
 * Type for extract content tool input
 */
type ExtractContentInput = z.infer<typeof ExtractContentInputSchema>;

/**
 * Type for a link item
 */
interface LinkItem {
  text: string;
  url: string;
}

/**
 * Type for a table row
 */
type TableRow = string[];

/**
 * Type for a table
 */
interface TableData {
  headers: string[];
  rows: TableRow[];
}

/**
 * Output schema for extract content tool
 */
const ExtractContentOutputSchema = z.object({
  url: z.string(),
  title: z.string(),
  elements: z.record(z.any()),
  text: z.string().optional(),
  html: z.string().optional(),
  links: z.array(z.object({
    text: z.string(),
    url: z.string(),
  })).optional(),
  tables: z.array(z.object({
    headers: z.array(z.string()),
    rows: z.array(z.array(z.string())),
  })).optional(),
  sessionId: z.string(),
});

/**
 * Type for extract content tool output
 */
type ExtractContentOutput = z.infer<typeof ExtractContentOutputSchema>;

/**
 * Register the extract content tool with the MCP server
 * @param server The MCP server instance
 * @param browserManager The browser manager instance
 */
export function registerExtractContentTool(
  server: Server,
  browserManager: BrowserManager
): void {
  logger.info('Registering extract_content tool');
  
  server.registerToolDefinition({
    name: 'extract_content',
    description: 'Extract specific content from a webpage',
    parameters: ExtractContentInputSchema,
  });
  
  server.registerToolImplementation({
    name: 'extract_content',
    handler: async (params: ExtractContentInput): Promise<ExtractContentOutput> => {
      logger.info('Extracting content from webpage');
      
      try {
        // Get page from browser manager
        const { page, sessionId } = await browserManager.getPage(params.sessionId);
        
        // Get current page info
        const url = page.url();
        const title = await page.title();
        
        // Extract content based on selectors
        const elements: Record<string, string> = {};
        
        if (params.selectors) {
          for (const [name, selector] of Object.entries(params.selectors)) {
            try {
              const element = await page.$(selector);
              
              if (element) {
                const text = await page.evaluate((el) => el.textContent || '', element);
                elements[name] = text.trim();
                logger.debug(`Extracted "${name}": ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`);
              } else {
                logger.warn(`Selector "${selector}" for "${name}" not found`);
                elements[name] = '';
              }
            } catch (error) {
              logger.error(`Error extracting "${name}": ${error instanceof Error ? error.message : String(error)}`);
              elements[name] = '';
            }
          }
        }
        
        // Result object
        const result: ExtractContentOutput = {
          url,
          title,
          elements,
          sessionId,
        };
        
        // Extract full page text if requested
        if (params.extractText) {
          const text = await page.evaluate(() => {
            return document.body.innerText || '';
          });
          result.text = text;
        }
        
        // Extract full page HTML if requested
        if (params.extractHtml) {
          const html = await page.evaluate(() => {
            return document.documentElement.outerHTML || '';
          });
          result.html = html;
        }
        
        // Extract links if requested
        if (params.extractLinks) {
          const links = await page.evaluate(() => {
            const linkElements = Array.from(document.querySelectorAll('a[href]'));
            return linkElements.map(el => ({
              text: el.textContent?.trim() || '',
              url: el.getAttribute('href') || '',
            }));
          });
          result.links = links as LinkItem[];
        }
        
        // Extract tables if requested
        if (params.extractTables) {
          const tables = await page.evaluate(() => {
            const tableElements = Array.from(document.querySelectorAll('table'));
            return tableElements.map(table => {
              // Extract headers
              const headerRow = table.querySelector('thead tr');
              const headers = headerRow
                ? Array.from(headerRow.querySelectorAll('th')).map(th => th.textContent?.trim() || '')
                : Array.from(table.querySelectorAll('tr:first-child th, tr:first-child td')).map(cell => cell.textContent?.trim() || '');
              
              // Extract rows
              const rows = Array.from(table.querySelectorAll('tbody tr, tr:not(:first-child)')).map(row => {
                return Array.from(row.querySelectorAll('td')).map(cell => cell.textContent?.trim() || '');
              });
              
              return { headers, rows };
            });
          });
          result.tables = tables as TableData[];
        }
        
        logger.info('Successfully extracted content');
        return result;
      } catch (error) {
        logger.error(`Error extracting content: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    },
  });
}

export default registerExtractContentTool;
