import { useState, useCallback, useEffect } from 'react'
import type { Coupon, StoreInfo } from '@/types/dominos'

interface AppState {
  isAuthenticated: boolean
  storeId: string
  language: string
  coupons: Coupon[]
  loading: boolean
  error: string
  expandedCards: Set<string>
  storeInfo: StoreInfo | null
  isEmailModalOpen: boolean
}

interface RateLimitState {
  requestCount: number
  firstRequestTime: number | null
}

const INITIAL_APP_STATE: AppState = {
  isAuthenticated: false,
  storeId: '',
  language: 'en',
  coupons: [],
  loading: false,
  error: '',
  expandedCards: new Set(),
  storeInfo: null,
  isEmailModalOpen: false
}

const INITIAL_RATE_LIMIT_STATE: RateLimitState = {
  requestCount: 0,
  firstRequestTime: null
}

export function useAppState() {
  // Initialize state from localStorage where appropriate
  const [state, setState] = useState<AppState>(() => ({
    ...INITIAL_APP_STATE,
    isAuthenticated: sessionStorage.getItem('authToken') !== null,
    storeId: localStorage.getItem('lastStoreId') || '',
    language: localStorage.getItem('selectedLanguage') || 'en'
  }))

  const [rateLimitState, setRateLimitState] = useState<RateLimitState>(() => {
    const stored = localStorage.getItem('rateLimit')
    return stored ? JSON.parse(stored) : INITIAL_RATE_LIMIT_STATE
  })

  // Timer state for rate limit updates
  const [, setTick] = useState(0)

  // Authentication actions
  const setAuthenticated = useCallback((authenticated: boolean) => {
    setState(prev => ({ ...prev, isAuthenticated: authenticated }))
    if (!authenticated) {
      sessionStorage.removeItem('authToken')
    }
  }, [])

  // Store actions
  const setStoreId = useCallback((storeId: string) => {
    setState(prev => ({ ...prev, storeId }))
    localStorage.setItem('lastStoreId', storeId)
  }, [])

  const setLanguage = useCallback((language: string) => {
    setState(prev => ({ ...prev, language }))
    localStorage.setItem('selectedLanguage', language)
  }, [])

  // Coupon actions
  const setCoupons = useCallback((coupons: Coupon[]) => {
    setState(prev => ({ ...prev, coupons }))
  }, [])

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, loading }))
  }, [])

  const setError = useCallback((error: string) => {
    setState(prev => ({ ...prev, error }))
  }, [])

  // Store info actions
  const setStoreInfo = useCallback((storeInfo: StoreInfo | null) => {
    setState(prev => ({ ...prev, storeInfo }))
  }, [])

  // Card expansion actions
  const toggleCardExpansion = useCallback((cardId: string) => {
    setState(prev => {
      const newExpandedCards = new Set(prev.expandedCards)
      if (newExpandedCards.has(cardId)) {
        newExpandedCards.delete(cardId)
      } else {
        newExpandedCards.add(cardId)
      }
      return { ...prev, expandedCards: newExpandedCards }
    })
  }, [])

  // Email modal actions
  const setEmailModalOpen = useCallback((isOpen: boolean) => {
    setState(prev => ({ ...prev, isEmailModalOpen: isOpen }))
  }, [])

  // Rate limit actions
  const updateRateLimit = useCallback((requestCount: number, firstRequestTime: number | null) => {
    const newState = { requestCount, firstRequestTime }
    setRateLimitState(newState)
    
    // Persist to localStorage
    localStorage.setItem('rateLimit', JSON.stringify(newState))
  }, [])

  const resetRateLimit = useCallback(() => {
    setRateLimitState(INITIAL_RATE_LIMIT_STATE)
    localStorage.removeItem('rateLimit')
  }, [])

  // Rate limit timer effect
  useEffect(() => {
    const interval = setInterval(() => {
      if (rateLimitState.firstRequestTime) {
        const elapsed = Date.now() - rateLimitState.firstRequestTime
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
  }, [rateLimitState.firstRequestTime, resetRateLimit])

  // Computed values
  const remainingRequests = Math.max(0, 5 - rateLimitState.requestCount)
  const resetMinutes = rateLimitState.firstRequestTime && rateLimitState.requestCount > 0
    ? Math.max(0, Math.ceil((10 * 60 * 1000 - (Date.now() - rateLimitState.firstRequestTime)) / 1000 / 60))
    : 0

  return {
    // State
    ...state,
    rateLimitState,
    remainingRequests,
    resetMinutes,

    // Actions
    setAuthenticated,
    setStoreId,
    setLanguage,
    setCoupons,
    setLoading,
    setError,
    setStoreInfo,
    toggleCardExpansion,
    setEmailModalOpen,
    updateRateLimit,
    resetRateLimit
  }
}

export default useAppState