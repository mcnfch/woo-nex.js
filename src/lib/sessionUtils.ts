import { v4 as uuidv4 } from 'uuid';

// Local storage key for session ID
const SESSION_STORAGE_KEY = 'shopping_session_id';

/**
 * Get or create a session ID for the current user
 * @returns Session ID string
 */
export const getOrCreateSessionId = (): string => {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return '';
  }
  
  let sessionId = localStorage.getItem(SESSION_STORAGE_KEY);
  
  if (!sessionId) {
    sessionId = uuidv4();
    localStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  }
  
  return sessionId;
};

/**
 * Get user identifier (user ID if logged in, session ID if not)
 * @param userId Optional user ID for logged-in users
 * @returns User identifier string
 */
export const getUserIdentifier = (userId?: string | null): string => {
  if (userId) {
    return `user:${userId}`;
  }
  
  return `session:${getOrCreateSessionId()}`;
};
