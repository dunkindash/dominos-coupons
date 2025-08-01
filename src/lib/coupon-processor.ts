import type { Coupon } from "@/types/dominos"

/**
 * Extract menu item hints from coupon descriptions
 */
export function extractMenuItemHints(description: string): string[] {
  if (!description) return []
  
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

/**
 * Process raw coupon data and add computed fields
 */
export function processCoupons(coupons: Coupon[]): Coupon[] {
  return coupons.map(coupon => {
    // Analyze coupon name and description for menu item hints
    const textToAnalyze = [coupon.Name, coupon.Description].filter(Boolean).join(' ')
    if (textToAnalyze) {
      coupon.MenuItemHints = extractMenuItemHints(textToAnalyze)
    }
    return coupon
  })
}

/**
 * Parse coupon data from API response
 */
export function parseCouponData(data: any): Coupon[] {
  const couponsData = data.Coupons || data.coupons || data.Coupon || { Columns: [], Data: [] }
  
  if (!couponsData.Columns || !couponsData.Data) {
    return []
  }

  return couponsData.Data.map((row: unknown[]) => {
    const coupon: Record<string, unknown> = {}
    couponsData.Columns.forEach((column: string, index: number) => {
      coupon[column] = row[index]
    })
    
    // Parse expiration date, virtual code, and eligible items from Tags field
    if (coupon.Tags && typeof coupon.Tags === 'string') {
      parseCouponTags(coupon, coupon.Tags)
    }
    
    // Fallback to direct fields if not found in Tags
    setCouponFallbacks(coupon)
    
    return coupon as Coupon
  })
}

/**
 * Parse coupon tags for additional metadata
 */
function parseCouponTags(coupon: Record<string, unknown>, tags: string) {
  // Extract expiration date
  const expiresOnMatch = tags.match(/ExpiresOn=(\d{4}-\d{2}-\d{2})/)
  const expiresAtMatch = tags.match(/ExpiresAt=(\d{2}:\d{2}:\d{2})/)
  const expireDateMatch = tags.match(/ExpireDate=([^,]+)/)
  const expirationMatch = tags.match(/Expiration=([^,]+)/)
  
  if (expiresOnMatch) {
    coupon.ExpirationDate = expiresOnMatch[1]
    if (expiresAtMatch) {
      coupon.ExpirationTime = expiresAtMatch[1]
    }
  } else if (expireDateMatch) {
    coupon.ExpirationDate = expireDateMatch[1]
  } else if (expirationMatch) {
    coupon.ExpirationDate = expirationMatch[1]
  }
  
  // Extract virtual code
  const virtualCodeMatch = tags.match(/VirtualCode=([^,]+)/)
  const onlineCodeMatch = tags.match(/OnlineCode=([^,]+)/)
  const webCodeMatch = tags.match(/WebCode=([^,]+)/)
  const codeMatch = tags.match(/Code=([^,]+)/)
  
  if (virtualCodeMatch) {
    coupon.VirtualCode = virtualCodeMatch[1]
  } else if (onlineCodeMatch) {
    coupon.VirtualCode = onlineCodeMatch[1]
  } else if (webCodeMatch) {
    coupon.VirtualCode = webCodeMatch[1]
  } else if (codeMatch && !coupon.Code) {
    coupon.VirtualCode = codeMatch[1]
  }
  
  // Extract other metadata
  const productCodesMatch = tags.match(/ProductCodes=([^,]+)/)
  if (productCodesMatch) {
    coupon.EligibleProducts = productCodesMatch[1].split(':')
  }
  
  const categoryCodesMatch = tags.match(/CategoryCodes=([^,]+)/)
  if (categoryCodesMatch) {
    coupon.EligibleCategories = categoryCodesMatch[1].split(':')
  }
  
  const minOrderMatch = tags.match(/MinOrder=([^,]+)/)
  if (minOrderMatch) {
    coupon.MinimumOrder = minOrderMatch[1]
  }
  
  const serviceMethodMatch = tags.match(/ServiceMethod=([^,]+)/)
  if (serviceMethodMatch) {
    coupon.ServiceMethod = serviceMethodMatch[1]
  }
  
  const validServiceMethodsMatch = tags.match(/ValidServiceMethods=([^,]+)/)
  if (validServiceMethodsMatch) {
    coupon.ValidServiceMethods = validServiceMethodsMatch[1].split(':')
  }
  
  const timeRestrictionMatch = tags.match(/TimeRestriction=([^,]+)/)
  if (timeRestrictionMatch) {
    coupon.TimeRestriction = timeRestrictionMatch[1]
  }
  
  const validHoursMatch = tags.match(/ValidHours=([^,]+)/)
  if (validHoursMatch) {
    coupon.ValidHours = validHoursMatch[1]
  }
}

/**
 * Set fallback values for coupon fields
 */
function setCouponFallbacks(coupon: Record<string, unknown>) {
  if (!coupon.ExpirationDate && coupon.ExpiresOn) {
    coupon.ExpirationDate = coupon.ExpiresOn
  }
  if (!coupon.ExpirationDate && coupon.ExpireDate) {
    coupon.ExpirationDate = coupon.ExpireDate
  }
}