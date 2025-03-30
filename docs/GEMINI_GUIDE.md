# Gemini 2.5 Integration Guide

This guide provides detailed information on using Google's Gemini 2.5 models with the Browser-use-claude-mcp server.

## Overview

Google's Gemini 2.5 models offer advanced AI capabilities including:

- Long context windows (up to 1 million tokens)
- Multimodal understanding (text, images, audio)
- Enhanced reasoning abilities
- Improved code generation and interpretation

This MCP server is optimized to work with Gemini 2.5, allowing you to combine Gemini's capabilities with browser automation features.

## Available Gemini 2.5 Models

The server supports the following Gemini models:

- `gemini-2.5-pro`: General-purpose model with enhanced reasoning
- `gemini-2.5-pro-vision`: Vision-capable model for image understanding
- `gemini-2.5-flash`: Faster, more lightweight model
- `gemini-2.5-flash-vision`: Vision-capable lightweight model

## Setup

### 1. Get a Google API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create an API key for Gemini (requires Google account)
3. Note your API key

### 2. Configure the Server

Set the following environment variables in your `.env` file:

```
MCP_MODEL_PROVIDER=GEMINI
GOOGLE_API_KEY=your_google_api_key_here
GEMINI_MODEL_NAME=gemini-2.5-pro
```

Or when using with Claude Desktop, update your configuration:

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
        "GOOGLE_API_KEY": "your_google_api_key_here",
        "GEMINI_MODEL_NAME": "gemini-2.5-pro"
      }
    }
  }
}
```

## Advanced Configuration

### Safety Settings

By default, the server configures Gemini with minimal safety settings to allow for maximum flexibility. You can modify this in the `src/ai/adapters/geminiAdapter.ts` file if needed.

### Generation Parameters

You can customize Gemini's generation parameters:

- `temperature`: Controls randomness (0.0-1.0, default: 0.7)
- `topK`: Limits token selection to top K tokens (default: 40)
- `topP`: Nucleus sampling parameter (0.0-1.0, default: 0.95)
- `maxOutputTokens`: Maximum generation length (default: 8192)

These parameters can be set in the AI service options when making requests.

## Using Vision Capabilities

To use Gemini's vision capabilities with screenshots:

1. Take a screenshot with the `take_screenshot` tool
2. Use the `generateTextWithImage` method of the AI service with the screenshot data

Example workflow:

```javascript
// Take screenshot
const screenshotResult = await callTool('take_screenshot');

// Generate analysis using Gemini Vision
const analysis = await aiService.generateTextWithImage(
  "What can you see in this screenshot?",
  screenshotResult.imageData,
  screenshotResult.mimeType
);
```

## Example Tasks

The following examples show how to use Gemini 2.5 with the browser automation tools:

### Research and Summarization

```javascript
// Browse to a webpage
const browseResult = await callTool('browse_webpage', {
  url: 'https://example.com/article'
});

// Have Gemini summarize the content
const summary = await aiService.generateText(
  `Summarize this article:\n\n${browseResult.content}`
);
```

### Form Filling with Intelligence

```javascript
// Browse to a form page
const browseResult = await callTool('browse_webpage', {
  url: 'https://example.com/contact'
});

// Take screenshot for visual understanding
const screenshotResult = await callTool('take_screenshot');

// Use Gemini to understand the form
const formAnalysis = await aiService.generateTextWithImage(
  "What fields are in this form and how should I fill them out?",
  screenshotResult.imageData,
  screenshotResult.mimeType
);

// Fill the form based on the analysis
await callTool('fill_form', {
  fields: {
    // Fields as determined by Gemini
    "name": "John Doe",
    "email": "john@example.com",
    "message": "Hello world!"
  }
});
```

### Web Research

```javascript
// Perform search
const searchResult = await callTool('search_web', {
  query: "latest AI developments"
});

// Visit top result
const browseResult = await callTool('browse_webpage', {
  url: searchResult.results[0].url
});

// Extract specific content
const extractResult = await callTool('extract_content', {
  selectors: {
    "title": "h1",
    "mainContent": "article",
    "author": ".author"
  }
});

// Have Gemini analyze the findings
const analysis = await aiService.generateText(
  `Analyze this article about AI developments:\n\n${JSON.stringify(extractResult.elements)}`
);
```

## Performance Tips

1. **Use Vision Strategically**: Vision models are more computationally intensive. Use them only when visual understanding is necessary.

2. **Batch Operations**: When possible, batch multiple operations together to minimize the number of API calls.

3. **Manage Context Size**: Gemini 2.5 supports large contexts, but processing long texts can be slower. Extract only the relevant content when possible.

4. **Set Appropriate Parameters**: Adjust temperature, topK, and topP based on your needs. Lower temperature for more deterministic outputs, higher for more creative ones.

## Troubleshooting

### API Key Issues

If you encounter authentication errors:
- Verify your API key is correct
- Ensure your API key has access to Gemini 2.5 models
- Check if you have exceeded your quota or rate limits

### Model Availability

Gemini 2.5 models may not be available in all regions. If you encounter model availability issues, try using an earlier version like Gemini 1.5.

### Performance Issues

If responses are slow:
- Try using a smaller context window
- Use `gemini-2.5-flash` for faster responses (at the cost of some quality)
- Reduce the complexity of your prompts

## Further Resources

- [Google Gemini Documentation](https://ai.google.dev/gemini-api/docs)
- [Gemini API Reference](https://ai.google.dev/api/gemini)
- [Gemini Playground](https://makersuite.google.com/app)
- [Google AI Studio](https://makersuite.google.com/)
