import { useState, useCallback } from 'react'
import { ErrorFactory, type AppError, ErrorType } from '@/lib/error-factory'

interface ErrorState {
  error: AppError | null
  isRetrying: boolean
  retryCount: number
}

interface UseErrorHandlerOptions {
  maxRetries?: number
  onError?: (error: AppError) => void
  onRetry?: (error: AppError, attempt: number) => void
}

export function useErrorHandler(options: UseErrorHandlerOptions = {}) {
  const { maxRetries = 3, onError, onRetry } = options
  
  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0
  })

  const handleError = useCallback((error: unknown, context?: string) => {
    let appError: AppError

    if (error && typeof error === 'object' && 'type' in error) {
      appError = error as AppError
    } else {
      appError = ErrorFactory.fromUnknown(error, {
        userMessage: context ? `Error in ${context}` : undefined
      })
    }

    setErrorState(prev => ({
      ...prev,
      error: appError,
      isRetrying: false
    }))

    onError?.(appError)

    // Log error for debugging
    console.error(`Error in ${context || 'application'}:`, appError)

    return appError
  }, [onError])

  const clearError = useCallback(() => {
    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0
    })
  }, [])

  const retryOperation = useCallback(async (
    operation: () => Promise<void> | void,
    context?: string
  ) => {
    const { error, retryCount } = errorState

    if (!error || !error.retryable || retryCount >= maxRetries) {
      return false
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1
    }))

    onRetry?.(error, retryCount + 1)

    try {
      // Handle rate limit delays
      if (error.type === ErrorType.RATE_LIMIT && error.details?.resetTime) {
        const delay = Math.max(0, Number(error.details.resetTime) - Date.now())
        if (delay > 0) {
          await new Promise(resolve => setTimeout(resolve, delay))
        }
      }

      await operation()
      
      // Success - clear error
      clearError()
      return true
    } catch (retryError) {
      // Handle retry failure
      const newError = handleError(retryError, context)
      
      setErrorState(prev => ({
        ...prev,
        error: newError,
        isRetrying: false
      }))
      
      return false
    }
  }, [errorState, maxRetries, onRetry, handleError, clearError])

  const canRetry = errorState.error?.retryable && errorState.retryCount < maxRetries

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    canRetry,
    handleError,
    clearError,
    retryOperation
  }
}

// Specialized hook for API errors
export function useApiErrorHandler() {
  return useErrorHandler({
    maxRetries: 3,
    onError: () => {
      // Log API errors to monitoring service in production
      if (process.env.NODE_ENV === 'production') {
        // Example: analytics.track('API Error', { type: error.type, code: error.code })
      }
    }
  })
}

// Specialized hook for email errors
export function useEmailErrorHandler() {
  return useErrorHandler({
    maxRetries: 2,
    onError: (error) => {
      if (error.type === ErrorType.EMAIL) {
        // Track email-specific errors
        console.warn('Email error occurred:', error.message)
      }
    }
  })
}