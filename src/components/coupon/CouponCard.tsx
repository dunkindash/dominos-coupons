import { memo, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Coupon } from "@/types/dominos"

interface CouponCategory {
  name: string
  color: string
  bgColor: string
  borderColor: string
  icon: string
  priority: number
}

const COUPON_CATEGORIES: Record<string, CouponCategory> = {
  'pizza': {
    name: 'Pizza Deals',
    color: 'text-dominos-red',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    icon: '🍕',
    priority: 1
  },
  'bundle': {
    name: 'Bundle Deals',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    icon: '📦',
    priority: 2
  },
  'wings': {
    name: 'Wings & Sides',
    color: 'text-yellow-700',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    icon: '🍗',
    priority: 3
  },
  'late-night': {
    name: 'Late Night',
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    icon: '🌙',
    priority: 4
  },
  'delivery': {
    name: 'Delivery Special',
    color: 'text-dominos-blue',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    icon: '🚚',
    priority: 5
  },
  'carryout': {
    name: 'Carryout Deal',
    color: 'text-green-700',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    icon: '🏪',
    priority: 6
  },
  'limited': {
    name: 'Limited Time',
    color: 'text-red-700',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-300',
    icon: '⏰',
    priority: 7
  },
  'default': {
    name: 'Special Offer',
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-200',
    icon: '🎟️',
    priority: 8
  }
}

interface CouponCardProps {
  coupon: Coupon
  index: number
  isExpanded: boolean
  onToggle: () => void
  viewMode?: 'grid' | 'list'
}

// Enhanced categorization function
function categorizeCoupon(coupon: Coupon): CouponCategory {
  const text = [coupon.Name, coupon.Description].filter(Boolean).join(' ').toLowerCase()
  
  // Check for late night deals first (highest priority for special treatment)
  const lateNightKeywords = ['late night', 'after 10', 'after 11', 'after midnight', 'night owl', 'midnight', '10pm', '11pm', 'late', 'night only', 'evening', 'after dark']
  if (lateNightKeywords.some(keyword => text.includes(keyword))) {
    return COUPON_CATEGORIES['late-night']
  }
  
  // Check for bundle deals
  if (coupon.Bundle === 'true' || coupon.Bundle === true || text.includes('bundle') || text.includes('combo') || text.includes('meal deal')) {
    return COUPON_CATEGORIES['bundle']
  }
  
  // Check for pizza deals
  const pizzaKeywords = ['pizza', 'large pizza', 'medium pizza', 'small pizza', 'specialty pizza', 'cheese pizza', 'pepperoni pizza', 'hand tossed', 'thin crust', 'pan pizza']
  if (pizzaKeywords.some(keyword => text.includes(keyword))) {
    return COUPON_CATEGORIES['pizza']
  }
  
  // Check for wings and sides
  const wingsKeywords = ['wings', 'boneless wings', 'traditional wings', 'sides', 'breadsticks', 'cheesy bread', 'pasta', 'sandwich', 'salad']
  if (wingsKeywords.some(keyword => text.includes(keyword))) {
    return COUPON_CATEGORIES['wings']
  }
  
  // Check for delivery specific deals
  if (coupon.ServiceMethod === 'Delivery' || (coupon.ValidServiceMethods && coupon.ValidServiceMethods.includes('Delivery') && coupon.ValidServiceMethods.length === 1)) {
    return COUPON_CATEGORIES['delivery']
  }
  
  // Check for carryout specific deals
  if (coupon.ServiceMethod === 'Carryout' || (coupon.ValidServiceMethods && coupon.ValidServiceMethods.includes('Carryout') && coupon.ValidServiceMethods.length === 1)) {
    return COUPON_CATEGORIES['carryout']
  }
  
  // Check for limited time offers
  const limitedTimeKeywords = ['limited time', 'today only', 'ends tonight', 'ends today', 'while supplies last', 'limited offer', 'ends soon', 'expires today', 'flash sale']
  if (limitedTimeKeywords.some(keyword => text.includes(keyword))) {
    return COUPON_CATEGORIES['limited']
  }
  
  return COUPON_CATEGORIES['default']
}

// Helper function to extract savings amount for better visual hierarchy
function extractSavingsAmount(coupon: Coupon): { amount: string; type: 'dollar' | 'percent' | 'price' } {
  const text = [coupon.Name, coupon.Description].filter(Boolean).join(' ')
  
  // Look for dollar savings (e.g., "Save $5", "$3 off")
  const dollarSavings = text.match(/\$(\d+(?:\.\d{2})?)\s*(?:off|savings?)/i) || text.match(/save\s*\$(\d+(?:\.\d{2})?)/i)
  if (dollarSavings) {
    return { amount: `${dollarSavings[1]}`, type: 'dollar' }
  }
  
  // Look for percentage savings (e.g., "50% off", "Save 25%")
  const percentSavings = text.match(/(\d+)%\s*off/i) || text.match(/save\s*(\d+)%/i)
  if (percentSavings) {
    return { amount: `${percentSavings[1]}%`, type: 'percent' }
  }
  
  // Use price as fallback
  if (coupon.Price) {
    return { amount: `${coupon.Price}`, type: 'price' }
  }
  
  return { amount: 'Deal', type: 'price' }
}

