# Gemini 2.5 Integration Guide

This guide provides detailed information about integrating with Google's Gemini 2.5 model in the Browser-use-claude-mcp server.

## Overview

Gemini 2.5 is Google's latest large language model with enhanced reasoning capabilities and a larger context window. It excels at understanding and generating text, analyzing images, and maintaining context in conversations.

The Browser-use-claude-mcp server includes specialized integration for Gemini 2.5, providing:

- Text generation with customizable parameters
- Image analysis capabilities
- Chat conversation support

## Setup

### Prerequisites

- Google AI API key (obtain from [Google AI Studio](https://makersuite.google.com/app/apikey))
- Google Gemini 2.5 API access (as of March 2025)

### Configuration

1. Set the following environment variables in your `.env` file:

```
MCP_MODEL_PROVIDER=GEMINI
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL_NAME=gemini-2.5-pro
```

2. Or configure them in the Claude Desktop configuration file:

```json
{
  "mcpServers": {
    "browser-use-claude-mcp": {
      "command": "node",
      "args": [
        "dist/index.js"
      ],
      "env": {
        "MCP_MODEL_PROVIDER": "GEMINI",
        "GOOGLE_API_KEY": "your_google_api_key_here",
        "GEMINI_MODEL_NAME": "gemini-2.5-pro"
      }
    }
  }
}
```

## Available Models

Gemini offers several models that can be used with this MCP server:

- `gemini-2.5-pro`: Recommended general-purpose model with advanced reasoning
- `gemini-2.5-flash`: Faster but slightly less capable model
- `gemini-2.5-pro-vision`: When utilizing image analysis capabilities

You can specify the model in the `GEMINI_MODEL_NAME` environment variable.

## Generation Parameters

The Gemini adapter supports the following generation parameters:

- `temperature`: Controls randomness (0.0 = deterministic, 1.0 = creative)
- `topK`: Limits token selection to the K most likely tokens
- `topP`: Limits token selection to a cumulative probability
- `maxOutputTokens`: Maximum number of tokens to generate
- `stopSequences`: Sequences that will stop generation when encountered

Example:

```typescript
const response = await aiService.generateText(
  "Describe the purpose of example.com",
  {
    temperature: 0.4,
    maxTokens: 2048,
  }
);
```

## Image Analysis

Gemini 2.5 has strong multimodal capabilities, enabling it to analyze images and generate text descriptions or answer questions about them.

Example:

```typescript
// Take a screenshot
const screenshot = await page.screenshot({ type: 'png' });
const screenshotBase64 = screenshot.toString('base64');

// Generate text with image analysis
const response = await aiService.generateTextWithImage(
  "What is shown on this webpage?",
  screenshotBase64,
  "image/png",
  {
    temperature: 0.4,
    maxTokens: 2048,
  }
);
```

## Chat Conversations

Gemini 2.5 supports chat-style interactions with multiple turns:

```typescript
const response = await aiService.generateChatResponse(
  [
    { role: "user", content: "What's the best way to learn JavaScript?" },
    { role: "model", content: "Start with the basics of programming concepts..." },
    { role: "user", content: "What about frameworks?" },
  ],
  {
    temperature: 0.7,
    maxTokens: 2048,
  }
);
```

## Example Usage

Here's a complete example demonstrating browser automation with Gemini 2.5:

```typescript
// Initialize browser manager
const browserManager = new BrowserManager(browserConfig);
await browserManager.initialize();

// Get a browser page
const { page, sessionId } = await browserManager.getPage();

// Navigate to a website
await page.goto('https://example.com');

// Initialize AI service
const aiService = new AIService();

// Generate text about the webpage
const response = await aiService.generateText(
  'Describe the purpose of example.com',
  {
    temperature: 0.4,
    maxTokens: 2048,
  }
);

console.log(response.text);
```

For a complete working example, see `src/examples/gemini25-example.ts`.

## Advanced Usage

### Vision Capabilities

When working with images, you may want to use a model specifically tuned for vision tasks:

```typescript
// Override the model name for vision capabilities
process.env.GEMINI_MODEL_NAME = 'gemini-2.5-pro-vision';

// Initialize the AI service
const aiService = new AIService();

// Now use image analysis functions
```

### Handling Errors

The Gemini adapter includes robust error handling. Here's how to handle errors gracefully:

```typescript
try {
  const response = await aiService.generateText("Your prompt here");
  console.log(response.text);
} catch (error) {
  console.error('Error with Gemini API:', error.message);
  // Implement fallback logic if needed
}
```

## Limitations and Best Practices

- **API Rate Limiting**: Be mindful of Google's API rate limits and quotas
- **Cost Management**: Monitor your API usage to manage costs
- **Content Policies**: Ensure your usage complies with Google's content policies
- **Model Selection**: Use the appropriate model for your task (Pro for complex reasoning, Flash for simpler tasks)
- **Error Handling**: Implement proper error handling for API failures
- **Security**: Keep your API keys secure and never expose them in client-side code

## Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Google Generative AI Documentation](https://developers.generativeai.google/products/gemini)
- [Gemini API Reference](https://developers.generativeai.google/reference/rest)
