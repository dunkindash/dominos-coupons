import type { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { BrandedErrorDisplay } from '@/components/common/BrandedErrorDisplay'
import { ErrorFactory } from '@/lib/error-factory'

interface EmailErrorBoundaryProps {
  children: ReactNode
  onReset?: () => void
}

function EmailErrorFallback({ onReset }: { onReset?: () => void }) {
  const emailError = ErrorFactory.email.createServiceUnavailableError()
  
  // Add email-specific suggestions
  emailError.suggestions = [
    'Take a screenshot of the coupons you want',
    'Copy the coupon codes manually',
    'Try refreshing the page'
  ]

  return (
    <BrandedErrorDisplay
      error={emailError}
      onRetry={onReset}
      canRetry={!!onReset}
      showDetails={false}
    />
  )
}

export function EmailErrorBoundary({ children, onReset }: EmailErrorBoundaryProps) {
  return (
    <ErrorBoundary
      fallback={<EmailErrorFallback onReset={onReset} />}
      onError={(error, errorInfo) => {
        // Log email-specific errors
        console.error('Email feature error:', error, errorInfo)
        
        // In production, send to monitoring service with email context
        if (process.env.NODE_ENV === 'production') {
          // Example: analytics.track('Email Error', { error: error.message })
        }
      }}
      resetOnPropsChange={true}
    >
      {children}
    </ErrorBoundary>
  )
}

export default EmailErrorBoundary