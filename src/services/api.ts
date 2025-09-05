/**
 * src/services/api.ts
 * 
 * API service layer for Domino's Coupons application
 * Requirements: TypeScript 5.0+, Fetch API
 * Dependencies: @/types/dominos, @/lib/coupon-processor
 */

import type { StoreInfo, Coupon } from "@/types/dominos"
import { parseCouponData } from "@/lib/coupon-processor"

interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

interface FetchCouponsResponse {
  coupons: Coupon[]
  storeInfo: StoreInfo
  rateLimit: {
    remaining: number
    limit: number
    resetTime: string | null
  }
}

class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public code?: string
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

class ApiService {
  private baseUrl: string

  constructor() {
    // Use Vercel API in production, local proxy in development
    this.baseUrl = import.meta.env.PROD ? '/api' : '/api'
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const authToken = sessionStorage.getItem('authToken')
    
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(authToken && { 'Authorization': `Bearer ${authToken}` }),
        ...options.headers,
      },
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorData.code
      )
    }

    return response.json()
  }

  async fetchCoupons(
    storeId: string,
    language: string = 'en'
  ): Promise<FetchCouponsResponse> {
    try {
      const endpoint = import.meta.env.PROD 
        ? `/store/${storeId}/menu?lang=${language}`
        : `/power/store/${storeId}/menu?lang=${language}`

      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          ...(sessionStorage.getItem('authToken') && {
            'Authorization': `Bearer ${sessionStorage.getItem('authToken')}`
          })
        }
      })

      // Extract rate limit info from response headers
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '5')
      const limit = parseInt(response.headers.get('X-RateLimit-Limit') || '5')
      const resetTime = response.headers.get('X-RateLimit-Reset')

      if (response.status === 429) {
        const errorData = await response.json()
        throw new ApiError(
          errorData.message || 'Rate limit exceeded',
          429,
          'RATE_LIMIT_EXCEEDED'
        )
      }

      if (response.status === 401) {
        throw new ApiError(
          'Session expired. Please refresh the page.',
          401,
          'UNAUTHORIZED'
        )
      }

      if (!response.ok) {
        throw new ApiError(
          'Failed to fetch menu data',
          response.status
        )
      }

      const data = await response.json()

      // Extract store information
      const storeInfo: StoreInfo = {
        StoreID: data.StoreID,
        businessDate: data.BusinessDate,
        market: data.Market,
        storeAsOfTime: data.StoreAsOfTime,
        status: data.Status,
        languageCode: data.LanguageCode
      }

      // Parse coupons
      const coupons = parseCouponData(data)

      return {
        coupons,
        storeInfo,
        rateLimit: {
          remaining,
          limit,
          resetTime
        }
      }
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        error instanceof Error ? error.message : 'An unexpected error occurred',
        500
      )
    }
  }

  async searchStores(query: string): Promise<StoreInfo[]> {
    try {
      const response = await this.makeRequest<{ stores: StoreInfo[] }>(
        `/stores/nearby?q=${encodeURIComponent(query)}`
      )
      return response.stores
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        'Failed to search stores',
        500
      )
    }
  }

  async authenticate(password: string): Promise<{ token: string }> {
    try {
      const response = await this.makeRequest<{ token: string }>('/auth', {
        method: 'POST',
        body: JSON.stringify({ password })
      })
      return response
    } catch (error) {
      if (error instanceof ApiError) {
        throw error
      }
      throw new ApiError(
        'Authentication failed',
        401
      )
    }
  }
}

export const apiService = new ApiService()
export { ApiError }
export type { ApiResponse, FetchCouponsResponse }
