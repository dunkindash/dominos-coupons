import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import StoreResults from "@/components/store/StoreResults"

interface Store {
  storeId: string
  address: string
  distance: number
  phone: string
  isOpen: boolean
  deliveryMinutes?: number
}

interface StoreFinderProps {
  onStoreSelect: (storeId: string) => void
  onRateLimitUpdate?: (requestCount: number, firstRequestTime: number | null) => void
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

export default function StoreFinder({ onStoreSelect, onRateLimitUpdate }: StoreFinderProps) {
  const [street, setStreet] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')
  const [zipCode, setZipCode] = useState('')
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [hasSearched, setHasSearched] = useState(false)

  const findStores = async () => {
    // Validate required fields
    if (!street.trim() || !city.trim() || !state || !zipCode.trim()) {
      setError('Please fill in all address fields')
      return
    }
    
    // Build address string
    const fullAddress = `${street.trim()}, ${city.trim()}, ${state} ${zipCode.trim()}`
    
    setLoading(true)
    setError('')
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
      
      // Call the callback to update parent component's rate limit state
      if (onRateLimitUpdate) {
        onRateLimitUpdate(newRequestCount, newFirstRequestTime)
      }

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
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to find stores')
      }

      const data = await response.json()
      setStores(data.stores)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    findStores()
  }

  return (
    <div>
      <Card className="flex-1 max-w-md mx-auto lg:mx-0 shadow-lg border-0">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">Find Nearby Stores</CardTitle>
        </CardHeader>
        <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-3">
            <Input
              type="text"
              placeholder="Street Address (e.g., 123 Main St)"
              value={street}
              onChange={(e) => setStreet(e.target.value)}
              className="w-full"
            />
            <Input
              type="text"
              placeholder="City"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full"
            />
            <div className="grid grid-cols-2 gap-3">
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
              <Input
                type="text"
                placeholder="ZIP Code"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                className="w-full"
                maxLength={10}
              />
            </div>
          </div>
          <Button 
            type="submit" 
            variant="dominos-primary"
            disabled={loading || !street.trim() || !city.trim() || !state || !zipCode.trim()}
            className="w-full"
          >
            {loading ? 'Finding Stores...' : 'Find Stores'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {loading && (
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              <p className="text-blue-600 text-sm">Finding nearby stores...</p>
            </div>
          </div>
        )}

        </CardContent>
      </Card>

      {/* Store Results Section */}
      {(hasSearched || stores.length > 0) && (
        <div className="mt-6">
          <StoreResults
            stores={stores}
            onStoreSelect={onStoreSelect}
            loading={loading}
            searchLocation={hasSearched ? `${street}, ${city}, ${state} ${zipCode}` : undefined}
          />
        </div>
      )}
    </div>
  )
}