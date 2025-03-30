# Using Browser-use-claude-mcp with Google Gemini 2.5

This document provides specific guidance on configuring and using the Browser-use-claude-mcp server with Google's Gemini 2.5 models.

## Overview

Gemini 2.5 is Google's most advanced AI model, featuring enhanced reasoning capabilities, multimodal understanding, and improved performance on complex tasks. The Browser-use-claude-mcp server is designed to work seamlessly with Gemini 2.5, allowing you to leverage its capabilities for browser automation tasks.

## Supported Gemini 2.5 Models

The following Gemini 2.5 models are supported:

- `gemini-2.5-pro`: General purpose model with excellent performance across a wide range of tasks
- `gemini-2.5-pro-vision`: Vision-enabled model that can analyze images in addition to text
- `gemini-2.5-flash`: Faster, more cost-effective model for simpler tasks

## Setup for Gemini 2.5

### 1. Obtain an API Key

1. Go to the [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key if you don't already have one
3. Make note of the API key for configuration

### 2. Configure Environment Variables

In your `.env` file:

```
MCP_MODEL_PROVIDER=GEMINI
GOOGLE_API_KEY=your_api_key_here
GEMINI_MODEL_NAME=gemini-2.5-pro
```

### 3. Claude Desktop Configuration

For Claude Desktop, add the following to your configuration file:

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
        "GOOGLE_API_KEY": "your_api_key_here",
        "GEMINI_MODEL_NAME": "gemini-2.5-pro"
      }
    }
  }
}
```

## Advanced Configuration for Gemini 2.5

### Safety Settings

By default, the server uses minimal safety settings to allow Gemini to process a wide range of content. If you need to adjust these settings, you can modify the `safetySettings` in `src/ai/adapters/geminiAdapter.ts`.

### Generation Parameters

You can customize generation parameters like temperature, tokens, and sampling in your requests. For example, with lower temperatures (0.0-0.5), Gemini produces more deterministic outputs, while higher temperatures (0.7-1.0) produce more creative, varied responses.

Default parameters:
```javascript
const DEFAULT_PARAMS = {
  temperature: 0.7,
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 8192,
};
```

## Using Vision Capabilities

Gemini 2.5 Pro Vision can analyze screenshots taken by the MCP server. To enable this functionality:

1. Make sure you're using the vision-capable model:
   ```
   GEMINI_MODEL_NAME=gemini-2.5-pro-vision
   ```

2. Use the `take_screenshot` tool to capture a page and then analyze it with Gemini.

## Best Practices for Gemini 2.5

### Prompting

Gemini 2.5 works best with:

- Clear, specific instructions
- Step-by-step reasoning requests
- System prompts that define its role and limitations

### Rate Limits and Quotas

Be aware of Google AI's rate limits:
- Free tier: 60 queries per minute
- Paid tier: Higher limits based on your plan

If you encounter rate limit issues, implement appropriate backing off and retry logic.

### Error Handling

Common errors include:
- Rate limit exceeded
- Invalid API key
- Model unavailability (especially for newly released models)

The server has built-in error handling but you may need to adjust timeouts and retry logic for your specific use case.

## Sample Prompts

Here are some sample prompts that work well with Gemini 2.5:

1. **Detailed search and summarization**:
   ```
   Search for information about [topic] and summarize the key points from the top 3 results.
   ```

2. **Form filling with reasoning**:
   ```
   Visit [website], fill out the form with the following information, and explain your choices for each field.
   ```

3. **Interactive browsing sequence**:
   ```
   Go to [website], navigate to the product section, filter by [criteria], and extract details of the top 5 products.
   ```

## Performance Considerations

Gemini 2.5 Pro has a context window of approximately 1 million tokens, allowing it to process large amounts of web page content in a single request. However, very long contexts may increase latency and token usage.

For optimal performance:
- Use the most appropriate model variant for your needs
- Be specific about what content to extract from web pages
- Consider using `gemini-2.5-flash` for simpler tasks that don't require the full capabilities of Pro

## Further Resources

- [Google AI Platform Documentation](https://ai.google.dev/docs)
- [Gemini 2.5 Technical Report](https://storage.googleapis.com/deepmind-media/gemini/gemini_v2_report.pdf)
- [Google AI Studio](https://makersuite.google.com/)
