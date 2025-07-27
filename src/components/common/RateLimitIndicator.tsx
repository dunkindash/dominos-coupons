import { useMemo, memo } from 'react'

interface RateLimitIndicatorProps {
  requestCount: number
  maxRequests: number
  firstRequestTime: number | null
  windowMinutes?: number
}

export const RateLimitIndicator = memo(function RateLimitIndicator({
  requestCount,
  maxRequests,
  firstRequestTime,
  windowMinutes = 10
}: RateLimitIndicatorProps) {
  const { remaining, resetMinutes, progressPercentage, statusColor } = useMemo(() => {
    const remaining = Math.max(0, maxRequests - requestCount)
    const resetMinutes = firstRequestTime && requestCount > 0 
      ? Math.max(0, Math.ceil((windowMinutes * 60 * 1000 - (Date.now() - firstRequestTime)) / 1000 / 60))
      : 0
    
    const progressPercentage = (requestCount / maxRequests) * 100
    
    const statusColor = requestCount >= maxRequests 
      ? 'bg-red-500' 
      : requestCount >= maxRequests * 0.6 
        ? 'bg-yellow-500' 
        : 'bg-green-500'

    return { remaining, resetMinutes, progressPercentage, statusColor }
  }, [requestCount, maxRequests, firstRequestTime, windowMinutes])

  return (
    <div className="space-y-1">
      <p className="text-xs text-gray-500">
        Rate limit: {maxRequests} searches per {windowMinutes} minutes • {remaining} remaining
      </p>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div 
          className={`h-2 rounded-full transition-all duration-300 ${statusColor}`}
          style={{ width: `${progressPercentage}%` }}
          role="progressbar"
          aria-valuenow={requestCount}
          aria-valuemin={0}
          aria-valuemax={maxRequests}
          aria-label={`${requestCount} of ${maxRequests} requests used`}
        />
      </div>
      
      {firstRequestTime && requestCount > 0 && resetMinutes > 0 && (
        <p className="text-xs text-gray-400">
          Resets in {resetMinutes} minute{resetMinutes !== 1 ? 's' : ''}
        </p>
      )}
      
      {requestCount >= maxRequests && (
        <p className="text-xs text-red-600 font-medium">
          Rate limit reached. Please wait before making more requests.
        </p>
      )}
    </div>
  )
})

export default RateLimitIndicator