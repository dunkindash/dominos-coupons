/**
 * Validation strategies using the Strategy pattern
 */

export interface ValidationResult {
  isValid: boolean
  error?: string
  suggestion?: string
  sanitizedValue?: string
}

export interface ValidationStrategy {
  validate(input: string): ValidationResult
}

// Base validation strategy with common functionality
abstract class BaseValidationStrategy implements ValidationStrategy {
  abstract validate(input: string): ValidationResult

  protected sanitizeInput(input: string): string {
    if (typeof input !== 'string') {
      return ''
    }
    
    return input
      .trim()
      .replace(/[^\x20-\x7E]/g, '') // Keep only printable ASCII characters
      .replace(/\s+/g, ' ') // Normalize whitespace
  }

  protected checkLength(input: string, maxLength: number): ValidationResult | null {
    if (input.length > maxLength) {
      return {
        isValid: false,
        error: `Input is too long (maximum ${maxLength} characters)`
      }
    }
    return null
  }
}

// Email validation strategies
export class BasicEmailValidationStrategy extends BaseValidationStrategy {
  validate(input: string): ValidationResult {
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        error: 'Email address is required'
      }
    }

    const sanitized = this.sanitizeInput(input)
    
    if (!sanitized) {
      return {
        isValid: false,
        error: 'Email address cannot be empty'
      }
    }

    const lengthCheck = this.checkLength(sanitized, 254)
    if (lengthCheck) {
      return lengthCheck
    }

    // Basic email format validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
    
    if (!emailRegex.test(sanitized)) {
      return {
        isValid: false,
        error: 'Please enter a valid email address'
      }
    }

    return {
      isValid: true,
      sanitizedValue: sanitized
    }
  }
}

export class SecurityEmailValidationStrategy extends BaseValidationStrategy {
  private readonly dangerousPatterns = [
    /[<>]/,                    // HTML tags
    /javascript:/i,            // JavaScript protocol
    /data:/i,                  // Data protocol
    /vbscript:/i,             // VBScript protocol
    /on\w+\s*=/i,             // Event handlers
    /\bscript\b/i,            // Script tags
    /[\r\n]/,                 // Line breaks in email
    /[;|&`$]/                 // Command injection chars
  ]

  validate(input: string): ValidationResult {
    const basicValidation = new BasicEmailValidationStrategy().validate(input)
    
    if (!basicValidation.isValid) {
      return basicValidation
    }

    const sanitized = basicValidation.sanitizedValue!

    // Check for security threats
    if (this.dangerousPatterns.some(pattern => pattern.test(sanitized))) {
      return {
        isValid: false,
        error: 'Email contains invalid or potentially dangerous characters'
      }
    }



    return {
      isValid: true,
      sanitizedValue: sanitized
    }
  }
}

export class TypoDetectionEmailValidationStrategy extends BaseValidationStrategy {
  private readonly commonDomainTypos: Record<string, string> = {
    'gmail.co': 'gmail.com',
    'gmail.cm': 'gmail.com',
    'gmial.com': 'gmail.com',
    'yahoo.co': 'yahoo.com',
    'yahoo.cm': 'yahoo.com',
    'hotmail.co': 'hotmail.com',
    'hotmail.cm': 'hotmail.com',
    'outlook.co': 'outlook.com',
    'icloud.co': 'icloud.com'
  }

  validate(input: string): ValidationResult {
    const securityValidation = new SecurityEmailValidationStrategy().validate(input)
    
    if (!securityValidation.isValid) {
      return securityValidation
    }

    const sanitized = securityValidation.sanitizedValue!
    const domain = sanitized.split('@')[1]?.toLowerCase()
    
    if (domain && this.commonDomainTypos[domain]) {
      const suggestion = sanitized.replace(domain, this.commonDomainTypos[domain])
      return {
        isValid: false,
        error: 'Email address appears to have a typo',
        suggestion
      }
    }

    return {
      isValid: true,
      sanitizedValue: sanitized
    }
  }
}

// Store ID validation strategies
export class StoreIdValidationStrategy extends BaseValidationStrategy {
  validate(input: string): ValidationResult {
    if (!input || typeof input !== 'string') {
      return {
        isValid: false,
        error: 'Store ID is required'
      }
    }

    const sanitized = this.sanitizeInput(input)
    
    if (!sanitized) {
      return {
        isValid: false,
        error: 'Store ID cannot be empty'
      }
    }

    // Store IDs should only contain digits and be reasonable length
    if (!/^\d{1,10}$/.test(sanitized)) {
      return {
        isValid: false,
        error: 'Store ID must contain only digits (1-10 characters)'
      }
    }

    return {
      isValid: true,
      sanitizedValue: sanitized
    }
  }
}

// Validation context that uses strategies
export class ValidationContext {
  private strategy: ValidationStrategy

  constructor(strategy: ValidationStrategy) {
    this.strategy = strategy
  }

  setStrategy(strategy: ValidationStrategy): void {
    this.strategy = strategy
  }

  validate(input: string): ValidationResult {
    return this.strategy.validate(input)
  }
}

// Factory for creating validation strategies
export class ValidationStrategyFactory {
  static createEmailValidator(options: {
    checkSecurity?: boolean
    checkTypos?: boolean
  } = {}): ValidationStrategy {
    const { checkSecurity = true, checkTypos = true } = options

    if (checkTypos) {
      return new TypoDetectionEmailValidationStrategy()
    }
    
    if (checkSecurity) {
      return new SecurityEmailValidationStrategy()
    }
    
    return new BasicEmailValidationStrategy()
  }

  static createStoreIdValidator(): ValidationStrategy {
    return new StoreIdValidationStrategy()
  }
}

// Convenience functions for common validation scenarios
export const validators = {
  email: {
    basic: (input: string) => new BasicEmailValidationStrategy().validate(input),
    secure: (input: string) => new SecurityEmailValidationStrategy().validate(input),
    withTypoDetection: (input: string) => new TypoDetectionEmailValidationStrategy().validate(input)
  },
  
  storeId: (input: string) => new StoreIdValidationStrategy().validate(input)
}