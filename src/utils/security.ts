/**
 * Security utilities for input validation and sanitization
 */

// URL validation
export const isValidUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return ['http:', 'https:', 'mailto:', 'tel:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

// Email validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// HTML sanitization (basic)
export const sanitizeHtml = (input: string): string => {
  const div = document.createElement('div');
  div.textContent = input;
  return div.innerHTML;
};

// SQL injection prevention for text inputs
export const sanitizeText = (input: string): string => {
  return input
    .replace(/[<>\"']/g, '') // Remove potentially dangerous characters
    .trim()
    .substring(0, 1000); // Limit length
};

// Phone number validation
export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^[+]?[\d\s\-\(\)]{7,15}$/;
  return phoneRegex.test(phone);
};

// Price validation
export const isValidPrice = (price: string | number): boolean => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return !isNaN(num) && num >= 0 && num <= 99999;
};

// File size validation (in bytes)
export const isValidFileSize = (size: number, maxSizeMB: number = 10): boolean => {
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  return size <= maxSizeBytes;
};

// File type validation for images
export const isValidImageType = (mimeType: string): boolean => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  return allowedTypes.includes(mimeType.toLowerCase());
};

// YouTube URL validation
export const isValidYouTubeUrl = (url: string): boolean => {
  if (!isValidUrl(url)) return false;
  
  try {
    const urlObj = new URL(url);
    return ['youtube.com', 'www.youtube.com', 'youtu.be'].includes(urlObj.hostname);
  } catch {
    return false;
  }
};

// Extract YouTube video ID from URL
export const extractYouTubeVideoId = (url: string): string | null => {
  if (!isValidYouTubeUrl(url)) return null;
  
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

// Rate limiting helper (simple in-memory)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

export const checkRateLimit = (key: string, maxRequests: number = 10, windowMs: number = 60000): boolean => {
  const now = Date.now();
  const record = rateLimitMap.get(key);
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
    return true;
  }
  
  if (record.count >= maxRequests) {
    return false;
  }
  
  record.count++;
  return true;
};

// Clear expired rate limit entries
export const cleanupRateLimit = (): void => {
  const now = Date.now();
  for (const [key, record] of rateLimitMap.entries()) {
    if (now > record.resetTime) {
      rateLimitMap.delete(key);
    }
  }
};

// Content length validation
export const isValidContentLength = (content: string, maxLength: number = 5000): boolean => {
  return content.length <= maxLength;
};

// Password strength validation
export const validatePasswordStrength = (password: string): { 
  isValid: boolean; 
  errors: string[] 
} => {
  const errors: string[] = [];
  
  if (password.length < 8) {
    errors.push('Lösenordet måste vara minst 8 tecken långt');
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('Lösenordet måste innehålla minst en stor bokstav');
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('Lösenordet måste innehålla minst en liten bokstav');
  }
  
  if (!/\d/.test(password)) {
    errors.push('Lösenordet måste innehålla minst en siffra');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};