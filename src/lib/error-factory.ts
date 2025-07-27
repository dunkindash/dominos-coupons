/**
 * Error factory for creating consistent error objects across the application
 */

export enum ErrorType {
  VALIDATION = 'validation',
  NETWORK = 'network',
  API = 'api',
  AUTHENTICATION = 'authentication',
  RATE_LIMIT = 'rate_limit',
  EMAIL = 'email',
  COUPON = 'coupon',
  STORE = 'store'
}

export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

export interface AppError {
  type: ErrorType
  severity: ErrorSeverity
  message: string
  userMessage: string
  code?: string
  details?: Record<string, unknown>
  timestamp: Date
  retryable: boolean
  suggestions?: string[]
}

export interface ErrorContext {
  message: string
  userMessage?: string
  code?: string
  details?: Record<string, unknown>
  retryable?: boolean
  suggestions?: string[]
}

class BaseErrorFactory {
  protected createError(
    type: ErrorType,
    severity: ErrorSeverity,
    context: ErrorContext
  ): AppError {
    return {
      type,
      severity,
      message: context.message,
      userMessage: context.userMessage || this.getDefaultUserMessage(type),
      code: context.code,
      details: context.details,
      timestamp: new Date(),
      retryable: context.retryable ?? this.isRetryableByDefault(type),
      suggestions: context.suggestions
    }
  }

  private getDefaultUserMessage(type: ErrorType): string {
    switch (type) {
      case ErrorType.VALIDATION:
        return 'Please check your input and try again.'
      case ErrorType.NETWORK:
        return 'Network error. Please check your connection and try again.'
      case ErrorType.API:
        return 'Service temporarily unavailable. Please try again later.'
      case ErrorType.AUTHENTICATION:
        return 'Session expired. Please refresh the page.'
      case ErrorType.RATE_LIMIT:
        return 'Too many requests. Please wait a moment and try again.'
      case ErrorType.EMAIL:
        return 'Email service error. Please try again later.'
      case ErrorType.COUPON:
        return 'Error loading coupons. Please try again.'
      case ErrorType.STORE:
        return 'Error loading store information. Please try again.'
      default:
        return 'An unexpected error occurred. Please try again.'
    }
  }

  private isRetryableByDefault(type: ErrorType): boolean {
    switch (type) {
      case ErrorType.NETWORK:
      case ErrorType.API:
      case ErrorType.EMAIL:
      case ErrorType.COUPON:
      case ErrorType.STORE:
        return true
      case ErrorType.VALIDATION:
      case ErrorType.AUTHENTICATION:
        return false
      case ErrorType.RATE_LIMIT:
        return true // But with delay
      default:
        return false
    }
  }
}

export class ValidationErrorFactory extends BaseErrorFactory {
  createEmailValidationError(_email: string, reason: string): AppError {
    return this.createError(ErrorType.VALIDATION, ErrorSeverity.LOW, {
      message: `Email validation failed: ${reason}`,
      userMessage: `Please enter a valid email address. ${reason}`,
      code: 'EMAIL_VALIDATION_FAILED',
      details: { email: '[REDACTED]', reason },
      retryable: false,
      suggestions: ['Check for typos in your email address', 'Make sure to include @ and a domain']
    })
  }

  createCouponSelectionError(): AppError {
    return this.createError(ErrorType.VALIDATION, ErrorSeverity.LOW, {
      message: 'No coupons selected for email',
      userMessage: 'Please select at least one coupon to continue.',
      code: 'NO_COUPONS_SELECTED',
      retryable: false,
      suggestions: ['Select one or more coupons from the list']
    })
  }

  createStoreIdValidationError(storeId: string): AppError {
    return this.createError(ErrorType.VALIDATION, ErrorSeverity.MEDIUM, {
      message: `Invalid store ID: ${storeId}`,
      userMessage: 'Please enter a valid store number.',
      code: 'INVALID_STORE_ID',
      details: { storeId },
      retryable: false,
      suggestions: ['Store numbers are typically 4-5 digits', 'Check your receipt or the Domino\'s website']
    })
  }
}

export class NetworkErrorFactory extends BaseErrorFactory {
  createConnectionError(): AppError {
    return this.createError(ErrorType.NETWORK, ErrorSeverity.HIGH, {
      message: 'Network connection failed',
      userMessage: 'Unable to connect to the server. Please check your internet connection.',
      code: 'CONNECTION_FAILED',
      retryable: true,
      suggestions: ['Check your internet connection', 'Try again in a few moments']
    })
  }

  createTimeoutError(): AppError {
    return this.createError(ErrorType.NETWORK, ErrorSeverity.MEDIUM, {
      message: 'Request timeout',
      userMessage: 'The request took too long to complete. Please try again.',
      code: 'REQUEST_TIMEOUT',
      retryable: true,
      suggestions: ['Try again with a stable internet connection']
    })
  }
}

