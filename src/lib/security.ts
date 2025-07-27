/**
 * Security utilities for input sanitization and validation
 */

// HTML entities for sanitization
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#x27;',
  '/': '&#x2F;',
  '`': '&#x60;',
  '=': '&#x3D;'
}

/**
 * Sanitizes HTML content by escaping dangerous characters
 * @param input - String to sanitize
 * @returns Sanitized string
 */
export function sanitizeHtml(input: string): string {
  if (typeof input !== 'string') {
    return String(input)
  }
  
  return input.replace(/[&<>"'`=/]/g, (match) => HTML_ENTITIES[match] || match)
}

/**
 * Sanitizes user input for safe storage and display
 * @param input - Input to sanitize
 * @returns Sanitized input
 */
export function sanitizeInput(input: string): string {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .trim()
    .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000) // Limit length
}

/**
 * Validates email address against injection attacks
 * @param email - Email to validate
 * @returns True if email is safe
 */
export function isEmailSafe(email: string): boolean {
  if (typeof email !== 'string') {
    return false
  }
  
  // Check for common injection patterns
  const dangerousPatterns = [
    /[<>]/,                    // HTML tags
    /javascript:/i,            // JavaScript protocol
    /data:/i,                  // Data protocol
    /vbscript:/i,             // VBScript protocol
    /on\w+\s*=/i,             // Event handlers
    /\bscript\b/i,            // Script tags
    /[\r\n]/,                 // Line breaks in email
    /[;|&`$]/                 // Command injection chars
  ]
  
  // Check for null bytes and other dangerous control characters
  // eslint-disable-next-line no-control-regex
  if (email.includes('\0') || /[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/.test(email)) {
    return false
  }
  
  return !dangerousPatterns.some(pattern => pattern.test(email))
}

/**
 * Validates store ID for safety
 * @param storeId - Store ID to validate
 * @returns True if store ID is safe
 */
export function isStoreIdSafe(storeId: string): boolean {
  if (typeof storeId !== 'string') {
    return false
  }
  
  // Store IDs should only contain digits and be reasonable length
  return /^\d{1,10}$/.test(storeId.trim())
}

/**
 * Sanitizes coupon data for safe processing
 * @param coupon - Coupon object to sanitize
 * @returns Sanitized coupon object
 */
export function sanitizeCoupon(coupon: Record<string, unknown>): Record<string, unknown> {
  if (!coupon || typeof coupon !== 'object') {
    return {}
  }
  
  const sanitized: Record<string, unknown> = {}
  
  // List of allowed fields and their sanitization
  const allowedFields: Record<string, (val: unknown) => string> = {
    ID: (val: unknown) => sanitizeInput(String(val)),
    Name: (val: unknown) => sanitizeInput(String(val)),
    Description: (val: unknown) => sanitizeInput(String(val)),
    Price: (val: unknown) => sanitizeInput(String(val)),
    Code: (val: unknown) => sanitizeInput(String(val)),
    VirtualCode: (val: unknown) => sanitizeInput(String(val)),
    ExpirationDate: (val: unknown) => sanitizeInput(String(val)),
    Tags: (val: unknown) => sanitizeInput(String(val)),
    Local: (val: unknown) => String(val) === 'true' ? 'true' : 'false',
    Bundle: (val: unknown) => String(val) === 'true' ? 'true' : 'false'
  }
  
  Object.entries(allowedFields).forEach(([field, sanitizer]) => {
    if (coupon[field] !== undefined && coupon[field] !== null) {
      sanitized[field] = sanitizer(coupon[field])
    }
  })
  
  return sanitized
}

/**
 * Creates a Content Security Policy header value
 * @returns CSP header value
 */
export function getCSPHeader(): string {
  return [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'", // Needed for React
    "style-src 'self' 'unsafe-inline'",  // Needed for Tailwind
    "img-src 'self' data: https:",
    "font-src 'self' data:",
    "connect-src 'self' https://api.dominos.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'"
  ].join('; ')
}

/**
 * Validates request origin for CSRF protection
 * @param origin - Request origin
 * @param allowedOrigins - List of allowed origins
 * @returns True if origin is allowed
 */
export function isOriginAllowed(origin: string | null, allowedOrigins: string[]): boolean {
  if (!origin) {
    return false
  }
  
  return allowedOrigins.some(allowed => {
    if (allowed === '*') return true
    if (allowed.startsWith('*.')) {
      const domain = allowed.substring(2)
      return origin.endsWith(domain)
    }
    return origin === allowed
  })
}

/**
 * Generates a secure random token
 * @param length - Token length
 * @returns Random token
 */
export function generateSecureToken(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  
  // Use crypto.getRandomValues if available, fallback to Math.random
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    
    for (let i = 0; i < length; i++) {
      result += chars[array[i] % chars.length]
    }
  } else {
    // Fallback for environments without crypto
    for (let i = 0; i < length; i++) {
      result += chars[Math.floor(Math.random() * chars.length)]
    }
  }
  
  return result
}

/**
 * Rate limiting with sliding window
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  private maxRequests: number
  private windowMs: number
  
  constructor(maxRequests: number, windowMs: number) {
    this.maxRequests = maxRequests
    this.windowMs = windowMs
  }
  
  /**
   * Checks if request is allowed
   * @param identifier - Client identifier
   * @returns True if request is allowed
   */
  isAllowed(identifier: string): boolean {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    
    // Remove old requests outside the window
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    if (validRequests.length >= this.maxRequests) {
      return false
    }
    
    // Add current request
    validRequests.push(now)
    this.requests.set(identifier, validRequests)
    
    return true
  }
  
  /**
   * Gets remaining requests for identifier
   * @param identifier - Client identifier
   * @returns Number of remaining requests
   */
  getRemaining(identifier: string): number {
    const now = Date.now()
    const requests = this.requests.get(identifier) || []
    const validRequests = requests.filter(time => now - time < this.windowMs)
    
    return Math.max(0, this.maxRequests - validRequests.length)
  }
  
  /**
   * Gets reset time for identifier
   * @param identifier - Client identifier
   * @returns Reset time in milliseconds
   */
  getResetTime(identifier: string): number {
    const requests = this.requests.get(identifier) || []
    if (requests.length === 0) {
      return Date.now()
    }
    
    const oldestRequest = Math.min(...requests)
    return oldestRequest + this.windowMs
  }
  
  /**
   * Cleans up old entries
   */
  cleanup(): void {
    const now = Date.now()
    
    for (const [identifier, requests] of this.requests.entries()) {
      const validRequests = requests.filter(time => now - time < this.windowMs)
      
      if (validRequests.length === 0) {
        this.requests.delete(identifier)
      } else {
        this.requests.set(identifier, validRequests)
      }
    }
  }
}

/**
 * Input validation utilities
 */
export const validators = {
  /**
   * Validates email format and safety
   */
  email: (email: string): { valid: boolean; error?: string } => {
    if (!email || typeof email !== 'string') {
      return { valid: false, error: 'Email is required' }
    }
    
    const trimmed = email.trim()
    
    if (trimmed.length > 254) {
      return { valid: false, error: 'Email is too long' }
    }
    
    if (!isEmailSafe(trimmed)) {
      return { valid: false, error: 'Email contains invalid characters' }
    }
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    if (!emailRegex.test(trimmed)) {
      return { valid: false, error: 'Invalid email format' }
    }
    
    return { valid: true }
  },
  
  /**
   * Validates store ID format and safety
   */
  storeId: (storeId: string): { valid: boolean; error?: string } => {
    if (!storeId || typeof storeId !== 'string') {
      return { valid: false, error: 'Store ID is required' }
    }
    
    const trimmed = storeId.trim()
    
    if (!isStoreIdSafe(trimmed)) {
      return { valid: false, error: 'Invalid store ID format' }
    }
    
    if (trimmed.length < 1 || trimmed.length > 10) {
      return { valid: false, error: 'Store ID must be 1-10 digits' }
    }
    
    return { valid: true }
  }
}