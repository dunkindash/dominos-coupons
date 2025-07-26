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
      <div className="flex items-center justify-between pb-2 border-b">
        <span className="text-sm font-medium">
          {selectedCoupons.length} of {coupons.length} selected
        </span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleSelectAll}
          className="h-8 px-3 text-xs"
        >
          {isAllSelected ? "Deselect All" : "Select All"}
        </Button>
      </div>

      {/* Coupon List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {coupons.map((coupon) => {
          const couponId = getCouponId(coupon)
          const isSelected = selectedCoupons.includes(couponId)
          const couponCode = getCouponCode(coupon)
          const price = formatCouponPrice(coupon.Price)

          return (
            <label
              key={couponId}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                "hover:bg-accent/50",
                isSelected && "bg-accent border-primary/50"
              )}
            >
              <input
                type="checkbox"
                checked={isSelected}
                onChange={() => handleCouponToggle(couponId)}
                className="mt-1 h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                aria-describedby={`coupon-${couponId}-description`}
              />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm leading-tight">
                      {coupon.Name || "Unnamed Coupon"}
                    </h4>
                    
                    {coupon.Description && (
                      <p 
                        id={`coupon-${couponId}-description`}
                        className="text-xs text-muted-foreground mt-1 line-clamp-2"
                      >
                        {coupon.Description}
                      </p>
                    )}
                    
                    {couponCode && (
                      <div className="mt-2">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-muted text-muted-foreground">
                          Code: {couponCode}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  {price && (
                    <div className="text-right">
                      <span className="text-sm font-semibold text-green-600">
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
        <p className="text-sm text-muted-foreground text-center py-2">
          Please select at least one coupon to continue
        </p>
      )}
    </div>
  )
}