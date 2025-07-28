import { memo } from 'react'
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

interface Store {
  storeId: string
  address: string
  distance: number
  phone: string
  isOpen: boolean
  deliveryMinutes?: number
}

interface StoreResultsProps {
  stores: Store[]
  onStoreSelect: (storeId: string) => void
  loading?: boolean
  searchLocation?: string
}

export const StoreResults = memo(function StoreResults({ 
  stores, 
  onStoreSelect, 
  loading = false,
  searchLocation 
}: StoreResultsProps) {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center">
          <div className="inline-flex items-center space-x-2 text-dominos-blue-600">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-dominos-blue-600"></div>
            <span className="text-sm font-medium">Finding nearby stores...</span>
          </div>
        </div>
        {/* Loading skeleton cards */}
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
                <div className="ml-4 space-y-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16"></div>
                  <div className="h-8 bg-gray-200 rounded w-20"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-8">
        <div className="mb-4">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" 
            />
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" 
            />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No stores found</h3>
        <p className="text-gray-600 text-sm max-w-md mx-auto">
          {searchLocation ? (
            <>We couldn't find any Domino's stores near <span className="font-medium">"{searchLocation}"</span>. Try searching with a different address or check if the area is served by Domino's.</>
          ) : (
            "We couldn't find any Domino's stores for your search. Try entering a different address or check if the area is served by Domino's."
          )}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          {stores.length} store{stores.length !== 1 ? 's' : ''} found
        </h3>
        {searchLocation && (
          <p className="text-sm text-gray-600">
            Near: <span className="font-medium">{searchLocation}</span>
          </p>
        )}
      </div>
      
      <div className="grid gap-4">
        {stores.map((store) => (
          <Card 
            key={store.storeId} 
            className="hover:shadow-md transition-shadow duration-200 border-gray-200"
          >
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0">
                  {/* Store Header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h4 className="text-lg font-bold text-gray-900">
                      Store #{store.storeId}
                    </h4>
                    <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                      store.isOpen 
                        ? 'bg-green-100 text-green-800 border border-green-200' 
                        : 'bg-red-100 text-red-800 border border-red-200'
                    }`}>
                      <div className={`w-2 h-2 rounded-full mr-1.5 ${
                        store.isOpen ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                      {store.isOpen ? 'Open Now' : 'Closed'}
                    </div>
                  </div>

                  {/* Store Address */}
                  <div className="mb-3">
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {store.address}
                    </p>
                  </div>

                  {/* Store Details */}
                  <div className="flex flex-wrap items-center gap-4 text-xs text-gray-600">
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="font-medium">{store.phone}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="font-medium">{store.distance.toFixed(1)} miles away</span>
                    </div>

                    {store.deliveryMinutes && (
                      <div className="flex items-center gap-1 text-dominos-blue-600">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium">~{store.deliveryMinutes} min delivery</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Button */}
                <div className="ml-4 flex-shrink-0">
                  <Button
                    variant="dominos-primary"
                    size="lg"
                    onClick={() => onStoreSelect(store.storeId)}
                    className="whitespace-nowrap"
                  >
                    View Deals
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {stores.length > 0 && (
        <div className="text-center pt-4 border-t border-gray-100">
          <p className="text-xs text-gray-500">
            Showing stores that are currently open and available for delivery
          </p>
        </div>
      )}
    </div>
  )
})

export default StoreResults