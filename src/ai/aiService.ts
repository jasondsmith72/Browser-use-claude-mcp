import { GoogleGenerativeAI } from '@google/generative-ai';
import { Config } from '../config/index.js';
import { setupLogger, createContextLogger } from '../utils/logger.js';
import fetch from 'node-fetch';

// Logger
const logger = createContextLogger(setupLogger(), 'AIService');

// Types
export interface AIResponse {
  text: string;
  model: string;
  provider: string;
}

export interface AIOptions {
  maxTokens?: number;
  temperature?: number;
  topP?: number;
  topK?: number;
}

export type AIProvider = 'GEMINI' | 'ANTHROPIC' | 'OPENAI';

/**
 * Service that handles interactions with AI providers
 */
export class AIService {
  private provider: AIProvider;

  constructor() {
    this.provider = Config.ai.provider as AIProvider;
    logger.info(`Initializing AI service with provider: ${this.provider}`);
  }

  /**
   * Generate text from the configured AI provider
   * @param prompt The text prompt
   * @param options Generation options
   * @returns The AI response
   */
  async generateText(prompt: string, options: AIOptions = {}): Promise<AIResponse> {
    try {
      switch (this.provider) {
        case 'GEMINI':
          return await this.generateWithGemini(prompt, options);
        case 'ANTHROPIC':
          return await this.generateWithAnthropic(prompt, options);
        case 'OPENAI':
          return await this.generateWithOpenAI(prompt, options);
        default:
          throw new Error(`Unsupported AI provider: ${this.provider}`);
      }
    } catch (error) {
      logger.error(`Error generating text: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Generate text using Google's Gemini API
   * @param prompt The text prompt
   * @param options Generation options
   * @returns The AI response
   */
  private async generateWithGemini(
    prompt: string, 
    options: AIOptions
  ): Promise<AIResponse> {
    try {
      const apiKey = Config.ai.gemini.apiKey;
      const modelName = Config.ai.gemini.modelName;
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      
      const generationConfig = {
        temperature: options.temperature ?? 0.7,
        topK: options.topK ?? 40,
        topP: options.topP ?? 0.95,
        maxOutputTokens: options.maxTokens ?? 8192,
      };
      
      const result = await model.generateContent({
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig,
      });
      
      const response = result.response;
      const text = response.text();
      
      return {
        text,
        model: modelName,
        provider: 'GEMINI',
      };
    } catch (error) {
      logger.error(`Error with Gemini: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Generate text using Anthropic's Claude API
   * @param prompt The text prompt
   * @param options Generation options
   * @returns The AI response
   */
  private async generateWithAnthropic(
    prompt: string, 
    options: AIOptions
  ): Promise<AIResponse> {
    try {
      const apiKey = Config.ai.anthropic.apiKey;
      const modelName = Config.ai.anthropic.modelName;
      
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'user', content: prompt },
          ],
          max_tokens: options.maxTokens ?? 4096,
          temperature: options.temperature ?? 0.7,
          top_p: options.topP ?? 0.95,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Anthropic API error (${response.status}): ${errorText}`);
      }
      
      const result = await response.json() as any;
      
      return {
        text: result.content?.[0]?.text || '',
        model: modelName,
        provider: 'ANTHROPIC',
      };
    } catch (error) {
      logger.error(`Error with Anthropic: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }

  /**
   * Generate text using OpenAI's API
   * @param prompt The text prompt
   * @param options Generation options
   * @returns The AI response
   */
  private async generateWithOpenAI(
    prompt: string, 
    options: AIOptions
  ): Promise<AIResponse> {
    try {
      const apiKey = Config.ai.openai.apiKey;
      const modelName = Config.ai.openai.modelName;
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: modelName,
          messages: [
            { role: 'user', content: prompt },
          ],
          max_tokens: options.maxTokens ?? 4096,
          temperature: options.temperature ?? 0.7,
          top_p: options.topP ?? 1,
        }),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`OpenAI API error (${response.status}): ${errorText}`);
      }
      
      const result = await response.json() as any;
      
      return {
        text: result.choices?.[0]?.message?.content || '',
        model: modelName,
        provider: 'OPENAI',
      };
    } catch (error) {
      logger.error(`Error with OpenAI: ${error instanceof Error ? error.message : String(error)}`);
      throw error;
    }
  }
}

export default AIService;
