import { setupLogger, createContextLogger } from './logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'ImageUtils');

/**
 * Utilities for image handling
 */
export class ImageUtils {
  /**
   * Convert a Buffer to base64 string
   * @param buffer Image buffer
   * @returns Base64 encoded string
   */
  static bufferToBase64(buffer: Buffer): string {
    return buffer.toString('base64');
  }

  /**
   * Convert a base64 string to Buffer
   * @param base64 Base64 encoded string
   * @returns Buffer
   */
  static base64ToBuffer(base64: string): Buffer {
    return Buffer.from(base64, 'base64');
  }

  /**
   * Get MIME type from a base64 image
   * @param base64 Base64 encoded image string
   * @returns MIME type or undefined if not found
   */
  static getMimeTypeFromBase64(base64: string): string | undefined {
    // Extract MIME type from base64 data URI
    const match = base64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
    
    if (match) {
      return match[1];
    }
    
    // If no MIME type found, try to determine from content
    const buffer = this.base64ToBuffer(base64);
    
    // Check for PNG signature
    if (buffer.length >= 8 && 
        buffer[0] === 0x89 && 
        buffer[1] === 0x50 && 
        buffer[2] === 0x4E && 
        buffer[3] === 0x47) {
      return 'image/png';
    }
    
    // Check for JPEG signature
    if (buffer.length >= 3 && 
        buffer[0] === 0xFF && 
        buffer[1] === 0xD8 && 
        buffer[2] === 0xFF) {
      return 'image/jpeg';
    }
    
    // Check for GIF signature
    if (buffer.length >= 6 && 
        buffer[0] === 0x47 && 
        buffer[1] === 0x49 && 
        buffer[2] === 0x46 && 
        buffer[3] === 0x38 && 
        (buffer[4] === 0x37 || buffer[4] === 0x39) && 
        buffer[5] === 0x61) {
      return 'image/gif';
    }
    
    // Default to PNG if we can't determine
    logger.warn('Could not determine MIME type from image data, defaulting to image/png');
    return 'image/png';
  }

  /**
   * Ensure base64 image has a proper data URI
   * @param base64 Base64 encoded image string
   * @param mimeType Optional MIME type (will be detected if not provided)
   * @returns Base64 data URI
   */
  static ensureDataUri(base64: string, mimeType?: string): string {
    // Check if it's already a data URI
    if (base64.startsWith('data:')) {
      return base64;
    }
    
    // Determine MIME type if not provided
    const type = mimeType || this.getMimeTypeFromBase64(base64) || 'image/png';
    
    // Create data URI
    return `data:${type};base64,${base64}`;
  }

  /**
   * Extract base64 data from a data URI
   * @param dataUri Data URI
   * @returns Base64 data without prefix
   */
  static extractBase64FromDataUri(dataUri: string): string {
    const match = dataUri.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.*)$/);
    
    if (match) {
      return match[2];
    }
    
    // If not a data URI, return as is
    return dataUri;
  }

  /**
   * Compress a base64 image string (placeholder for future implementation)
   * @param base64 Base64 encoded image string
   * @param quality Compression quality (0-1)
   * @returns Compressed base64 image string
   */
  static async compressImage(base64: string, quality: number = 0.8): Promise<string> {
    // This is a placeholder for future implementation
    // Could use a library like sharp or jimp for actual implementation
    
    logger.info(`Image compression requested with quality: ${quality}`);
    return base64;
  }

  /**
   * Resize a base64 image string (placeholder for future implementation)
   * @param base64 Base64 encoded image string
   * @param maxWidth Maximum width
   * @param maxHeight Maximum height
   * @returns Resized base64 image string
   */
  static async resizeImage(base64: string, maxWidth: number, maxHeight: number): Promise<string> {
    // This is a placeholder for future implementation
    // Could use a library like sharp or jimp for actual implementation
    
    logger.info(`Image resize requested to ${maxWidth}x${maxHeight}`);
    return base64;
  }
}

export default ImageUtils;
