import { useMemo } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { getCouponId, formatCouponPrice, getCouponCode } from "@/lib/coupon-utils"
import type { Coupon } from "@/types/dominos"

interface CouponSelectorProps {
  coupons: Coupon[]
  selectedCoupons: string[]
  onSelectionChange: (selectedIds: string[]) => void
}

export default function CouponSelector({
  coupons,
  selectedCoupons,
  onSelectionChange
}: CouponSelectorProps) {
  // Memoize expensive calculations
  const isAllSelected = useMemo(() => 
    selectedCoupons.length === coupons.length && coupons.length > 0,
    [selectedCoupons.length, coupons.length]
  )



  const handleCouponToggle = (couponId: string) => {
    const newSelection = selectedCoupons.includes(couponId)
      ? selectedCoupons.filter(id => id !== couponId)
      : [...selectedCoupons, couponId]
    
    onSelectionChange(newSelection)
  }

  const handleSelectAll = () => {
    if (isAllSelected) {
      onSelectionChange([])
    } else {
      const allIds = coupons.map(getCouponId)
      onSelectionChange(allIds)
    }
  }

  if (coupons.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <p>No coupons available to select</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Select All / Deselect All Controls */}
      <div className="sticky top-0 bg-gray-50 z-10 flex items-center justify-between py-3 px-4 border-b border-gray-200">
        <span className="text-sm font-medium text-gray-600">
          {selectedCoupons.length} of {coupons.length} selected
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          className="h-8 px-3 text-sm font-medium text-[#006491] hover:text-[#004d6f] hover:bg-blue-50"
        >
          {isAllSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>

      {/* Coupon List */}
      <div className="space-y-3 p-4">
        {coupons.map((coupon) => {
          const couponId = getCouponId(coupon)
          const isSelected = selectedCoupons.includes(couponId)
          const couponCode = getCouponCode(coupon)
          const price = formatCouponPrice(coupon.Price)

          return (
            <label
              key={couponId}
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all touch-manipulation bg-white",
                "hover:border-[#006491]/50 hover:shadow-md",
                isSelected && "bg-blue-50 border-[#006491] shadow-md"
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCouponToggle(couponId)}
                className="mt-0.5 sm:mt-1 h-4 w-4 flex-shrink-0 rounded border-gray-300 text-[#E31837] focus:ring-[#E31837] accent-[#E31837]"
                aria-describedby={`coupon-${couponId}-description`}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm leading-tight break-words text-gray-800">
                      {coupon.Name || "Special Offer"}
                    </h4>
                    
                    {coupon.Description && (
                      <p 
                        id={`coupon-${couponId}-description`}
                        className="text-xs text-muted-foreground mt-1 line-clamp-2 break-words"
                      >
                        {coupon.Description}
                      </p>
                    )}
                    
                    {couponCode && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-mono bg-gray-100 text-gray-700 border border-gray-200">
                          <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                          </svg>
                          {couponCode}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {price && (
                    <div className="text-right">
                      <span className="text-sm font-bold text-[#E31837] whitespace-nowrap bg-red-50 px-2 py-1 rounded-md">
                        {price}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </label>
          )
        })}
      </div>

      {selectedCoupons.length === 0 && (
        <div className="flex items-center justify-center gap-2 text-sm text-amber-600 bg-amber-50 rounded-lg p-3 mx-3">
          <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p>Please select at least one coupon to continue</p>
        </div>
      )}
    </div>
  )
}