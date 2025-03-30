import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { z } from 'zod';
import { setupLogger, createContextLogger } from '../utils/logger.js';
import { AIService } from '../ai/aiService.js';
import { Config } from '../config/index.js';

// Logger
const logger = createContextLogger(setupLogger(), 'AnalyzeContentTool');

/**
 * Input schema for analyze content tool
 */
const AnalyzeContentInputSchema = z.object({
  url: z.string().url('A valid URL is required'),
  question: z.string(),
  extractHtml: z.boolean().default(false).optional(),
  extractTables: z.boolean().default(true).optional(),
  extractLinks: z.boolean().default(true).optional(),
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
  question: z.string(),
  answer: z.string(),
  url: z.string(),
  title: z.string(),
  sessionId: z.string(),
  model: z.string(),
  provider: z.string(),
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
    description: 'Navigate to a webpage, extract content, and analyze it with AI to answer a question',
    parameters: AnalyzeContentInputSchema,
  });
  
  server.registerToolImplementation({
    name: 'analyze_content',
    handler: async (params: AnalyzeContentInput): Promise<AnalyzeContentOutput> => {
      logger.info(`Analyzing content from ${params.url} with question: ${params.question}`);
      
      try {
        // Get page from browser manager
        const { page, sessionId } = await browserManager.getPage(params.sessionId);
        
        // Navigate to the URL
        const response = await page.goto(params.url, {
          waitUntil: 'networkidle2',
          timeout: 30000,
        });
        
        if (!response) {
          throw new Error(`Failed to load: ${params.url}`);
        }
        
        if (!response.ok()) {
          throw new Error(`HTTP error: ${response.status()} ${response.statusText()}`);
        }
        
        // Get page title and URL
        const title = await page.title();
        const url = page.url();
        
        // Extract text content
        const textContent = await page.evaluate(() => document.body.innerText);
        
        // Extract HTML content if requested
        let htmlContent = '';
        if (params.extractHtml) {
          htmlContent = await page.evaluate(() => document.documentElement.outerHTML);
        }
        
        // Extract tables if requested
        let tables = [];
        if (params.extractTables) {
          tables = await page.evaluate(() => {
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
        }
        
        // Extract links if requested
        let links = [];
        if (params.extractLinks) {
          links = await page.evaluate(() => {
            const linkElements = Array.from(document.querySelectorAll('a[href]'));
            return linkElements.map(el => ({
              text: el.textContent?.trim() || '',
              url: el.getAttribute('href') || '',
            }));
          });
        }
        
        // Initialize AI service
        const aiService = new AIService();
        
        // Create prompt for AI
        let prompt = `You are a web assistant that helps analyze webpage content to answer questions. 
        
I'll provide you with content from a webpage and a question about that content. Your task is to analyze the information and provide a clear, accurate, and concise answer to the question.

WEBPAGE URL: ${url}
WEBPAGE TITLE: ${title}
QUESTION: ${params.question}

WEBPAGE CONTENT: 
${textContent.substring(0, 12000)}`;

        // Add tables information if available
        if (tables.length > 0) {
          prompt += '\n\nTABLES FROM WEBPAGE:\n';
          for (let i = 0; i < Math.min(tables.length, 5); i++) {
            const table = tables[i];
            prompt += `\nTable ${i + 1}:\n`;
            prompt += `Headers: ${table.headers.join(' | ')}\n`;
            
            for (let j = 0; j < Math.min(table.rows.length, 10); j++) {
              prompt += `Row ${j + 1}: ${table.rows[j].join(' | ')}\n`;
            }
            
            if (table.rows.length > 10) {
              prompt += `[... ${table.rows.length - 10} more rows ...]\n`;
            }
          }
          
          if (tables.length > 5) {
            prompt += `\n[... ${tables.length - 5} more tables ...]\n`;
          }
        }
        
        // Add links information if available
        if (links.length > 0) {
          prompt += '\n\nIMPORTANT LINKS FROM WEBPAGE:\n';
          for (let i = 0; i < Math.min(links.length, 20); i++) {
            const link = links[i];
            if (link.text && link.url) {
              prompt += `${link.text}: ${link.url}\n`;
            }
          }
          
          if (links.length > 20) {
            prompt += `\n[... ${links.length - 20} more links ...]\n`;
          }
        }
        
        // Final instruction
        prompt += `\nBased ONLY on the information provided above, please answer the following question as accurately as possible:
        
QUESTION: ${params.question}

If the provided information does not contain an answer to the question, please indicate that clearly. Do not make up information that is not present in the provided content.`;
        
        // Get AI response
        logger.info('Generating AI analysis...');
        const aiResponse = await aiService.generateText(prompt, {
          temperature: 0.3,
          maxTokens: 1000,
        });
        
        logger.info('Successfully analyzed content');
        
        return {
          question: params.question,
          answer: aiResponse.text,
          url,
          title,
          sessionId,
          model: aiResponse.model,
          provider: aiResponse.provider,
        };
      } catch (error) {
        logger.error(`Error analyzing content: ${error instanceof Error ? error.message : String(error)}`);
        throw error;
      }
    },
  });
}

export default registerAnalyzeContentTool;
