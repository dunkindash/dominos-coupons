import type { ReactNode } from 'react'
import { ErrorBoundary } from '@/components/common/ErrorBoundary'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface EmailErrorBoundaryProps {
  children: ReactNode
  onReset?: () => void
}

function EmailErrorFallback({ onReset }: { onReset?: () => void }) {
  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="text-red-600 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          Email Feature Error
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600">
          There was a problem with the email feature. You can still browse and view coupons normally.
        </p>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <h4 className="font-medium text-blue-800 mb-1">What you can do:</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Take a screenshot of the coupons you want</li>
            <li>• Copy the coupon codes manually</li>
            <li>• Try refreshing the page</li>
          </ul>
        </div>

        <div className="flex gap-2">
          {onReset && (
            <Button 
              onClick={onReset}
              variant="outline"
              size="sm"
              className="flex-1"
            >
              Try Email Again
            </Button>
          )}
          <Button 
            onClick={() => window.location.reload()}
            variant="destructive"
            size="sm"
            className="flex-1"
          >
            Refresh Page
          </Button>
        </div>
      </CardContent>
    </Card>
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