import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { AIService } from '../ai/aiService.js';
import { z } from 'zod';
import { setupLogger, createContextLogger } from '../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'AnalyzeScreenshotTool');

/**
 * Input schema for analyze screenshot tool
 */
const AnalyzeScreenshotInputSchema = z.object({
  selector: z.string().optional(),
  question: z.string(),
  fullPage: z.boolean().default(false).optional(),
  temperature: z.number().min(0).max(1).default(0.7).optional(),
  maxTokens: z.number().min(1).default(1024).optional(),
  sessionId: z.string().optional(),
});

/**
 * Type for analyze screenshot tool input
 */
type AnalyzeScreenshotInput = z.infer<typeof AnalyzeScreenshotInputSchema>;

/**
 * Output schema for analyze screenshot tool
 */
const AnalyzeScreenshotOutputSchema = z.object({
  analysis: z.string(),
  url: z.string(),
  title: z.string(),
  model: z.string(),
  sessionId: z.string(),
});

/**
 * Type for analyze screenshot tool output
 */
type AnalyzeScreenshotOutput = z.infer<typeof AnalyzeScreenshotOutputSchema>;

/**
 * Register the analyze screenshot tool with the MCP server
 * @param server The MCP server instance
 * @param browserManager The browser manager instance
 */
export function registerAnalyzeScreenshotTool(
  server: Server,
  browserManager: BrowserManager
): void {
  logger.info('Registering analyze_screenshot tool');
  
  server.registerToolDefinition({
    name: 'analyze_screenshot',
    description: 'Analyze a screenshot of the current webpage with AI vision',
    parameters: AnalyzeScreenshotInputSchema,
  });
  
  server.registerToolImplementation({
    name: 'analyze_screenshot',
    handler: async (params: AnalyzeScreenshotInput): Promise<AnalyzeScreenshotOutput> => {
      logger.info('Analyzing screenshot with AI vision');
      
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
        const mimeType = 'image/png';
        
        // Initialize AI service
        const aiService = new AIService();
        
        // Generate prompt for image analysis
        const prompt = `Analyze the following screenshot of a webpage.
URL: ${url}
Title: ${title}

Question or task: ${params.question}

Please analyze the screenshot and provide a detailed response addressing the question or task.`;
        
        // Get analysis from AI
        const aiResponse = await aiService.generateTextWithImage(prompt, imageBase64, mimeType, {
          temperature: params.temperature,
          maxTokens: params.maxTokens,
        });
        
        logger.info('Successfully analyzed screenshot with AI vision');
        
        return {
          analysis: aiResponse.text,
          url,
          title,
          model: aiResponse.model,
          sessionId,
        };
      } catch (error) {
        logger.error(`Error analyzing screenshot: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    },
  });
}

export default registerAnalyzeScreenshotTool;
