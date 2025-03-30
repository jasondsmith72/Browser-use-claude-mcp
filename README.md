# Browser-use-claude-mcp

A browser automation MCP server for AI models like Claude and Gemini 2.5, enabling web browsing capabilities through natural language.

## Overview

This project implements a Model Context Protocol (MCP) server that provides browser automation capabilities to AI models. It allows AI assistants to browse the web, interact with websites, and extract information using natural language commands.

Key features:
- 🌐 Full browser automation (navigation, form filling, clicking, etc.)
- 🔍 Web search capabilities
- 📸 Screenshot capture with AI vision analysis
- 🤖 Multiple AI model support (Gemini 2.5, Claude, OpenAI)
- 🚀 Easy integration with any MCP-compatible client

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

See [INSTALL.md](INSTALL.md) for detailed installation and setup instructions.

## AI Provider Support

The MCP server supports multiple AI providers through a modular adapter system:

### Google Gemini 2.5

Gemini 2.5 is fully supported, including text generation and image analysis capabilities. The server automatically routes vision-based tasks to the appropriate Gemini model.

### Anthropic Claude

Claude is supported through the Anthropic API, with special handling for multimodal content in Claude 3 models.

### OpenAI

OpenAI models are supported, including GPT-4o for vision tasks.

## Available Tools

The MCP server provides the following tools:

- `browse_webpage`: Navigate to a URL and interact with the page
- `search_web`: Perform a web search and return results
- `take_screenshot`: Capture a screenshot of the current page
- `analyze_screenshot`: Analyze a screenshot using AI vision capabilities
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
      "command": "browser-use-claude-mcp",
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

Here are some examples of how to use the tools from an MCP client:

```
# Browse to a webpage
browse_webpage(url="https://example.com")

# Perform a web search
search_web(query="best programming languages 2025")

# Take and analyze a screenshot
take_screenshot(fullPage=true)
analyze_screenshot(question="What are the main navigation options on this page?")

# Fill out a form
fill_form(fields={
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello world!"
}, submit=true)
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Credits

This project builds upon the work of [browser-use](https://github.com/browser-use/browser-use) and other MCP server implementations.
