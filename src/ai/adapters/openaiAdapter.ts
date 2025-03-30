import fetch from 'node-fetch';
import { Config } from '../../config/index.js';
import { setupLogger, createContextLogger } from '../../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'OpenAIAdapter');

/**
 * Generation parameters for OpenAI
 */
export interface OpenAIGenerationParams {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  presencePenalty?: number;
  frequencyPenalty?: number;
  stopSequences?: string[];
}

/**
 * Default generation parameters
 */
const DEFAULT_PARAMS: OpenAIGenerationParams = {
  temperature: 0.7,
  topP: 1.0,
  maxTokens: 4096,
  presencePenalty: 0,
  frequencyPenalty: 0,
};

/**
 * Adapter for OpenAI models
 */
export class OpenAIAdapter {
  private apiKey: string;
  private modelName: string;
  
  /**
   * Constructor
   */
  constructor() {
    this.apiKey = Config.ai.openai.apiKey;
    
    if (!this.apiKey) {
      throw new Error('No OpenAI API key provided');
    }
    
    this.modelName = Config.ai.openai.modelName;
    
    logger.info(`Initialized OpenAI adapter with model: ${this.modelName}`);
  }
  
  /**
   * Generate text using the OpenAI model
   * @param prompt Text prompt for generation
   * @param params Generation parameters
   * @returns Generated text
   */
  async generateText(prompt: string, params: Partial<OpenAIGenerationParams> = {}): Promise<string> {
    try {
      // Combine default parameters with provided parameters
      const generationParams = {
        ...DEFAULT_PARAMS,
        ...params,
      };
      
      // Make API request
      logger.debug(`Generating content with model: ${this.modelName}`);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'user', content: prompt },
          ],
          max_tokens: generationParams.maxTokens,
          temperature: generationParams.temperature,
          top_p: generationParams.topP,
          presence_penalty: generationParams.presencePenalty,
          frequency_penalty: generationParams.frequencyPenalty,
          stop: generationParams.stopSequences,
        }),
      });
      
      // Check for errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }
      
      // Parse response
      const result = await response.json() as any;
      
      // Extract text
      const text = result.choices?.[0]?.message?.content || '';
      
      logger.debug(`Generated ${text.length} characters`);
      return text;
    } catch (error) {
      logger.error(`Error generating text with OpenAI: ${error instanceof Error ? error.message : String(error)}`);
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
    messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
    params: Partial<OpenAIGenerationParams> = {}
  ): Promise<string> {
    try {
      // Combine default parameters with provided parameters
      const generationParams = {
        ...DEFAULT_PARAMS,
        ...params,
      };
      
      // Format messages for OpenAI
      const formattedMessages = messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      }));
      
      // Make API request
      logger.debug(`Generating chat response with model: ${this.modelName}`);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: formattedMessages,
          max_tokens: generationParams.maxTokens,
          temperature: generationParams.temperature,
          top_p: generationParams.topP,
          presence_penalty: generationParams.presencePenalty,
          frequency_penalty: generationParams.frequencyPenalty,
          stop: generationParams.stopSequences,
        }),
      });
      
      // Check for errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }
      
      // Parse response
      const result = await response.json() as any;
      
      // Extract text
      const text = result.choices?.[0]?.message?.content || '';
      
      logger.debug(`Generated ${text.length} character chat response`);
      return text;
    } catch (error) {
      logger.error(`Error generating chat response with OpenAI: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
  
  /**
   * Generate text with image analysis capabilities
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
    params: Partial<OpenAIGenerationParams> = {}
  ): Promise<string> {
    try {
      // Make sure we're using a vision-capable model
      const modelName = this.modelName.includes('vision') ? this.modelName : 'gpt-4o';
      
      // Combine default parameters with provided parameters
      const generationParams = {
        ...DEFAULT_PARAMS,
        ...params,
      };
      
      // Format the content for vision model
      const content = [
        {
          type: 'text',
          text: prompt,
        },
        {
          type: 'image_url',
          image_url: {
            url: `data:${mimeType};base64,${imageData}`,
          },
        },
      ];
      
      // Make API request
      logger.debug(`Generating content with vision model: ${modelName}`);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'user', content },
          ],
          max_tokens: generationParams.maxTokens,
          temperature: generationParams.temperature,
          top_p: generationParams.topP,
          presence_penalty: generationParams.presencePenalty,
          frequency_penalty: generationParams.frequencyPenalty,
          stop: generationParams.stopSequences,
        }),
      });
      
      // Check for errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }
      
      // Parse response
      const result = await response.json() as any;
      
      // Extract text
      const text = result.choices?.[0]?.message?.content || '';
      
      logger.debug(`Generated ${text.length} characters with image analysis`);
      return text;
    } catch (error) {
      logger.error(`Error generating text with OpenAI vision: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

export default OpenAIAdapter;
