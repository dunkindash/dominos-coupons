/**
 * @fileoverview Utility functions for coupon handling
 */

import type { Coupon } from "@/types/dominos"

/**
 * Generates a consistent unique identifier for a coupon
 * @param coupon - The coupon object
 * @returns A unique string identifier
 */
export function getCouponId(coupon: Coupon): string {
  return coupon.ID || coupon.Code || coupon.VirtualCode || `${coupon.Name}-${Date.now()}`
}

/**
 * Formats coupon price for display
 * @param price - The price string from the coupon
 * @returns Formatted price string
 */
export function formatCouponPrice(price: string | undefined): string {
  if (!price) return ""
  
  // Remove any existing dollar signs and format consistently
  const cleanPrice = price.replace(/[$]/g, "")
  return cleanPrice.includes("$") ? cleanPrice : `$${cleanPrice}`
}

/**
 * Gets the coupon code (prioritizing VirtualCode over Code)
 * @param coupon - The coupon object
 * @returns The coupon code string
 */
export function getCouponCode(coupon: Coupon): string {
  return coupon.VirtualCode || coupon.Code || ""
}

/**
 * Checks if a coupon is a special offer based on tags
 * @param coupon - The coupon object
 * @returns True if it's a special offer
 */
export function isSpecialOffer(coupon: Coupon): boolean {
  if (!coupon.Tags) return false
  
  const tags = coupon.Tags.toLowerCase()
  return tags.includes('special') || 
         tags.includes('limited') || 
         tags.includes('exclusive')
}

/**
 * Validates that a coupon has the minimum required data
 * @param coupon - The coupon object to validate
 * @returns True if the coupon is valid
 */
export function isValidCoupon(coupon: Coupon): boolean {
  return !!(coupon.Name && (coupon.Code || coupon.VirtualCode || coupon.ID))
}