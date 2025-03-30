import { Config } from '../../config/index.js';
import { setupLogger, createContextLogger } from '../../utils/logger.js';
import GeminiAdapter from './geminiAdapter.js';
import AnthropicAdapter from './anthropicAdapter.js';
import OpenAIAdapter from './openaiAdapter.js';

// Logger
const logger = createContextLogger(setupLogger(), 'AIAdapterFactory');

/**
 * Common interface for all AI model adapters
 */
export interface AIAdapter {
  generateText(prompt: string, params?: any): Promise<string>;
  generateTextWithImage(prompt: string, imageData: string, mimeType: string, params?: any): Promise<string>;
  generateChatResponse(messages: any[], params?: any): Promise<string>;
}

/**
 * Factory to create the appropriate AI adapter based on the configured provider
 */
export class AIAdapterFactory {
  /**
   * Create an AI adapter instance
   * @returns An instance of the appropriate AI adapter
   */
  static createAdapter(): AIAdapter {
    const provider = Config.ai.provider;
    
    logger.info(`Creating AI adapter for provider: ${provider}`);
    
    // Create the appropriate adapter based on the provider
    switch (provider) {
      case 'GEMINI':
        return new GeminiAdapter();
      case 'ANTHROPIC':
        return new AnthropicAdapter();
      case 'OPENAI':
        return new OpenAIAdapter();
      default:
        logger.error(`Unsupported AI provider: ${provider}`);
        throw new Error(`Unsupported AI provider: ${provider}`);
    }
  }
}

export default AIAdapterFactory;
