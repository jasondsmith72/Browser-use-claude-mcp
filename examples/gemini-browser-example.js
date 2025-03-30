/**
 * Example script to demonstrate using the Browser-use-claude-mcp server with Google Gemini 2.5
 * 
 * This script shows how a simple client could use the MCP server to browse the web
 * and perform tasks with Gemini's help.
 * 
 * Usage:
 * 1. Make sure the MCP server is running
 * 2. Update the configuration with your API key
 * 3. Run: node examples/gemini-browser-example.js
 */

const { spawn } = require('child_process');
const path = require('path');

// Configuration
const config = {
  // MCP server path
  serverPath: path.join(__dirname, '../dist/index.js'),
  
  // Gemini API configuration
  gemini: {
    apiKey: process.env.GOOGLE_API_KEY || 'your_google_api_key_here',
    modelName: 'gemini-2.5-pro',
  },
  
  // Browser configuration
  browser: {
    headless: false,
  },
};

/**
 * Call the MCP server with a request
 * @param {string} method Method name
 * @param {object} params Parameters
 * @returns {Promise<object>} Response
 */
async function callMCP(method, params = {}, previousResult = null) {
  return new Promise((resolve, reject) => {
    // Launch MCP server
    const server = spawn('node', [config.serverPath], {
      env: {
        ...process.env,
        MCP_MODEL_PROVIDER: 'GEMINI',
        GOOGLE_API_KEY: config.gemini.apiKey,
        GEMINI_MODEL_NAME: config.gemini.modelName,
        BROWSER_HEADLESS: config.browser.headless ? 'true' : 'false',
      },
    });
    
    let responseData = '';
    let requestSent = false;
    
    // Handle server output
    server.stdout.on('data', (data) => {
      const chunk = data.toString();
      responseData += chunk;
      
      // Check if server is ready (it will output a JSON-RPC message)
      if (!requestSent && chunk.includes('"jsonrpc"')) {
        requestSent = true;
        
        // Send the request
        const request = {
          jsonrpc: '2.0',
          id: 1,
          method: previousResult ? 'tools/call' : 'tools/list',
          params: previousResult 
            ? { name: method, arguments: { ...params, sessionId: previousResult.sessionId } }
            : {},
        };
        
        server.stdin.write(JSON.stringify(request) + '\n');
      }
    });
    
    // Handle server errors
    server.stderr.on('data', (data) => {
      console.error(`Server error: ${data.toString()}`);
    });
    
    // Process response when server exits
    server.on('close', (code) => {
      if (code !== 0) {
        return reject(new Error(`Server exited with code ${code}`));
      }
      
      try {
        // Parse all JSON objects from the response
        const jsonObjects = responseData
          .split('\n')
          .filter(line => line.trim().startsWith('{'))
          .map(line => JSON.parse(line));
        
        // Find the actual response
        const response = jsonObjects.find(obj => obj.id === 1);
        
        if (!response) {
          return reject(new Error('No valid response found'));
        }
        
        if (response.error) {
          return reject(new Error(`Server error: ${response.error.message}`));
        }
        
        resolve(response.result);
      } catch (error) {
        reject(new Error(`Failed to parse response: ${error.message}`));
      }
    });
  });
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Listing available tools...');
    const toolsResponse = await callMCP('tools/list');
    
    if (!toolsResponse || !toolsResponse.tools) {
      throw new Error('Failed to get tools list');
    }
    
    console.log(`Found ${toolsResponse.tools.length} tools:`);
    toolsResponse.tools.forEach(tool => {
      console.log(`- ${tool.name}: ${tool.description}`);
    });
    
    // Step 1: Browse to a webpage
    console.log('\nBrowsing to a webpage...');
    const browseResult = await callMCP('browse_webpage', {
      url: 'https://www.example.com',
    });
    
    console.log(`Browsed to "${browseResult.title}" at ${browseResult.url}`);
    console.log(`Content length: ${browseResult.content.length} characters`);
    
    // Step 2: Search for something
    console.log('\nPerforming a web search...');
    const searchResult = await callMCP('search_web', {
      query: 'latest AI news',
      numResults: 3,
    }, browseResult);
    
    console.log(`Search for "${searchResult.query}" found ${searchResult.results.length} results:`);
    searchResult.results.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Snippet: ${result.snippet.substring(0, 100)}...`);
    });
    
    // Step 3: Take a screenshot
    console.log('\nTaking a screenshot...');
    const screenshotResult = await callMCP('take_screenshot', {}, searchResult);
    
    console.log(`Took screenshot of "${screenshotResult.title}"`);
    console.log(`Image format: ${screenshotResult.mimeType}`);
    console.log(`Image data length: ${screenshotResult.imageData.length} characters`);
    
    // Step 4: Extract content
    console.log('\nExtracting content...');
    const extractResult = await callMCP('extract_content', {
      extractText: true,
      extractLinks: true,
    }, screenshotResult);
    
    console.log(`Extracted content from "${extractResult.title}"`);
    console.log(`Text length: ${extractResult.text?.length || 0} characters`);
    console.log(`Links: ${extractResult.links?.length || 0}`);
    
    console.log('\nDemo completed successfully!');
  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
}

// Run the demo
main();
