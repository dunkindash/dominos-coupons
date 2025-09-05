/**
 * src/config/app.config.ts
 * 
 * Centralized Application Configuration Management
 * 
 * Requirements:
 * - TypeScript 5.0+
 * - Node.js 18+ (for process.env access)
 * 
 * Dependencies:
 * - None (pure TypeScript configuration)
 * 
 * Features:
 * - Environment-specific configuration overrides (development, production, test)
 * - Type-safe configuration interfaces with validation
 * - Email, API, UI, and Security configuration sections
 * - Runtime configuration validation with error reporting
 * - Convenience exports for specific config sections
 * - Automatic environment detection and config merging
 * - Production-ready security defaults with CSRF protection
 * - Rate limiting configuration for API endpoints
 * - Vercel deployment support with dynamic origin detection
 */

export interface EmailConfig {
  maxLength: number
  maxCouponsPerEmail: number
  defaultLanguage: string
  apiEndpoint: string
  defaultRateLimitMinutes: number
  retryConfig: {
    maxAttempts: number
    delayMs: number
  }
}

export interface APIConfig {
  timeout: number
  retries: number
  retryDelay: number
  rateLimit: {
    maxRequests: number
    windowMinutes: number
  }
}

export interface UIConfig {
  successMessageDuration: number
  modalAnimationDuration: number
  debounceDelay: number
  lazyLoadingDelay: number
}

export interface SecurityConfig {
  maxInputLength: number
  allowedOrigins: string[]
  csrfProtection: boolean
  sanitizeInputs: boolean
}

export interface AppConfig {
  email: EmailConfig
  api: APIConfig
  ui: UIConfig
  security: SecurityConfig
}

// Default configuration
const defaultConfig: AppConfig = {
  email: {
    maxLength: 254, // RFC 5321 limit
    maxCouponsPerEmail: 50,
    defaultLanguage: 'en',
    apiEndpoint: '/api/email/send-coupons',
    defaultRateLimitMinutes: 10,
    retryConfig: {
      maxAttempts: 3,
      delayMs: 1000
    }
  },
  
  api: {
    timeout: 10000, // 10 seconds
    retries: 3,
    retryDelay: 1000,
    rateLimit: {
      maxRequests: 5,
      windowMinutes: 10
    }
  },
  
  ui: {
    successMessageDuration: 2000, // 2 seconds
    modalAnimationDuration: 200,
    debounceDelay: 300,
    lazyLoadingDelay: 100
  },
  
  security: {
    maxInputLength: 1000,
    allowedOrigins: [
      'http://localhost:3000',
      'http://localhost:5173',
      'https://your-domain.com' // Replace with actual domain
    ],
    csrfProtection: true,
    sanitizeInputs: true
  }
}

// Environment-specific overrides
const getEnvironmentConfig = (): Partial<AppConfig> => {
  const env = process.env.NODE_ENV || 'development'
  
  switch (env) {
    case 'development':
      return {
        api: {
          ...defaultConfig.api,
          timeout: 30000, // Longer timeout for development
        },
        security: {
          ...defaultConfig.security,
          csrfProtection: false // Disabled for easier development
        }
      }
    
    case 'production':
      return {
        security: {
          ...defaultConfig.security,
          allowedOrigins: [
            process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : '',
            process.env.ALLOWED_ORIGIN || '',
            'https://your-production-domain.com' // Replace with actual domain
          ].filter(Boolean)
        }
      }
    
    case 'test':
      return {
        api: {
          ...defaultConfig.api,
          timeout: 5000,
          retries: 1
        },
        ui: {
          ...defaultConfig.ui,
          debounceDelay: 0, // No debounce in tests
          successMessageDuration: 100
        }
      }
    
    default:
      return {}
  }
}

// Merge default config with environment-specific overrides
function mergeConfig(base: AppConfig, override: Partial<AppConfig>): AppConfig {
  return {
    email: { ...base.email, ...override.email },
    api: { ...base.api, ...override.api },
    ui: { ...base.ui, ...override.ui },
    security: { ...base.security, ...override.security }
  }
}

// Export the final configuration
export const appConfig: AppConfig = mergeConfig(defaultConfig, getEnvironmentConfig())

// Convenience exports for specific config sections
export const emailConfig = appConfig.email
export const apiConfig = appConfig.api
export const uiConfig = appConfig.ui
export const securityConfig = appConfig.security

// Configuration validation
export function validateConfig(config: AppConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  // Validate email config
  if (config.email.maxLength <= 0) {
    errors.push('Email max length must be positive')
  }
  
  if (config.email.maxCouponsPerEmail <= 0) {
    errors.push('Max coupons per email must be positive')
  }
  
  // Validate API config
  if (config.api.timeout <= 0) {
    errors.push('API timeout must be positive')
  }
  
  if (config.api.rateLimit.maxRequests <= 0) {
    errors.push('Rate limit max requests must be positive')
  }
  
  // Validate UI config
  if (config.ui.debounceDelay < 0) {
    errors.push('Debounce delay cannot be negative')
  }
  
  // Validate security config
  if (config.security.allowedOrigins.length === 0) {
    errors.push('At least one allowed origin must be specified')
  }
  
  return {
    valid: errors.length === 0,
    errors
  }
}

// Runtime configuration validation
const configValidation = validateConfig(appConfig)
if (!configValidation.valid) {
  // Import logger dynamically to avoid circular dependencies
  import('../lib/logger.js').then(({ logger }) => {
    logger.warn('Configuration validation failed', {
      errors: configValidation.errors,
      environment: process.env.NODE_ENV || 'development',
      context: 'app-config-validation'
    })
  }).catch(() => {
    // Fallback to console if logger import fails
    console.warn('Configuration validation failed:', configValidation.errors)
  })
}

export default appConfig
