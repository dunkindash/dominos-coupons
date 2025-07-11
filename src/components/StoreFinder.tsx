import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

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
}

export default function StoreFinder({ onStoreSelect }: StoreFinderProps) {
  const [zipCode, setZipCode] = useState('')
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const findStores = async () => {
    if (!zipCode.trim()) return
    
    setLoading(true)
    setError('')
    
    try {
      const authToken = sessionStorage.getItem('authToken')
      const response = await fetch('/api/stores/nearby', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        },
        body: JSON.stringify({ zipCode: zipCode.trim() })
      })

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
    <Card className="shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Find Nearby Stores</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            type="text"
            placeholder="Enter zip code (e.g., 90210)"
            value={zipCode}
            onChange={(e) => setZipCode(e.target.value)}
            className="w-full"
            maxLength={10}
          />
          <Button 
            type="submit" 
            disabled={loading || !zipCode.trim()}
            className="w-full !bg-blue-600 hover:!bg-blue-700 !text-white"
          >
            {loading ? 'Finding Stores...' : 'Find Stores'}
          </Button>
        </form>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {stores.length > 0 && (
          <div className="mt-4 space-y-2">
            <h3 className="font-semibold text-sm text-gray-700">
              Found {stores.length} nearby stores:
            </h3>
            <div className="max-h-60 overflow-y-auto space-y-2">
              {stores.map((store) => (
                <div
                  key={store.storeId}
                  className="p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => onStoreSelect(store.storeId)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-medium text-sm">Store #{store.storeId}</div>
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
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                      store.isOpen 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {store.isOpen ? 'Open' : 'Closed'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}