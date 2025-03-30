#!/usr/bin/env node

import dotenv from 'dotenv';
import { Server, StdioServerTransport } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from './browser/browserManager.js';
import { setupTools } from './tools/index.js';
import { setupLogger } from './utils/logger.js';
import { logStartupInfo } from './utils/startup.js';
import { Config } from './config/index.js';

// Load environment variables
dotenv.config();

// Initialize logger
const logger = setupLogger();

async function main() {
  try {
    // Log startup info
    logStartupInfo(logger);

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
  } catch (error) {
    logger.error(`Error starting MCP server: ${error instanceof Error ? error.message : String(error)}`);
    logger.debug(error);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Received SIGTERM, shutting down...');
  process.exit(0);
});

// Start the server
main();
