import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { z } from 'zod';
import { setupLogger, createContextLogger } from '../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'TakeScreenshotTool');

/**
 * Input schema for take screenshot tool
 */
const TakeScreenshotInputSchema = z.object({
  selector: z.string().optional(),
  fullPage: z.boolean().default(false).optional(),
  sessionId: z.string().optional(),
});

/**
 * Type for take screenshot tool input
 */
type TakeScreenshotInput = z.infer<typeof TakeScreenshotInputSchema>;

/**
 * Output schema for take screenshot tool
 */
const TakeScreenshotOutputSchema = z.object({
  imageData: z.string(), // Base64 encoded image
  mimeType: z.string(),
  url: z.string(),
  title: z.string(),
  sessionId: z.string(),
});

/**
 * Type for take screenshot tool output
 */
type TakeScreenshotOutput = z.infer<typeof TakeScreenshotOutputSchema>;

/**
 * Register the take screenshot tool with the MCP server
 * @param server The MCP server instance
 * @param browserManager The browser manager instance
 */
export function registerTakeScreenshotTool(
  server: Server,
  browserManager: BrowserManager
): void {
  logger.info('Registering take_screenshot tool');
  
  server.registerToolDefinition({
    name: 'take_screenshot',
    description: 'Take a screenshot of the current webpage or a specific element',
    parameters: TakeScreenshotInputSchema,
  });
  
  server.registerToolImplementation({
    name: 'take_screenshot',
    handler: async (params: TakeScreenshotInput): Promise<TakeScreenshotOutput> => {
      logger.info('Taking screenshot');
      
      try {
        // Get page from browser manager
        const { page, sessionId } = await browserManager.getPage(params.sessionId);
        
        // Get current page URL and title
        const url = page.url();
        const title = await page.title();
        
        // Take screenshot
        let imageBuffer;
        
        if (params.selector) {
          // Take screenshot of specific element
          const element = await page.$(params.selector);
          if (!element) {
            throw new Error(`Element not found: ${params.selector}`);
          }
          
          imageBuffer = await element.screenshot({
            type: 'png',
          });
        } else {
          // Take screenshot of the entire page or viewport
          imageBuffer = await page.screenshot({
            type: 'png',
            fullPage: params.fullPage === true,
          });
        }
        
        // Convert to base64
        const imageBase64 = imageBuffer.toString('base64');
        
        logger.info('Successfully took screenshot');
        
        return {
          imageData: imageBase64,
          mimeType: 'image/png',
          url,
          title,
          sessionId,
        };
      } catch (error) {
        logger.error(`Error taking screenshot: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    },
  });
}

export default registerTakeScreenshotTool;
