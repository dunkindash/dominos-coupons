import { useState, useEffect, useCallback } from 'react'

export function useRateLimit() {
  const [requestCount, setRequestCount] = useState(() => {
    try {
      const stored = localStorage.getItem('rateLimit')
      return stored ? JSON.parse(stored).requestCount : 0
    } catch {
      return 0
    }
  })
  
  const [firstRequestTime, setFirstRequestTime] = useState<number | null>(() => {
    try {
      const stored = localStorage.getItem('rateLimit')
      return stored ? JSON.parse(stored).firstRequestTime : null
    } catch {
      return null
    }
  })

  const [, setTick] = useState(0) // Force re-render for timer

  const updateRateLimit = useCallback((newRequestCount: number, newFirstRequestTime: number | null) => {
    setRequestCount(newRequestCount)
    setFirstRequestTime(newFirstRequestTime)
    
    try {
      localStorage.setItem('rateLimit', JSON.stringify({
        requestCount: newRequestCount,
        firstRequestTime: newFirstRequestTime
      }))
    } catch (error) {
      console.warn('Failed to save rate limit to localStorage:', error)
    }
  }, [])

  const resetRateLimit = useCallback(() => {
    setRequestCount(0)
    setFirstRequestTime(null)
    try {
      localStorage.removeItem('rateLimit')
    } catch (error) {
      console.warn('Failed to remove rate limit from localStorage:', error)
    }
  }, [])

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (firstRequestTime) {
        const elapsed = Date.now() - firstRequestTime
        if (elapsed >= 10 * 60 * 1000) {
          // Reset after 10 minutes
          resetRateLimit()
        } else {
          // Force re-render to update timer
          setTick(prev => prev + 1)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [firstRequestTime, resetRateLimit])

  const getRemainingTime = useCallback(() => {
    if (!firstRequestTime) return 0
    const elapsed = Date.now() - firstRequestTime
    const remaining = Math.max(0, (10 * 60 * 1000) - elapsed)
    return Math.ceil(remaining / 1000)
  }, [firstRequestTime])

  return {
    requestCount,
    firstRequestTime,
    updateRateLimit,
    resetRateLimit,
    getRemainingTime
  }
}