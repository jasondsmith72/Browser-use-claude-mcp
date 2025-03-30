import { Config } from '../config/index.js';
import { setupLogger, createContextLogger } from '../utils/logger.js';
import { AIAdapter, AIAdapterFactory } from './adapters/index.js';

// Logger
const logger = createContextLogger(setupLogger(), 'AIService');

/**
 * Type for AI response
 */
export interface AIResponse {
  text: string;
  model: string;
  provider: string;
}

/**
 * Type for general AI options
 */
export interface AIOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

/**
 * Type for chat message
 */
export interface ChatMessage {
  role: string;
  content: string;
}

/**
 * Service that handles interactions with AI providers
 */
export class AIService {
  private adapter: AIAdapter;
  private provider: string;

  /**
   * Constructor
   */
  constructor() {
    this.provider = Config.ai.provider;
    logger.info(`Initializing AI service with provider: ${this.provider}`);
    
    // Create adapter using factory
    this.adapter = AIAdapterFactory.createAdapter();
  }

  /**
   * Generate text from the configured AI provider
   * @param prompt The text prompt
   * @param options Generation options
   * @returns The AI response
   */
  async generateText(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    try {
      // Get model name based on provider
      const modelName = this.getModelName();
      
      // Generate text using adapter
      const text = await this.adapter.generateText(prompt, {
        maxTokens: options.maxTokens,
        temperature: options.temperature,
        topP: options.topP,
        topK: options.topK,
      });
      
      return {
        text,
        model: modelName,
        provider: this.provider,
      };
    } catch (error) {
      logger.error(`Error generating text: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Generate text with image analysis
   * @param prompt Text prompt
   * @param imageData Base64 encoded image data
   * @param mimeType Image MIME type
   * @param options Generation options
   * @returns The AI response
   */
  async generateTextWithImage(
    prompt: string,
    imageData: string,
    mimeType: string,
    options: AIOptions = {}
  ): Promise<AIResponse> {
    try {
      // Get vision-capable model
      const modelName = this.getVisionModelName();
      
      // Generate text with image using adapter
      const text = await this.adapter.generateTextWithImage(
        prompt,
        imageData,
        mimeType,
        {
          maxTokens: options.maxTokens,
          temperature: options.temperature,
          topP: options.topP,
          topK: options.topK,
        }
      );
      
      return {
        text,
        model: modelName,
        provider: this.provider,
      };
    } catch (error) {
      logger.error(`Error generating text with image: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Generate a chat response
   * @param messages Array of chat messages
   * @param options Generation options
   * @returns The AI response
   */
  async generateChatResponse(
    messages: ChatMessage[],
    options: AIOptions = {}
  ): Promise<AIResponse> {
    try {
      // Get model name
      const modelName = this.getModelName();
      
      // Generate chat response using adapter
      const text = await this.adapter.generateChatResponse(
        messages,
        {
          maxTokens: options.maxTokens,
          temperature: options.temperature,
          topP: options.topP,
          topK: options.topK,
        }
      );
      
      return {
        text,
        model: modelName,
        provider: this.provider,
      };
    } catch (error) {
      logger.error(`Error generating chat response: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Get the model name for the configured provider
   * @returns The model name
   */
  private getModelName(): string {
    switch (this.provider) {
      case 'GEMINI':
        return Config.ai.gemini.modelName;
      case 'ANTHROPIC':
        return Config.ai.anthropic.modelName;
      case 'OPENAI':
        return Config.ai.openai.modelName;
      default:
        return 'unknown';
    }
  }

  /**
   * Get the vision-capable model name for the configured provider
   * @returns The vision-capable model name
   */
  private getVisionModelName(): string {
    switch (this.provider) {
      case 'GEMINI':
        return Config.ai.gemini.modelName.includes('vision')
          ? Config.ai.gemini.modelName
          : 'gemini-2.5-pro-vision';
      case 'ANTHROPIC':
        return Config.ai.anthropic.modelName.includes('3')
          ? Config.ai.anthropic.modelName
          : 'claude-3-5-sonnet-20241022';
      case 'OPENAI':
        return Config.ai.openai.modelName.includes('vision')
          ? Config.ai.openai.modelName
          : 'gpt-4o';
      default:
        return 'unknown';
    }
  }
}

export default AIService;
