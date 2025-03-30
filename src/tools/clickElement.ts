import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { z } from 'zod';
import { setupLogger, createContextLogger } from '../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'ClickElementTool');

/**
 * Input schema for click element tool
 */
const ClickElementInputSchema = z.object({
  text: z.string().optional(),
  selector: z.string().optional(),
  index: z.number().min(0).default(0).optional(),
  waitForNavigation: z.boolean().default(true).optional(),
  timeout: z.number().min(1000).default(30000).optional(),
  sessionId: z.string().optional(),
}).refine(
  data => data.text !== undefined || data.selector !== undefined,
  {
    message: 'Either text or selector must be provided',
    path: ['text', 'selector'],
  }
);

/**
 * Type for click element tool input
 */
type ClickElementInput = z.infer<typeof ClickElementInputSchema>;

/**
 * Output schema for click element tool
 */
const ClickElementOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  newUrl: z.string().optional(),
  newTitle: z.string().optional(),
  sessionId: z.string(),
});

/**
 * Type for click element tool output
 */
type ClickElementOutput = z.infer<typeof ClickElementOutputSchema>;

/**
 * Register the click element tool with the MCP server
 * @param server The MCP server instance
 * @param browserManager The browser manager instance
 */
export function registerClickElementTool(
  server: Server,
  browserManager: BrowserManager
): void {
  logger.info('Registering click_element tool');
  
  server.registerToolDefinition({
    name: 'click_element',
    description: 'Click on an element on the webpage by text content or CSS selector',
    parameters: ClickElementInputSchema,
  });
  
  server.registerToolImplementation({
    name: 'click_element',
    handler: async (params: ClickElementInput): Promise<ClickElementOutput> => {
      const selectorInfo = params.text 
        ? `text "${params.text}"` 
        : `selector "${params.selector}"`;
      
      logger.info(`Clicking element with ${selectorInfo}`);
      
      try {
        // Get page from browser manager
        const { page, sessionId } = await browserManager.getPage(params.sessionId);
        
        // Navigate to the URL (fallback to current url if not specified)
        let element;
        const timeout = params.timeout || 30000;
        
        if (params.text) {
          // Find element by text content
          await page.waitForFunction(
            (text) => {
              const elements = [...document.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"]')];
              return elements.some(el => el.textContent && el.textContent.trim().includes(text));
            },
            { timeout },
            params.text
          );
          
          // Get all matching elements
          const elements = await page.evaluateHandle((text) => {
            const matches = [];
            const allElements = document.querySelectorAll('a, button, [role="button"], input[type="submit"], input[type="button"]');
            
            allElements.forEach(el => {
              if (el.textContent && el.textContent.trim().includes(text)) {
                matches.push(el);
              }
            });
            
            return matches;
          }, params.text);
          
          // Get the element at the specified index
          const index = params.index || 0;
          const elementHandle = await elements.evaluateHandle((elements, idx) => elements[idx], index);
          
          if ((await elementHandle.evaluate(el => el === undefined || el === null))) {
            throw new Error(`Element with text "${params.text}" at index ${index} not found`);
          }
          
          element = elementHandle;
        } else if (params.selector) {
          // Find element by selector
          await page.waitForSelector(params.selector, { timeout });
          
          // Get all matching elements
          const elements = await page.$$(params.selector);
          const index = params.index || 0;
          
          if (index >= elements.length) {
            throw new Error(`Element with selector "${params.selector}" at index ${index} not found`);
          }
          
          element = elements[index];
        } else {
          throw new Error('Either text or selector must be provided');
        }
        
        // Setup navigation promise if waiting for navigation
        let navigationPromise;
        if (params.waitForNavigation) {
          navigationPromise = page.waitForNavigation({ timeout });
        }
        
        // Click the element
        await element.click();
        
        // Wait for navigation if enabled
        if (navigationPromise) {
          await navigationPromise.catch(() => {
            logger.warn('Navigation did not occur after click');
          });
        }
        
        // Get updated page info
        const newUrl = page.url();
        const newTitle = await page.title();
        
        logger.info(`Successfully clicked element with ${selectorInfo}`);
        
        return {
          success: true,
          message: `Successfully clicked element with ${selectorInfo}`,
          newUrl,
          newTitle,
          sessionId,
        };
      } catch (error) {
        logger.error(`Error clicking element: ${error instanceof Error ? error.message : String(error)}`);
        
        return {
          success: false,
          message: `Failed to click element: ${error instanceof Error ? error.message : String(error)}`,
          sessionId: params.sessionId || '',
        };
      }
    },
  });
}

export default registerClickElementTool;
