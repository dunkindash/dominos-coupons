import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'

// No Results Error State
interface NoResultsProps {
  searchType: 'store' | 'coupon' | 'location'
  searchValue?: string
  onRetry?: () => void
  onClear?: () => void
  suggestions?: string[]
}

export function NoResultsState({
  searchType,
  searchValue,
  onRetry,
  onClear,
  suggestions = []
}: NoResultsProps) {
  const getNoResultsContent = () => {
    switch (searchType) {
      case 'store':
        return {
          icon: (
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          ),
          title: 'Store Not Found',
          message: searchValue 
            ? `We couldn't find a Domino's store with ID "${searchValue}".`
            : "We couldn't find any Domino's stores matching your search.",
          defaultSuggestions: [
            'Double-check the store number on your receipt',
            'Try searching for nearby stores instead',
            'Store numbers are typically 4-5 digits'
          ]
        }
      case 'location':
        return {
          icon: (
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          ),
          title: 'No Nearby Stores',
          message: searchValue
            ? `No Domino's stores found near "${searchValue}".`
            : "No Domino's stores found in your area.",
          defaultSuggestions: [
            'Try expanding your search radius',
            'Check your location spelling',
            'Search for a nearby city or zip code'
          ]
        }
      case 'coupon':
        return {
          icon: (
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
          ),
          title: 'No Coupons Available',
          message: 'This store doesn\'t have any active coupons right now.',
          defaultSuggestions: [
            'Try checking another nearby store',
            'Coupons are updated regularly - check back later',
            'Some deals may be available in-store only'
          ]
        }
      default:
        return {
          icon: (
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
          ),
          title: 'No Results Found',
          message: 'We couldn\'t find what you\'re looking for.',
          defaultSuggestions: ['Try a different search', 'Check your spelling']
        }
    }
  }

  const content = getNoResultsContent()
  const allSuggestions = suggestions.length > 0 ? suggestions : content.defaultSuggestions

  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          {content.icon}
        </div>
        
        <h3 className="dominos-heading-sm mb-2">
          {content.title}
        </h3>
        
        <p className="text-gray-600 mb-6">
          {content.message}
        </p>

        {allSuggestions.length > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
            <h4 className="font-medium text-dominos-blue mb-2">
              Try these suggestions:
            </h4>
            <ul className="text-sm text-gray-600 space-y-1">
              {allSuggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2">
                  <span className="text-dominos-blue text-xs mt-1">•</span>
                  <span>{suggestion}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              variant="dominos-primary"
              size="lg"
            >
              Try Again
            </Button>
          )}
          {onClear && (
            <Button
              onClick={onClear}
              variant="dominos-secondary"
              size="lg"
            >
              New Search
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

// Network Error State
interface NetworkErrorProps {
  onRetry?: () => void
  isRetrying?: boolean
  message?: string
}

export function NetworkErrorState({
  onRetry,
  isRetrying = false,
  message = "We're having trouble connecting to our servers."
}: NetworkErrorProps) {
  return (
    <div className="text-center py-12 px-4">
      <div className="max-w-md mx-auto">
        <div className="flex justify-center mb-4">
          <svg className="w-12 h-12 text-dominos-blue" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        
        <h3 className="dominos-heading-sm text-dominos-blue mb-2">
          Connection Problem
        </h3>
        
        <p className="text-gray-600 mb-6">
          {message}
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
          <h4 className="font-medium text-dominos-blue mb-2">
            What you can try:
          </h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-dominos-blue text-xs mt-1">•</span>
              <span>Check your internet connection</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dominos-blue text-xs mt-1">•</span>
              <span>Try again in a few moments</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-dominos-blue text-xs mt-1">•</span>
              <span>Refresh the page if the problem persists</span>
            </li>
          </ul>
        </div>

        <div className="flex gap-3 justify-center">
          {onRetry && (
            <Button
              onClick={onRetry}
              disabled={isRetrying}
              variant="dominos-primary"
              size="lg"
            >
              {isRetrying ? (
                <>
                  <Spinner size="sm" className="text-white" />
                  Connecting...
                </>
              ) : (
                'Try Again'
              )}
            </Button>
          )}
          <Button
            onClick={() => window.location.reload()}
            variant="dominos-secondary"
            size="lg"
          >
            Refresh Page
          </Button>
        </div>
      </div>
    </div>
  )
}

// Loading State with Domino's branding
interface LoadingStateProps {
  message?: string
  subMessage?: string
  showSpinner?: boolean
  size?: 'sm' | 'md' | 'lg'
}

export function LoadingState({
  message = "Loading...",
  subMessage,
  showSpinner = true,
  size = 'md'
}: LoadingStateProps) {
  const sizeClasses = {
    sm: 'py-8',
    md: 'py-12',
    lg: 'py-16'
  }

  const spinnerSizes = {
    sm: 'sm' as const,
    md: 'md' as const,
    lg: 'lg' as const
  }

  return (
    <div className={`text-center px-4 ${sizeClasses[size]}`}>
      <div className="max-w-md mx-auto">
        {showSpinner && (
          <div className="flex justify-center mb-4">
            <Spinner size={spinnerSizes[size]} className="text-dominos-red" />
          </div>
        )}
        
        <h3 className="dominos-heading-sm text-gray-900 mb-2">
          {message}
        </h3>
        
        {subMessage && (
          <p className="text-gray-600">
            {subMessage}
          </p>
        )}
      </div>
    </div>
  )
}

// Generic Error Fallback
interface ErrorFallbackProps {
  error?: Error
  resetError?: () => void
  title?: string
  message?: string
}

export function ErrorFallback({
  error,
  resetError,
  title = "Something went wrong",
  message = "We encountered an unexpected error. Please try again."
}: ErrorFallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-dominos-red flex items-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            {message}
          </p>
          
          {process.env.NODE_ENV === 'development' && error && (
            <details className="bg-gray-50 p-3 rounded text-sm">
              <summary className="cursor-pointer font-medium text-gray-700 mb-2">
                Error Details (Development)
              </summary>
              <div className="space-y-2">
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                <div>
                  <strong>Stack:</strong>
                  <pre className="mt-1 text-xs bg-white p-2 rounded border overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              </div>
            </details>
          )}

          <div className="flex gap-2">
            {resetError && (
              <Button 
                onClick={resetError}
                variant="dominos-primary"
                size="sm"
                className="flex-1"
              >
                Try Again
              </Button>
            )}
            <Button 
              onClick={() => window.location.reload()}
              variant="dominos-secondary"
              size="sm"
              className="flex-1"
            >
              Reload Page
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default {
  NoResultsState,
  NetworkErrorState,
  LoadingState,
  ErrorFallback
}