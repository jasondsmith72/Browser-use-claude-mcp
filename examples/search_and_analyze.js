// Example script to demonstrate using MCP server to search the web and analyze results with Gemini 2.5
const { spawn } = require('child_process');
const readline = require('readline');
const path = require('path');

// Path to the MCP server
const serverPath = path.join(__dirname, '..', 'dist', 'index.js');

// Function to send a JSON-RPC message to the server
function sendJsonRpcMessage(process, method, params = {}, id = 1) {
  const message = {
    jsonrpc: '2.0',
    method,
    params,
    id,
  };
  
  process.stdin.write(JSON.stringify(message) + '\n');
  console.log(`Sent: ${method}`, params);
}

// Main function
async function main() {
  // Start the MCP server process
  console.log('Starting MCP server...');
  const serverProcess = spawn('node', [serverPath], {
    env: {
      ...process.env,
      MCP_MODEL_PROVIDER: 'GEMINI',
      GOOGLE_API_KEY: process.env.GOOGLE_API_KEY || 'your_api_key_here',
      GEMINI_MODEL_NAME: 'gemini-2.5-pro',
      BROWSER_HEADLESS: 'false',
    },
  });
  
  // Create readline interface to read server output
  const rl = readline.createInterface({
    input: serverProcess.stdout,
    terminal: false,
  });
  
  // Handle server errors
  serverProcess.stderr.on('data', (data) => {
    console.error(`Server error: ${data}`);
  });
  
  // Process server output
  rl.on('line', async (line) => {
    try {
      // Parse the JSON-RPC response
      const response = JSON.parse(line);
      console.log(`Received response for id: ${response.id}`);
      
      // Handle different types of responses
      if (response.id === 1) {
        // Response to initialize
        console.log('Server initialized successfully');
        
        // Search the web
        sendJsonRpcMessage(serverProcess, 'tools/call', {
          name: 'search_web',
          arguments: {
            query: 'latest AI advancements 2025',
            numResults: 3,
          },
        }, 2);
      } else if (response.id === 2) {
        // Response to search_web
        console.log('Search completed');
        
        // Extract search results
        const searchResults = response.result.content[0].text;
        const results = JSON.parse(searchResults);
        console.log(`Found ${results.results.length} search results`);
        
        // Create prompt for analysis
        const searchAnalysisPrompt = `
          Analyze the following search results about recent AI advancements:
          
          ${results.results.map((r, i) => `
          Result ${i + 1}: ${r.title}
          URL: ${r.url}
          Snippet: ${r.snippet}
          `).join('\n')}
          
          Please provide:
          1. A summary of the main themes across these results
          2. The most significant advancement mentioned
          3. Any potential impact on industries
          4. Recommendations for further research
        `;
        
        // Use Gemini to analyze the results
        sendJsonRpcMessage(serverProcess, 'tools/call', {
          name: 'browse_webpage',
          arguments: {
            url: results.results[0].url,
          },
        }, 3);
      } else if (response.id === 3) {
        // Response to browse_webpage
        console.log('Webpage browsing completed');
        
        // Extract page content
        const pageContent = response.result.content[0].text;
        const pageData = JSON.parse(pageContent);
        
        console.log(`Browsed page: ${pageData.title}`);
        
        // Extract content from the page
        sendJsonRpcMessage(serverProcess, 'tools/call', {
          name: 'extract_content',
          arguments: {
            extractText: true,
            sessionId: pageData.sessionId,
          },
        }, 4);
      } else if (response.id === 4) {
        // Response to extract_content
        console.log('Content extraction completed');
        
        // Get the extracted text
        const extractionResult = response.result.content[0].text;
        const extractionData = JSON.parse(extractionResult);
        
        // Limit the text length for the analysis
        const textToAnalyze = extractionData.text?.substring(0, 3000) || '';
        
        // Create analysis prompt
        const analysisPrompt = `
          Please analyze this webpage content about recent AI advancements:
          
          ${textToAnalyze}
          
          Provide a concise summary of the key points, focusing on the most significant advancements and potential impacts.
        `;
        
        // Use Gemini to analyze the content
        console.log('Sending content to Gemini for analysis...');
        
        const sessionId = extractionData.sessionId;
        
        // Take a screenshot for visual analysis
        sendJsonRpcMessage(serverProcess, 'tools/call', {
          name: 'take_screenshot',
          arguments: {
            fullPage: false,
            sessionId,
          },
        }, 5);
      } else if (response.id === 5) {
        // Response to take_screenshot
        console.log('Screenshot captured');
        
        // Complete the demo
        console.log('Demo completed successfully');
        console.log('Press Ctrl+C to exit');
      }
    } catch (error) {
      console.error('Error processing server output:', error);
    }
  });
  
  // Initialize the server
  sendJsonRpcMessage(serverProcess, 'initialize', {
    protocolVersion: '2024-11-05',
    capabilities: {},
    clientInfo: {
      name: 'example-client',
      version: '0.1.0',
    },
  }, 1);
  
  // Handle process termination
  process.on('SIGINT', () => {
    console.log('Shutting down server...');
    serverProcess.kill();
    process.exit(0);
  });
}

// Run the main function
main().catch(console.error);
