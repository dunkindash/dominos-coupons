/**
 * Application-wide constants and configuration
 */

// Email configuration
export const EMAIL_CONSTANTS = {
  MAX_EMAIL_LENGTH: 254, // RFC 5321 limit
  MAX_COUPONS_PER_EMAIL: 50,
  DEFAULT_LANGUAGE: 'en',
  API_ENDPOINT: '/api/email/send-coupons',
  DEFAULT_RATE_LIMIT_MINUTES: 10,
  RETRY_CONFIG: {
    MAX_ATTEMPTS: 3,
    DELAY_MS: 1000
  }
} as const

// Common domain typos for email validation
export const COMMON_EMAIL_TYPOS: Record<string, string> = {
  'gmail.co': 'gmail.com',
  'gmail.cm': 'gmail.com',
  'gmial.com': 'gmail.com',
  'yahoo.co': 'yahoo.com',
  'yahoo.cm': 'yahoo.com',
  'hotmail.co': 'hotmail.com',
  'hotmail.cm': 'hotmail.com',
  'outlook.co': 'outlook.com',
  'icloud.co': 'icloud.com'
} as const

// HTTP status codes and their meanings
export const HTTP_STATUS = {
  OK: 200,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  TOO_MANY_REQUESTS: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503
} as const

// UI constants
export const UI_CONSTANTS = {
  SUCCESS_MESSAGE_DURATION: 2000, // 2 seconds
  MODAL_ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 300
} as const

// Validation patterns
export const VALIDATION_PATTERNS = {
  EMAIL: /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,
  STORE_ID: /^\d+$/
} as const