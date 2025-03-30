import { v4 as uuidv4 } from 'uuid';
import { setupLogger, createContextLogger } from './logger.js';

// Logger
const logger = createContextLogger(setupLogger(), 'SessionManager');

/**
 * Interface for session data
 */
export interface SessionData {
  id: string;
  createdAt: Date;
  lastActivity: Date;
  data: Record<string, any>;
}

/**
 * Class to manage user sessions
 */
export class SessionManager {
  private static instance: SessionManager;
  private sessions: Map<string, SessionData>;
  private expirationTimeMs: number;
  
  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    this.sessions = new Map<string, SessionData>();
    this.expirationTimeMs = 30 * 60 * 1000; // 30 minutes by default
    
    // Start session cleanup interval
    setInterval(() => this.cleanupExpiredSessions(), 5 * 60 * 1000); // Clean every 5 minutes
    
    logger.info('Session manager initialized');
  }
  
  /**
   * Get the singleton instance
   */
  public static getInstance(): SessionManager {
    if (!SessionManager.instance) {
      SessionManager.instance = new SessionManager();
    }
    
    return SessionManager.instance;
  }
  
  /**
   * Set the session expiration time
   * @param timeMs Expiration time in milliseconds
   */
  public setExpirationTime(timeMs: number): void {
    this.expirationTimeMs = timeMs;
    logger.info(`Session expiration time set to ${timeMs}ms`);
  }
  
  /**
   * Create a new session
   * @param initialData Optional initial data
   * @returns Session ID
   */
  public createSession(initialData: Record<string, any> = {}): string {
    const sessionId = uuidv4();
    const now = new Date();
    
    const sessionData: SessionData = {
      id: sessionId,
      createdAt: now,
      lastActivity: now,
      data: initialData,
    };
    
    this.sessions.set(sessionId, sessionData);
    logger.debug(`Created session ${sessionId}`);
    
    return sessionId;
  }
  
  /**
   * Get a session by ID
   * @param sessionId Session ID
   * @returns Session data or undefined if not found
   */
  public getSession(sessionId: string): SessionData | undefined {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      // Update last activity time
      session.lastActivity = new Date();
      logger.debug(`Retrieved session ${sessionId}`);
    } else {
      logger.warn(`Session ${sessionId} not found`);
    }
    
    return session;
  }
  
  /**
   * Update session data
   * @param sessionId Session ID
   * @param data New data (will be merged with existing data)
   * @returns Updated session data or undefined if session not found
   */
  public updateSession(sessionId: string, data: Record<string, any>): SessionData | undefined {
    const session = this.sessions.get(sessionId);
    
    if (session) {
      session.lastActivity = new Date();
      session.data = { ...session.data, ...data };
      logger.debug(`Updated session ${sessionId}`);
      return session;
    } else {
      logger.warn(`Cannot update session ${sessionId} - not found`);
      return undefined;
    }
  }
  
  /**
   * Delete a session
   * @param sessionId Session ID
   * @returns True if session was deleted, false if not found
   */
  public deleteSession(sessionId: string): boolean {
    const deleted = this.sessions.delete(sessionId);
    
    if (deleted) {
      logger.debug(`Deleted session ${sessionId}`);
    } else {
      logger.warn(`Cannot delete session ${sessionId} - not found`);
    }
    
    return deleted;
  }
  
  /**
   * Check if a session exists
   * @param sessionId Session ID
   * @returns True if session exists, false otherwise
   */
  public hasSession(sessionId: string): boolean {
    return this.sessions.has(sessionId);
  }
  
  /**
   * Get all active sessions
   * @returns Array of session data
   */
  public getAllSessions(): SessionData[] {
    return Array.from(this.sessions.values());
  }
  
  /**
   * Clean up expired sessions
   */
  private cleanupExpiredSessions(): void {
    const now = new Date();
    let expiredCount = 0;
    
    for (const [sessionId, session] of this.sessions.entries()) {
      const lastActivityTime = session.lastActivity.getTime();
      const expirationTime = lastActivityTime + this.expirationTimeMs;
      
      if (now.getTime() > expirationTime) {
        this.sessions.delete(sessionId);
        expiredCount++;
      }
    }
    
    if (expiredCount > 0) {
      logger.info(`Cleaned up ${expiredCount} expired sessions`);
    }
  }
}

export default SessionManager;
