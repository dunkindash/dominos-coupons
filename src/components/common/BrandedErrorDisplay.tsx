import React from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import type { AppError } from '@/lib/error-factory'
import { ErrorType } from '@/lib/error-factory'

interface BrandedErrorDisplayProps {
  error: AppError
  onRetry?: () => void
  onDismiss?: () => void
  isRetrying?: boolean
  canRetry?: boolean
  showDetails?: boolean
  compact?: boolean
}

// Error type to icon mapping
const getErrorIcon = (type: ErrorType) => {
  switch (type) {
    case ErrorType.NETWORK:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case ErrorType.RATE_LIMIT:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
    case ErrorType.EMAIL:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      )
    case ErrorType.STORE:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      )
    case ErrorType.COUPON:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
        </svg>
      )
    case ErrorType.VALIDATION:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      )
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      )
  }
}

// Error type to color scheme mapping
const getErrorColorScheme = (type: ErrorType) => {
  switch (type) {
    case ErrorType.NETWORK:
      return {
        iconColor: 'text-dominos-blue',
        titleColor: 'text-dominos-blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    case ErrorType.RATE_LIMIT:
      return {
        iconColor: 'text-yellow-600',
        titleColor: 'text-yellow-800',
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200'
      }
    case ErrorType.EMAIL:
      return {
        iconColor: 'text-dominos-blue',
        titleColor: 'text-dominos-blue',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200'
      }
    case ErrorType.VALIDATION:
      return {
        iconColor: 'text-orange-600',
        titleColor: 'text-orange-800',
        bgColor: 'bg-orange-50',
        borderColor: 'border-orange-200'
      }
    default:
      return {
        iconColor: 'text-dominos-red',
        titleColor: 'text-dominos-red',
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200'
      }
  }
}

// Get user-friendly title for error type
const getErrorTitle = (type: ErrorType) => {
  switch (type) {
    case ErrorType.NETWORK:
      return 'Connection Problem'
    case ErrorType.RATE_LIMIT:
      return 'Please Wait'
    case ErrorType.EMAIL:
      return 'Email Issue'
    case ErrorType.STORE:
      return 'Store Not Found'
    case ErrorType.COUPON:
      return 'Coupons Unavailable'
    case ErrorType.VALIDATION:
      return 'Input Error'
    case ErrorType.AUTHENTICATION:
      return 'Session Expired'
    default:
      return 'Something Went Wrong'
  }
}

export function BrandedErrorDisplay({
  error,
  onRetry,
  onDismiss,
  isRetrying = false,
  canRetry = false,
  showDetails = false,
  compact = false
}: BrandedErrorDisplayProps) {
  const colorScheme = getErrorColorScheme(error.type)
  const icon = getErrorIcon(error.type)
  const title = getErrorTitle(error.type)

  if (compact) {
    return (
      <div className={`rounded-lg border p-3 ${colorScheme.bgColor} ${colorScheme.borderColor}`}>
        <div className="flex items-start gap-3">
          <div className={`flex-shrink-0 ${colorScheme.iconColor}`}>
            {icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${colorScheme.titleColor}`}>
              {title}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {error.userMessage}
            </p>
            {error.suggestions && error.suggestions.length > 0 && (
              <ul className="text-xs text-gray-500 mt-2 space-y-1">
                {error.suggestions.map((suggestion, index) => (
                  <li key={index}>• {suggestion}</li>
                ))}
              </ul>
            )}
          </div>
          <div className="flex-shrink-0 flex gap-2">
            {canRetry && onRetry && (
              <Button
                onClick={onRetry}
                disabled={isRetrying}
                variant="dominos-ghost"
                size="sm"
                className="h-8"
              >
                {isRetrying ? (
                  <>
                    <Spinner size="sm" className="text-dominos-red" />
                    Retrying...
                  </>
                ) : (
                  'Retry'
                )}
              </Button>
            )}
            {onDismiss && (
              <Button
                onClick={onDismiss}
                variant="ghost"
                size="sm"
                className="h-8 text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </Button>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="pb-3">
        <CardTitle className={`flex items-center gap-3 ${colorScheme.titleColor}`}>
          <div className={colorScheme.iconColor}>
            {icon}
          </div>
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-700">
          {error.userMessage}
        </p>

        {error.suggestions && error.suggestions.length > 0 && (
          <div className={`rounded-lg p-3 ${colorScheme.bgColor} ${colorScheme.borderColor} border`}>
            <h4 className={`font-medium ${colorScheme.titleColor} mb-2`}>
              What you can try:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {error.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className={`text-xs mt-1 ${colorScheme.iconColor}`}>•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {error.type === ErrorType.RATE_LIMIT && error.details?.resetTime ? (
          <RateLimitCountdown resetTime={Number(error.details.resetTime)} />
        ) : null}

        {showDetails && process.env.NODE_ENV === 'development' && (
          <details className="bg-gray-50 p-3 rounded text-sm">
            <summary className="cursor-pointer font-medium text-gray-700 mb-2">
              Error Details (Development)
            </summary>
            <div className="space-y-2">
              <div>
                <strong>Type:</strong> {error.type}
              </div>
              <div>
                <strong>Code:</strong> {error.code || 'N/A'}
              </div>
              <div>
                <strong>Message:</strong> {error.message}
              </div>
              <div>
                <strong>Timestamp:</strong> {error.timestamp.toLocaleString()}
              </div>
              {error.details && (
                <div>
                  <strong>Details:</strong>
                  <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                    {JSON.stringify(error.details, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        <div className="flex gap-2 pt-2">
          {canRetry && onRetry && (
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              variant="dominos-primary"
              size="sm"
              className="flex-1"
            >
              {isRetrying ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Retrying...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
          )}
          {onDismiss && (
            <Button
              onClick={onDismiss}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Dismiss
            </Button>
          )}
          {!canRetry && !onDismiss && (
            <Button
              onClick={() => window.location.reload()}
              variant="dominos-secondary"
              size="sm"
              className="flex-1"
            >
              Refresh Page
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

// Rate limit countdown component
function RateLimitCountdown({ resetTime }: { resetTime: number }) {
  const [timeLeft, setTimeLeft] = React.useState(Math.max(0, resetTime - Date.now()))

  React.useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, resetTime - Date.now())
      setTimeLeft(remaining)
      
      if (remaining <= 0) {
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [resetTime])

  const minutes = Math.floor(timeLeft / 1000 / 60)
  const seconds = Math.floor((timeLeft / 1000) % 60)

  if (timeLeft <= 0) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-3">
        <p className="text-sm text-green-800 font-medium">
          ✓ You can try again now!
        </p>
      </div>
    )
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
      <div className="flex items-center justify-between">
        <p className="text-sm text-yellow-800 font-medium">
          Rate limit active
        </p>
        <div className="text-sm font-mono text-yellow-700">
          {minutes}:{seconds.toString().padStart(2, '0')}
        </div>
      </div>
      <div className="w-full bg-yellow-200 rounded-full h-2 mt-2">
        <div
          className="bg-yellow-500 h-2 rounded-full transition-all duration-1000"
          style={{
            width: `${Math.max(0, 100 - (timeLeft / (10 * 60 * 1000)) * 100)}%`
          }}
        />
      </div>
    </div>
  )
}

export default BrandedErrorDisplay