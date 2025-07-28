import React from 'react'
import { BrandedErrorDisplay } from './BrandedErrorDisplay'
import { NoResultsState, NetworkErrorState, LoadingState } from './ErrorStates'
import { useEnhancedErrorHandler } from '@/hooks/useEnhancedErrorHandler'
import type { AppError } from '@/lib/error-factory'
import { ErrorType } from '@/lib/error-factory'

interface ErrorDisplayProps {
  error: AppError | null
  onRetry?: () => void
  onClear?: () => void
  isRetrying?: boolean
  canRetry?: boolean
  context?: 'search' | 'coupon' | 'email' | 'store' | 'general'
  compact?: boolean
  showDetails?: boolean
}

export function ErrorDisplay({
  error,
  onRetry,
  onClear,
  isRetrying = false,
  canRetry = true,
  context = 'general',
  compact = false,
  showDetails = false
}: ErrorDisplayProps) {
  if (!error) return null

  // Handle specific error types with custom displays
  switch (error.type) {
    case ErrorType.NETWORK:
      if (!compact) {
        return (
          <NetworkErrorState
            onRetry={onRetry}
            isRetrying={isRetrying}
            message={error.userMessage}
          />
        )
      }
      break

    case ErrorType.STORE:
      if (!compact && context === 'search') {
        return (
          <NoResultsState
            searchType="store"
            searchValue={error.details?.storeId as string}
            onRetry={onRetry}
            onClear={onClear}
            suggestions={error.suggestions}
          />
        )
      }
      break

    case ErrorType.COUPON:
      if (!compact && context === 'coupon') {
        return (
          <NoResultsState
            searchType="coupon"
            onRetry={onRetry}
            onClear={onClear}
            suggestions={error.suggestions}
          />
        )
      }
      break
  }

  // Default to branded error display
  return (
    <BrandedErrorDisplay
      error={error}
      onRetry={onRetry}
      onDismiss={onClear}
      isRetrying={isRetrying}
      canRetry={canRetry}
      compact={compact}
      showDetails={showDetails}
    />
  )
}

// Hook-integrated error display component
interface ErrorDisplayWithHandlerProps {
  errorHandler: ReturnType<typeof useEnhancedErrorHandler>
  onRetry?: () => Promise<void> | void
  context?: 'search' | 'coupon' | 'email' | 'store' | 'general'
  compact?: boolean
  showDetails?: boolean
}

export function ErrorDisplayWithHandler({
  errorHandler,
  onRetry,
  context = 'general',
  compact = false,
  showDetails = false
}: ErrorDisplayWithHandlerProps) {
  const handleRetry = async () => {
    if (onRetry) {
      await errorHandler.retryOperation(onRetry, `retry ${context}`)
    }
  }

  return (
    <ErrorDisplay
      error={errorHandler.error}
      onRetry={errorHandler.canRetry ? handleRetry : undefined}
      onClear={errorHandler.clearError}
      isRetrying={errorHandler.isRetrying}
      canRetry={errorHandler.canRetry}
      context={context}
      compact={compact}
      showDetails={showDetails}
    />
  )
}

// Loading state with error fallback
interface LoadingWithErrorProps {
  isLoading: boolean
  error: AppError | null
  onRetry?: () => void
  loadingMessage?: string
  loadingSubMessage?: string
  children?: React.ReactNode
  context?: 'search' | 'coupon' | 'email' | 'store' | 'general'
}

export function LoadingWithError({
  isLoading,
  error,
  onRetry,
  loadingMessage,
  loadingSubMessage,
  children,
  context = 'general'
}: LoadingWithErrorProps) {
  if (isLoading) {
    return (
      <LoadingState
        message={loadingMessage}
        subMessage={loadingSubMessage}
        size="md"
      />
    )
  }

  if (error) {
    return (
      <ErrorDisplay
        error={error}
        onRetry={onRetry}
        context={context}
        compact={false}
        showDetails={false}
      />
    )
  }

  return <>{children}</>
}

// Inline error display for forms and inputs
interface InlineErrorProps {
  error: AppError | null
  className?: string
}

export function InlineError({ error, className = '' }: InlineErrorProps) {
  if (!error) return null

  return (
    <div className={`text-sm text-dominos-red mt-1 ${className}`}>
      <div className="flex items-start gap-2">
        <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>{error.userMessage}</span>
      </div>
      {error.suggestions && error.suggestions.length > 0 && (
        <ul className="mt-1 ml-6 text-xs text-gray-600 space-y-0.5">
          {error.suggestions.map((suggestion, index) => (
            <li key={index}>• {suggestion}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

// Toast-style error notification
interface ErrorToastProps {
  error: AppError | null
  onDismiss: () => void
  onRetry?: () => void
  autoHide?: boolean
  hideDelay?: number
}

export function ErrorToast({
  error,
  onDismiss,
  onRetry,
  autoHide = true,
  hideDelay = 5000
}: ErrorToastProps) {
  React.useEffect(() => {
    if (error && autoHide && error.type !== ErrorType.RATE_LIMIT) {
      const timer = setTimeout(onDismiss, hideDelay)
      return () => clearTimeout(timer)
    }
  }, [error, autoHide, hideDelay, onDismiss])

  if (!error) return null

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <BrandedErrorDisplay
        error={error}
        onRetry={onRetry}
        onDismiss={onDismiss}
        compact={true}
        canRetry={!!onRetry}
      />
    </div>
  )
}

export default ErrorDisplay