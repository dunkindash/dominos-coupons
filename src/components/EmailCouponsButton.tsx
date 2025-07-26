import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { cn } from "@/lib/utils"
import type { Coupon } from "@/types/dominos"

interface EmailCouponsButtonProps {
  coupons: Coupon[]
  disabled?: boolean
  loading?: boolean
  onClick: () => void
  className?: string
}

export default function EmailCouponsButton({
  coupons,
  disabled = false,
  loading = false,
  onClick,
  className
}: EmailCouponsButtonProps) {
  // Memoize computed values to prevent unnecessary re-renders
  const hasCoupons = coupons?.length > 0
  const isDisabled = disabled || loading || !hasCoupons
  const couponCount = coupons?.length ?? 0

  return (
    <Button
      onClick={onClick}
      disabled={isDisabled}
      variant="destructive"
      size="lg"
      className={cn(
        "w-full bg-red-600 hover:bg-red-700 text-white border-0",
        "transition-all duration-200 font-medium shadow-md hover:shadow-lg",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "focus-visible:ring-red-500/20",
        "touch-manipulation min-h-[44px] sm:min-h-[40px]",
        className
      )}
      aria-label={loading ? "Sending coupons via email" : `Email ${couponCount} coupons`}
    >
      {loading ? (
        <>
          <Spinner size="sm" className="-ml-1 mr-2 text-white" />
          <span>Sending Email...</span>
        </>
      ) : (
        <>
          <svg 
            className="w-4 h-4 mr-1.5 sm:mr-2 flex-shrink-0" 
            fill="currentColor" 
            viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
            <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
          </svg>
          <span className="text-sm sm:text-base">Email Coupons ({couponCount})</span>
        </>
      )}
    </Button>
  )
}