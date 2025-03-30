// Configuration module that loads settings from environment variables

export const Config = {
  server: {
    name: process.env.SERVER_NAME || 'browser-use-claude-mcp',
    version: process.env.SERVER_VERSION || '1.0.0',
    logLevel: process.env.LOG_LEVEL || 'info',
    telemetry: process.env.ANONYMIZED_TELEMETRY === 'true',
  },
  browser: {
    chromePath: process.env.CHROME_PATH || '',
    userDataDir: process.env.CHROME_USER_DATA || '',
    debuggingPort: parseInt(process.env.CHROME_DEBUGGING_PORT || '9222', 10),
    debuggingHost: process.env.CHROME_DEBUGGING_HOST || 'localhost',
    persistentSession: process.env.CHROME_PERSISTENT_SESSION === 'true',
    headless: process.env.BROWSER_HEADLESS === 'true',
    disableSecurity: process.env.BROWSER_DISABLE_SECURITY === 'true',
    windowWidth: parseInt(process.env.BROWSER_WINDOW_WIDTH || '1280', 10),
    windowHeight: parseInt(process.env.BROWSER_WINDOW_HEIGHT || '720', 10),
  },
  ai: {
    provider: (process.env.MCP_MODEL_PROVIDER || 'GEMINI').toUpperCase(),
    // Gemini configuration
    gemini: {
      apiKey: process.env.GOOGLE_API_KEY || '',
      modelName: process.env.GEMINI_MODEL_NAME || 'gemini-2.5-pro',
    },
    // Claude configuration
    anthropic: {
      apiKey: process.env.ANTHROPIC_API_KEY || '',
      modelName: process.env.ANTHROPIC_MODEL_NAME || 'claude-3-5-sonnet-20241022',
    },
    // OpenAI configuration
    openai: {
      apiKey: process.env.OPENAI_API_KEY || '',
      modelName: process.env.OPENAI_MODEL_NAME || 'gpt-4o',
    },
  },
};

// Validate required configuration
export function validateConfig(): void {
  // Check for AI provider
  if (!Config.ai.provider) {
    throw new Error('No AI provider specified. Set MCP_MODEL_PROVIDER environment variable.');
  }

  // Check for appropriate API key based on provider
  switch (Config.ai.provider) {
    case 'GEMINI':
      if (!Config.ai.gemini.apiKey) {
        throw new Error('Missing Google API key. Set GOOGLE_API_KEY environment variable.');
      }
      break;
    case 'ANTHROPIC':
      if (!Config.ai.anthropic.apiKey) {
        throw new Error('Missing Anthropic API key. Set ANTHROPIC_API_KEY environment variable.');
      }
      break;
    case 'OPENAI':
      if (!Config.ai.openai.apiKey) {
        throw new Error('Missing OpenAI API key. Set OPENAI_API_KEY environment variable.');
      }
      break;
    default:
      throw new Error(`Unsupported AI provider: ${Config.ai.provider}`);
  }
}

export default {
  Config,
  validateConfig,
};
