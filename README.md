# Browser-use-claude-mcp

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green)](https://nodejs.org/)

A browser automation MCP server for AI models like Claude, Gemini 2.5, and OpenAI, enabling web browsing capabilities through natural language.

## 🌟 Features

- 🌐 **Full Browser Automation**: Navigate websites, click elements, fill forms, and extract content
- 🔍 **Web Search**: Perform searches and analyze results
- 🤖 **Multiple AI Providers**: Support for Google Gemini 2.5, Anthropic Claude, and OpenAI
- 🖼️ **Screenshot Capture**: Capture and analyze webpage screenshots
- 🧩 **MCP Standard**: Fully compatible with the Model Context Protocol for AI agents
- 🔌 **Easy Integration**: Works with Claude Desktop, Cursor, and other MCP clients

## ⚡ Quick Start

### Prerequisites

- Node.js 18 or higher
- Chrome/Chromium browser
- API key from one of the supported AI providers

### Installation

```bash
# Clone the repository
git clone https://github.com/jasondsmith72/Browser-use-claude-mcp.git
cd Browser-use-claude-mcp

# Install dependencies
npm install

# Build the project
npm run build
```

### Configuration

1. Create a `.env` file by copying the example:
   ```bash
   cp .env.example .env
   ```

2. Configure your preferred AI provider in the `.env` file:
   ```
   MCP_MODEL_PROVIDER=GEMINI
   GOOGLE_API_KEY=your_google_api_key_here
   ```

### Integration with Claude Desktop

1. Edit the Claude Desktop configuration file:
   - Windows: `%APPDATA%/Claude/claude_desktop_config.json`
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add the MCP server configuration:
   ```json
   {
     "mcpServers": {
       "browser-use-claude-mcp": {
         "command": "node",
         "args": [
           "/path/to/dist/index.js"
         ],
         "env": {
           "MCP_MODEL_PROVIDER": "GEMINI",
           "GOOGLE_API_KEY": "your_google_api_key_here"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop.

## 🛠️ Available Tools

The MCP server provides the following tools for browser automation:

### `browse_webpage`

Navigate to a webpage and extract its content.

```js
browse_webpage(url="https://example.com")
```

### `search_web`

Perform a web search and get results.

```js
search_web(query="the meaning of life", numResults=5)
```

### `take_screenshot`

Capture a screenshot of the current webpage.

```js
take_screenshot(fullPage=true)
```

### `click_element`

Click on an element identified by text or selector.

```js
click_element(text="Sign Up", waitForNavigation=true)
```

### `fill_form`

Fill out form fields on a webpage.

```js
fill_form(fields={
  "username": "john_doe",
  "email": "john@example.com",
  "password": "secureP@ssw0rd"
}, submit=true)
```

### `extract_content`

Extract specific content from a webpage.

```js
extract_content(selectors={
  "title": "h1.page-title",
  "price": ".product-price",
  "description": ".product-description"
}, extractLinks=true)
```

## 🧩 AI Provider Support

### Google Gemini 2.5

Optimized for Gemini 2.5, with support for text generation and vision capabilities.

### Anthropic Claude

Full support for Claude models, with multimodal capabilities for image analysis.

### OpenAI

Support for GPT models, including vision capabilities for image analysis.

## 🔄 Session Management

The server maintains browser sessions across requests, allowing for multi-step interactions with websites. You can specify a `sessionId` in your requests to continue using an existing browser session:

```js
// First request
const result1 = await browse_webpage(url="https://example.com");
const sessionId = result1.sessionId;

// Follow-up request using the same session
const result2 = await click_element(text="Login", sessionId=sessionId);
```

## 📚 Documentation

For detailed installation and configuration instructions, see [INSTALL.md](./INSTALL.md).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [browser-use](https://github.com/browser-use/browser-use) - For inspiration and concepts
- [Model Context Protocol](https://modelcontextprotocol.io/) - For the MCP standard
- [Puppeteer](https://pptr.dev/) - For browser automation capabilities
