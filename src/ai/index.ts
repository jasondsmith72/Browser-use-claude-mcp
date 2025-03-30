import { AIService, AIResponse, AIOptions, ChatMessage } from './aiService.js';
import { AIIntegrationHelper } from './integrationHelper.js';
import { AIAdapter, AIAdapterFactory } from './adapters/index.js';
import GeminiAdapter from './adapters/geminiAdapter.js';
import AnthropicAdapter from './adapters/anthropicAdapter.js';
import OpenAIAdapter from './adapters/openaiAdapter.js';

// Export all AI-related components
export {
  AIService,
  AIResponse,
  AIOptions,
  ChatMessage,
  AIIntegrationHelper,
  AIAdapter,
  AIAdapterFactory,
  GeminiAdapter,
  AnthropicAdapter,
  OpenAIAdapter,
};

// Default export
export default {
  AIService,
  AIIntegrationHelper,
  AIAdapterFactory,
};