export class APIErrorFactory extends BaseErrorFactory {
  createRateLimitError(resetTime?: number): AppError {
    const resetMinutes = resetTime ? Math.ceil((resetTime - Date.now()) / 1000 / 60) : 10
    
    return this.createError(ErrorType.RATE_LIMIT, ErrorSeverity.MEDIUM, {
      message: 'Rate limit exceeded',
      userMessage: `Too many requests. Please wait ${resetMinutes} minute${resetMinutes !== 1 ? 's' : ''} before trying again.`,
      code: 'RATE_LIMIT_EXCEEDED',
      details: { resetTime, resetMinutes },
      retryable: true,
      suggestions: [`Wait ${resetMinutes} minutes before trying again`]
    })
  }

  createAuthenticationError(): AppError {
    return this.createError(ErrorType.AUTHENTICATION, ErrorSeverity.HIGH, {
      message: 'Authentication failed',
      userMessage: 'Your session has expired. Please refresh the page to continue.',
      code: 'AUTH_FAILED',
      retryable: false,
      suggestions: ['Refresh the page', 'Clear your browser cache if the problem persists']
    })
  }

  createServerError(statusCode: number, message?: string): AppError {
    return this.createError(ErrorType.API, ErrorSeverity.HIGH, {
      message: `Server error (${statusCode}): ${message || 'Unknown error'}`,
      userMessage: 'The service is temporarily unavailable. Please try again later.',
      code: `SERVER_ERROR_${statusCode}`,
      details: { statusCode, originalMessage: message },
      retryable: statusCode >= 500,
      suggestions: ['Try again in a few minutes', 'Contact support if the problem persists']
    })
  }
}

export class EmailErrorFactory extends BaseErrorFactory {
  createSendError(originalError?: string): AppError {
    return this.createError(ErrorType.EMAIL, ErrorSeverity.MEDIUM, {
      message: `Email send failed: ${originalError || 'Unknown error'}`,
      userMessage: 'Failed to send email. Please try again or take a screenshot of the coupons.',
      code: 'EMAIL_SEND_FAILED',
      details: { originalError },
      retryable: true,
      suggestions: [
        'Try again in a moment',
        'Check that your email address is correct',
        'Take a screenshot as a backup'
      ]
    })
  }

  createServiceUnavailableError(): AppError {
    return this.createError(ErrorType.EMAIL, ErrorSeverity.HIGH, {
      message: 'Email service unavailable',
      userMessage: 'The email service is temporarily unavailable. Please try again later.',
      code: 'EMAIL_SERVICE_UNAVAILABLE',
      retryable: true,
      suggestions: [
        'Try again in a few minutes',
        'Take a screenshot of the coupons as a backup'
      ]
    })
  }
}

export class CouponErrorFactory extends BaseErrorFactory {
  createLoadError(storeId: string): AppError {
    return this.createError(ErrorType.COUPON, ErrorSeverity.MEDIUM, {
      message: `Failed to load coupons for store ${storeId}`,
      userMessage: 'Unable to load coupons for this store. Please try again.',
      code: 'COUPON_LOAD_FAILED',
      details: { storeId },
      retryable: true,
      suggestions: ['Try again in a moment', 'Check that the store number is correct']
    })
  }

  createParsingError(): AppError {
    return this.createError(ErrorType.COUPON, ErrorSeverity.MEDIUM, {
      message: 'Failed to parse coupon data',
      userMessage: 'There was an error processing the coupon data. Please try again.',
      code: 'COUPON_PARSE_FAILED',
      retryable: true,
      suggestions: ['Try refreshing the page', 'Try a different store if the problem persists']
    })
  }
}

// Main error factory that delegates to specific factories
export class ErrorFactory {
  private static _validation = new ValidationErrorFactory()
  private static _network = new NetworkErrorFactory()
  private static _api = new APIErrorFactory()
  private static _email = new EmailErrorFactory()
  private static _coupon = new CouponErrorFactory()

  static get validation() {
    return this._validation
  }

  static get network() {
    return this._network
  }

  static get api() {
    return this._api
  }

  static get email() {
    return this._email
  }

  static get coupon() {
    return this._coupon
  }

  // Generic error creation
  static createGenericError(message: string, userMessage?: string): AppError {
    return {
      type: ErrorType.API,
      severity: ErrorSeverity.MEDIUM,
      message,
      userMessage: userMessage || 'An unexpected error occurred. Please try again.',
      timestamp: new Date(),
      retryable: true
    }
  }

  // Convert unknown errors to AppError
  static fromUnknown(error: unknown, context?: Partial<ErrorContext>): AppError {
    if (error instanceof Error) {
      return {
        type: ErrorType.API,
        severity: ErrorSeverity.MEDIUM,
        message: error.message,
        userMessage: context?.userMessage || 'An unexpected error occurred. Please try again.',
        code: context?.code,
        details: { ...context?.details, stack: error.stack },
        timestamp: new Date(),
        retryable: context?.retryable ?? true,
        suggestions: context?.suggestions
      }
    }

    return this.createGenericError(
      String(error),
      context?.userMessage
    )
  }
}

// Utility function to check if an error is retryable
export function isRetryableError(error: AppError): boolean {
  return error.retryable && error.type !== ErrorType.RATE_LIMIT
}

// Utility function to get retry delay for rate limit errors
export function getRetryDelay(error: AppError): number {
  if (error.type === ErrorType.RATE_LIMIT && error.details?.resetTime) {
    return Math.max(0, Number(error.details.resetTime) - Date.now())
  }
  return 0
}