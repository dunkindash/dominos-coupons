import { useState, useCallback } from 'react'
import type { StoreInfo, Coupon } from "@/types/dominos"

interface AppState {
  storeId: string
  language: string
  coupons: Coupon[]
  loading: boolean
  error: string
  storeInfo: StoreInfo | null
  expandedCards: Set<string>
  couponViewMode: 'grid' | 'list'
}

export function useAppState() {
  const [storeId, setStoreId] = useState(() => 
    localStorage.getItem('lastStoreId') || ''
  )
  
  const [language, setLanguage] = useState(() => 
    localStorage.getItem('selectedLanguage') || 'en'
  )
  
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  
  const [couponViewMode, setCouponViewMode] = useState<'grid' | 'list'>(() => {
    try {
      return (localStorage.getItem('couponViewMode') as 'grid' | 'list') || 'grid'
    } catch (error) {
      console.warn('Failed to load view mode preference from localStorage:', error)
      return 'grid'
    }
  })

  const updateStoreId = useCallback((newStoreId: string) => {
    setStoreId(newStoreId)
    localStorage.setItem('lastStoreId', newStoreId)
  }, [])

  const updateLanguage = useCallback((newLanguage: string) => {
    setLanguage(newLanguage)
    localStorage.setItem('selectedLanguage', newLanguage)
  }, [])

  const updateViewMode = useCallback((mode: 'grid' | 'list') => {
    setCouponViewMode(mode)
    try {
      localStorage.setItem('couponViewMode', mode)
    } catch (error) {
      console.warn('Failed to save view mode preference to localStorage:', error)
    }
  }, [])

  const toggleCardExpansion = useCallback((cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }, [])

  return {
    // State
    storeId,
    language,
    coupons,
    loading,
    error,
    storeInfo,
    expandedCards,
    couponViewMode,
    
    // Actions
    setStoreId: updateStoreId,
    setLanguage: updateLanguage,
    setCoupons,
    setLoading,
    setError,
    setStoreInfo,
    setExpandedCards,
    setCouponViewMode: updateViewMode,
    toggleCardExpansion
  }
}