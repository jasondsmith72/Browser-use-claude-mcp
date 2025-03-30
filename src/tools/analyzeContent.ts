import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { z } from 'zod';
import { setupLogger, createContextLogger } from '../utils/logger.js';
import { AIService } from '../ai/aiService.js';

// Logger
const logger = createContextLogger(setupLogger(), 'AnalyzeContentTool');

/**
 * Input schema for analyze content tool
 */
const AnalyzeContentInputSchema = z.object({
  question: z.string(),
  takeScreenshot: z.boolean().default(false).optional(),
  maxTokens: z.number().min(100).max(32000).default(4096).optional(),
  temperature: z.number().min(0).max(1).default(0.7).optional(),
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
  answer: z.string(),
  model: z.string(),
  provider: z.string(),
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
    description: 'Analyze webpage content with AI to answer specific questions',
    parameters: AnalyzeContentInputSchema,
  });
  
  server.registerToolImplementation({
    name: 'analyze_content',
    handler: async (params: AnalyzeContentInput): Promise<AnalyzeContentOutput> => {
      logger.info(`Analyzing content with question: ${params.question}`);
      
      try {
        // Get page from browser manager
        const { page, sessionId } = await browserManager.getPage(params.sessionId);
        
        // Get current page info
        const url = page.url();
        const title = await page.title();
        
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
        
        // Take screenshot if requested
        let screenshotBase64 = '';
        let mimeType = '';
        
        if (params.takeScreenshot) {
          const screenshot = await page.screenshot({ type: 'jpeg', quality: 80 });
          screenshotBase64 = screenshot.toString('base64');
          mimeType = 'image/jpeg';
        }
        
        // Initialize AI service
        const aiService = new AIService();
        
        // Create prompt for AI
        const prompt = `I am examining a webpage with the following information:
URL: ${url}
Title: ${title}

The content of the page is as follows:
---
${content.substring(0, 15000)} ${content.length > 15000 ? '... (content truncated)' : ''}
---

Based on this webpage content, please answer the following question:
${params.question}

Please be specific and only include information that is directly relevant to the question. If the answer cannot be found in the webpage content, please indicate that.`;
        
        // Generate response using AI
        let aiResponse;
        
        if (params.takeScreenshot && screenshotBase64) {
          // Generate response with image if screenshot was taken
          aiResponse = await aiService.generateTextWithImage(
            prompt,
            screenshotBase64,
            mimeType,
            {
              maxTokens: params.maxTokens,
              temperature: params.temperature,
            }
          );
        } else {
          // Generate text-only response
          aiResponse = await aiService.generateText(
            prompt,
            {
              maxTokens: params.maxTokens,
              temperature: params.temperature,
            }
          );
        }
        
        logger.info('Successfully analyzed content');
        
        return {
          answer: aiResponse.text,
          model: aiResponse.model,
          provider: aiResponse.provider,
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
