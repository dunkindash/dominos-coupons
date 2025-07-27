import { useMemo, memo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import type { Coupon } from "@/types/dominos"

interface CouponDisplayProps {
    coupons: Coupon[]
    onCardToggle: (cardId: string) => void
    expandedCards: Set<string>
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
        'supreme', 'pepperoni', 'chicken', 'beef', 'italian sausage',
        'delivery', 'carryout', 'pickup', 'topping', 'toppings'
    ]

    menuItems.forEach(item => {
        if (lowerDesc.includes(item)) {
            hints.push(item)
        }
    })

    // Extract specific pricing mentions
    const priceMatches = description.match(/\$\d+\.?\d*/g)
    if (priceMatches) {
        hints.push(...priceMatches.map(price => `Price: ${price}`))
    }

    // Extract quantity mentions
    const quantityMatches = description.match(/\b(\d+)\s*(piece|pc|order|item)/gi)
    if (quantityMatches) {
        hints.push(...quantityMatches.map(qty => `Quantity: ${qty}`))
    }

    // Detect time-sensitive language
    const timeSensitiveTerms = [
        'today only', 'limited time', 'ends tonight', 'ends at midnight',
        'ends today', 'while supplies last', 'limited offer',
        'ends soon', 'expires today', 'flash sale', 'hourly special',
        'lunch special', 'dinner special', 'happy hour'
    ]

    timeSensitiveTerms.forEach(term => {
        if (lowerDesc.includes(term)) {
            hints.push(`⏰ ${term}`)
        }
    })

    return [...new Set(hints)] // Remove duplicates
}

