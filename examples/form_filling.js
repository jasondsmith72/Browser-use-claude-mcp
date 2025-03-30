// Example script to demonstrate filling out forms with Gemini 2.5 assistance
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
        
        // Navigate to a form page (example: a contact form)
        const formUrl = 'https://httpbin.org/forms/post';
        
        sendJsonRpcMessage(serverProcess, 'tools/call', {
          name: 'browse_webpage',
          arguments: {
            url: formUrl,
          },
        }, 2);
      } else if (response.id === 2) {
        // Response to browse_webpage
        console.log('Navigated to form page');
        
        // Extract form page data
        const pageData = JSON.parse(response.result.content[0].text);
        console.log(`Page title: ${pageData.title}`);
        
        // Take a screenshot of the form
        sendJsonRpcMessage(serverProcess, 'tools/call', {
          name: 'take_screenshot',
          arguments: {
            fullPage: true,
            sessionId: pageData.sessionId,
          },
        }, 3);
      } else if (response.id === 3) {
        // Response to take_screenshot
        console.log('Screenshot captured');
        
        // Extract screenshot data
        const screenshotData = JSON.parse(response.result.content[0].text);
        const sessionId = screenshotData.sessionId;
        
        // Analyze the form using Gemini
        console.log('Analyzing form with Gemini...');
        
        // Normally we would send the screenshot to Gemini and ask it to analyze the form
        // For this example, we'll use predefined form fields since we know it's the httpbin form
        
        // Define the form fields to fill out
        const formFields = {
          'custname': 'John Doe',
          'custtel': '555-123-4567',
          'custemail': 'john.doe@example.com',
          'size': 'medium',
          'topping': 'bacon',
          'delivery': '1130',
          'comments': 'This is a test comment for the form filling example. Please deliver as soon as possible.',
        };
        
        // Fill out the form
        sendJsonRpcMessage(serverProcess, 'tools/call', {
          name: 'fill_form',
          arguments: {
            fields: formFields,
            submit: true,
            sessionId,
          },
        }, 4);
      } else if (response.id === 4) {
        // Response to fill_form
        console.log('Form filled out');
        
        // Extract form submission data
        const formData = JSON.parse(response.result.content[0].text);
        
        console.log(`Form submission status: ${formData.success ? 'Success' : 'Failed'}`);
        console.log(`Message: ${formData.message}`);
        console.log(`Filled fields: ${formData.filledFields.join(', ')}`);
        
        if (formData.skippedFields.length > 0) {
          console.log(`Skipped fields: ${formData.skippedFields.join(', ')}`);
        }
        
        console.log(`Submitted: ${formData.submitted}`);
        console.log(`New URL: ${formData.newUrl}`);
        
        // Take a screenshot of the result page
        sendJsonRpcMessage(serverProcess, 'tools/call', {
          name: 'take_screenshot',
          arguments: {
            fullPage: true,
            sessionId: formData.sessionId,
          },
        }, 5);
      } else if (response.id === 5) {
        // Response to take_screenshot (result page)
        console.log('Result page screenshot captured');
        
        // Get the content from the result page
        const screenshotData = JSON.parse(response.result.content[0].text);
        const sessionId = screenshotData.sessionId;
        
        sendJsonRpcMessage(serverProcess, 'tools/call', {
          name: 'extract_content',
          arguments: {
            extractText: true,
            sessionId,
          },
        }, 6);
      } else if (response.id === 6) {
        // Response to extract_content
        console.log('Result page content extracted');
        
        // Process the result page content
        const contentData = JSON.parse(response.result.content[0].text);
        
        console.log('\nForm Submission Result:');
        console.log('------------------------');
        console.log(`Page title: ${contentData.title}`);
        console.log(`URL: ${contentData.url}`);
        
        // Check if the submission was successful (would analyze the content here)
        // For httpbin, it returns a page showing the submitted data
        
        console.log('\nDemo completed successfully');
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
