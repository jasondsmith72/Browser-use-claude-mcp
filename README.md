# Browser-use-claude-mcp

A browser automation MCP server for AI models like Claude and Gemini 2.5, enabling web browsing capabilities through natural language.

## Overview

This project implements a Model Context Protocol (MCP) server that provides browser automation capabilities to AI models. It allows AI assistants to browse the web, interact with websites, and extract information using natural language commands.

### Key Features

- 🌐 **Full browser automation** - Navigation, form filling, clicking, etc.
- 🔍 **Web search capabilities** - Search the web and extract relevant information
- 📸 **Screenshot capture** - Take screenshots of web pages for visual understanding
- 🤖 **Multiple AI model support** - Works with Gemini 2.5, Claude, and OpenAI
- 🚀 **Easy integration** - Compatible with any MCP client (Claude Desktop, etc.)
- 🐳 **Docker support** - Run in a containerized environment

## Getting Started

### Prerequisites

- Node.js 18 or higher
- Chrome/Chromium browser
- API key for one of the supported AI providers:
  - Google Gemini
  - Anthropic Claude
  - OpenAI

### Installation Methods

#### Option 1: Local Installation

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

4. Configure environment variables:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and preferences
   ```

5. Start the server:
   ```bash
   npm start
   ```

#### Option 2: Docker Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/jasondsmith72/Browser-use-claude-mcp.git
   cd Browser-use-claude-mcp
   ```

2. Create a `.env` file with your API keys:
   ```bash
   cp .env.example .env
   # Edit .env with your API keys and preferences
   ```

3. Run with Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Configuration

### Environment Variables

The server can be configured using environment variables. Here are the most important ones:

| Variable | Description | Default |
|----------|-------------|---------|
| `MCP_MODEL_PROVIDER` | AI provider to use (`GEMINI`, `ANTHROPIC`, `OPENAI`) | `GEMINI` |
| `GOOGLE_API_KEY` | Google API key for Gemini | |
| `GEMINI_MODEL_NAME` | Gemini model name | `gemini-2.5-pro` |
| `ANTHROPIC_API_KEY` | Anthropic API key for Claude | |
| `ANTHROPIC_MODEL_NAME` | Claude model name | `claude-3-5-sonnet-20241022` |
| `OPENAI_API_KEY` | OpenAI API key | |
| `OPENAI_MODEL_NAME` | OpenAI model name | `gpt-4o` |
| `CHROME_PATH` | Path to Chrome executable | |
| `CHROME_USER_DATA` | Path to Chrome user data directory | |
| `CHROME_DEBUGGING_PORT` | Chrome debugging port | `9222` |
| `BROWSER_HEADLESS` | Run browser in headless mode | `false` |
| `LOG_LEVEL` | Logging level (`debug`, `info`, `warn`, `error`) | `info` |

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

## Available Tools

The MCP server provides the following tools:

| Tool | Description |
|------|-------------|
| `browse_webpage` | Navigate to a URL and extract its content |
| `search_web` | Perform a web search and return results |
| `take_screenshot` | Capture a screenshot of the current page |
| `click_element` | Click on an element identified by text or selector |
| `fill_form` | Fill out form fields on a webpage |
| `extract_content` | Extract specific content from a webpage |

## Example Usage

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

# Take a screenshot
take_screenshot(fullPage=true)

# Click on an element
click_element(text="Submit")

# Extract content
extract_content(selectors={"title": "h1", "content": ".main-content"})
```

## Development

```bash
# Run in development mode with automatic reloading
npm run dev

# Run tests
npm test

# Lint code
npm run lint
```

## Docker Support

This project includes Docker support for easy deployment. The Docker setup includes:

- Chrome/Chromium browser with all dependencies
- NodeJS environment for running the server
- Volume for persistency
- Appropriate security settings

Run with Docker Compose:

```bash
docker-compose up -d
```

## Troubleshooting

For detailed troubleshooting information, see [INSTALL.md](INSTALL.md).

## License

MIT

## Acknowledgments

This project builds upon the work of the [browser-use](https://github.com/browser-use/browser-use) project and various MCP server implementations. Special thanks to the original authors and contributors.
