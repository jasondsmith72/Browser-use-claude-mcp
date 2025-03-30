import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { AIService } from '../ai/aiService.js';
import { z } from 'zod';
import { setupLogger, createContextLogger } from '../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'AnalyzeContentTool');

/**
 * Input schema for analyze content tool
 */
const AnalyzeContentInputSchema = z.object({
  instructions: z.string(),
  url: z.string().url().optional(),
  selector: z.string().optional(),
  takeScreenshot: z.boolean().default(false).optional(),
  sessionId: z.string().optional(),
});

/**
 * Type for analyze content tool input
 */
type AnalyzeContentInput = z.infer<typeof AnalyzeContentInputSchema>;

/**
 * Output schema for analyze content tool
 */
const AnalyzeContentOutputSchema = z.object({
  url: z.string(),
  title: z.string(),
  analysis: z.string(),
  extractedText: z.string().optional(),
  sessionId: z.string(),
});

/**
 * Type for analyze content tool output
 */
type AnalyzeContentOutput = z.infer<typeof AnalyzeContentOutputSchema>;

/**
 * Register the analyze content tool with the MCP server
 * @param server The MCP server instance
 * @param browserManager The browser manager instance
 */
export function registerAnalyzeContentTool(
  server: Server,
  browserManager: BrowserManager
): void {
  logger.info('Registering analyze_content tool');
  
  server.registerToolDefinition({
    name: 'analyze_content',
    description: 'Analyze webpage content using AI',
    parameters: AnalyzeContentInputSchema,
  });
  
  server.registerToolImplementation({
    name: 'analyze_content',
    handler: async (params: AnalyzeContentInput): Promise<AnalyzeContentOutput> => {
      logger.info('Analyzing content with AI');
      
      try {
        // Get page from browser manager
        const { page, sessionId } = await browserManager.getPage(params.sessionId);
        
        // Navigate to URL if provided
        if (params.url) {
          await page.goto(params.url, {
            waitUntil: 'networkidle2',
            timeout: 30000,
          });
        }
        
        // Get page info
        const url = page.url();
        const title = await page.title();
        
        // Extract text content
        let extractedText = '';
        if (params.selector) {
          // Extract from specific selector
          extractedText = await page.evaluate((selector) => {
            const element = document.querySelector(selector);
            return element ? element.textContent || '' : '';
          }, params.selector);
        } else {
          // Extract from entire page
          extractedText = await page.evaluate(() => {
            return document.body.innerText || '';
          });
        }
        
        // Truncate text if too long (to avoid token limits)
        const maxLength = 15000;
        if (extractedText.length > maxLength) {
          extractedText = extractedText.substring(0, maxLength) + '... [content truncated]';
        }
        
        // Take screenshot if requested
        let imageData = '';
        let mimeType = '';
        
        if (params.takeScreenshot) {
          const screenshotBuffer = await page.screenshot({
            type: 'jpeg',
            quality: 80,
            fullPage: false,
          });
          
          imageData = screenshotBuffer.toString('base64');
          mimeType = 'image/jpeg';
        }
        
        // Prepare AI service
        const aiService = new AIService();
        
        // Prepare prompt for AI analysis
        const prompt = `
You are tasked with analyzing content from a webpage. Below are the details:

URL: ${url}
Title: ${title}
User Instructions: ${params.instructions}

Here is the extracted content to analyze:
---
${extractedText}
---

Based on the user's instructions, please analyze this content. If the instructions are unclear, focus on the main points, key information, sentiment, and any relevant insights.

Provide a concise and structured analysis.
`;
        
        // Generate analysis with or without image
        let aiResponse;
        if (params.takeScreenshot && imageData) {
          aiResponse = await aiService.generateTextWithImage(prompt, imageData, mimeType);
        } else {
          aiResponse = await aiService.generateText(prompt);
        }
        
        // Return analysis
        logger.info('Successfully analyzed content');
        
        return {
          url,
          title,
          analysis: aiResponse.text,
          extractedText,
          sessionId,
        };
      } catch (error) {
        logger.error(`Error analyzing content: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    },
  });
}

export default registerAnalyzeContentTool;
