import puppeteer from 'puppeteer';
import puppeteerExtra from 'puppeteer-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';
import { v4 as uuidv4 } from 'uuid';
import { setupLogger, createContextLogger } from '../utils/logger.js';

// Add stealth plugin to puppeteer
puppeteerExtra.use(StealthPlugin());

// Browser configuration type
export interface BrowserConfig {
  chromePath: string;
  userDataDir: string;
  debuggingPort: number;
  debuggingHost: string;
  persistentSession: boolean;
  headless: boolean;
  disableSecurity: boolean;
  windowWidth: number;
  windowHeight: number;
}

/**
 * Manages browser instances and sessions
 */
export class BrowserManager {
  private browser: puppeteer.Browser | null = null;
  private pages: Map<string, puppeteer.Page> = new Map();
  private config: BrowserConfig;
  private logger = createContextLogger(setupLogger(), 'BrowserManager');

  constructor(config: BrowserConfig) {
    this.config = config;
  }

  /**
   * Initialize the browser instance
   */
  async initialize(): Promise<void> {
    if (this.browser) {
      this.logger.warn('Browser already initialized');
      return;
    }

    try {
      this.logger.info('Launching browser...');
      
      // Setup launch options
      const launchOptions: puppeteer.LaunchOptions = {
        headless: this.config.headless ? 'new' : false,
        args: [
          `--window-size=${this.config.windowWidth},${this.config.windowHeight}`,
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
        defaultViewport: {
          width: this.config.windowWidth,
          height: this.config.windowHeight,
        },
      };
      
      // Add executable path if specified
      if (this.config.chromePath) {
        launchOptions.executablePath = this.config.chromePath;
      }
      
      // Add user data directory if persistent sessions are enabled
      if (this.config.persistentSession && this.config.userDataDir) {
        launchOptions.userDataDir = this.config.userDataDir;
      }
      
      // Add debugging options
      if (this.config.debuggingPort) {
        launchOptions.args?.push(`--remote-debugging-port=${this.config.debuggingPort}`);
        launchOptions.args?.push(`--remote-debugging-address=${this.config.debuggingHost}`);
      }
      
      // Add security options
      if (this.config.disableSecurity) {
        launchOptions.args?.push('--disable-web-security');
        launchOptions.args?.push('--disable-features=IsolateOrigins,site-per-process');
        launchOptions.args?.push('--allow-running-insecure-content');
      }
      
      // Launch browser
      this.browser = await puppeteerExtra.launch(launchOptions);
      this.logger.info('Browser launched successfully');
      
      // Setup listeners
      this.browser.on('disconnected', () => {
        this.logger.warn('Browser disconnected');
        this.browser = null;
      });
      
    } catch (error) {
      this.logger.error(`Failed to launch browser: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to launch browser: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Creates a new page or returns an existing one
   * @param sessionId Optional session ID to reuse an existing page
   * @returns The page and session ID
   */
  async getPage(sessionId?: string): Promise<{ page: puppeteer.Page; sessionId: string }> {
    if (!this.browser) {
      await this.initialize();
    }
    
    if (!this.browser) {
      throw new Error('Browser not initialized');
    }
    
    // Generate a new session ID if none provided
    const id = sessionId || uuidv4();
    
    // Return existing page if available
    if (sessionId && this.pages.has(sessionId)) {
      const page = this.pages.get(sessionId);
      if (page) {
        return { page, sessionId: id };
      }
    }
    
    // Create a new page
    try {
      const page = await this.browser.newPage();
      
      // Set viewport size
      await page.setViewport({
        width: this.config.windowWidth,
        height: this.config.windowHeight,
      });
      
      // Set up page settings
      await page.setDefaultNavigationTimeout(30000);
      await page.setDefaultTimeout(30000);
      
      // Set user agent to a recent Chrome version
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36'
      );
      
      // Store page in session map
      this.pages.set(id, page);
      
      // Setup listeners
      page.on('close', () => {
        this.pages.delete(id);
        this.logger.debug(`Page session ${id} closed`);
      });
      
      this.logger.debug(`Created new page for session ${id}`);
      return { page, sessionId: id };
    } catch (error) {
      this.logger.error(`Failed to create page: ${error instanceof Error ? error.message : String(error)}`);
      throw new Error(`Failed to create page: ${error instanceof Error ? error.message : String(error)}`);
    }
  }
  
  /**
   * Close a specific page session
   * @param sessionId The session ID to close
   */
  async closePage(sessionId: string): Promise<void> {
    const page = this.pages.get(sessionId);
    if (page) {
      try {
        await page.close();
        this.pages.delete(sessionId);
        this.logger.debug(`Closed page session ${sessionId}`);
      } catch (error) {
        this.logger.error(`Failed to close page: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
  
  /**
   * Close the browser and all pages
   */
  async close(): Promise<void> {
    if (this.browser) {
      try {
        // Close all pages
        for (const page of this.pages.values()) {
          await page.close().catch(() => {});
        }
        this.pages.clear();
        
        // Close browser
        await this.browser.close();
        this.browser = null;
        this.logger.info('Browser closed');
      } catch (error) {
        this.logger.error(`Failed to close browser: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }
}

export default BrowserManager;
