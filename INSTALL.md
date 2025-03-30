# Installation and Setup Guide

This guide provides detailed instructions for installing and configuring the Browser-use-claude-mcp server.

## Prerequisites

Before getting started, make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) (usually comes with Node.js)
- [Chrome](https://www.google.com/chrome/) or [Chromium](https://www.chromium.org/getting-involved/download-chromium/) browser

## Installation

### Option 1: Install from Source

1. Clone the repository:
   ```bash
   git clone https://github.com/jasondsmith72/Browser-use-claude-mcp.git
   cd Browser-use-claude-mcp
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Build the project:
   ```bash
   npm run build
   ```

### Option 2: Install as a Package (Coming Soon)

```bash
npm install -g browser-use-claude-mcp
```

## Configuration

1. Create a `.env` file in the project root based on the `.env.example` template:
   ```bash
   cp .env.example .env
   ```

2. Edit the `.env` file to configure your environment:
   - Set `MCP_MODEL_PROVIDER` to your preferred AI model provider: `GEMINI`, `ANTHROPIC`, or `OPENAI`
   - Add your API key for the chosen provider
   - Configure browser settings if needed

## Setting Up AI Model Providers

### Google Gemini

1. Go to the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key for Gemini
3. Add it to your `.env` file:
   ```
   MCP_MODEL_PROVIDER=GEMINI
   GOOGLE_API_KEY=your_google_api_key_here
   GEMINI_MODEL_NAME=gemini-2.5-pro
   ```

### Anthropic Claude

1. Go to the [Anthropic Console](https://console.anthropic.com/)
2. Create an API key for Claude
3. Add it to your `.env` file:
   ```
   MCP_MODEL_PROVIDER=ANTHROPIC
   ANTHROPIC_API_KEY=your_anthropic_api_key_here
   ANTHROPIC_MODEL_NAME=claude-3-5-sonnet-20241022
   ```

### OpenAI

1. Go to the [OpenAI Platform](https://platform.openai.com/account/api-keys)
2. Create an API key for OpenAI
3. Add it to your `.env` file:
   ```
   MCP_MODEL_PROVIDER=OPENAI
   OPENAI_API_KEY=your_openai_api_key_here
   OPENAI_MODEL_NAME=gpt-4o
   ```

## Using with Claude Desktop

1. Locate the Claude Desktop configuration file:
   - Windows: `%APPDATA%/Claude/claude_desktop_config.json`
   - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add the MCP server configuration:
   ```json
   {
     "mcpServers": {
       "browser-use-claude-mcp": {
         "command": "node",
         "args": [
           "/path/to/Browser-use-claude-mcp/dist/index.js"
         ],
         "env": {
           "CHROME_PATH": "",
           "CHROME_USER_DATA": "",
           "MCP_MODEL_PROVIDER": "GEMINI",
           "GOOGLE_API_KEY": "your_google_api_key_here",
           "GEMINI_MODEL_NAME": "gemini-2.5-pro"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop for the changes to take effect.

## Troubleshooting

### Browser Connection Issues

If the server cannot connect to the browser:

1. Make sure Chrome or Chromium is installed
2. If using a custom Chrome path, verify the path in your configuration
3. Check that the debugging port (default: 9222) is not in use

### AI API Issues

If you encounter errors with the AI API:

1. Verify your API key is correct and has sufficient permissions
2. Check if your API usage quota or rate limits have been exceeded
3. Ensure you're using a supported model name

### General Issues

- Check the logs for detailed error messages
- Verify that your environment variables are correctly set

## Running for Development

```bash
npm run dev
```

This will start the server with nodemon for automatic reloading when files change.

## License

MIT
