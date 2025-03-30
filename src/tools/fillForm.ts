import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { BrowserManager } from '../browser/browserManager.js';
import { z } from 'zod';
import { setupLogger, createContextLogger } from '../utils/logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'FillFormTool');

/**
 * Input schema for fill form tool
 */
const FillFormInputSchema = z.object({
  fields: z.record(z.string()),
  submit: z.boolean().default(false).optional(),
  submitSelector: z.string().optional(),
  waitForNavigation: z.boolean().default(true).optional(),
  timeout: z.number().min(1000).default(30000).optional(),
  sessionId: z.string().optional(),
});

/**
 * Type for fill form tool input
 */
type FillFormInput = z.infer<typeof FillFormInputSchema>;

/**
 * Output schema for fill form tool
 */
const FillFormOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  filledFields: z.array(z.string()),
  skippedFields: z.array(z.string()),
  submitted: z.boolean(),
  newUrl: z.string().optional(),
  sessionId: z.string(),
});

/**
 * Type for fill form tool output
 */
type FillFormOutput = z.infer<typeof FillFormOutputSchema>;

/**
 * Register the fill form tool with the MCP server
 * @param server The MCP server instance
 * @param browserManager The browser manager instance
 */
export function registerFillFormTool(
  server: Server,
  browserManager: BrowserManager
): void {
  logger.info('Registering fill_form tool');
  
  server.registerToolDefinition({
    name: 'fill_form',
    description: 'Fill out form fields on a webpage',
    parameters: FillFormInputSchema,
  });
  
  server.registerToolImplementation({
    name: 'fill_form',
    handler: async (params: FillFormInput): Promise<FillFormOutput> => {
      logger.info(`Filling form with ${Object.keys(params.fields).length} fields`);
      
      try {
        // Get page from browser manager
        const { page, sessionId } = await browserManager.getPage(params.sessionId);
        
        const timeout = params.timeout || 30000;
        const filledFields: string[] = [];
        const skippedFields: string[] = [];
        
        // Process each field
        for (const [fieldName, fieldValue] of Object.entries(params.fields)) {
          try {
            // Try different selectors for the field
            const selectors = [
              `input[name="${fieldName}"]`,
              `input#${fieldName}`,
              `textarea[name="${fieldName}"]`,
              `textarea#${fieldName}`,
              `select[name="${fieldName}"]`,
              `select#${fieldName}`,
              `[name="${fieldName}"]`,
              `#${fieldName}`,
              `[aria-label="${fieldName}"]`,
              `[placeholder="${fieldName}"]`,
              `label:has-text("${fieldName}") + input`,
              `label:has-text("${fieldName}") + textarea`,
              `label:has-text("${fieldName}") + select`,
            ];
            
            let elementFound = false;
            
            for (const selector of selectors) {
              const element = await page.$(selector);
              
              if (element) {
                // Get the tag name to determine how to interact with the element
                const tagName = await page.evaluate(el => el.tagName.toLowerCase(), element);
                
                if (tagName === 'select') {
                  // Handle select elements
                  await page.select(selector, fieldValue);
                  elementFound = true;
                  break;
                } else if (tagName === 'input') {
                  // Get the input type
                  const inputType = await page.evaluate(el => el.type, element);
                  
                  if (inputType === 'checkbox' || inputType === 'radio') {
                    // Handle checkbox/radio inputs
                    const currentValue = await page.evaluate(el => el.checked, element);
                    const targetValue = fieldValue.toLowerCase() === 'true' || fieldValue === '1';
                    
                    if (currentValue !== targetValue) {
                      await element.click();
                    }
                  } else {
                    // Handle text/email/password/etc. inputs
                    await element.click({ clickCount: 3 }); // Select all text
                    await element.type(fieldValue);
                  }
                  
                  elementFound = true;
                  break;
                } else if (tagName === 'textarea') {
                  // Handle textarea elements
                  await element.click({ clickCount: 3 }); // Select all text
                  await element.type(fieldValue);
                  elementFound = true;
                  break;
                }
              }
            }
            
            if (elementFound) {
              filledFields.push(fieldName);
              logger.debug(`Filled field: ${fieldName}`);
            } else {
              skippedFields.push(fieldName);
              logger.warn(`Could not find field: ${fieldName}`);
            }
          } catch (error) {
            logger.error(`Error filling field ${fieldName}: ${error instanceof Error ? error.message : String(error)}`);
            skippedFields.push(fieldName);
          }
        }
        
        // Handle form submission if requested
        let submitted = false;
        let newUrl = page.url();
        
        if (params.submit) {
          try {
            // Setup navigation promise if waiting for navigation
            let navigationPromise;
            if (params.waitForNavigation) {
              navigationPromise = page.waitForNavigation({ timeout });
            }
            
            if (params.submitSelector) {
              // Click the specified submit element
              const submitElement = await page.$(params.submitSelector);
              if (submitElement) {
                await submitElement.click();
                submitted = true;
              } else {
                logger.warn(`Submit selector not found: ${params.submitSelector}`);
              }
            } else {
              // Try standard submit methods
              const submitButton = await page.$('input[type="submit"], button[type="submit"]');
              if (submitButton) {
                await submitButton.click();
                submitted = true;
              } else {
                // Try to submit the form directly
                await page.evaluate(() => {
                  const form = document.querySelector('form');
                  if (form) {
                    form.submit();
                    return true;
                  }
                  return false;
                });
                submitted = true;
              }
            }
            
            // Wait for navigation if enabled
            if (navigationPromise) {
              await navigationPromise.catch(() => {
                logger.warn('Navigation did not occur after form submission');
              });
            }
            
            // Get the new URL
            newUrl = page.url();
          } catch (error) {
            logger.error(`Error submitting form: ${error instanceof Error ? error.message : String(error)}`);
          }
        }
        
        return {
          success: filledFields.length > 0,
          message: `Filled ${filledFields.length} fields, skipped ${skippedFields.length} fields`,
          filledFields,
          skippedFields,
          submitted,
          newUrl,
          sessionId,
        };
      } catch (error) {
        logger.error(`Error filling form: ${error instanceof Error ? error.message : String(error)}`);
        
        return {
          success: false,
          message: `Failed to fill form: ${error instanceof Error ? error.message : String(error)}`,
          filledFields: [],
          skippedFields: Object.keys(params.fields),
          submitted: false,
          sessionId: params.sessionId || '',
        };
      }
    },
  });
}

export default registerFillFormTool;
