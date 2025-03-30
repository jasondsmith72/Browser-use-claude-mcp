# Browser-use-claude-mcp

A browser automation MCP server for AI models like Claude and Gemini 2.5, enabling web browsing capabilities through natural language.

## Overview

This project implements a Model Context Protocol (MCP) server that provides browser automation capabilities to AI models. It allows AI assistants to browse the web, interact with websites, and extract information using natural language commands.

## Key Features

### Browser Automation

- 🌐 **Web Navigation**: Browse to any URL, follow links, and navigate through websites
- 🖱️ **Element Interaction**: Click buttons, links, and other elements on a page
- 📝 **Form Filling**: Input text, select options, and submit forms
- 📋 **Content Extraction**: Extract specific content from webpages using selectors
- 📸 **Screenshot Capture**: Take screenshots of full pages or specific elements
- 🔍 **Web Search**: Search the web and extract results from search engines

### Multi-Provider AI Support

- 🧠 **Google Gemini 2.5**: First-class support for Google's latest AI model
- 🤖 **Anthropic Claude**: Integration with Claude 3 and later models
- 🔮 **OpenAI**: Support for GPT-4 and later models
- 🔀 **Extensible Architecture**: Easy to add support for other AI providers

### Advanced Features

- 📊 **Vision Capabilities**: Analyze screenshots and images for enhanced understanding
- 💾 **Session Management**: Maintain state across multiple interactions
- 🧩 **Adapter Pattern**: Switch between AI providers without changing code
- 🔧 **Configurable**: Easily change settings via environment variables

## Installation

See [INSTALL.md](INSTALL.md) for detailed installation and setup instructions.

### Quick Start

```bash
# Clone the repository
git clone https://github.com/jasondsmith72/Browser-use-claude-mcp.git
cd Browser-use-claude-mcp

# Install dependencies
npm install

# Build the project
npm run build

# Run the server
npm start
```

## Configuration

Create a `.env` file based on `.env.example` and set your API keys and preferences:

```
# AI Provider (GEMINI, ANTHROPIC, or OPENAI)
MCP_MODEL_PROVIDER=GEMINI

# API Keys
GOOGLE_API_KEY=your_google_api_key
# ANTHROPIC_API_KEY=your_anthropic_api_key
# OPENAI_API_KEY=your_openai_api_key

# Browser Settings
CHROME_PATH=
CHROME_USER_DATA=
BROWSER_HEADLESS=false
```

## Usage with Claude Desktop

1. Edit your Claude Desktop configuration file:
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
        "MCP_MODEL_PROVIDER": "GEMINI",
        "GOOGLE_API_KEY": "your_google_api_key_here"
      }
    }
  }
}
```

3. Restart Claude Desktop

## Available Tools

The MCP server provides the following tools:

### browse_webpage

Navigate to a URL and extract its content.

```
browse_webpage(url="https://example.com")
```

### search_web

Perform a web search and return results.

```
search_web(query="latest AI news", numResults=5)
```

### take_screenshot

Capture a screenshot of the current page or a specific element.

```
take_screenshot(fullPage=true)
take_screenshot(selector="#main-content")
```

### click_element

Click on an element identified by text or selector.

```
click_element(text="Learn More")
click_element(selector=".signup-button")
```

### fill_form

Fill out form fields on a webpage.

```
fill_form(fields={
  "username": "johndoe",
  "email": "john@example.com",
  "message": "Hello, world!"
}, submit=true)
```

### extract_content

Extract specific content from a webpage using selectors.

```
extract_content(selectors={
  "title": "h1",
  "description": ".description",
  "price": ".product-price"
})
```

## Vision Capabilities

The server includes vision capabilities to analyze screenshots and images:

```
# Take a screenshot and analyze its content
screenshot = take_screenshot(fullPage=true)
analysis = analyze_image(screenshot, prompt="What products are shown on this page?")
```

## Session Management

All tools accept an optional `sessionId` parameter to maintain state across multiple interactions:

```
# First interaction
result1 = browse_webpage(url="https://example.com")
sessionId = result1.sessionId

# Subsequent interactions using the same session
result2 = click_element(text="Login", sessionId=sessionId)
```

## Development

```bash
# Run in development mode
npm run dev

# Run tests
npm test

# Run linting
npm run lint
```

## License

MIT

## Credits

This project builds upon the work of [browser-use](https://github.com/browser-use/browser-use) and other MCP server implementations. Special thanks to all contributors.
