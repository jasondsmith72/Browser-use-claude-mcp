# Browser-use-claude-mcp

A browser automation MCP server for AI models like Claude and Gemini 2.5, enabling web browsing capabilities through natural language.

## Overview

This project implements a Model Context Protocol (MCP) server that provides browser automation capabilities to AI models. It allows AI assistants to browse the web, interact with websites, and extract information using natural language commands.

## Key Features

### 🌐 Browser Automation Features
- Full browser automation (navigation, form filling, clicking, etc.)
- Web search capabilities
- Screenshot capture for visual understanding
- Content extraction and analysis

### 🤖 AI Features
- Support for multiple AI providers:
  - **Google Gemini 2.5 (primary focus)**
  - Anthropic Claude
  - OpenAI
- Image analysis (vision) capabilities
- AI-powered content analysis

### 🔧 Technical Features
- Written in TypeScript for maximum reliability
- Modular architecture with clean separation of concerns
- Comprehensive logging and error handling
- Easy configuration through environment variables

## Available Tools

| Tool Name | Description |
|-----------|-------------|
| `browse_webpage` | Navigate to a URL and extract its content |
| `search_web` | Perform a web search and return results |
| `take_screenshot` | Capture a screenshot of the current page |
| `click_element` | Click on an element by text or selector |
| `fill_form` | Fill out form fields with provided values |
| `extract_content` | Extract specific content from a webpage |
| `analyze_content` | AI-powered analysis of webpage content |

## Getting Started

See [INSTALL.md](INSTALL.md) for detailed installation and setup instructions.

### Quick Start

1. Clone the repository
   ```bash
   git clone https://github.com/jasondsmith72/Browser-use-claude-mcp.git
   cd Browser-use-claude-mcp
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file (use `.env.example` as a template)
   ```bash
   cp .env.example .env
   ```

4. Build the project
   ```bash
   npm run build
   ```

5. Start the server
   ```bash
   npm start
   ```

### Configuration

The server can be configured through environment variables in your `.env` file:

```
# Browser configuration
CHROME_PATH=
CHROME_USER_DATA=
CHROME_DEBUGGING_PORT=9222

# AI provider (GEMINI, ANTHROPIC, OPENAI)
MCP_MODEL_PROVIDER=GEMINI

# API keys (use the one for your chosen provider)
GOOGLE_API_KEY=your_google_api_key_here
ANTHROPIC_API_KEY=your_anthropic_api_key_here
OPENAI_API_KEY=your_openai_api_key_here
```

## Using with Claude Desktop

1. Locate the Claude Desktop configuration file:
   - Windows: `%APPDATA%/Claude/claude_desktop_config.json`
   - MacOS: `~/Library/Application Support/Claude/claude_desktop_config.json`

2. Add this MCP server to your configuration:
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
           "GOOGLE_API_KEY": "your_google_api_key_here"
         }
       }
     }
   }
   ```

3. Restart Claude Desktop for the changes to take effect.

## Examples

### Basic Web Browsing

```
browse_webpage(url="https://example.com")
```

### Web Search

```
search_web(query="best programming languages 2025")
```

### Filling a Form

```
fill_form(fields={
  "name": "John Doe",
  "email": "john@example.com",
  "message": "Hello world!"
}, submit=true)
```

### AI Content Analysis

```
analyze_content(
  url="https://en.wikipedia.org/wiki/Artificial_intelligence",
  instructions="Summarize the key developments in AI in the last decade"
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

## License

MIT

## Credits

This project builds upon the work of browser-use and other MCP server implementations.
