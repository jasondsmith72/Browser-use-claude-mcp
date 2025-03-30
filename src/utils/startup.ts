import winston from 'winston';
import { Config } from '../config/index.js';
import chalk from 'chalk';

/**
 * Logs server startup information
 * @param logger Winston logger instance
 */
export function logStartupInfo(logger: winston.Logger): void {
  // Server info block
  const serverName = chalk.bold.blue(Config.server.name);
  const serverVersion = chalk.yellow(`v${Config.server.version}`);
  
  logger.info(`Starting ${serverName} ${serverVersion}`);
  logger.info(`Log level: ${Config.server.logLevel}`);
  
  // AI provider info block
  let aiProviderInfo = '';
  switch (Config.ai.provider) {
    case 'GEMINI':
      aiProviderInfo = `Google Gemini (${Config.ai.gemini.modelName})`;
      break;
    case 'ANTHROPIC':
      aiProviderInfo = `Anthropic Claude (${Config.ai.anthropic.modelName})`;
      break;
    case 'OPENAI':
      aiProviderInfo = `OpenAI (${Config.ai.openai.modelName})`;
      break;
    default:
      aiProviderInfo = Config.ai.provider;
  }
  
  logger.info(`AI Provider: ${aiProviderInfo}`);
  
  // Browser info block
  const headlessMode = Config.browser.headless ? 'headless' : 'visible';
  const persistentMode = Config.browser.persistentSession ? 'persistent' : 'ephemeral';
  
  logger.info(`Browser mode: ${headlessMode}, ${persistentMode}`);
  logger.info(`Browser resolution: ${Config.browser.windowWidth}x${Config.browser.windowHeight}`);
  
  // Log environment info if in debug mode
  if (Config.server.logLevel === 'debug') {
    logger.debug('Environment configuration:', Config);
  }
}

export default {
  logStartupInfo,
};
