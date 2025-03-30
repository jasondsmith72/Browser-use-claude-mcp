# Browser-use-claude-mcp

A browser automation MCP server for AI models like Claude and Gemini 2.5, enabling web browsing capabilities through natural language.

## Overview

This project implements a Model Context Protocol (MCP) server that provides browser automation capabilities to AI models. It allows AI assistants to browse the web, interact with websites, and extract information using natural language commands.

Key features:
- 🌐 Full browser automation (navigation, form filling, clicking, etc.)
- 🔍 Web search capabilities
- 📸 Screenshot capture for visual understanding
- 🤖 Multiple AI model support (Gemini 2.5, Claude, OpenAI)
- 🧠 Advanced webpage analysis with AI vision capabilities
- 🚀 Easy integration with any MCP-compatible client

## Gemini 2.5 Integration

This MCP server includes special integration with Google's Gemini 2.5 model. Key features:

- **Vision-Based Webpage Analysis**: Uses Gemini 2.5's vision capabilities to analyze webpages from both HTML content and visual screenshots
- **Advanced Question Answering**: Answer specific questions about webpage content using AI analysis
- **Multi-Modal Processing**: Combines textual and visual understanding for better browsing assistance

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

## Configuration

1. Create a `.env` file in your project root (use `.env.example` as a template):

```bash
cp .env.example .env
```

2. Configure your environment variables:
   - Set your preferred AI provider (`MCP_MODEL_PROVIDER`)
   - Add your API key for the chosen provider
   - Configure browser settings if needed

For detailed setup instructions, see [INSTALL.md](INSTALL.md).

## Usage

### With Claude Desktop

1. Add the MCP server to your Claude Desktop configuration:

**Windows**: Edit `%APPDATA%/Claude/claude_desktop_config.json`  
**MacOS**: Edit `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "browser-use-claude-mcp": {
      "command": "browser-use-claude-mcp",
      "env": {
        "CHROME_PATH": "",
        "CHROME_USER_DATA": "",
        "MCP_MODEL_PROVIDER": "GEMINI",
        "GOOGLE_API_KEY": "your_api_key_here"
      }
    }
  }
}
```

2. Restart Claude Desktop and you should see the browser tools available.

### With Other MCP Clients

You can use this server with any MCP client by configuring the client to connect to this server. Refer to your client's documentation for specific instructions.

## Available Tools

The MCP server provides the following tools:

- `browse_webpage`: Navigate to a URL and interact with the page
- `search_web`: Perform a web search and return results
- `take_screenshot`: Capture a screenshot of the current page
- `click_element`: Click on an element identified by text or selector
- `fill_form`: Fill out form fields on a webpage
- `extract_content`: Extract specific content from a webpage
- `analyze_webpage`: AI-powered analysis of webpage content (Gemini 2.5 feature)

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

# Analyze a webpage with Gemini 2.5
analyze_webpage(
  url="https://example.com/product",
  question="What are the key features of this product?",
  extractScreenshot=true
)
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

## AI Provider Support

This MCP server supports multiple AI providers:

- **Google Gemini**: Gemini 2.5 Pro, Gemini 2.5 Pro Vision
- **Anthropic Claude**: Claude 3.5 Sonnet
- **OpenAI**: GPT-4o

You can switch between providers by setting the `MCP_MODEL_PROVIDER` environment variable and providing the appropriate API key.

## License

MIT

## Credits

This project builds upon the work of browser-use and other MCP server implementations.
