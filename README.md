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

## Gemini 2.5 Integration

This MCP server provides specialized support for Google's Gemini 2.5 AI models, including:

- Optimized integration with Gemini 2.5 Pro and Gemini 2.5 Pro Vision
- Support for multimodal content (text + images)
- Structured content extraction and processing
- Session-based browsing for multi-turn interactions

To use Gemini 2.5 with this MCP server:

1. Obtain a Google API key with access to Gemini models
2. Configure the server with your API key and model preferences
3. Connect your MCP client (Claude Desktop, etc.) to the server

See the [examples/gemini-browser-example.js](examples/gemini-browser-example.js) file for a complete usage example.

## Installation

See [INSTALL.md](INSTALL.md) for detailed installation instructions.

### Prerequisites

- Node.js 18 or higher
- Chrome/Chromium browser installed
- API key from one of the supported AI providers (Google Gemini, Anthropic Claude, or OpenAI)

### Quick Start

```bash
# Clone the repository
git clone https://github.com/jasondsmith72/Browser-use-claude-mcp.git
cd Browser-use-claude-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Configure environment
cp .env.example .env
# Edit .env with your API keys and preferences

# Start the server
npm start
```

## Usage

### With Claude Desktop

1. Add the MCP server to your Claude Desktop configuration:

**Windows**: Edit `%APPDATA%/Claude/claude_desktop_config.json`  
**MacOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

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

2. Restart Claude Desktop and you should see the browser tools available.

### Supported AI Providers

The server supports the following AI providers:

- **Google Gemini** (Default)
  - Models: gemini-2.5-pro, gemini-2.5-pro-vision
  - Environment variables: `GOOGLE_API_KEY`, `GEMINI_MODEL_NAME`

- **Anthropic Claude**
  - Models: claude-3-5-sonnet-20241022, etc.
  - Environment variables: `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL_NAME`

- **OpenAI**
  - Models: gpt-4o, etc.
  - Environment variables: `OPENAI_API_KEY`, `OPENAI_MODEL_NAME`

You can select the provider using the `MCP_MODEL_PROVIDER` environment variable.

## Available Tools

The MCP server provides the following tools:

- `browse_webpage`: Navigate to a URL and interact with the page
- `search_web`: Perform a web search and return results
- `take_screenshot`: Capture a screenshot of the current page
- `click_element`: Click on an element identified by text or selector
- `fill_form`: Fill out form fields on a webpage
- `extract_content`: Extract specific content from a webpage

## Examples

Here are some examples of how to use the tools from an MCP client:

```
# Browse to a webpage
browse_webpage(url="https://example.com")

# Perform a web search
search_web(query="best programming languages 2025")

# Fill out a form
fill_form(url="https://example.com/contact", fields={
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello world!"
})
```

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

This project builds upon the work of [browser-use](https://github.com/browser-use/browser-use) and other MCP server implementations.
