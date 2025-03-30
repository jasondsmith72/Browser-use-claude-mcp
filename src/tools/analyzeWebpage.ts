import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { z } from 'zod';
import { setupLogger, createContextLogger } from '../utils/logger.js';
import AIService from '../ai/aiService.js';

// Logger
const logger = createContextLogger(setupLogger(), 'AnalyzeWebpageTool');

/**
 * Input schema for analyze webpage tool
 */
const AnalyzeWebpageInputSchema = z.object({
  url: z.string().url('A valid URL is required'),
  question: z.string().min(1, 'A question is required'),
  extractScreenshot: z.boolean().default(true).optional(),
  waitForSelector: z.string().optional(),
  timeout: z.number().optional(),
  sessionId: z.string().optional(),
});

/**
 * Type for analyze webpage tool input
 */
type AnalyzeWebpageInput = z.infer<typeof AnalyzeWebpageInputSchema>;

/**
 * Output schema for analyze webpage tool
 */
const AnalyzeWebpageOutputSchema = z.object({
  title: z.string(),
  url: z.string(),
  answer: z.string(),
  sessionId: z.string(),
});

/**
 * Type for analyze webpage tool output
 */
type AnalyzeWebpageOutput = z.infer<typeof AnalyzeWebpageOutputSchema>;

/**
 * Register the analyze webpage tool with the MCP server
 * @param server The MCP server instance
 * @param browserManager The browser manager instance
 */
export function registerAnalyzeWebpageTool(
  server: Server,
  browserManager: BrowserManager
): void {
  logger.info('Registering analyze_webpage tool');
  
  server.registerToolDefinition({
    name: 'analyze_webpage',
    description: 'Navigate to a webpage, analyze its content, and answer questions about it using Gemini 2.5',
    parameters: AnalyzeWebpageInputSchema,
  });
  
  server.registerToolImplementation({
    name: 'analyze_webpage',
    handler: async (params: AnalyzeWebpageInput): Promise<AnalyzeWebpageOutput> => {
      logger.info(`Analyzing webpage: ${params.url} with question: ${params.question}`);
      
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
        const htmlContent = await page.evaluate(() => {
          return document.documentElement.outerHTML;
        });
        
        // Capture screenshot if requested
        let screenshotBase64 = '';
        let mimeType = '';
        
        if (params.extractScreenshot) {
          const screenshotBuffer = await page.screenshot({
            type: 'jpeg',
            quality: 70,
            fullPage: false,
          });
          
          screenshotBase64 = screenshotBuffer.toString('base64');
          mimeType = 'image/jpeg';
        }
        
        // Initialize AI service
        const aiService = new AIService();
        
        // Create prompt for AI analysis
        const prompt = `
I need you to analyze this webpage and answer a specific question.

URL: ${currentUrl}
Title: ${title}

Question: ${params.question}

${params.extractScreenshot ? 'I have included a screenshot of the webpage. Analyze both the HTML and the screenshot to provide the most accurate answer.' : 'Analyze the HTML to provide the most accurate answer.'}

Please provide a comprehensive answer based solely on the information available on this webpage. If the information needed to answer the question is not present on this webpage, indicate that.
        `.trim();
        
        // Generate answer using AI service
        let answer: string;
        
        if (params.extractScreenshot && screenshotBase64) {
          // Use image analysis if screenshot is available
          const response = await aiService.generateTextWithImage(
            prompt,
            screenshotBase64,
            mimeType,
            {
              temperature: 0.3,
              maxTokens: 2048,
            }
          );
          answer = response.text;
        } else {
          // Use HTML content for analysis (truncated if too long)
          const truncatedHtml = htmlContent.length > 100000 
            ? htmlContent.substring(0, 100000) + '...[HTML truncated]'
            : htmlContent;
          
          const htmlPrompt = `${prompt}\n\nHTML Content:\n${truncatedHtml}`;
          const response = await aiService.generateText(
            htmlPrompt,
            {
              temperature: 0.3,
              maxTokens: 2048,
            }
          );
          answer = response.text;
        }
        
        logger.info(`Successfully analyzed webpage: ${params.url}`);
        
        return {
          title,
          url: currentUrl,
          answer,
          sessionId,
        };
      } catch (error) {
        logger.error(`Error analyzing webpage: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    },
  });
}

export default registerAnalyzeWebpageTool;