// Helper function to extract menu item hints from coupon descriptions
function extractMenuItemHints(description: string): string[] {
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
    'supreme', 'pepperoni', 'chicken', 'beef', 'italian sausage'
  ]

  menuItems.forEach(item => {
    if (lowerDesc.includes(item)) {
      hints.push(item)
    }
  })

  return [...new Set(hints)].slice(0, 3) // Limit to 3 most relevant hints
}

export const CouponCard = memo(function CouponCard({ 
  coupon, 
  index, 
  isExpanded, 
  onToggle, 
  viewMode = 'grid' 
}: CouponCardProps) {
  const cardId = coupon.Code || coupon.ID || `coupon-${index}`
  
  // Memoize category and savings calculations
  const category = useMemo(() => categorizeCoupon(coupon), [coupon])
  const savings = useMemo(() => extractSavingsAmount(coupon), [coupon])
  const menuItemHints = useMemo(() => {
    const textToAnalyze = [coupon.Name, coupon.Description].filter(Boolean).join(' ')
    return textToAnalyze ? extractMenuItemHints(textToAnalyze) : []
  }, [coupon.Name, coupon.Description])

  // List view layout
  if (viewMode === 'list') {
    return (
      <Card 
        key={cardId} 
        className={`
          group relative overflow-hidden transition-all duration-300 ease-out
          hover:shadow-lg hover:scale-[1.01]
          active:scale-[0.99] active:shadow-md
          cursor-pointer
          ${category.borderColor} border-l-4 border-y border-r
          bg-white hover:bg-gray-50/50
          transform-gpu will-change-transform
          touch-manipulation
        `}
        onClick={onToggle}
      >
        <CardContent className="p-4">
          <div className="flex items-center gap-4">
            {/* Left: Savings Badge */}
            <div className="flex-shrink-0">
              <div className={`
                inline-flex items-center gap-1 px-3 py-2 rounded-lg
                ${savings.type === 'dollar' ? 'bg-green-100 text-green-800' : 
                  savings.type === 'percent' ? 'bg-orange-100 text-orange-800' : 
                  'bg-dominos-red text-white'}
                font-bold text-sm shadow-sm
                transition-all duration-200 group-hover:scale-105
                min-w-[80px] justify-center
              `}>
                <span className="text-xs">
                  {savings.type === 'dollar' && '💰'}
                  {savings.type === 'percent' && '🎯'}
                  {savings.type === 'price' && '💵'}
                </span>
                <span className="text-base font-bold">{savings.amount}</span>
                {savings.type !== 'price' && <span className="text-xs">OFF</span>}
              </div>
            </div>

            {/* Center: Main Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-gray-900 text-base leading-tight mb-1 truncate">
                    {coupon.Name || 'Special Offer'}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-2 line-clamp-2">
                    {coupon.Description}
                  </p>
                  
                  {/* Key attributes in compact format */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-xs font-medium">
                      Code: {coupon.Code}
                    </span>
                    {coupon.VirtualCode && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs font-medium">
                        Online: {coupon.VirtualCode}
                      </span>
                    )}
                    {coupon.MinimumOrder && (
                      <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs font-medium">
                        Min: ${String(coupon.MinimumOrder)}
                      </span>
                    )}
                  </div>

                  {/* Service methods */}
                  {coupon.ValidServiceMethods && Array.isArray(coupon.ValidServiceMethods) && coupon.ValidServiceMethods.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {coupon.ValidServiceMethods.map((method, index) => (
                        <span key={index} className="px-2 py-1 bg-dominos-blue/10 text-dominos-blue rounded text-xs font-medium">
                          {method === 'Carryout' ? '🏪' :
                            method === 'Delivery' ? '🚚' :
                              method === 'Carside' ? '🚗' :
                                method === 'Hotspot' ? '📍' : ''}
                          {method}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right: Category and Action */}
                <div className="flex-shrink-0 flex flex-col items-end gap-2">
                  {/* Category badge */}
                  <span className={`
                    px-2 py-1 rounded-full text-xs font-bold
                    ${category.color} ${category.bgColor}
                    shadow-sm border ${category.borderColor}
                    transition-all duration-200 group-hover:scale-105
                    flex items-center gap-1
                  `}>
                    {category.icon}
                    <span className="hidden sm:inline">{category.name}</span>
                  </span>

                  {/* Expiration */}
                  <div className="text-xs text-gray-500 text-right">
                    {coupon.ExpirationDate ? (
                      `Expires: ${new Date(coupon.ExpirationDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}`
                    ) : (
                      'Check store'
                    )}
                  </div>

                  {/* Action button */}
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation()
                      onToggle()
                    }}
                    className={`
                      h-8 px-3 text-xs font-medium transition-all duration-200
                      bg-dominos-red hover:bg-dominos-red-hover text-white
                      shadow-sm hover:shadow-md transform hover:scale-[1.02] active:scale-[0.98]
                      border-0 focus:ring-2 focus:ring-dominos-red/50
                      touch-manipulation
                    `}
                  >
                    {isExpanded ? 'Hide' : 'Details'}
                  </Button>
                </div>
              </div>

              {/* Expanded Details for List View */}
              {isExpanded && (
                <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200 animate-in slide-in-from-top-2 duration-200">
                  {/* Menu Item Hints */}
                  {menuItemHints.length > 0 && (
                    <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                      <h4 className="font-semibold text-sm mb-2 text-green-800">🍕 Includes:</h4>
                      <div className="flex flex-wrap gap-1">
                        {menuItemHints.map((hint, index) => (
                          <span key={index} className="px-2 py-1 bg-white text-green-700 rounded text-xs font-medium border border-green-200 capitalize">
                            {hint}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Additional attributes */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {coupon.Local === 'true' && (
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium shadow-sm border border-blue-200">
                        📍 Local Offer
                      </span>
                    )}
                    {(coupon.Bundle === 'true' || coupon.Bundle === true) && (
                      <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium shadow-sm border border-orange-200">
                        📦 Bundle Deal
                      </span>
                    )}
                  </div>

                  {/* Eligible Items */}
                  {(coupon.EligibleProducts || coupon.EligibleCategories) && (
                    <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-sm mb-2 text-blue-800">📋 Eligible Items:</h4>
                      {coupon.EligibleCategories && Array.isArray(coupon.EligibleCategories) && (
                        <div className="mb-2">
                          <span className="text-xs font-medium text-blue-600">Categories: </span>
                          <span className="text-xs text-blue-700">{coupon.EligibleCategories.join(', ')}</span>
                        </div>
                      )}
                      {coupon.EligibleProducts && Array.isArray(coupon.EligibleProducts) && (
                        <div>
                          <span className="text-xs font-medium text-blue-600">Products: </span>
                          <span className="text-xs text-blue-700">{coupon.EligibleProducts.join(', ')}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* All Fields Debug Info */}
                  <h4 className="font-semibold text-sm mb-3 text-gray-800">🔍 All Fields:</h4>
                  <div className="grid grid-cols-1 gap-2 text-xs max-h-48 overflow-y-auto">
                    {Object.entries(coupon).map(([key, value]) => (
                      <div key={key} className="flex justify-between py-1 border-b border-gray-200 last:border-b-0">
                        <span className="font-medium text-gray-600">{key}:</span>
                        <span className="text-gray-800 break-all max-w-xs text-right">
                          {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Grid view layout - simplified version
  return (
    <Card 
      key={cardId} 
      className={`
        group relative overflow-hidden transition-all duration-300 ease-out
        hover:shadow-2xl hover:-translate-y-1 hover:scale-[1.02]
        active:scale-[0.98] active:shadow-lg
        flex flex-col h-full cursor-pointer
        ${category.borderColor} border-2
        bg-white hover:bg-gray-50/50
        transform-gpu will-change-transform
        touch-manipulation
      `}
      onClick={onToggle}
    >
      {/* Category Badge - Top Right */}
      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 z-10">
        <span className={`
          px-2 py-1 rounded-full text-xs font-bold
          ${category.color} ${category.bgColor}
          shadow-sm border ${category.borderColor}
          transition-all duration-200 group-hover:scale-105
          hidden xs:inline-flex
        `}>
          {category.icon} {category.name}
        </span>
        <span className={`
          w-8 h-8 rounded-full text-xs font-bold
          ${category.color} ${category.bgColor}
          shadow-sm border ${category.borderColor}
          transition-all duration-200 group-hover:scale-105
          flex items-center justify-center xs:hidden
        `}>
          {category.icon}
        </span>
      </div>

      <CardHeader className={`pb-3 sm:pb-4 px-4 sm:px-6 ${category.bgColor} relative`}>
        {/* Savings Amount - Prominent Display */}
        <div className="flex justify-between items-start gap-2 sm:gap-4 mb-3">
          <div className="flex-1 min-w-0">
            <div className={`
              inline-flex items-center gap-1 sm:gap-2 mb-3 px-2 sm:px-3 py-1 sm:py-2 rounded-lg
              ${savings.type === 'dollar' ? 'bg-green-100 text-green-800' : 
                savings.type === 'percent' ? 'bg-orange-100 text-orange-800' : 
                'bg-dominos-red text-white'}
              font-bold text-base sm:text-lg shadow-sm
              transition-all duration-200 group-hover:scale-105
            `}>
              <span className="text-sm sm:text-base">
                {savings.type === 'dollar' && '💰'}
                {savings.type === 'percent' && '🎯'}
                {savings.type === 'price' && '💵'}
              </span>
              <span className="text-lg sm:text-xl">{savings.amount}</span>
              {savings.type !== 'price' && <span className="text-xs sm:text-sm">OFF</span>}
            </div>
            
            <CardTitle className="text-base sm:text-lg leading-tight mb-2 font-bold text-gray-900 pr-10 sm:pr-16">
              {coupon.Name || 'Special Offer'}
            </CardTitle>
          </div>
        </div>

        {/* Coupon Codes */}
        <div className="flex flex-wrap gap-1 sm:gap-2 mb-3">
          <CardDescription className={`
            text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md font-medium
            bg-white/80 text-gray-700 border border-gray-300
            transition-all duration-200 group-hover:bg-white
          `}>
            Code: {coupon.Code}
          </CardDescription>
          {coupon.VirtualCode && (
            <CardDescription className={`
              text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-md font-medium
              bg-blue-100 text-blue-800 border border-blue-200
              transition-all duration-200 group-hover:bg-blue-200
            `}>
              Online: {coupon.VirtualCode}
            </CardDescription>
          )}
        </div>

        {/* Expiration Date */}
        <div className="text-xs text-gray-600 font-medium">
          {coupon.ExpirationDate ? (
            `⏰ Expires: ${new Date(coupon.ExpirationDate).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}`
          ) : (
            '⏰ Check store for expiration'
          )}
        </div>
      </CardHeader>

      <CardContent className="flex flex-col flex-grow p-3 sm:p-4">
        {/* Description */}
        <div className="flex-grow">
          <p className="text-gray-700 mb-4 text-sm leading-relaxed font-medium">
            {coupon.Description}
          </p>

          {/* Key Deal Attributes */}
          <div className="flex flex-wrap gap-2 mb-4">
            {coupon.Local === 'true' && (
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium shadow-sm border border-blue-200">
                📍 Local Offer
              </span>
            )}
            {(coupon.Bundle === 'true' || coupon.Bundle === true) && (
              <span className="px-2 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium shadow-sm border border-orange-200">
                📦 Bundle Deal
              </span>
            )}
            {coupon.ServiceMethod && (
              <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium shadow-sm border border-purple-200">
                {String(coupon.ServiceMethod)} Only
              </span>
            )}
            {coupon.MinimumOrder && (
              <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-medium shadow-sm border border-yellow-200">
                💰 Min: ${String(coupon.MinimumOrder)}
              </span>
            )}
          </div>

          {/* Menu Item Hints - Compact Display */}
          {menuItemHints.length > 0 && (
            <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
              <h4 className="font-semibold text-sm mb-2 text-green-800">🍕 Includes:</h4>
              <div className="flex flex-wrap gap-1">
                {menuItemHints.map((hint, index) => (
                  <span key={index} className="px-2 py-1 bg-white text-green-700 rounded text-xs font-medium border border-green-200 capitalize">
                    {hint}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Service Methods - Always visible if available */}
        {coupon.ValidServiceMethods && Array.isArray(coupon.ValidServiceMethods) && coupon.ValidServiceMethods.length > 0 && (
          <div className="mb-4 p-3 bg-dominos-blue/5 rounded-lg border border-dominos-blue/20">
            <h4 className="font-semibold text-sm mb-2 text-dominos-blue">🚗 Available For:</h4>
            <div className="flex flex-wrap gap-2">
              {coupon.ValidServiceMethods.map((method, index) => (
                <span key={index} className="px-2 py-1 bg-white text-dominos-blue rounded text-xs font-medium border border-dominos-blue/30">
                  {method === 'Carryout' ? '🏪 Carryout' :
                    method === 'Delivery' ? '🚚 Delivery' :
                      method === 'Carside' ? '🚗 Carside' :
                        method === 'Hotspot' ? '📍 Hotspot' :
                          method}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation()
              onToggle()
            }}
            className={`
              w-full h-10 sm:h-8 text-xs sm:text-xs font-medium transition-all duration-200
              bg-dominos-red hover:bg-dominos-red-hover text-white
              shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]
              border-0 focus:ring-2 focus:ring-dominos-red/50
              touch-manipulation
            `}
          >
            {isExpanded ? 'Hide Details' : 'View Details'}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
})

export default CouponCard