import { useState, useCallback, useRef } from 'react'
import { ErrorFactory, type AppError, ErrorType, isRetryableError, getRetryDelay } from '@/lib/error-factory'

interface ErrorState {
  error: AppError | null
  isRetrying: boolean
  retryCount: number
  lastRetryTime: number | null
}

interface UseEnhancedErrorHandlerOptions {
  maxRetries?: number
  retryDelay?: number
  onError?: (error: AppError) => void
  onRetry?: (error: AppError, attempt: number) => void
  onMaxRetriesReached?: (error: AppError) => void
  context?: string
}

export function useEnhancedErrorHandler(options: UseEnhancedErrorHandlerOptions = {}) {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    onError,
    onRetry,
    onMaxRetriesReached,
    context = 'operation'
  } = options

  const [errorState, setErrorState] = useState<ErrorState>({
    error: null,
    isRetrying: false,
    retryCount: 0,
    lastRetryTime: null
  })

  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const handleError = useCallback((error: unknown, errorContext?: string) => {
    let appError: AppError

    // Convert unknown error to AppError
    if (error && typeof error === 'object' && 'type' in error) {
      appError = error as AppError
    } else if (error instanceof Error) {
      // Handle specific error types based on message patterns
      if (error.message.includes('fetch')) {
        appError = ErrorFactory.network.createConnectionError()
      } else if (error.message.includes('timeout')) {
        appError = ErrorFactory.network.createTimeoutError()
      } else if (error.message.includes('rate limit')) {
        appError = ErrorFactory.api.createRateLimitError()
      } else {
        appError = ErrorFactory.fromUnknown(error, {
          userMessage: `Error in ${errorContext || context}`
        })
      }
    } else {
      appError = ErrorFactory.createGenericError(
        String(error),
        `Error in ${errorContext || context}`
      )
    }

    setErrorState(prev => ({
      ...prev,
      error: appError,
      isRetrying: false
    }))

    onError?.(appError)

    // Log error for debugging
    console.error(`Error in ${errorContext || context}:`, {
      type: appError.type,
      message: appError.message,
      code: appError.code,
      details: appError.details,
      timestamp: appError.timestamp
    })

    return appError
  }, [onError, context])

  const clearError = useCallback(() => {
    if (retryTimeoutRef.current) {
      clearTimeout(retryTimeoutRef.current)
      retryTimeoutRef.current = null
    }

    setErrorState({
      error: null,
      isRetrying: false,
      retryCount: 0,
      lastRetryTime: null
    })
  }, [])

  const retryOperation = useCallback(async (
    operation: () => Promise<void> | void,
    operationContext?: string
  ) => {
    const { error, retryCount } = errorState

    if (!error || !isRetryableError(error) || retryCount >= maxRetries) {
      if (retryCount >= maxRetries && error) {
        onMaxRetriesReached?.(error)
      }
      return false
    }

    setErrorState(prev => ({
      ...prev,
      isRetrying: true,
      retryCount: prev.retryCount + 1,
      lastRetryTime: Date.now()
    }))

    onRetry?.(error, retryCount + 1)

    try {
      // Handle rate limit delays
      const rateLimitDelay = getRetryDelay(error)
      const totalDelay = Math.max(rateLimitDelay, retryDelay * Math.pow(2, retryCount)) // Exponential backoff

      if (totalDelay > 0) {
        await new Promise(resolve => {
          retryTimeoutRef.current = setTimeout(resolve, totalDelay)
        })
      }

      await operation()
      
      // Success - clear error
      clearError()
      return true
    } catch (retryError) {
      // Handle retry failure
      const newError = handleError(retryError, operationContext)
      
      setErrorState(prev => ({
        ...prev,
        error: newError,
        isRetrying: false
      }))
      
      return false
    }
  }, [errorState, maxRetries, retryDelay, onRetry, onMaxRetriesReached, handleError, clearError])

  const canRetry = errorState.error ? 
    isRetryableError(errorState.error) && errorState.retryCount < maxRetries : 
    false

  const getRetryCountdown = useCallback(() => {
    if (!errorState.error || !errorState.lastRetryTime) return 0
    
    const rateLimitDelay = getRetryDelay(errorState.error)
    const exponentialDelay = retryDelay * Math.pow(2, errorState.retryCount)
    const totalDelay = Math.max(rateLimitDelay, exponentialDelay)
    
    return Math.max(0, totalDelay - (Date.now() - errorState.lastRetryTime))
  }, [errorState.error, errorState.lastRetryTime, errorState.retryCount, retryDelay])

  return {
    error: errorState.error,
    isRetrying: errorState.isRetrying,
    retryCount: errorState.retryCount,
    canRetry,
    handleError,
    clearError,
    retryOperation,
    getRetryCountdown
  }
}

// Specialized hooks for different contexts
export function useStoreErrorHandler() {
  return useEnhancedErrorHandler({
    maxRetries: 3,
    retryDelay: 2000,
    context: 'store search',
    onError: (error) => {
      if (error.type === ErrorType.STORE) {
        // Track store-specific errors
        console.warn('Store search error:', error.message)
      }
    }
  })
}

export function useCouponErrorHandler() {
  return useEnhancedErrorHandler({
    maxRetries: 2,
    retryDelay: 1500,
    context: 'coupon loading',
    onError: (error) => {
      if (error.type === ErrorType.COUPON) {
        // Track coupon-specific errors
        console.warn('Coupon loading error:', error.message)
      }
    }
  })
}

export function useNetworkErrorHandler() {
  return useEnhancedErrorHandler({
    maxRetries: 5,
    retryDelay: 1000,
    context: 'network request',
    onError: (error) => {
      if (error.type === ErrorType.NETWORK) {
        // Track network-specific errors
        console.warn('Network error:', error.message)
      }
    }
  })
}

export function useEmailErrorHandler() {
  return useEnhancedErrorHandler({
    maxRetries: 2,
    retryDelay: 2000,
    context: 'email service',
    onError: (error) => {
      if (error.type === ErrorType.EMAIL) {
        // Track email-specific errors
        console.warn('Email service error:', error.message)
      }
    }
  })
}

// Utility function to create error handlers for specific operations
export function createOperationErrorHandler(
  operationName: string,
  options: Partial<UseEnhancedErrorHandlerOptions> = {}
) {
  return function useOperationErrorHandler() {
    return useEnhancedErrorHandler({
      context: operationName,
      ...options
    })
  }
}

export default useEnhancedErrorHandler