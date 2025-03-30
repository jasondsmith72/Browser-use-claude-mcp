# Browser-use-claude-mcp

A browser automation MCP server for AI models like Claude and Gemini 2.5, enabling web browsing capabilities through natural language.

## Overview

This project implements a Model Context Protocol (MCP) server that provides browser automation capabilities to AI models. It allows AI assistants to browse the web, interact with websites, and extract information using natural language commands.

Key features:
- 🌐 Full browser automation (navigation, form filling, clicking, etc.)
- 🔍 Web search capabilities
- 📸 Screenshot capture for visual understanding
- 🤖 Multiple AI model support (Gemini 2.5, Claude, OpenAI)
- 🚀 Easy integration with any MCP-compatible client

## AI Model Support

This project supports multiple AI model providers through a flexible adapter pattern:

### Gemini 2.5

Gemini 2.5 is Google's latest large language model with enhanced reasoning capabilities and a larger context window. This project includes specialized integration for Gemini 2.5, providing:

- Text generation with customizable parameters
- Image analysis capabilities
- Chat conversation support

### Claude

Claude is Anthropic's large language model with advanced reasoning and conversation abilities. The project supports:

- Text generation with Claude models
- Image analysis with Claude's multimodal capabilities
- Chat conversation support

### OpenAI

Support for OpenAI models like GPT-4 and GPT-4o provides:

- Text generation
- Image analysis
- Chat conversation support

## Installation

### Prerequisites

- Node.js 18 or higher
- Chrome/Chromium browser installed
- API key from one of the supported AI providers (Google Gemini, Anthropic Claude, or OpenAI)

### Install from NPM

```bash
# Install globally
npm install -g browser-use-claude-mcp

# Or install locally in your project
npm install browser-use-claude-mcp
```

### Install from Source

```bash
# Clone the repository
git clone https://github.com/jasondsmith72/Browser-use-claude-mcp.git
cd Browser-use-claude-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

For detailed installation instructions, see [INSTALL.md](INSTALL.md).

## Configuration

1. Create a `.env` file in your project root (use `.env.example` as a template):

```bash
cp .env.example .env
```

2. Configure your environment variables:
   - Set your preferred AI provider (`MCP_MODEL_PROVIDER`)
   - Add your API key for the chosen provider
   - Configure browser settings if needed

## Available Tools

The MCP server provides the following tools:

- `browse_webpage`: Navigate to a URL and interact with the page
- `search_web`: Perform a web search and return results
- `take_screenshot`: Capture a screenshot of the current page
- `click_element`: Click on an element identified by text or selector
- `fill_form`: Fill out form fields on a webpage
- `extract_content`: Extract specific content from a webpage

## Usage with Claude Desktop

1. Add the MCP server to your Claude Desktop configuration:

**Windows**: Edit `%APPDATA%/Claude/claude_desktop_config.json`  
**MacOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "browser-use-claude-mcp": {
      "command": "node",
      "args": [
        "dist/index.js"
      ],
      "env": {
        "CHROME_PATH": "",
        "CHROME_USER_DATA": "",
        "MCP_MODEL_PROVIDER": "GEMINI",
        "GOOGLE_API_KEY": "your_api_key_here",
        "GEMINI_MODEL_NAME": "gemini-2.5-pro"
      }
    }
  }
}
```

2. Restart Claude Desktop and you should see the browser tools available.

## Examples

You can find example code in the `src/examples` directory:

- `gemini25-example.ts`: Demonstrates integration with Gemini 2.5
- More examples coming soon!

## Architecture

This project uses a modular architecture with adapter patterns to support multiple AI providers:

- **Browser Manager**: Handles browser automation using Puppeteer
- **AI Service**: Provides a unified interface for AI model interactions
- **AI Adapters**: Provider-specific implementations for each AI model
- **MCP Tools**: Tools that leverage browser and AI capabilities

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## License

MIT

## Credits

This project builds upon the work of browser-use and other MCP server implementations.