const CouponCard = memo(function CouponCard({ coupon, index, isExpanded, onToggle }: {
    coupon: Coupon
    index: number
    isExpanded: boolean
    onToggle: () => void
}) {
    const cardId = coupon.Code || coupon.ID || `coupon-${index}`

    // Memoize menu item hints calculation
    const menuItemHints = useMemo(() => {
        const textToAnalyze = [coupon.Name, coupon.Description].filter(Boolean).join(' ')
        return textToAnalyze ? extractMenuItemHints(textToAnalyze) : []
    }, [coupon.Name, coupon.Description])

    return (
        <Card key={cardId} className="hover:shadow-xl transition-all duration-300 hover:scale-105 flex flex-col h-full shadow-lg border-0 ring-2 ring-red-200">
            <CardHeader className="pb-4 bg-gradient-to-r from-red-50 to-orange-50">
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs font-bold">
                        🔥 HOT DEAL
                    </span>
                </div>
                <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                        <CardTitle className="text-lg leading-tight mb-2 font-bold">
                            {coupon.Name || 'Special Offer'}
                        </CardTitle>
                        <div className="flex flex-wrap gap-2">
                            <CardDescription className="text-sm bg-gray-100 px-2 py-1 rounded-md inline-block">
                                Code: {coupon.Code}
                            </CardDescription>
                            {coupon.VirtualCode && (
                                <CardDescription className="text-sm bg-blue-100 px-2 py-1 rounded-md inline-block">
                                    Online: {coupon.VirtualCode}
                                </CardDescription>
                            )}
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                        <div className="text-2xl font-bold text-red-600 bg-red-50 px-3 py-2 rounded-lg">
                            ${coupon.Price || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500 mt-2 font-medium">
                            {coupon.ExpirationDate ? (
                                `Expires: ${new Date(coupon.ExpirationDate).toLocaleDateString('en-US', {
                                    month: 'short',
                                    day: 'numeric',
                                    year: 'numeric'
                                })}`
                            ) : (
                                'Expiration: Unknown'
                            )}
                        </div>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="flex flex-col flex-grow">
                <div className="flex-grow">
                    <p className="text-gray-700 mb-4 text-sm leading-relaxed">
                        {coupon.Description}
                    </p>

                    <div className="flex flex-wrap gap-2 mb-4">
                        {coupon.Local === 'true' && (
                            <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium shadow-sm">
                                Local Offer
                            </span>
                        )}
                        {coupon.Bundle === 'true' && (
                            <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-medium shadow-sm">
                                Bundle Deal
                            </span>
                        )}
                        {coupon.ServiceMethod && (
                            <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium shadow-sm">
                                {String(coupon.ServiceMethod)} Only
                            </span>
                        )}
                        {coupon.MinimumOrder && (
                            <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-medium shadow-sm">
                                Min Order: ${String(coupon.MinimumOrder)}
                            </span>
                        )}
                    </div>
                </div>

                <div className="mt-auto">
                    {/* Valid Service Methods */}
                    {coupon.ValidServiceMethods && Array.isArray(coupon.ValidServiceMethods) && coupon.ValidServiceMethods.length > 0 && (
                        <div className="mb-4 p-3 bg-green-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-sm mb-2 text-green-800">🚗 Available For:</h4>
                            <div className="flex flex-wrap gap-2">
                                {coupon.ValidServiceMethods.map((method, index) => (
                                    <span key={index} className="px-2 py-1 bg-white text-green-700 rounded text-xs font-medium border border-green-200">
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

                    {menuItemHints.length > 0 && (
                        <div className="mb-4 p-3 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg border border-green-200">
                            <h4 className="font-semibold text-sm mb-2 text-green-800">🍕 What's Included:</h4>
                            <div className="flex flex-wrap gap-1">
                                {menuItemHints.map((hint, index) => (
                                    <span key={index} className="px-2 py-1 bg-white text-green-700 rounded text-xs font-medium border border-green-200">
                                        {hint}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

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

                    <Button
                        size="sm"
                        onClick={onToggle}
                        className="w-full text-xs !bg-red-600 hover:!bg-red-700 !text-white transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                        {isExpanded ? 'Hide Details' : 'Show All Details'}
                    </Button>

                    {isExpanded && (
                        <div className="mt-4 p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border border-gray-200">
                            <h4 className="font-semibold text-sm mb-3 text-gray-800">All Fields:</h4>
                            <div className="grid grid-cols-1 gap-2 text-xs">
                                {Object.entries(coupon).map(([key, value]) => (
                                    <div key={key} className="flex justify-between">
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
            </CardContent>
        </Card>
    )
})

export const CouponDisplay = memo(function CouponDisplay({ coupons, onCardToggle, expandedCards }: CouponDisplayProps) {
    // Separate late night deals from regular coupons
    const { lateNightCoupons, regularCoupons } = useMemo(() => {
        const lateNight: Coupon[] = []
        const regular: Coupon[] = []

        coupons.forEach(coupon => {
            const text = [coupon.Name, coupon.Description].filter(Boolean).join(' ').toLowerCase()
            const lateNightKeywords = ['late night', 'after 10', 'after 11', 'after midnight', 'night owl', 'midnight', '10pm', '11pm', 'late', 'night only', 'evening', 'after dark']

            if (lateNightKeywords.some(keyword => text.includes(keyword))) {
                lateNight.push(coupon)
            } else {
                regular.push(coupon)
            }
        })

        return { lateNightCoupons: lateNight, regularCoupons: regular }
    }, [coupons])

    if (coupons.length === 0) {
        return null
    }

    return (
        <>
            {/* Late Night Deals Section */}
            {lateNightCoupons.length > 0 && (
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-purple-200 mb-2 flex items-center justify-center gap-2">
                            🌙 Late Night Deals 🌙
                        </h2>
                        <p className="text-purple-100 text-sm">
                            🦉 Perfect for night owls - special late night offers!
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {lateNightCoupons.map((coupon, index) => {
                            const cardId = coupon.Code || coupon.ID || `late-night-${index}`
                            const isExpanded = expandedCards.has(cardId)

                            return (
                                <CouponCard
                                    key={cardId}
                                    coupon={coupon}
                                    index={index}
                                    isExpanded={isExpanded}
                                    onToggle={() => onCardToggle(cardId)}
                                />
                            )
                        })}
                    </div>
                </div>
            )}

            {/* Regular Coupons Section */}
            {regularCoupons.length > 0 && (
                <div className="mb-8">
                    <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-blue-200 mb-2">
                            🎟️ All Available Coupons ({regularCoupons.length})
                        </h2>
                        <p className="text-blue-100 text-sm">
                            Save money on your favorite Domino's items
                        </p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {regularCoupons.map((coupon, index) => {
                            const cardId = coupon.Code || coupon.ID || `regular-${index}`
                            const isExpanded = expandedCards.has(cardId)

                            return (
                                <CouponCard
                                    key={cardId}
                                    coupon={coupon}
                                    index={index}
                                    isExpanded={isExpanded}
                                    onToggle={() => onCardToggle(cardId)}
                                />
                            )
                        })}
                    </div>
                </div>
            )}
        </>
    )
})

export default CouponDisplay