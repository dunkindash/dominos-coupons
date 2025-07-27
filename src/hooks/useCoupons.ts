import { useState, useCallback } from 'react'
import type { Coupon, StoreInfo } from '@/types/dominos'

interface UseCouponsReturn {
  coupons: Coupon[]
  loading: boolean
  error: string
  storeInfo: StoreInfo | null
  fetchCoupons: (storeId: string, language: string) => Promise<void>
}

export function useCoupons(): UseCouponsReturn {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)

  const fetchCoupons = useCallback(async (storeId: string, language: string) => {
    if (!storeId) return
    
    setLoading(true)
    setError('')
    
    try {
      const apiUrl = import.meta.env.PROD 
        ? `/api/store/${storeId}/menu?lang=${language}`
        : `/api/power/store/${storeId}/menu?lang=${language}`
        
      const authToken = sessionStorage.getItem('authToken')
      const response = await fetch(apiUrl, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      })
      
      if (response.status === 429) {
        const errorData = await response.json()
        setError(errorData.message || 'Rate limit exceeded')
        return
      }
      
      if (response.status === 401) {
        setError('Session expired. Please refresh the page.')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu data')
      }
      
      const data = await response.json()
      
      // Extract store information
      setStoreInfo({
        StoreID: data.StoreID,
        BusinessDate: data.BusinessDate,
        MarketName: data.Market,
        AddressDescription: data.AddressDescription,
        Phone: data.Phone,
        IsOpen: data.IsOpen,
        IsOnlineCapable: data.IsOnlineCapable,
        IsDeliveryStore: data.IsDeliveryStore
      })
      
      // Process coupons data
      const couponsData = data.Coupons || data.coupons || data.Coupon || { Columns: [], Data: [] }
      
      if (couponsData.Columns && couponsData.Data) {
        const processedCoupons = couponsData.Data.map((row: unknown[]) => {
          const coupon: Record<string, unknown> = {}
          couponsData.Columns.forEach((column: string, index: number) => {
            coupon[column] = row[index]
          })
          return coupon
        })
        setCoupons(processedCoupons)
      } else {
        setCoupons([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    coupons,
    loading,
    error,
    storeInfo,
    fetchCoupons
  }
}