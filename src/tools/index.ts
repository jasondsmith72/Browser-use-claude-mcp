import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { registerBrowseWebpageTool } from './browseWebpage.js';
import { registerSearchWebTool } from './searchWeb.js';
import { registerTakeScreenshotTool } from './takeScreenshot.js';
import { registerClickElementTool } from './clickElement.js';
import { registerFillFormTool } from './fillForm.js';
import { registerExtractContentTool } from './extractContent.js';
import { registerAnalyzeScreenshotTool } from './analyzeScreenshot.js';
import { setupLogger, createContextLogger } from '../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'ToolsIndex');

/**
 * Sets up all available tools for the MCP server
 * @param server The MCP server instance
 * @param browserManager The browser manager instance
 */
export function setupTools(server: Server, browserManager: BrowserManager): void {
  logger.info('Setting up tools...');
  
  // Register all the tools
  registerBrowseWebpageTool(server, browserManager);
  registerSearchWebTool(server, browserManager);
  registerTakeScreenshotTool(server, browserManager);
  registerClickElementTool(server, browserManager);
  registerFillFormTool(server, browserManager);
  registerExtractContentTool(server, browserManager);
  registerAnalyzeScreenshotTool(server, browserManager);
  
  logger.info('Tools setup complete');
}

export default {
  setupTools,
};
