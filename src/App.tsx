import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import type { Coupon } from "@/types/dominos"
import PasswordProtection from './components/PasswordProtection'
import StoreFinder from './components/StoreFinder'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem('authToken') !== null
  })
  const [storeId, setStoreId] = useState(() => {
    return localStorage.getItem('lastStoreId') || ''
  })
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('selectedLanguage') || 'en'
  })
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set())
  const [storeInfo, setStoreInfo] = useState<any>(null)
  const [requestCount, setRequestCount] = useState(() => {
    const stored = localStorage.getItem('rateLimit')
    return stored ? JSON.parse(stored).requestCount : 0
  })
  const [firstRequestTime, setFirstRequestTime] = useState<number | null>(() => {
    const stored = localStorage.getItem('rateLimit')
    return stored ? JSON.parse(stored).firstRequestTime : null
  })
  const [, setTick] = useState(0) // Force re-render for timer


  const fetchCoupons = async () => {
    if (!storeId) return
    
    setLoading(true)
    setError('')
    
    try {
      // Use Vercel API in production, local proxy in development
      const apiUrl = import.meta.env.PROD 
        ? `/api/store/${storeId}/menu?lang=${language}`
        : `/api/power/store/${storeId}/menu?lang=${language}`
        
      const authToken = sessionStorage.getItem('authToken')
      const response = await fetch(apiUrl, {
        headers: authToken ? { 'Authorization': `Bearer ${authToken}` } : {}
      })
      
      // Update rate limit info from response headers
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '5')
      const limit = parseInt(response.headers.get('X-RateLimit-Limit') || '5')
      const resetTime = response.headers.get('X-RateLimit-Reset')
      
      const newRequestCount = limit - remaining
      const newFirstRequestTime = resetTime && remaining < limit ? 
        new Date(resetTime).getTime() - (10 * 60 * 1000) : firstRequestTime
      
      setRequestCount(newRequestCount)
      setFirstRequestTime(newFirstRequestTime)
      
      // Store in localStorage for persistence
      localStorage.setItem('rateLimit', JSON.stringify({
        requestCount: newRequestCount,
        firstRequestTime: newFirstRequestTime
      }))
      
      if (response.status === 429) {
        const errorData = await response.json()
        setError(errorData.message || 'Rate limit exceeded')
        return
      }
      
      if (response.status === 401) {
        console.log('Authentication failed, logging out user')
        setError('Session expired. Please refresh the page.')
        setIsAuthenticated(false)
        sessionStorage.removeItem('authToken')
        return
      }
      
      if (!response.ok) {
        throw new Error('Failed to fetch menu data')
      }
      
      const data = await response.json()
      
      // Rate limit info is now handled above from response headers
      
      // Extract store information
      setStoreInfo({
        storeId: data.StoreID,
        businessDate: data.BusinessDate,
        market: data.Market,
        storeAsOfTime: data.StoreAsOfTime,
        status: data.Status
      })
      
      // Extract coupons from the structured response
      const couponsData = data.Coupons || data.coupons || data.Coupon || { Columns: [], Data: [] }
      
      if (couponsData.Columns && couponsData.Data) {
        // Convert the columnar data to coupon objects
        const coupons = couponsData.Data.map((row: any[]) => {
          const coupon: any = {}
          couponsData.Columns.forEach((column: string, index: number) => {
            coupon[column] = row[index]
          })
          
          // Parse expiration date and virtual code from Tags field
          if (coupon.Tags && typeof coupon.Tags === 'string') {
            const expiresMatch = coupon.Tags.match(/ExpiresOn=(\d{4}-\d{2}-\d{2})/)
            if (expiresMatch) {
              coupon.ExpirationDate = expiresMatch[1]
            }
            
            const virtualCodeMatch = coupon.Tags.match(/VirtualCode=([^,]+)/)
            if (virtualCodeMatch) {
              coupon.VirtualCode = virtualCodeMatch[1]
            }
          }
          
          return coupon
        })
        setCoupons(coupons)
      } else {
        setCoupons([])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchCoupons()
  }

  // Note: Rate limit checking is now integrated into fetchCoupons to avoid duplicate API calls

  const toggleCardExpansion = (cardId: string) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev)
      if (newSet.has(cardId)) {
        newSet.delete(cardId)
      } else {
        newSet.add(cardId)
      }
      return newSet
    })
  }

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (firstRequestTime) {
        const elapsed = Date.now() - firstRequestTime
        if (elapsed >= 10 * 60 * 1000) {
          // Reset after 10 minutes
          setRequestCount(0)
          setFirstRequestTime(null)
          localStorage.removeItem('rateLimit')
        } else {
          // Force re-render to update timer
          setTick(prev => prev + 1)
        }
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [firstRequestTime])

  if (!isAuthenticated) {
    return <PasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />
  }

  return (
    <div className="min-h-screen bg-blue-600 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-blue-100 mb-2">
            Domino's Coupons Finder
          </h1>
          <p className="text-blue-100">
            Find the best deals at your local Domino's store
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6 mb-8">
          <Card className="flex-1 max-w-sm mx-auto lg:mx-0 shadow-lg border-0">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg font-semibold">Store Search</CardTitle>
              <p className="text-sm text-gray-600">Enter store number directly</p>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Language</label>
                    <select
                      value={language}
                      onChange={(e) => {
                        setLanguage(e.target.value)
                        localStorage.setItem('selectedLanguage', e.target.value)
                      }}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="en">English</option>
                      <option value="es">Español</option>
                    </select>
                  </div>
                  <Input
                    type="text"
                    placeholder="Enter store number (e.g., 7046)"
                    value={storeId}
                    onChange={(e) => {
                      setStoreId(e.target.value)
                      localStorage.setItem('lastStoreId', e.target.value)
                    }}
                    className="w-full transition-all duration-200 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="space-y-1">
                    <p className="text-xs text-gray-500">
                      Rate limit: 5 searches per 10 minutes • {5 - requestCount} remaining
                    </p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          requestCount >= 5 ? 'bg-red-500' : requestCount >= 3 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${(requestCount / 5) * 100}%` }}
                      />
                    </div>
                    {firstRequestTime && requestCount > 0 && (
                      <p className="text-xs text-gray-400">
                        Resets in {Math.max(0, Math.ceil((10 * 60 * 1000 - (Date.now() - firstRequestTime)) / 1000 / 60))} minutes
                      </p>
                    )}
                  </div>
                </div>
                <Button 
                  type="submit" 
                  disabled={loading || !storeId} 
                  className="w-full !bg-red-600 hover:!bg-red-700 !text-white !border-0 transition-all duration-200 font-medium shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {loading ? 'Loading...' : 'Find Coupons'}
                </Button>
              </form>
              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}
            </CardContent>
          </Card>

          <StoreFinder 
            onStoreSelect={(selectedStoreId) => {
              setStoreId(selectedStoreId)
              localStorage.setItem('lastStoreId', selectedStoreId)
            }}
            onRateLimitUpdate={(newRequestCount, newFirstRequestTime) => {
              setRequestCount(newRequestCount)
              setFirstRequestTime(newFirstRequestTime)
              
              // Store in localStorage for persistence
              localStorage.setItem('rateLimit', JSON.stringify({
                requestCount: newRequestCount,
                firstRequestTime: newFirstRequestTime
              }))
            }}
          />

          {storeInfo && (
            <Card className="flex-1 max-w-sm mx-auto lg:mx-0 shadow-lg border-0">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold">Store Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Store ID:</span>
                    <span className="font-semibold">{storeInfo.storeId}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Market:</span>
                    <span className="font-semibold">{storeInfo.market}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-100">
                    <span className="font-medium text-gray-600">Business Date:</span>
                    <span className="font-semibold">{storeInfo.businessDate}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="font-medium text-gray-600">Status:</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      storeInfo.status === 0 ? 'bg-blue-100 text-blue-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {storeInfo.status === 0 ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {coupons.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {coupons.map((coupon, index) => {
              const cardId = coupon.Code || coupon.ID || index.toString()
              const isExpanded = expandedCards.has(cardId)
              
              return (
                <Card key={cardId} className="hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full shadow-lg border-0">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start gap-4">
                      <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-2 font-bold">
                          {coupon.Name || 'Special Offer'}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                          <CardDescription className="text-sm bg-gray-100 px-2 py-1 rounded-md inline-block">
                            Code: {coupon.Code}
                          </CardDescription>
                          {coupon.VirtualCode && (
                            <CardDescription className="text-sm bg-blue-100 px-2 py-1 rounded-md inline-block">
                              Online: {coupon.VirtualCode}
                            </CardDescription>
                          )}
                        </div>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                          ${coupon.Price || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 font-medium">
                          {coupon.ExpirationDate ? (
                            `Expires: ${new Date(coupon.ExpirationDate).toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric', 
                              year: 'numeric' 
                            })}`
                          ) : (
                            'Expiration: Unknown'
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col flex-grow">
                    <div className="flex-grow">
                      <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                        {coupon.Description}
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mb-4">
                        {coupon.Local === 'true' && (
                          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium shadow-sm">
                            Local Offer
                          </span>
                        )}
                        {coupon.Bundle === 'true' && (
                          <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium shadow-sm">
                            Bundle Deal
                          </span>
                        )}
                      </div>

                      {coupon.PriceInfo && (
                        <div className="text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded-md">
                          {coupon.PriceInfo}
                        </div>
                      )}

                      <div className="flex justify-between items-center text-xs text-gray-500 mb-4 p-2 bg-gray-50 rounded-md">
                        <span className="font-medium">Sort: {coupon.SortSeq}</span>
                        {coupon.GroupCodes && (
                          <span className="font-medium">Groups: {coupon.GroupCodes}</span>
                        )}
                      </div>
                    </div>

                    <div className="mt-auto">
                      <Button
                        size="sm"
                        onClick={() => toggleCardExpansion(cardId)}
                        className="w-full text-xs !bg-blue-600 hover:!bg-blue-700 !text-white transition-all duration-200 shadow-md hover:shadow-lg"
                      >
                        {isExpanded ? 'Hide Details' : 'Show All Details'}
                      </Button>

                      {isExpanded && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                          <h4 className="font-semibold text-sm mb-3 text-gray-800">All Fields:</h4>
                          <div className="grid grid-cols-1 gap-2 text-xs max-h-48 overflow-y-auto">
                            {Object.entries(coupon)
                              .filter(([_, value]) => value !== null && value !== undefined && value !== '')
                              .map(([key, value]) => (
                                <div key={key} className="flex flex-col gap-1 p-2 bg-white rounded border border-gray-100">
                                  <span className="font-medium text-gray-600">{key}:</span>
                                  <span className="text-gray-800 break-all text-left pl-2">
                                    {String(value)}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {coupons.length === 0 && storeId && !loading && !error && (
          <div className="text-center py-12">
            <p className="text-gray-500">No coupons found for this store.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default App
