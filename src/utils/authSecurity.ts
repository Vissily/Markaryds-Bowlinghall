/**
 * Authentication security utilities
 */

// Clean up auth state to prevent limbo states
export const cleanupAuthState = (): void => {
  // Remove standard auth tokens
  if (typeof localStorage !== 'undefined') {
    // Remove all Supabase auth keys from localStorage
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        localStorage.removeItem(key);
      }
    });
  }
  
  // Remove from sessionStorage if in use
  if (typeof sessionStorage !== 'undefined') {
    Object.keys(sessionStorage).forEach((key) => {
      if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
        sessionStorage.removeItem(key);
      }
    });
  }
};

// Session timeout management
export const SESSION_TIMEOUT_MS = 8 * 60 * 60 * 1000; // 8 hours

export const isSessionExpired = (lastActivity: number): boolean => {
  return Date.now() - lastActivity > SESSION_TIMEOUT_MS;
};

export const updateLastActivity = (): void => {
  if (typeof localStorage !== 'undefined') {
    localStorage.setItem('last_activity', Date.now().toString());
  }
};

export const getLastActivity = (): number => {
  if (typeof localStorage !== 'undefined') {
    const lastActivity = localStorage.getItem('last_activity');
    return lastActivity ? parseInt(lastActivity, 10) : Date.now();
  }
  return Date.now();
};

// Security headers validation
export const validateSecurityContext = (): boolean => {
  // Check if we're in a secure context (HTTPS in production)
  if (typeof window !== 'undefined') {
    const isLocalhost = window.location.hostname === 'localhost' || 
                       window.location.hostname === '127.0.0.1' ||
                       window.location.hostname.includes('lovableproject.com');
    
    // Allow HTTP only for localhost and Lovable preview
    if (!isLocalhost && window.location.protocol !== 'https:') {
      console.warn('Security warning: Application should be served over HTTPS in production');
      return false;
    }
  }
  
  return true;
};

// Audit log entry
export interface AuditLogEntry {
  action: string;
  userId?: string;
  timestamp: number;
  details?: Record<string, any>;
  userAgent?: string;
  ipAddress?: string;
}

// Simple audit logging (in production, this should go to a backend service)
export const auditLog = (entry: Omit<AuditLogEntry, 'timestamp'>): void => {
  const logEntry: AuditLogEntry = {
    ...entry,
    timestamp: Date.now(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
  };
  
  // In development, log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('Audit Log:', logEntry);
  }
  
  // In production, you would send this to your audit service
  // Example: sendToAuditService(logEntry);
};

// Failed login attempt tracking
const failedAttempts = new Map<string, { count: number; lastAttempt: number }>();

export const trackFailedLogin = (email: string): void => {
  const now = Date.now();
  const existing = failedAttempts.get(email);
  
  if (existing) {
    // Reset count if last attempt was more than 15 minutes ago
    if (now - existing.lastAttempt > 15 * 60 * 1000) {
      existing.count = 1;
    } else {
      existing.count++;
    }
    existing.lastAttempt = now;
  } else {
    failedAttempts.set(email, { count: 1, lastAttempt: now });
  }
  
  auditLog({
    action: 'FAILED_LOGIN_ATTEMPT',
    details: { email, attemptCount: failedAttempts.get(email)?.count }
  });
};

export const isAccountLocked = (email: string): boolean => {
  const attempts = failedAttempts.get(email);
  if (!attempts) return false;
  
  const now = Date.now();
  // Lock account for 15 minutes after 5 failed attempts
  return attempts.count >= 5 && (now - attempts.lastAttempt) < 15 * 60 * 1000;
};

export const clearFailedAttempts = (email: string): void => {
  failedAttempts.delete(email);
};

// Manual clear function for admin use
export const clearAllFailedAttempts = (): void => {
  failedAttempts.clear();
  auditLog({
    action: 'CLEAR_ALL_FAILED_ATTEMPTS',
    details: { clearedBy: 'admin' }
  });
};

// Password validation for security
export const isSecurePassword = (password: string): boolean => {
  return password.length >= 8 &&
         /[A-Z]/.test(password) &&
         /[a-z]/.test(password) &&
         /\d/.test(password) &&
         !/(.)\1{2,}/.test(password); // No more than 2 consecutive identical characters
};