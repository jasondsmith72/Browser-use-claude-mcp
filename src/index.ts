#!/usr/bin/env node

import dotenv from 'dotenv';
import { Server, StdioServerTransport } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from './browser/browserManager.js';
import { setupTools } from './tools/index.js';
import { setupLogger } from './utils/logger.js';
import { logStartupInfo } from './utils/startup.js';
import { Config, validateConfig } from './config/index.js';
import { AIService } from './ai/aiService.js';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = setupLogger();

async function main() {
  try {
    // Validate required configuration
    validateConfig();
    
    // Log startup info
    logStartupInfo(logger);

    // Initialize AI service
    logger.info('Initializing AI service...');
    const aiService = new AIService();
    
    // Initialize server
    const server = new Server({
      transport: new StdioServerTransport(),
    });

    // Initialize browser manager
    logger.info('Initializing browser manager...');
    const browserManager = new BrowserManager(Config.browser);
    await browserManager.initialize();

    // Register tools
    logger.info('Registering tools...');
    setupTools(server, browserManager);

    // Initialize and start server
    logger.info('Starting MCP server...');
    await server.start();
    logger.info('MCP server started successfully');
    
    // Setup graceful shutdown
    const shutdown = async () => {
      logger.info('Shutting down...');
      
      // Close browser
      try {
        await browserManager.close();
      } catch (error) {
        logger.error(`Error closing browser: ${error instanceof Error ? error.message : String(error)}`);
      }
      
      // Exit process
      process.exit(0);
    };
    
    // Handle graceful shutdown
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
    
    // Handle unhandled errors
    process.on('uncaughtException', (error) => {
      logger.error(`Uncaught exception: ${error instanceof Error ? error.message : String(error)}`);
      if (error instanceof Error) {
        logger.error(error.stack || 'No stack trace available');
      }
    });
    
    process.on('unhandledRejection', (reason, promise) => {
      logger.error(`Unhandled rejection at: ${promise}, reason: ${reason}`);
    });
    
  } catch (error) {
    logger.error(`Error starting MCP server: ${error instanceof Error ? error.message : String(error)}`);
    logger.debug(error);
    process.exit(1);
  }
}

// Start the server
main();
