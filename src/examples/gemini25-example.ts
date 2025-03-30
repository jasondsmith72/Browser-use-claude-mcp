/**
 * Example of using the Browser-use-claude-mcp server with Gemini 2.5
 * 
 * This example demonstrates how to use the MCP server tools with the Gemini 2.5 model.
 * 
 * To run this example:
 * 1. Make sure the MCP server is configured and running
 * 2. Set the GOOGLE_API_KEY and other required environment variables
 * 3. Run the example with `ts-node src/examples/gemini25-example.ts`
 */

import puppeteer from 'puppeteer';
import AIService from '../ai/aiService.js';
import { BrowserManager } from '../browser/browserManager.js';
import { setupLogger, createContextLogger } from '../utils/logger.js';
import { Config } from '../config/index.js';

// Configure environment variables
process.env.MCP_MODEL_PROVIDER = 'GEMINI';
process.env.GEMINI_MODEL_NAME = 'gemini-2.5-pro';
// Set your API key here or in .env file
// process.env.GOOGLE_API_KEY = 'your_api_key_here';

// Logger
const logger = createContextLogger(setupLogger(), 'Gemini25Example');

/**
 * Example browser automation with Gemini 2.5 integration
 */
async function runExample() {
  logger.info('Starting Gemini 2.5 example');
  
  // Initialize browser manager
  const browserConfig = {
    chromePath: '',
    userDataDir: '',
    debuggingPort: 9222,
    debuggingHost: 'localhost',
    persistentSession: false,
    headless: false,
    disableSecurity: false,
    windowWidth: 1280,
    windowHeight: 720,
  };
  
  const browserManager = new BrowserManager(browserConfig);
  await browserManager.initialize();
  
  try {
    // Get a browser page
    const { page, sessionId } = await browserManager.getPage();
    
    // Navigate to a website
    logger.info('Navigating to example.com');
    await page.goto('https://example.com');
    
    // Take a screenshot
    const screenshot = await page.screenshot({ type: 'png' });
    const screenshotBase64 = screenshot.toString('base64');
    
    // Initialize AI service
    const aiService = new AIService();
    
    // Generate text about the webpage using Gemini 2.5
    logger.info('Generating text about the webpage using Gemini 2.5');
    const textResponse = await aiService.generateText(
      'Describe the purpose of example.com based on its content.',
      {
        temperature: 0.4,
        maxTokens: 2048,
      }
    );
    
    logger.info('Gemini 2.5 text response:');
    logger.info(textResponse.text);
    
    // Generate text with image analysis capabilities using Gemini 2.5
    logger.info('Generating text with image analysis using Gemini 2.5');
    const imageResponse = await aiService.generateTextWithImage(
      'What is shown on this webpage? Describe all the visual elements you can see.',
      screenshotBase64,
      'image/png',
      {
        temperature: 0.4,
        maxTokens: 2048,
      }
    );
    
    logger.info('Gemini 2.5 image analysis response:');
    logger.info(imageResponse.text);
    
    // Generate a chat response using Gemini 2.5
    logger.info('Generating chat response using Gemini 2.5');
    const chatResponse = await aiService.generateChatResponse(
      [
        { role: 'user', content: 'What can I do with the example.com domain?' },
        { role: 'model', content: 'Example.com is a domain reserved for illustrative examples in documentation and testing. You cannot actually use it for a personal or commercial website.' },
        { role: 'user', content: 'Who owns the example.com domain?' },
      ],
      {
        temperature: 0.4,
        maxTokens: 2048,
      }
    );
    
    logger.info('Gemini 2.5 chat response:');
    logger.info(chatResponse.text);
    
    // Get information about the Gemini model
    logger.info('Gemini 2.5 model information:');
    logger.info(`- Provider: ${textResponse.provider}`);
    logger.info(`- Model: ${textResponse.model}`);
    
    // Close the browser
    logger.info('Closing browser');
    await browserManager.close();
    
    logger.info('Example completed successfully');
  } catch (error) {
    logger.error(`Error running example: ${error instanceof Error ? error.message : String(error)}`);
    await browserManager.close();
  }
}

// Run the example
runExample().catch(error => {
  logger.error(`Unhandled error in example: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
});
