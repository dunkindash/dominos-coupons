import { useState, useEffect, lazy, Suspense, useMemo, useCallback } from 'react'
import type { StoreInfo } from "@/types/dominos"

import type { Coupon } from "@/types/dominos"
import PasswordProtection from './components/PasswordProtection'
import UnifiedSearch from './components/UnifiedSearch'
import EmailCouponsButton from './components/EmailCouponsButton'
import EnhancedHeader from './components/layout/EnhancedHeader'

import StoreInfoCard from './components/store/StoreInfoCard'
import CouponDisplay from './components/coupon/CouponDisplay'
import ErrorBoundary from './components/common/ErrorBoundary'
import EmailErrorBoundary from './components/email/EmailErrorBoundary'

// Lazy load the email modal for better performance
const EmailModal = lazy(() => import('./components/EmailModal'))

// Helper function to extract menu item hints from coupon descriptions
const extractMenuItemHints = (description: string): string[] => {
  const hints: string[] = []
  const lowerDesc = description.toLowerCase()
  
  // Common menu item keywords (order matters - more specific first)
  const menuItems = [
    'large pizza', 'medium pizza', 'small pizza',
    'specialty pizza', 'cheese pizza', 'pepperoni pizza',
    'hand tossed', 'thin crust', 'pan pizza',
    'boneless wings', 'traditional wings',
    'cheesy bread', 'bread',
    'pizza', 'wings', 'pasta', 'sandwich', 'sandwiches',
    'breadsticks', 'soda', 'drink', 'beverages',
    'dessert', 'cookie', 'brownies', 'salad', 'sides',
    'supreme', 'pepperoni', 'chicken', 'beef', 'italian sausage',
    'delivery', 'carryout', 'pickup', 'topping', 'toppings'
  ]
  
  menuItems.forEach(item => {
    if (lowerDesc.includes(item)) {
      hints.push(item)
    }
  })
  
  // Extract specific pricing mentions
  const priceMatches = description.match(/\$\d+\.?\d*/g)
  if (priceMatches) {
    hints.push(...priceMatches.map(price => `Price: ${price}`))
  }
  
  // Extract quantity mentions
  const quantityMatches = description.match(/\b(\d+)\s*(piece|pc|order|item)/gi)
  if (quantityMatches) {
    hints.push(...quantityMatches.map(qty => `Quantity: ${qty}`))
  }
  
  // Detect time-sensitive language
  const timeSensitiveTerms = [
    'today only', 'limited time', 'ends tonight', 'ends at midnight',
    'ends today', 'while supplies last', 'limited offer',
    'ends soon', 'expires today', 'flash sale', 'hourly special',
    'lunch special', 'dinner special', 'happy hour'
  ]
  
  timeSensitiveTerms.forEach(term => {
    if (lowerDesc.includes(term)) {
      hints.push(`⏰ ${term}`)
    }
  })
  
  return [...new Set(hints)] // Remove duplicates
}

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
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null)
  const [requestCount, setRequestCount] = useState(() => {
    const stored = localStorage.getItem('rateLimit')
    return stored ? JSON.parse(stored).requestCount : 0
  })
  const [firstRequestTime, setFirstRequestTime] = useState<number | null>(() => {
    const stored = localStorage.getItem('rateLimit')
    return stored ? JSON.parse(stored).firstRequestTime : null
  })
  const [, setTick] = useState(0) // Force re-render for timer
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false)

  // Memoize processed coupons to avoid recalculation
  const processedCoupons = useMemo(() => {
    return coupons.map(coupon => {
      // Analyze coupon name and description for menu item hints
      const textToAnalyze = [coupon.Name, coupon.Description].filter(Boolean).join(' ')
      if (textToAnalyze) {
        coupon.MenuItemHints = extractMenuItemHints(textToAnalyze)
      }
      return coupon
    })
  }, [coupons])

  const fetchCoupons = useCallback(async () => {
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
      
      // Extract store information
      setStoreInfo({
        StoreID: data.StoreID,
        businessDate: data.BusinessDate,
        market: data.Market,
        storeAsOfTime: data.StoreAsOfTime,
        status: data.Status,
        languageCode: data.LanguageCode
      })
      
      // Extract coupons from the structured response
      const couponsData = data.Coupons || data.coupons || data.Coupon || { Columns: [], Data: [] }
      
      if (couponsData.Columns && couponsData.Data) {
        // Convert the columnar data to coupon objects
        const coupons = couponsData.Data.map((row: unknown[]) => {
          const coupon: Record<string, unknown> = {}
          couponsData.Columns.forEach((column: string, index: number) => {
            coupon[column] = row[index]
          })
          
          // Parse expiration date, virtual code, and eligible items from Tags field and direct fields
          
          // Extract expiration date - check Tags first, then direct fields
          if (coupon.Tags && typeof coupon.Tags === 'string') {
            // Check for various date formats in Tags
            const expiresOnMatch = coupon.Tags.match(/ExpiresOn=(\d{4}-\d{2}-\d{2})/)
            const expiresAtMatch = coupon.Tags.match(/ExpiresAt=(\d{2}:\d{2}:\d{2})/)
            const expireDateMatch = coupon.Tags.match(/ExpireDate=([^,]+)/)
            const expirationMatch = coupon.Tags.match(/Expiration=([^,]+)/)
            
            if (expiresOnMatch) {
              coupon.ExpirationDate = expiresOnMatch[1]
              // If we also have ExpiresAt, append the time
              if (expiresAtMatch) {
                coupon.ExpirationTime = expiresAtMatch[1]
              }
            } else if (expireDateMatch) {
              coupon.ExpirationDate = expireDateMatch[1]
            } else if (expirationMatch) {
              coupon.ExpirationDate = expirationMatch[1]
            }
          }
          // Fallback to direct fields if not found in Tags
          if (!coupon.ExpirationDate && coupon.ExpiresOn) {
            coupon.ExpirationDate = coupon.ExpiresOn
          }
          if (!coupon.ExpirationDate && coupon.ExpireDate) {
            coupon.ExpirationDate = coupon.ExpireDate
          }
          
          // Extract virtual code - check Tags first, then direct fields
          if (coupon.Tags && typeof coupon.Tags === 'string') {
            // Check for various virtual code patterns in Tags
            const virtualCodeMatch = coupon.Tags.match(/VirtualCode=([^,]+)/)
            const onlineCodeMatch = coupon.Tags.match(/OnlineCode=([^,]+)/)
            const webCodeMatch = coupon.Tags.match(/WebCode=([^,]+)/)
            const codeMatch = coupon.Tags.match(/Code=([^,]+)/)
            
            if (virtualCodeMatch) {
              coupon.VirtualCode = virtualCodeMatch[1]
            } else if (onlineCodeMatch) {
              coupon.VirtualCode = onlineCodeMatch[1]
            } else if (webCodeMatch) {
              coupon.VirtualCode = webCodeMatch[1]
            } else if (codeMatch && !coupon.Code) {
              // Only use generic Code if we don't already have a main Code
              coupon.VirtualCode = codeMatch[1]
            }
          }
          
          // Continue with other Tags processing
          if (coupon.Tags && typeof coupon.Tags === 'string') {
            
            // Extract eligible product codes and categories
            const productCodesMatch = coupon.Tags.match(/ProductCodes=([^,]+)/)
            if (productCodesMatch) {
              coupon.EligibleProducts = productCodesMatch[1].split(':')
            }
            
            const categoryCodesMatch = coupon.Tags.match(/CategoryCodes=([^,]+)/)
            if (categoryCodesMatch) {
              coupon.EligibleCategories = categoryCodesMatch[1].split(':')
            }
            
            // Extract minimum order requirements
            const minOrderMatch = coupon.Tags.match(/MinOrder=([^,]+)/)
            if (minOrderMatch) {
              coupon.MinimumOrder = minOrderMatch[1]
            }
            
            // Extract service method restrictions
            const serviceMethodMatch = coupon.Tags.match(/ServiceMethod=([^,]+)/)
            if (serviceMethodMatch) {
              coupon.ServiceMethod = serviceMethodMatch[1]
            }
            
            // Extract valid service methods
            const validServiceMethodsMatch = coupon.Tags.match(/ValidServiceMethods=([^,]+)/)
            if (validServiceMethodsMatch) {
              coupon.ValidServiceMethods = validServiceMethodsMatch[1].split(':')
            }
            
            // Extract time-based restrictions from Tags
            const timeRestrictionMatch = coupon.Tags.match(/TimeRestriction=([^,]+)/)
            if (timeRestrictionMatch) {
              coupon.TimeRestriction = timeRestrictionMatch[1]
            }
            
            const validHoursMatch = coupon.Tags.match(/ValidHours=([^,]+)/)
            if (validHoursMatch) {
              coupon.ValidHours = validHoursMatch[1]
            }
          }
          
          // Menu item hints will be added in the memoized processedCoupons
          
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
  }, [storeId, language, firstRequestTime])



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

  const handleEmailButtonClick = useCallback(() => {
    setIsEmailModalOpen(true)
  }, [])

  const handleEmailModalClose = useCallback(() => {
    setIsEmailModalOpen(false)
  }, [])

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
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        <EnhancedHeader />
        
        {/* Main content container with responsive grid */}
        <div className="dominos-container py-8">
          
          {/* Search and Store Info Section - Card-based layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Search takes up 2 columns on large screens */}
            <div className="lg:col-span-2">
              <div className="dominos-card">
                <UnifiedSearch
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
                  currentLanguage={language}
                  onLanguageChange={(newLanguage) => {
                    setLanguage(newLanguage)
                    localStorage.setItem('selectedLanguage', newLanguage)
                  }}
                  requestCount={requestCount}
                  firstRequestTime={firstRequestTime}
                  onFetchCoupons={fetchCoupons}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>

            {/* Store info takes up 1 column on large screens */}
            {storeInfo && (
              <div className="lg:col-span-1">
                <div className="dominos-card h-fit">
                  <StoreInfoCard storeInfo={storeInfo} />
                </div>
              </div>
            )}
          </div>

          {/* Coupons Display Section */}
          {processedCoupons.length > 0 && (
            <div className="dominos-card mb-8">
              <CouponDisplay
                coupons={processedCoupons}
                onCardToggle={toggleCardExpansion}
                expandedCards={expandedCards}
              />
            </div>
          )}

          {/* Email Button - Sticky positioning with card styling */}
          {processedCoupons.length > 0 && (
            <div className="sticky bottom-4 z-40">
              <div className="flex justify-center px-4">
                <div className="max-w-sm w-full">
                  <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-4">
                    <EmailErrorBoundary>
                      <EmailCouponsButton
                        coupons={processedCoupons}
                        onClick={handleEmailButtonClick}
                      />
                    </EmailErrorBoundary>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Empty State - Updated for white background */}
          {processedCoupons.length === 0 && !loading && !error && (
            <div className="dominos-card text-center py-16">
              <div className="mb-8">
                <div className="text-8xl mb-4">🍕</div>
                <h2 className="dominos-heading-lg text-gray-900 mb-2">
                  Ready to Find Great Deals?
                </h2>
                <p className="dominos-subheading text-lg">
                  Enter a store number or search by address to discover amazing Domino's coupons!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="text-2xl">🏪</div>
                  <span className="text-sm">Enter store number directly</span>
                </div>
                <div className="text-gray-400">or</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl">📍</div>
                  <span className="text-sm">Search by your address</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Email Modal */}
        <EmailErrorBoundary>
          <Suspense fallback={
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
              <div className="bg-white rounded-lg p-6 flex items-center gap-3">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent"></div>
                <span>Loading email modal...</span>
              </div>
            </div>
          }>
            <EmailModal
              isOpen={isEmailModalOpen}
              onClose={handleEmailModalClose}
              coupons={processedCoupons}
              storeInfo={storeInfo}
            />
          </Suspense>
        </EmailErrorBoundary>
      </div>
    </ErrorBoundary>
  )
}

export default App