import { Card, CardContent } from '@/components/ui/card'

// Enhanced loading spinner with Domino's branding
interface BrandedSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'red' | 'blue' | 'gray'
  className?: string
}

export function BrandedSpinner({ 
  size = 'md', 
  color = 'red',
  className = '' 
}: BrandedSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-[3px]',
    xl: 'w-12 h-12 border-[3px]'
  }

  const colorClasses = {
    red: 'border-dominos-red/20 border-t-dominos-red',
    blue: 'border-dominos-blue/20 border-t-dominos-blue',
    gray: 'border-gray-300 border-t-gray-600'
  }

  return (
    <div
      className={`animate-spin rounded-full ${sizeClasses[size]} ${colorClasses[color]} ${className}`}
      role="status"
      aria-label="Loading"
    >
      <span className="sr-only">Loading...</span>
    </div>
  )
}

// Pulsing dots animation
interface PulsingDotsProps {
  color?: 'red' | 'blue' | 'gray'
  size?: 'sm' | 'md' | 'lg'
}

export function PulsingDots({ color = 'red', size = 'md' }: PulsingDotsProps) {
  const sizeClasses = {
    sm: 'w-1.5 h-1.5',
    md: 'w-2 h-2',
    lg: 'w-3 h-3'
  }

  const colorClasses = {
    red: 'bg-dominos-red',
    blue: 'bg-dominos-blue',
    gray: 'bg-gray-400'
  }

  return (
    <div className="flex items-center gap-1">
      {[0, 1, 2].map((index) => (
        <div
          key={index}
          className={`rounded-full ${sizeClasses[size]} ${colorClasses[color]} animate-pulse`}
          style={{
            animationDelay: `${index * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )
}

// Skeleton loading for cards
interface SkeletonCardProps {
  lines?: number
  showImage?: boolean
  className?: string
}

export function SkeletonCard({ 
  lines = 3, 
  showImage = false,
  className = '' 
}: SkeletonCardProps) {
  return (
    <Card className={`animate-pulse ${className}`}>
      <CardContent className="p-4 space-y-3">
        {showImage && (
          <div className="w-full h-32 bg-gray-200 rounded-md" />
        )}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          {Array.from({ length: lines }).map((_, index) => (
            <div
              key={index}
              className={`h-3 bg-gray-200 rounded ${
                index === lines - 1 ? 'w-1/2' : 'w-full'
              }`}
            />
          ))}
        </div>
        <div className="flex gap-2 pt-2">
          <div className="h-8 bg-gray-200 rounded w-20" />
          <div className="h-8 bg-gray-200 rounded w-16" />
        </div>
      </CardContent>
    </Card>
  )
}

// Loading overlay for existing content
interface LoadingOverlayProps {
  isLoading: boolean
  message?: string
  children: React.ReactNode
  blur?: boolean
}

export function LoadingOverlay({ 
  isLoading, 
  message = "Loading...", 
  children,
  blur = true 
}: LoadingOverlayProps) {
  return (
    <div className="relative">
      <div className={isLoading && blur ? 'blur-sm pointer-events-none' : ''}>
        {children}
      </div>
      
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
          <div className="text-center">
            <BrandedSpinner size="lg" className="mb-3" />
            <p className="text-sm font-medium text-gray-700">
              {message}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// Specific loading states for different contexts
export function SearchingStores() {
  return (
    <div className="text-center py-8">
      <BrandedSpinner size="lg" className="mb-4" />
      <h3 className="dominos-heading-sm mb-2">
        Searching for stores...
      </h3>
      <p className="text-gray-600">
        Finding the best Domino's locations near you
      </p>
    </div>
  )
}

export function LoadingCoupons({ storeName }: { storeName?: string }) {
  return (
    <div className="text-center py-8">
      <BrandedSpinner size="lg" className="mb-4" />
      <h3 className="dominos-heading-sm mb-2">
        Loading coupons...
      </h3>
      <p className="text-gray-600">
        {storeName 
          ? `Getting the latest deals from ${storeName}`
          : 'Getting the latest deals for you'
        }
      </p>
    </div>
  )
}

export function SendingEmail() {
  return (
    <div className="text-center py-6">
      <BrandedSpinner size="md" color="blue" className="mb-3" />
      <h4 className="font-medium text-dominos-blue mb-1">
        Sending email...
      </h4>
      <p className="text-sm text-gray-600">
        Your coupons are on their way
      </p>
    </div>
  )
}

export function ProcessingRequest() {
  return (
    <div className="flex items-center gap-3 py-4">
      <BrandedSpinner size="sm" />
      <span className="text-sm text-gray-600">Processing your request...</span>
    </div>
  )
}

// Button loading state
interface LoadingButtonContentProps {
  isLoading: boolean
  loadingText?: string
  children: React.ReactNode
  spinnerColor?: 'red' | 'blue' | 'gray'
}

export function LoadingButtonContent({
  isLoading,
  loadingText,
  children,
  spinnerColor = 'gray'
}: LoadingButtonContentProps) {
  if (isLoading) {
    return (
      <>
        <BrandedSpinner size="sm" color={spinnerColor} />
        {loadingText || 'Loading...'}
      </>
    )
  }
  
  return <>{children}</>
}

// Progress indicator for multi-step processes
interface ProgressIndicatorProps {
  steps: string[]
  currentStep: number
  completedSteps?: number[]
}

export function ProgressIndicator({ 
  steps, 
  currentStep, 
  completedSteps = [] 
}: ProgressIndicatorProps) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => {
        const isCompleted = completedSteps.includes(index)
        const isCurrent = index === currentStep
        // const isPending = index > currentStep && !isCompleted
        
        return (
          <div key={index} className="flex items-center gap-3">
            <div className={`
              w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium
              ${isCompleted 
                ? 'bg-green-500 text-white' 
                : isCurrent 
                  ? 'bg-dominos-red text-white' 
                  : 'bg-gray-200 text-gray-500'
              }
            `}>
              {isCompleted ? (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                index + 1
              )}
            </div>
            
            <div className="flex-1">
              <p className={`text-sm font-medium ${
                isCompleted 
                  ? 'text-green-700' 
                  : isCurrent 
                    ? 'text-dominos-red' 
                    : 'text-gray-500'
              }`}>
                {step}
              </p>
            </div>
            
            {isCurrent && (
              <BrandedSpinner size="sm" />
            )}
          </div>
        )
      })}
    </div>
  )
}

export default {
  BrandedSpinner,
  PulsingDots,
  SkeletonCard,
  LoadingOverlay,
  SearchingStores,
  LoadingCoupons,
  SendingEmail,
  ProcessingRequest,
  LoadingButtonContent,
  ProgressIndicator
}