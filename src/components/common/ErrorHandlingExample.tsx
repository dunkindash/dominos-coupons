import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ErrorDisplay, InlineError, ErrorToast } from './ErrorDisplay'
import { useEnhancedErrorHandler, useStoreErrorHandler, useCouponErrorHandler } from '@/hooks/useEnhancedErrorHandler'
import { ErrorFactory, ErrorType } from '@/lib/error-factory'
import { BrandedSpinner, LoadingCoupons, SearchingStores } from './BrandedLoadingStates'

// Example component demonstrating the new error handling system
export function ErrorHandlingExample() {
  const [demoType, setDemoType] = useState<string>('')
  const [showToast, setShowToast] = useState(false)
  const storeErrorHandler = useStoreErrorHandler()
  const couponErrorHandler = useCouponErrorHandler()
  const generalErrorHandler = useEnhancedErrorHandler()

  const simulateError = (type: string) => {
    setDemoType(type)
    
    switch (type) {
      case 'network':
        storeErrorHandler.handleError(ErrorFactory.network.createConnectionError())
        break
      case 'rate-limit':
        storeErrorHandler.handleError(ErrorFactory.api.createRateLimitError(Date.now() + 5 * 60 * 1000))
        break
      case 'store-not-found':
        storeErrorHandler.handleError(ErrorFactory.validation.createStoreIdValidationError('12345'))
        break
      case 'no-coupons':
        couponErrorHandler.handleError(ErrorFactory.coupon.createLoadError('12345'))
        break
      case 'email-error':
        generalErrorHandler.handleError(ErrorFactory.email.createSendError('SMTP timeout'))
        break
      case 'validation':
        generalErrorHandler.handleError(ErrorFactory.validation.createEmailValidationError('invalid@', 'Missing domain'))
        break
      case 'toast':
        generalErrorHandler.handleError(ErrorFactory.network.createTimeoutError())
        setShowToast(true)
        break
    }
  }

  const simulateRetry = async () => {
    // Simulate a successful retry after 2 seconds
    await new Promise(resolve => setTimeout(resolve, 2000))
    console.log('Retry successful!')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="text-dominos-red">Error Handling System Demo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-gray-600">
            This demo showcases the new branded error states and user feedback components.
          </p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              onClick={() => simulateError('network')}
              variant="dominos-secondary"
              size="sm"
            >
              Network Error
            </Button>
            <Button
              onClick={() => simulateError('rate-limit')}
              variant="dominos-secondary"
              size="sm"
            >
              Rate Limit
            </Button>
            <Button
              onClick={() => simulateError('store-not-found')}
              variant="dominos-secondary"
              size="sm"
            >
              Store Not Found
            </Button>
            <Button
              onClick={() => simulateError('no-coupons')}
              variant="dominos-secondary"
              size="sm"
            >
              No Coupons
            </Button>
            <Button
              onClick={() => simulateError('email-error')}
              variant="dominos-secondary"
              size="sm"
            >
              Email Error
            </Button>
            <Button
              onClick={() => simulateError('validation')}
              variant="dominos-secondary"
              size="sm"
            >
              Validation Error
            </Button>
            <Button
              onClick={() => simulateError('toast')}
              variant="dominos-secondary"
              size="sm"
            >
              Toast Error
            </Button>
            <Button
              onClick={() => {
                storeErrorHandler.clearError()
                couponErrorHandler.clearError()
                generalErrorHandler.clearError()
                setDemoType('')
                setShowToast(false)
              }}
              variant="outline"
              size="sm"
            >
              Clear All
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Loading States Demo */}
      <Card>
        <CardHeader>
          <CardTitle className="text-dominos-blue">Loading States</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-3 gap-4">
            <div className="text-center">
              <h4 className="font-medium mb-3">Branded Spinner</h4>
              <BrandedSpinner size="lg" />
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-3">Searching Stores</h4>
              <SearchingStores />
            </div>
            <div className="text-center">
              <h4 className="font-medium mb-3">Loading Coupons</h4>
              <LoadingCoupons storeName="Store #12345" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Display Demo */}
      {(storeErrorHandler.error || couponErrorHandler.error || generalErrorHandler.error) && (
        <Card>
          <CardHeader>
            <CardTitle>Error Display ({demoType})</CardTitle>
          </CardHeader>
          <CardContent>
            {storeErrorHandler.error && (
              <ErrorDisplay
                error={storeErrorHandler.error}
                onRetry={() => storeErrorHandler.retryOperation(simulateRetry)}
                onClear={storeErrorHandler.clearError}
                isRetrying={storeErrorHandler.isRetrying}
                canRetry={storeErrorHandler.canRetry}
                context="store"
                showDetails={true}
              />
            )}
            
            {couponErrorHandler.error && (
              <ErrorDisplay
                error={couponErrorHandler.error}
                onRetry={() => couponErrorHandler.retryOperation(simulateRetry)}
                onClear={couponErrorHandler.clearError}
                isRetrying={couponErrorHandler.isRetrying}
                canRetry={couponErrorHandler.canRetry}
                context="coupon"
                showDetails={true}
              />
            )}
            
            {generalErrorHandler.error && !storeErrorHandler.error && !couponErrorHandler.error && (
              <ErrorDisplay
                error={generalErrorHandler.error}
                onRetry={() => generalErrorHandler.retryOperation(simulateRetry)}
                onClear={generalErrorHandler.clearError}
                isRetrying={generalErrorHandler.isRetrying}
                canRetry={generalErrorHandler.canRetry}
                context="general"
                showDetails={true}
              />
            )}
          </CardContent>
        </Card>
      )}

      {/* Inline Error Demo */}
      <Card>
        <CardHeader>
          <CardTitle>Inline Error Example</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-dominos-red"
                placeholder="Enter your email"
              />
              <InlineError error={generalErrorHandler.error?.type === ErrorType.VALIDATION ? generalErrorHandler.error : null} />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Toast Error */}
      {showToast && generalErrorHandler.error && (
        <ErrorToast
          error={generalErrorHandler.error}
          onDismiss={() => setShowToast(false)}
          onRetry={() => generalErrorHandler.retryOperation(simulateRetry)}
        />
      )}
    </div>
  )
}

export default ErrorHandlingExample