import { memo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface StoreInfoCardProps {
  storeInfo: {
    StoreID: string | number
    businessDate?: string
    market?: string
    storeAsOfTime?: string
    status?: number
    languageCode?: string
  }
}

export const StoreInfoCard = memo(function StoreInfoCard({ storeInfo }: StoreInfoCardProps) {
  if (!storeInfo || !storeInfo.StoreID) {
    return null
  }

  return (
    <Card className="flex-1 max-w-sm mx-auto lg:mx-0 shadow-lg border-0">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold">Store Information</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center py-2 border-b border-gray-100">
            <span className="font-medium text-gray-600">Store ID:</span>
            <span className="font-semibold">{storeInfo.StoreID}</span>
          </div>
          
          {storeInfo.market && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-600">Market:</span>
              <span className="font-semibold">{storeInfo.market}</span>
            </div>
          )}
          
          {storeInfo.businessDate && (
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="font-medium text-gray-600">Business Date:</span>
              <span className="font-semibold">{storeInfo.businessDate}</span>
            </div>
          )}
          
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
  )
})

export default StoreInfoCard