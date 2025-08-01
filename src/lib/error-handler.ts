/**
 * Centralized error handling utilities
 */

export interface AppError {
  message: string
  code?: string
  status?: number
  timestamp: number
  context?: Record<string, unknown>
}

export class ErrorHandler {
  private static instance: ErrorHandler
  private errorLog: AppError[] = []

  static getInstance(): ErrorHandler {
    if (!ErrorHandler.instance) {
      ErrorHandler.instance = new ErrorHandler()
    }
    return ErrorHandler.instance
  }

  /**
   * Log an error for debugging purposes
   */
  logError(error: Error | AppError, context?: Record<string, unknown>): void {
    const appError: AppError = {
      message: error.message,
      timestamp: Date.now(),
      context,
      ...(error instanceof Error && {
        code: error.name,
        status: (error as any).status
      })
    }

    this.errorLog.push(appError)
    
    // Keep only last 50 errors to prevent memory leaks
    if (this.errorLog.length > 50) {
      this.errorLog = this.errorLog.slice(-50)
    }

    // Log to console in development
    if (import.meta.env.DEV) {
      console.error('App Error:', appError)
    }
  }

  /**
   * Get user-friendly error message
   */
  getUserMessage(error: Error | AppError): string {
    const message = error.message

    // Map technical errors to user-friendly messages
    const errorMappings: Record<string, string> = {
      'Failed to fetch': 'Network error. Please check your connection and try again.',
      'NetworkError': 'Network error. Please check your connection and try again.',
      'TypeError': 'Something went wrong. Please try again.',
      'SyntaxError': 'Invalid response from server. Please try again.',
      'RATE_LIMIT_EXCEEDED': 'Too many requests. Please wait before trying again.',
      'UNAUTHORIZED': 'Your session has expired. Please refresh the page.',
      'NOT_FOUND': 'The requested resource was not found.',
      'VALIDATION_ERROR': 'Please check your input and try again.',
    }

    // Check for specific error codes
    const code = (error as any).code || (error as any).name
    if (code && errorMappings[code]) {
      return errorMappings[code]
    }

    // Check for message patterns
    for (const [pattern, userMessage] of Object.entries(errorMappings)) {
      if (message.toLowerCase().includes(pattern.toLowerCase())) {
        return userMessage
      }
    }

    // Return original message if it's already user-friendly
    if (message.length < 100 && !message.includes('Error:') && !message.includes('Exception:')) {
      return message
    }

    return 'Something went wrong. Please try again.'
  }

  /**
   * Handle API errors specifically
   */
  handleApiError(error: any): AppError {
    const appError: AppError = {
      message: this.getUserMessage(error),
      code: error.code || error.name,
      status: error.status,
      timestamp: Date.now(),
      context: {
        originalMessage: error.message,
        url: error.url,
        method: error.method
      }
    }

    this.logError(appError)
    return appError
  }

  /**
   * Handle validation errors
   */
  handleValidationError(field: string, message: string): AppError {
    const appError: AppError = {
      message: `${field}: ${message}`,
      code: 'VALIDATION_ERROR',
      timestamp: Date.now(),
      context: { field }
    }

    this.logError(appError)
    return appError
  }

  /**
   * Get recent errors for debugging
   */
  getRecentErrors(count: number = 10): AppError[] {
    return this.errorLog.slice(-count)
  }

  /**
   * Clear error log
   */
  clearErrors(): void {
    this.errorLog = []
  }
}

/**
 * Global error handler instance
 */
export const errorHandler = ErrorHandler.getInstance()

/**
 * React error boundary helper
 */
export function handleReactError(error: Error, errorInfo: any): void {
  errorHandler.logError(error, {
    componentStack: errorInfo.componentStack,
    errorBoundary: true
  })
}

/**
 * Promise rejection handler
 */
export function handleUnhandledRejection(event: PromiseRejectionEvent): void {
  errorHandler.logError(new Error(event.reason), {
    unhandledRejection: true,
    reason: event.reason
  })
}

/**
 * Window error handler
 */
export function handleWindowError(event: ErrorEvent): void {
  errorHandler.logError(new Error(event.message), {
    filename: event.filename,
    lineno: event.lineno,
    colno: event.colno,
    windowError: true
  })
}

// Set up global error handlers
if (typeof window !== 'undefined') {
  window.addEventListener('unhandledrejection', handleUnhandledRejection)
  window.addEventListener('error', handleWindowError)
}