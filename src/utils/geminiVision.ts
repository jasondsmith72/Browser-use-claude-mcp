import { AIService } from '../ai/aiService.js';
import { setupLogger, createContextLogger } from './logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'GeminiVision');

/**
 * Utility for processing images with Gemini's vision capabilities
 */
export class GeminiVision {
  private aiService: AIService;
  
  /**
   * Constructor
   */
  constructor() {
    this.aiService = new AIService();
  }
  
  /**
   * Analyze a webpage screenshot to identify UI elements
   * @param imageData Base64 encoded image data
   * @param mimeType Image MIME type
   * @returns Analysis of the UI elements in the screenshot
   */
  async analyzeScreenshot(imageData: string, mimeType: string): Promise<string> {
    const prompt = `
      Please analyze this screenshot of a webpage and identify the following:
      1. Main navigation elements
      2. Content sections
      3. Interactive elements (buttons, links, forms)
      4. Any prominent call-to-action (CTA) elements
      
      Format your response as a structured analysis of the page layout and UI elements.
    `;
    
    try {
      logger.info('Analyzing webpage screenshot with Gemini vision');
      const response = await this.aiService.generateTextWithImage(prompt, imageData, mimeType);
      return response.text;
    } catch (error) {
      logger.error(`Error analyzing screenshot: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Locate a specific element in a screenshot based on description
   * @param imageData Base64 encoded image data
   * @param mimeType Image MIME type
   * @param elementDescription Description of the element to locate
   * @returns CSS selector or XPath to locate the element
   */
  async locateElement(
    imageData: string,
    mimeType: string,
    elementDescription: string
  ): Promise<string> {
    const prompt = `
      Please look at this screenshot of a webpage and help me locate the following element:
      "${elementDescription}"
      
      Based on what you see, provide me with the most reliable way to locate this element, such as:
      1. A CSS selector
      2. XPath
      3. Descriptive location (e.g., "the blue button in the top-right corner")
      
      Focus on unique, stable identifiers like IDs, classes, or text content.
    `;
    
    try {
      logger.info(`Locating element in screenshot: ${elementDescription}`);
      const response = await this.aiService.generateTextWithImage(prompt, imageData, mimeType);
      return response.text;
    } catch (error) {
      logger.error(`Error locating element: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Extract text from a specific area or element in a screenshot
   * @param imageData Base64 encoded image data
   * @param mimeType Image MIME type
   * @param area Description of the area or element to extract text from
   * @returns Extracted text
   */
  async extractTextFromArea(
    imageData: string,
    mimeType: string,
    area: string
  ): Promise<string> {
    const prompt = `
      Please extract all the text from the following area in this screenshot:
      "${area}"
      
      Return only the exact text content without any analysis or extra commentary.
      Preserve the formatting as much as possible, including paragraphs, bullet points, and line breaks.
    `;
    
    try {
      logger.info(`Extracting text from area in screenshot: ${area}`);
      const response = await this.aiService.generateTextWithImage(prompt, imageData, mimeType);
      return response.text;
    } catch (error) {
      logger.error(`Error extracting text from area: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Analyze a form in a screenshot and identify its fields
   * @param imageData Base64 encoded image data
   * @param mimeType Image MIME type
   * @returns Analysis of the form fields and structure
   */
  async analyzeForm(imageData: string, mimeType: string): Promise<string> {
    const prompt = `
      Please analyze this screenshot containing a form and identify the following:
      1. All form fields (inputs, textareas, selects, etc.)
      2. Required fields
      3. Labels associated with each field
      4. Submit button or buttons
      5. Any validation requirements visible (e.g., "must be an email", "required field")
      
      Format your response as a structured list of form fields with their properties.
    `;
    
    try {
      logger.info('Analyzing form in screenshot');
      const response = await this.aiService.generateTextWithImage(prompt, imageData, mimeType);
      return response.text;
    } catch (error) {
      logger.error(`Error analyzing form: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

export default GeminiVision;
