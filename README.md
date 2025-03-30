# Browser-use-claude-mcp

A browser automation MCP server for AI models like Claude and Gemini 2.5, enabling web browsing capabilities through natural language.

## Overview

This project implements a Model Context Protocol (MCP) server that provides browser automation capabilities to AI models. It allows AI assistants to browse the web, interact with websites, and extract information using natural language commands.

Key features:
- 🌐 Full browser automation (navigation, form filling, clicking, etc.)
- 🔍 Web search capabilities
- 📸 Screenshot capture for visual understanding
- 🧠 AI-powered content analysis with multiple models (Gemini 2.5, Claude, OpenAI)
- 🤖 Multiple AI model support
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

## Configuration

1. Create a `.env` file in your project root (use `.env.example` as a template):

```bash
cp .env.example .env
```

2. Configure your environment variables:
   - Set your preferred AI provider (`MCP_MODEL_PROVIDER`)
   - Add your API key for the chosen provider
   - Configure browser settings if needed

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

### browse_webpage

Navigate to a URL and interact with the page.

```json
{
  "url": "https://example.com",
  "waitForSelector": ".content",
  "timeout": 30000,
  "sessionId": "optional-session-id"
}
```

### search_web

Perform a web search and return results.

```json
{
  "query": "best programming languages 2025",
  "numResults": 5,
  "site": "example.com",
  "sessionId": "optional-session-id"
}
```

### take_screenshot

Capture a screenshot of the current page.

```json
{
  "selector": "#main-content",
  "fullPage": true,
  "sessionId": "optional-session-id"
}
```

### click_element

Click on an element identified by text or selector.

```json
{
  "text": "Sign In",
  "selector": ".login-button",
  "index": 0,
  "waitForNavigation": true,
  "timeout": 30000,
  "sessionId": "optional-session-id"
}
```

### fill_form

Fill out form fields on a webpage.

```json
{
  "fields": {
    "username": "user@example.com",
    "password": "secretpassword"
  },
  "submit": true,
  "submitSelector": "button[type=submit]",
  "waitForNavigation": true,
  "timeout": 30000,
  "sessionId": "optional-session-id"
}
```

### extract_content

Extract specific content from a webpage.

```json
{
  "selectors": {
    "title": "h1",
    "subtitle": "h2",
    "content": ".main-content"
  },
  "extractHtml": false,
  "extractText": true,
  "extractLinks": true,
  "extractTables": true,
  "sessionId": "optional-session-id"
}
```

### analyze_content

Analyze webpage content with AI to answer specific questions.

```json
{
  "question": "What are the key features mentioned on this page?",
  "takeScreenshot": true,
  "maxTokens": 2048,
  "temperature": 0.5,
  "sessionId": "optional-session-id"
}
```

## AI Provider Support

This server supports multiple AI providers:

### Google Gemini 2.5

```
MCP_MODEL_PROVIDER=GEMINI
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL_NAME=gemini-2.5-pro
```

### Anthropic Claude

```
MCP_MODEL_PROVIDER=ANTHROPIC
ANTHROPIC_API_KEY=your_anthropic_api_key_here
ANTHROPIC_MODEL_NAME=claude-3-5-sonnet-20241022
```

### OpenAI

```
MCP_MODEL_PROVIDER=OPENAI
OPENAI_API_KEY=your_openai_api_key_here
OPENAI_MODEL_NAME=gpt-4o
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

This project builds upon the work of browser-use and other MCP server implementations.
