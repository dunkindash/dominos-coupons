/**
 * src/lib/validation.ts
 * 
 * Input validation utilities for security and data integrity
 * Requirements: TypeScript 5.0+
 * Dependencies: None (pure TypeScript/JavaScript)
 */

// Email validation regex (RFC 5322 compliant)
const EMAIL_REGEX = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

// Store ID validation (Domino's store IDs are typically 4-5 digits)
const STORE_ID_REGEX = /^\d{4,5}$/

// Language code validation (ISO 639-1)
const LANGUAGE_CODE_REGEX = /^[a-z]{2}$/

/**
 * Validate email address
 */
export function validateEmail(email: string): { isValid: boolean; error?: string } {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }
  
  if (email.length > 254) {
    return { isValid: false, error: 'Email is too long' }
  }
  
  if (!EMAIL_REGEX.test(email)) {
    return { isValid: false, error: 'Please enter a valid email address' }
  }
  
  return { isValid: true }
}

/**
 * Validate store ID
 */
export function validateStoreId(storeId: string): { isValid: boolean; error?: string } {
  if (!storeId) {
    return { isValid: false, error: 'Store ID is required' }
  }
  
  if (!STORE_ID_REGEX.test(storeId)) {
    return { isValid: false, error: 'Store ID must be 4-5 digits' }
  }
  
  return { isValid: true }
}

/**
 * Validate language code
 */
export function validateLanguageCode(code: string): { isValid: boolean; error?: string } {
  if (!code) {
    return { isValid: false, error: 'Language code is required' }
  }
  
  if (!LANGUAGE_CODE_REGEX.test(code)) {
    return { isValid: false, error: 'Invalid language code format' }
  }
  
  return { isValid: true }
}

/**
 * Sanitize string input to prevent XSS
 */
export function sanitizeString(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 1000) // Limit length
}

/**
 * Validate and sanitize search query
 */
export function validateSearchQuery(query: string): { isValid: boolean; sanitized: string; error?: string } {
  if (!query) {
    return { isValid: false, sanitized: '', error: 'Search query is required' }
  }
  
  const sanitized = sanitizeString(query)
  
  if (sanitized.length < 2) {
    return { isValid: false, sanitized, error: 'Search query must be at least 2 characters' }
  }
  
  if (sanitized.length > 100) {
    return { isValid: false, sanitized, error: 'Search query is too long' }
  }
  
  return { isValid: true, sanitized }
}

/**
 * Rate limiting validation
 */
export function validateRateLimit(
  requestCount: number, 
  firstRequestTime: number | null, 
  maxRequests: number = 5, 
  windowMs: number = 10 * 60 * 1000
): { isAllowed: boolean; remainingTime?: number } {
  if (!firstRequestTime) {
    return { isAllowed: true }
  }
  
  const elapsed = Date.now() - firstRequestTime
  
  if (elapsed >= windowMs) {
    return { isAllowed: true }
  }
  
  if (requestCount >= maxRequests) {
    const remainingTime = Math.ceil((windowMs - elapsed) / 1000)
    return { isAllowed: false, remainingTime }
  }
  
  return { isAllowed: true }
}

/**
 * Validate password strength (for authentication)
 */
export function validatePassword(password: string): { isValid: boolean; error?: string } {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }
  
  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters' }
  }
  
  if (password.length > 128) {
    return { isValid: false, error: 'Password is too long' }
  }
  
  return { isValid: true }
}

/**
 * Validate coupon code format
 */
export function validateCouponCode(code: string): { isValid: boolean; error?: string } {
  if (!code) {
    return { isValid: false, error: 'Coupon code is required' }
  }
  
  // Domino's coupon codes are typically alphanumeric, 4-10 characters
  const COUPON_CODE_REGEX = /^[A-Z0-9]{4,10}$/i
  
  if (!COUPON_CODE_REGEX.test(code)) {
    return { isValid: false, error: 'Invalid coupon code format' }
  }
  
  return { isValid: true }
}
