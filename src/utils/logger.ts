import winston from 'winston';
import { Config } from '../config/index.js';

/**
 * Sets up the logger for the application
 * @returns winston logger instance
 */
export function setupLogger() {
  const logLevel = Config.server.logLevel;
  
  const logger = winston.createLogger({
    level: logLevel,
    format: winston.format.combine(
      winston.format.timestamp({
        format: 'YYYY-MM-DD HH:mm:ss'
      }),
      winston.format.errors({ stack: true }),
      winston.format.splat(),
      winston.format.printf(({ level, message, timestamp, ...rest }) => {
        let logMessage = `${timestamp} [${level.toUpperCase()}] ${message}`;
        
        // Add any additional metadata if present
        if (Object.keys(rest).length > 0) {
          logMessage += ` ${JSON.stringify(rest)}`;
        }
        
        return logMessage;
      })
    ),
    transports: [
      // Write all logs to stderr for MCP compatibility
      new winston.transports.Console({
        stderrLevels: ['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'],
      }),
    ],
  });
  
  return logger;
}

/**
 * Creates a child logger with a specific context
 * @param logger The parent logger instance
 * @param context The context to add to logs
 * @returns A child logger with the given context
 */
export function createContextLogger(logger: winston.Logger, context: string) {
  return logger.child({ context });
}

export default {
  setupLogger,
  createContextLogger,
};
