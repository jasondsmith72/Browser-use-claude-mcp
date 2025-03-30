import fetch from 'node-fetch';
import { Config } from '../../config/index.js';
import { setupLogger, createContextLogger } from '../../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'AnthropicAdapter');

/**
 * Generation parameters for Claude
 */
export interface ClaudeGenerationParams {
  temperature?: number;
  topP?: number;
  maxTokens?: number;
  stopSequences?: string[];
}

/**
 * Default generation parameters
 */
const DEFAULT_PARAMS: ClaudeGenerationParams = {
  temperature: 0.7,
  topP: 0.95,
  maxTokens: 4096,
};

/**
 * Adapter for Anthropic's Claude AI model
 */
export class AnthropicAdapter {
  private apiKey: string;
  private modelName: string;
  private apiVersion: string;
  
  /**
   * Constructor
   */
  constructor() {
    this.apiKey = Config.ai.anthropic.apiKey;
    
    if (!this.apiKey) {
      throw new Error('No Anthropic API key provided');
    }
    
    this.modelName = Config.ai.anthropic.modelName;
    this.apiVersion = '2023-06-01';
    
    logger.info(`Initialized Anthropic adapter with model: ${this.modelName}`);
  }
  
  /**
   * Generate text using the Claude model
   * @param prompt Text prompt for generation
   * @param params Generation parameters
   * @returns Generated text
   */
  async generateText(prompt: string, params: Partial<ClaudeGenerationParams> = {}): Promise<string> {
    try {
      // Combine default parameters with provided parameters
      const generationParams = {
        ...DEFAULT_PARAMS,
        ...params,
      };
      
      // Make API request
      logger.debug(`Generating content with model: ${this.modelName}`);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: [
            { role: 'user', content: prompt },
          ],
          max_tokens: generationParams.maxTokens,
          temperature: generationParams.temperature,
          top_p: generationParams.topP,
          stop_sequences: generationParams.stopSequences,
        }),
      });
      
      // Check for errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
      }
      
      // Parse response
      const result = await response.json() as any;
      
      // Extract text
      const text = result.content?.[0]?.text || '';
      
      logger.debug(`Generated ${text.length} characters`);
      return text;
    } catch (error) {
      logger.error(`Error generating text with Claude: ${error instanceof Error ? error.message : String(error)}`);
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
    messages: { role: 'user' | 'assistant'; content: string }[],
    params: Partial<ClaudeGenerationParams> = {}
  ): Promise<string> {
    try {
      // Combine default parameters with provided parameters
      const generationParams = {
        ...DEFAULT_PARAMS,
        ...params,
      };
      
      // Convert message roles to Claude format
      const formattedMessages = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content,
      }));
      
      // Make API request
      logger.debug(`Generating chat response with model: ${this.modelName}`);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion,
        },
        body: JSON.stringify({
          model: this.modelName,
          messages: formattedMessages,
          max_tokens: generationParams.maxTokens,
          temperature: generationParams.temperature,
          top_p: generationParams.topP,
          stop_sequences: generationParams.stopSequences,
        }),
      });
      
      // Check for errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
      }
      
      // Parse response
      const result = await response.json() as any;
      
      // Extract text
      const text = result.content?.[0]?.text || '';
      
      logger.debug(`Generated ${text.length} character chat response`);
      return text;
    } catch (error) {
      logger.error(`Error generating chat response with Claude: ${error instanceof Error ? error.message : String(error)}`);
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
    params: Partial<ClaudeGenerationParams> = {}
  ): Promise<string> {
    try {
      // Claude's message API uses a different format for multimodal content
      // Make sure we're using a vision-capable model
      const modelName = this.modelName.includes('3') ? this.modelName : 'claude-3-5-sonnet-20241022';
      
      // Combine default parameters with provided parameters
      const generationParams = {
        ...DEFAULT_PARAMS,
        ...params,
      };
      
      // Format the multimodal content
      const content = [
        {
          type: 'text',
          text: prompt,
        },
        {
          type: 'image',
          source: {
            type: 'base64',
            media_type: mimeType,
            data: imageData,
          },
        },
      ];
      
      // Make API request
      logger.debug(`Generating content with vision model: ${modelName}`);
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.apiVersion,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'user', content },
          ],
          max_tokens: generationParams.maxTokens,
          temperature: generationParams.temperature,
          top_p: generationParams.topP,
          stop_sequences: generationParams.stopSequences,
        }),
      });
      
      // Check for errors
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
      }
      
      // Parse response
      const result = await response.json() as any;
      
      // Extract text
      const text = result.content?.[0]?.text || '';
      
      logger.debug(`Generated ${text.length} characters with image analysis`);
      return text;
    } catch (error) {
      logger.error(`Error generating text with Claude vision: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

export default AnthropicAdapter;
