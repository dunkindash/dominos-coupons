import { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import RateLimitIndicator from './common/RateLimitIndicator'

interface Store {
  storeId: string
  address: string
  distance: number
  phone: string
  isOpen: boolean
  deliveryMinutes?: number
}

interface UnifiedSearchProps {
  onStoreSelect: (storeId: string) => void
  onRateLimitUpdate: (requestCount: number, firstRequestTime: number | null) => void
  currentLanguage: string
  onLanguageChange: (lang: string) => void
  requestCount: number
  firstRequestTime: number | null
  onFetchCoupons: () => void
  loading: boolean
  error: string
}

const US_STATES = [
  { value: 'AL', label: 'Alabama' },
  { value: 'AK', label: 'Alaska' },
  { value: 'AZ', label: 'Arizona' },
  { value: 'AR', label: 'Arkansas' },
  { value: 'CA', label: 'California' },
  { value: 'CO', label: 'Colorado' },
  { value: 'CT', label: 'Connecticut' },
  { value: 'DE', label: 'Delaware' },
  { value: 'FL', label: 'Florida' },
  { value: 'GA', label: 'Georgia' },
  { value: 'HI', label: 'Hawaii' },
  { value: 'ID', label: 'Idaho' },
  { value: 'IL', label: 'Illinois' },
  { value: 'IN', label: 'Indiana' },
  { value: 'IA', label: 'Iowa' },
  { value: 'KS', label: 'Kansas' },
  { value: 'KY', label: 'Kentucky' },
  { value: 'LA', label: 'Louisiana' },
  { value: 'ME', label: 'Maine' },
  { value: 'MD', label: 'Maryland' },
  { value: 'MA', label: 'Massachusetts' },
  { value: 'MI', label: 'Michigan' },
  { value: 'MN', label: 'Minnesota' },
  { value: 'MS', label: 'Mississippi' },
  { value: 'MO', label: 'Missouri' },
  { value: 'MT', label: 'Montana' },
  { value: 'NE', label: 'Nebraska' },
  { value: 'NV', label: 'Nevada' },
  { value: 'NH', label: 'New Hampshire' },
  { value: 'NJ', label: 'New Jersey' },
  { value: 'NM', label: 'New Mexico' },
  { value: 'NY', label: 'New York' },
  { value: 'NC', label: 'North Carolina' },
  { value: 'ND', label: 'North Dakota' },
  { value: 'OH', label: 'Ohio' },
  { value: 'OK', label: 'Oklahoma' },
  { value: 'OR', label: 'Oregon' },
  { value: 'PA', label: 'Pennsylvania' },
  { value: 'RI', label: 'Rhode Island' },
  { value: 'SC', label: 'South Carolina' },
  { value: 'SD', label: 'South Dakota' },
  { value: 'TN', label: 'Tennessee' },
  { value: 'TX', label: 'Texas' },
  { value: 'UT', label: 'Utah' },
  { value: 'VT', label: 'Vermont' },
  { value: 'VA', label: 'Virginia' },
  { value: 'WA', label: 'Washington' },
  { value: 'WV', label: 'West Virginia' },
  { value: 'WI', label: 'Wisconsin' },
  { value: 'WY', label: 'Wyoming' }
]

export default function UnifiedSearch({
  onStoreSelect,
  onRateLimitUpdate,
  currentLanguage,
  onLanguageChange,
  requestCount,
  firstRequestTime,
  onFetchCoupons,
  loading,
  error
}: UnifiedSearchProps) {
  const [activeTab, setActiveTab] = useState<'store-number' | 'find-nearby'>('store-number')
  const [storeId, setStoreId] = useState(() => {
    return localStorage.getItem('lastStoreId') || ''
  })
  
  // Location search state
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [stores, setStores] = useState<Store[]>([])
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const handleStoreNumberSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault()
    if (!storeId.trim()) return
    onFetchCoupons()
  }, [storeId, onFetchCoupons])

  const handleStoreIdChange = useCallback((value: string) => {
    setStoreId(value)
    localStorage.setItem('lastStoreId', value)
    onStoreSelect(value)
  }, [onStoreSelect])

  const findStores = async () => {
    // Validate required fields
    if (!street.trim() || !city.trim() || !state || !zipCode.trim()) {
      setLocationError('Please fill in all address fields')
      return
    }
    
    // Build address string
    const fullAddress = `${street.trim()}, ${city.trim()}, ${state} ${zipCode.trim()}`
    
    setLocationLoading(true)
    setLocationError('')
    setHasSearched(true)
    setStores([])
    
    try {
      const authToken = sessionStorage.getItem('authToken')
      const response = await fetch('/api/stores/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ address: fullAddress })
      })

      // Update rate limit info from response headers
      const remaining = parseInt(response.headers.get('X-RateLimit-Remaining') || '5')
      const limit = parseInt(response.headers.get('X-RateLimit-Limit') || '5')
      const resetTime = response.headers.get('X-RateLimit-Reset')
      
      const newRequestCount = limit - remaining
      const newFirstRequestTime = resetTime && remaining < limit ? 
        new Date(resetTime).getTime() - (10 * 60 * 1000) : null
      
      onRateLimitUpdate(newRequestCount, newFirstRequestTime)

      if (response.status === 429) {
        const errorData = await response.json()
        setLocationError(errorData.message || 'Rate limit exceeded')
        return
      }

      if (response.status === 401) {
        setLocationError('Session expired. Please refresh the page.')
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to find stores')
      }

      const data = await response.json()
      setStores(data.stores)
    } catch (err) {
      setLocationError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLocationLoading(false)
    }
  }

  const handleLocationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    findStores()
  }

  const handleStoreSelection = (selectedStoreId: string) => {
    handleStoreIdChange(selectedStoreId)
    // Switch to store number tab to show the selected store
    setActiveTab('store-number')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-bold text-gray-900">Find Domino's Deals</CardTitle>
        <p className="text-sm text-gray-600">Search by store number or find nearby locations</p>
      </CardHeader>
      <CardContent>
        {/* Tab Navigation */}
        <div className="flex mb-6 bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('store-number')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'store-number'
                ? 'bg-white text-dominos-red shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Store Number
          </button>
          <button
            onClick={() => setActiveTab('find-nearby')}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all duration-200 ${
              activeTab === 'find-nearby'
                ? 'bg-white text-dominos-red shadow-sm'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            Find Nearby
          </button>
        </div>

        {/* Store Number Tab */}
        {activeTab === 'store-number' && (
          <div className="space-y-4">
            <form onSubmit={handleStoreNumberSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Language</label>
                  <select
                    value={currentLanguage}
                    onChange={(e) => onLanguageChange(e.target.value)}
                    className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Store Number</label>
                  <Input
                    type="text"
                    placeholder="Enter store number (e.g., 7046)"
                    value={storeId}
                    onChange={(e) => handleStoreIdChange(e.target.value)}
                    className="w-full transition-all duration-200 focus:ring-2 focus:ring-dominos-red focus:border-dominos-red"
                  />
                </div>
                <RateLimitIndicator
                  requestCount={requestCount}
                  maxRequests={5}
                  firstRequestTime={firstRequestTime}
                  windowMinutes={10}
                />
              </div>
              <Button 
                type="submit" 
                disabled={loading || !storeId.trim()} 
                variant="dominos-primary"
                className="w-full transition-all duration-200 font-semibold shadow-md hover:shadow-lg disabled:opacity-50"
              >
                {loading ? 'Loading...' : 'Find Coupons'}
              </Button>
            </form>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>
        )}

        {/* Find Nearby Tab */}
        {activeTab === 'find-nearby' && (
          <div className="space-y-4">
            <form onSubmit={handleLocationSubmit} className="space-y-4">
              <div className="space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">Street Address</label>
                  <Input
                    type="text"
                    placeholder="123 Main St"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full focus:ring-2 focus:ring-dominos-blue focus:border-dominos-blue"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">City</label>
                  <Input
                    type="text"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full focus:ring-2 focus:ring-dominos-blue focus:border-dominos-blue"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">State</label>
                    <select
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <option value="">Select State</option>
                      {US_STATES.map(stateOption => (
                        <option key={stateOption.value} value={stateOption.value}>
                          {stateOption.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">ZIP Code</label>
                    <Input
                      type="text"
                      placeholder="12345"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full focus:ring-2 focus:ring-dominos-blue focus:border-dominos-blue"
                      maxLength={10}
                    />
                  </div>
                </div>
              </div>
              <Button 
                type="submit" 
                disabled={locationLoading || !street.trim() || !city.trim() || !state || !zipCode.trim()}
                variant="dominos-accent"
                className="w-full font-semibold"
              >
                {locationLoading ? 'Finding Stores...' : 'Find Stores'}
              </Button>
            </form>

            {locationError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">{locationError}</p>
              </div>
            )}

            {locationLoading && (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
                <div className="flex items-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-dominos-blue"></div>
                  <p className="text-dominos-blue text-sm">Finding nearby stores...</p>
                </div>
              </div>
            )}

            {hasSearched && !locationLoading && stores.length === 0 && !locationError && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-md">
                <div className="text-center">
                  <p className="text-gray-600 text-sm">No nearby stores found</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Try entering a different address or check if the area is served by Domino's
                  </p>
                </div>
              </div>
            )}

            {stores.length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-sm text-gray-700">
                  Found {stores.length} nearby stores:
                </h3>
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {stores.map((store) => (
                    <div
                      key={store.storeId}
                      className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200 hover:border-dominos-red"
                      onClick={() => handleStoreSelection(store.storeId)}
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="font-medium text-sm text-gray-900">Store #{store.storeId}</div>
                          <div className="text-xs text-gray-600 mt-1">{store.address}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            📞 {store.phone} • 📍 {store.distance.toFixed(1)} miles
                          </div>
                          {store.deliveryMinutes && (
                            <div className="text-xs text-green-600 mt-1">
                              🚚 ~{store.deliveryMinutes} min delivery
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                            store.isOpen 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {store.isOpen ? 'Open' : 'Closed'}
                          </div>
                          <Button
                            variant="dominos-secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleStoreSelection(store.storeId)
                            }}
                            className="text-xs"
                          >
                            View Deals
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}