import { AIService } from './aiService.js';
import { setupLogger, createContextLogger } from '../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'AIIntegrationHelper');

/**
 * Helper class for AI integration in MCP tools
 */
export class AIIntegrationHelper {
  private static aiService: AIService | null = null;
  
  /**
   * Get the AI service instance (singleton)
   * @returns The AI service instance
   */
  private static getAIService(): AIService {
    if (!AIIntegrationHelper.aiService) {
      AIIntegrationHelper.aiService = new AIService();
    }
    return AIIntegrationHelper.aiService;
  }
  
  /**
   * Analyze a screenshot with AI
   * @param imageData Base64 encoded image data
   * @param prompt The prompt to send to the AI
   * @returns The AI analysis result
   */
  static async analyzeScreenshot(imageData: string, prompt: string): Promise<string> {
    try {
      logger.info('Analyzing screenshot with AI');
      
      const aiService = AIIntegrationHelper.getAIService();
      
      // Construct a prompt for image analysis
      const analysisPrompt = prompt || 'Describe what you see in this screenshot. Focus on the main elements and their arrangement.';
      
      // Generate text with image
      const result = await aiService.generateTextWithImage(
        analysisPrompt,
        imageData,
        'image/png'
      );
      
      logger.info('Screenshot analysis complete');
      
      return result.text;
    } catch (error) {
      logger.error(`Error analyzing screenshot: ${error instanceof Error ? error.message : String(error)}`);
      return `Failed to analyze screenshot: ${error instanceof Error ? error.message : String(error)}`;
    }
  }
  
  /**
   * Extract structured data from text
   * @param text The text to extract data from
   * @param schema The schema of the data to extract
   * @returns The extracted data
   */
  static async extractStructuredData(text: string, schema: object): Promise<object> {
    try {
      logger.info('Extracting structured data with AI');
      
      const aiService = AIIntegrationHelper.getAIService();
      
      // Construct a prompt for data extraction
      const extractionPrompt = `
Extract the structured data from the following text according to this schema:
${JSON.stringify(schema, null, 2)}

Return ONLY the filled JSON object without any additional text.

Text:
${text}
      `;
      
      // Generate response
      const result = await aiService.generateText(extractionPrompt);
      
      logger.info('Data extraction complete');
      
      // Parse the JSON result
      try {
        // Extract only the JSON part by finding the first { and last }
        const jsonStart = result.text.indexOf('{');
        const jsonEnd = result.text.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = result.text.substring(jsonStart, jsonEnd);
          return JSON.parse(jsonStr);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        logger.error(`Error parsing JSON from AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        logger.debug(`AI response: ${result.text}`);
        throw new Error('Failed to parse structured data from AI response');
      }
    } catch (error) {
      logger.error(`Error extracting structured data: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Generate a search query based on a natural language request
   * @param request The natural language request
   * @returns The optimized search query
   */
  static async generateSearchQuery(request: string): Promise<string> {
    try {
      logger.info('Generating search query with AI');
      
      const aiService = AIIntegrationHelper.getAIService();
      
      // Construct a prompt for query generation
      const queryPrompt = `
Convert the following natural language request into an optimized search engine query.
Remove filler words, focus on key terms, and use appropriate search operators if needed.
Return ONLY the search query without any additional text or explanation.

Request: ${request}
      `;
      
      // Generate response
      const result = await aiService.generateText(queryPrompt, { temperature: 0.3 });
      
      logger.info('Search query generation complete');
      
      // Clean up the result (remove quotes, newlines, etc.)
      return result.text.replace(/^["']|["']$/g, '').trim();
    } catch (error) {
      logger.error(`Error generating search query: ${error instanceof Error ? error.message : String(error)}`);
      
      // Fallback to the original request
      return request;
    }
  }
  
  /**
   * Generate a form filling strategy based on form fields and user requirements
   * @param formFields The available form fields
   * @param userRequirements The user's requirements
   * @returns The form filling strategy
   */
  static async generateFormFillingStrategy(
    formFields: string[],
    userRequirements: string
  ): Promise<Record<string, string>> {
    try {
      logger.info('Generating form filling strategy with AI');
      
      const aiService = AIIntegrationHelper.getAIService();
      
      // Construct a prompt for form filling strategy
      const strategyPrompt = `
I need to fill out a form with the following fields:
${formFields.map(field => `- ${field}`).join('\n')}

Based on these requirements:
${userRequirements}

Create a JSON object where the keys are the form field names and the values are what to fill in.
Return ONLY the JSON object without any additional text or explanation.
      `;
      
      // Generate response
      const result = await aiService.generateText(strategyPrompt);
      
      logger.info('Form filling strategy generation complete');
      
      // Parse the JSON result
      try {
        // Extract only the JSON part by finding the first { and last }
        const jsonStart = result.text.indexOf('{');
        const jsonEnd = result.text.lastIndexOf('}') + 1;
        
        if (jsonStart >= 0 && jsonEnd > jsonStart) {
          const jsonStr = result.text.substring(jsonStart, jsonEnd);
          return JSON.parse(jsonStr);
        } else {
          throw new Error('No valid JSON found in response');
        }
      } catch (parseError) {
        logger.error(`Error parsing JSON from AI response: ${parseError instanceof Error ? parseError.message : String(parseError)}`);
        logger.debug(`AI response: ${result.text}`);
        throw new Error('Failed to parse form filling strategy from AI response');
      }
    } catch (error) {
      logger.error(`Error generating form filling strategy: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

export default AIIntegrationHelper;
