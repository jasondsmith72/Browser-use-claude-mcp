import { GoogleGenerativeAI, GenerateContentResult, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { Config } from '../../config/index.js';
import { setupLogger, createContextLogger } from '../../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'GeminiAdapter');

/**
 * Safety settings for Gemini content generation
 */
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_NONE,
  },
];

/**
 * Generation parameters for Gemini
 */
export interface GeminiGenerationParams {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
}

/**
 * Default generation parameters
 */
const DEFAULT_PARAMS: GeminiGenerationParams = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};

/**
 * Adapter for Google's Gemini AI model
 */
export class GeminiAdapter {
  private genAI: GoogleGenerativeAI;
  private modelName: string;
  
  /**
   * Constructor
   */
  constructor() {
    const apiKey = Config.ai.gemini.apiKey;
    
    if (!apiKey) {
      throw new Error('No Gemini API key provided');
    }
    
    this.modelName = Config.ai.gemini.modelName;
    this.genAI = new GoogleGenerativeAI(apiKey);
    
    logger.info(`Initialized Gemini adapter with model: ${this.modelName}`);
  }
  
  /**
   * Generate text using the Gemini model
   * @param prompt Text prompt for generation
   * @param params Generation parameters
   * @returns Generated text
   */
  async generateText(prompt: string, params: Partial<GeminiGenerationParams> = {}): Promise<string> {
    try {
      // Combine default parameters with provided parameters
      const generationConfig = {
        ...DEFAULT_PARAMS,
        ...params,
      };
      
      // Get model
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        safetySettings,
      });
      
      // Generate content
      logger.debug(`Generating content with model: ${this.modelName}`);
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      // Extract text from response
      const response = result.response;
      const text = response.text();
      
      logger.debug(`Generated ${text.length} characters`);
      return text;
    } catch (error) {
      logger.error(`Error generating text with Gemini: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Generate text with vision capabilities (image analysis)
   * @param prompt Text prompt
   * @param imageData Base64 encoded image data
   * @param mimeType Image MIME type
   * @param params Generation parameters
   * @returns Generated text
   */
  async generateTextWithImage(
    prompt: string, 
    imageData: string, 
    mimeType: string,
    params: Partial<GeminiGenerationParams> = {}
  ): Promise<string> {
    try {
      // Ensure we're using a vision-capable model
      const modelName = this.modelName.includes('vision') 
        ? this.modelName 
        : 'gemini-2.5-pro-vision';
      
      // Combine default parameters with provided parameters
      const generationConfig = {
        ...DEFAULT_PARAMS,
        ...params,
      };
      
      // Get model
      const model = this.genAI.getGenerativeModel({
        model: modelName,
        safetySettings,
      });
      
      // Generate content
      logger.debug(`Generating content with vision model: ${modelName}`);
      const result = await model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              { text: prompt },
              { inlineData: { mimeType, data: imageData } },
            ],
          },
        ],
        generationConfig,
      });
      
      // Extract text from response
      const response = result.response;
      const text = response.text();
      
      logger.debug(`Generated ${text.length} characters with image analysis`);
      return text;
    } catch (error) {
      logger.error(`Error generating text with Gemini vision: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Generate a chat response
   * @param messages Array of message objects with role and content
   * @param params Generation parameters
   * @returns Generated text
   */
  async generateChatResponse(
    messages: { role: 'user' | 'model'; content: string }[],
    params: Partial<GeminiGenerationParams> = {}
  ): Promise<string> {
    try {
      // Combine default parameters with provided parameters
      const generationConfig = {
        ...DEFAULT_PARAMS,
        ...params,
      };
      
      // Get model
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        safetySettings,
      });
      
      // Convert messages to Gemini format
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'model' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));
      
      // Generate content
      logger.debug(`Generating chat response with model: ${this.modelName}`);
      const result = await model.generateContent({
        contents: formattedMessages,
        generationConfig,
      });
      
      // Extract text from response
      const response = result.response;
      const text = response.text();
      
      logger.debug(`Generated ${text.length} character chat response`);
      return text;
    } catch (error) {
      logger.error(`Error generating chat response with Gemini: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

export default GeminiAdapter;
