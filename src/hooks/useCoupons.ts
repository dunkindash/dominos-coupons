/**
 * src/hooks/useCoupons.ts
 * 
 * Custom React Hook for Coupon Data Management
 * 
 * Requirements:
 * - React 19+
 * - TypeScript 5.0+
 * 
 * Dependencies:
 * - react: useState and useCallback for state management and memoization
 * - @/services/api: API service layer with error handling (apiService, ApiError)
 * - @/types/dominos: TypeScript type definitions (Coupon, StoreInfo)
 * - @/lib/coupon-processor: Coupon data processing utilities (processCoupons)
 * 
 * Features:
 * - Centralized coupon data fetching and state management
 * - Rate limiting integration with callback support
 * - Comprehensive error handling with authentication flow
 * - Store information management alongside coupon data
 * - Loading state management for UI feedback
 * - Memoized callbacks for performance optimization
 * - Session storage integration for authentication tokens
 */

import { useState, useCallback } from 'react'
import { apiService, ApiError } from '@/services/api'
import type { Coupon, StoreInfo } from '@/types/dominos'
import { processCoupons } from '@/lib/coupon-processor'

interface UseCouponsReturn {
  coupons: Coupon[]
  storeInfo: StoreInfo | null
  loading: boolean
  error: string
  fetchCoupons: (storeId: string, language: string) => Promise<void>
  clearError: () => void
}

export function useCoupons(
  onRateLimitUpdate?: (count: number, resetTime: number | null) => void
): UseCouponsReturn {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const fetchCoupons = useCallback(async (storeId: string, language: string) => {
    if (!storeId) return
    
    setLoading(true)
    setError('')
    
    try {
      const response = await apiService.fetchCoupons(storeId, language)
      
      // Update rate limit info
      const newRequestCount = response.rateLimit.limit - response.rateLimit.remaining
      const newFirstRequestTime = response.rateLimit.resetTime && response.rateLimit.remaining < response.rateLimit.limit ? 
        new Date(response.rateLimit.resetTime).getTime() - (10 * 60 * 1000) : null
      
      onRateLimitUpdate?.(newRequestCount, newFirstRequestTime)
      
      // Set store info
      setStoreInfo(response.storeInfo)
      
      // Process and set coupons
      const processedCoupons = processCoupons(response.coupons)
      setCoupons(processedCoupons)
      
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message)
        
        // Handle authentication errors
        if (err.status === 401) {
          sessionStorage.removeItem('authToken')
          // Could trigger a re-authentication flow here
        }
      } else {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred')
      }
    } finally {
      setLoading(false)
    }
  }, [onRateLimitUpdate])

  const clearError = useCallback(() => {
    setError('')
  }, [])

  return {
    coupons,
    storeInfo,
    loading,
    error,
    fetchCoupons,
    clearError
  }
}
