/**
 * src/components/ActionBar.tsx
 * 
 * Sticky Action Bar Component for Coupon Management
 * 
 * Requirements:
 * - React 19+
 * - TypeScript 5.0+
 * - Tailwind CSS 3.0+
 * 
 * Dependencies:
 * - react: memo for performance optimization
 * - @/components/ui/button: Reusable button component
 * - @/lib/utils: Utility functions (cn for className merging)
 * - @/types/dominos: TypeScript type definitions for Coupon
 * 
 * Features:
 * - Responsive sticky positioning at bottom of viewport
 * - Smooth slide-in animations with transform transitions
 * - Touch-friendly mobile interface with proper sizing
 * - Accessibility support with ARIA labels and descriptions
 * - Email coupons functionality with visual feedback
 * - Future-ready share functionality (currently disabled)
 */

import { memo } from 'react'
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { Coupon } from "@/types/dominos"

interface ActionBarProps {
  visible: boolean
  coupons: Coupon[]
  onEmailCoupons: () => void
  className?: string
}

export const ActionBar = memo(function ActionBar({
  visible,
  coupons,
  onEmailCoupons,
  className
}: ActionBarProps) {
  const couponCount = coupons?.length ?? 0

  if (!visible || couponCount === 0) {
    return null
  }

  return (
    <div 
      className={cn(
        // Sticky positioning at bottom with proper z-index
        "sticky bottom-0 z-40",
        // Smooth slide-in animation
        "transform transition-all duration-300 ease-out",
        visible ? "translate-y-0 opacity-100" : "translate-y-full opacity-0",
        className
      )}
    >
      {/* Background with subtle shadow and border */}
      <div className="bg-white border-t border-gray-200 shadow-lg">
        {/* Container with responsive padding */}
        <div className="dominos-container py-3 sm:py-4">
          {/* Flex layout for responsive behavior */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
            
            {/* Coupon count and info - Hidden on mobile to save space */}
            <div className="hidden sm:flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-dominos-red rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{couponCount}</span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {couponCount} {couponCount === 1 ? 'Coupon' : 'Coupons'} Available
                  </p>
                  <p className="text-xs text-gray-600">
                    Save these deals to your email
                  </p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 w-full sm:w-auto">
              
              {/* Mobile-only coupon count */}
              <div className="flex sm:hidden items-center gap-2 flex-1 min-w-0">
                <div className="w-7 h-7 bg-dominos-red rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{couponCount}</span>
                </div>
                <span className="text-sm font-medium text-gray-700 truncate">
                  {couponCount} {couponCount === 1 ? 'Deal' : 'Deals'} Found
                </span>
              </div>

              {/* Primary email action button */}
              <Button
                onClick={onEmailCoupons}
                variant="dominos-primary"
                size="lg"
                type="button"
                className={cn(
                  // Enhanced styling for prominence
                  "shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]",
                  "transition-all duration-200 font-semibold",
                  "focus-visible:ring-2 focus-visible:ring-dominos-red/30 focus-visible:ring-offset-2",
                  // Mobile responsive sizing with touch-friendly targets
                  "min-h-[48px] sm:min-h-[44px] px-4 sm:px-6 lg:px-8",
                  "w-auto sm:w-auto flex-shrink-0",
                  "touch-manipulation"
                )}
                aria-label={`Email ${couponCount} ${couponCount === 1 ? 'coupon' : 'coupons'} to save them for later use`}
                aria-describedby="email-button-description"
              >
                <svg 
                  className="w-4 h-4 mr-2 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                  role="img"
                  aria-label="Email icon"
                >
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <span className="text-sm sm:text-base whitespace-nowrap">
                  <span className="hidden xs:inline">Email </span>Coupons
                </span>
              </Button>
              <span id="email-button-description" className="sr-only">
                Opens a modal to enter your email address and send the coupons
              </span>

              {/* Secondary action button - Share (future enhancement) */}
              <Button
                variant="dominos-secondary"
                size="lg"
                className={cn(
                  "hidden md:flex",
                  "shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]",
                  "transition-all duration-200",
                  "focus-visible:ring-2 focus-visible:ring-dominos-red/30 focus-visible:ring-offset-2",
                  "min-h-[44px] px-4 touch-manipulation"
                )}
                disabled
                aria-label="Share coupons (coming soon)"
              >
                <svg 
                  className="w-4 h-4 mr-2 flex-shrink-0" 
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path d="M15 8a3 3 0 10-2.977-2.63l-4.94 2.47a3 3 0 100 4.319l4.94 2.47a3 3 0 10.895-1.789l-4.94-2.47a3.027 3.027 0 000-.74l4.94-2.47C13.456 7.68 14.19 8 15 8z" />
                </svg>
                <span className="text-sm">Share</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
})

export default ActionBar
