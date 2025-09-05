/**
 * api/stores/nearby.js
 * 
 * Domino's nearby stores API endpoint with rate limiting and validation
 * Requirements: Node.js 18+, dominos package 3.3.1+
 * Dependencies: dominos, ../auth.js
 */

import { NearbyStores } from 'dominos'
import { verifyToken } from '../auth.js'

// Simple in-memory rate limiting (resets on each deployment)
const rateLimit = new Map()

const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW = 10 * 60 * 1000 // 10 minutes in milliseconds

/**
 * Clean up expired rate limit entries to prevent memory leaks
 */
function cleanupOldEntries() {
  const now = Date.now()
  for (const [key, value] of rateLimit.entries()) {
    if (value.resetTime < now) {
      rateLimit.delete(key)
    }
  }
}

/**
 * Validate address input for security and format requirements
 * @param {string} address - The address to validate
 * @returns {Object} Validation result with isValid flag and sanitized address
 */
function validateAddress(address) {
  if (!address || typeof address !== 'string') {
    return { isValid: false, error: 'Address is required and must be a string', sanitized: '' }
  }

  // Sanitize input to prevent injection attacks
  const sanitized = address
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 200) // Limit length to reasonable address size

  if (sanitized.length < 3) {
    return { isValid: false, error: 'Address must be at least 3 characters', sanitized }
  }

  if (sanitized.length > 200) {
    return { isValid: false, error: 'Address is too long', sanitized }
  }

  return { isValid: true, sanitized }
}

/**
 * Log structured messages for production monitoring
 * @param {string} level - Log level (info, warn, error)
 * @param {string} message - Log message
 * @param {Object} context - Additional context data
 */
function log(level, message, context = {}) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    level: level.toUpperCase(),
    message,
    service: 'nearby-stores-api',
    ...context
  }

  if (process.env.NODE_ENV === 'development') {
    console[level](`[${logEntry.timestamp}] ${logEntry.level}: ${message}`, context)
  } else {
    console[level](JSON.stringify(logEntry))
  }
}

/**
 * Main API handler for nearby stores endpoint
 * @param {Object} req - HTTP request object
 * @param {Object} res - HTTP response object
 */
export default async function handler(req, res) {
  const startTime = Date.now()
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    log('warn', 'Invalid HTTP method attempted', { method: req.method })
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check authentication
  const authToken = req.headers.authorization?.replace('Bearer ', '')
  if (!verifyToken(authToken)) {
    log('warn', 'Unauthorized access attempt', { 
      ip: req.headers['x-forwarded-for'] || 'unknown',
      userAgent: req.headers['user-agent'] || 'unknown'
    })
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { address } = req.body

  // Validate and sanitize address input
  const validation = validateAddress(address)
  if (!validation.isValid) {
    log('warn', 'Address validation failed', { 
      error: validation.error, 
      originalAddress: address?.substring(0, 50) // Log partial for debugging
    })
    return res.status(400).json({ error: validation.error })
  }

  const sanitizedAddress = validation.sanitized

  // Get client identifier (IP + User Agent for better identification)
  const forwarded = req.headers['x-forwarded-for']
  const ip = typeof forwarded === 'string' ? forwarded.split(',')[0] : 'unknown'
  const userAgent = req.headers['user-agent'] || 'unknown'
  const clientId = `${ip}:${userAgent}`

  // Clean up old entries periodically
  cleanupOldEntries()

  // Check rate limit
  const now = Date.now()
  const clientData = rateLimit.get(clientId)

  if (clientData) {
    if (clientData.resetTime > now && clientData.count >= RATE_LIMIT) {
      const minutesRemaining = Math.ceil((clientData.resetTime - now) / 1000 / 60)
      
      res.setHeader('X-RateLimit-Limit', RATE_LIMIT.toString())
      res.setHeader('X-RateLimit-Remaining', '0')
      res.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString())
      
      return res.status(429).json({ 
        error: 'Rate limit exceeded',
        message: `You have made too many requests. Please wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} before trying again.`,
        remaining: 0,
        resetTime: clientData.resetTime
      })
    }

    if (clientData.resetTime <= now) {
      // Reset the counter
      clientData.count = 0
      clientData.resetTime = now + RATE_LIMIT_WINDOW
    }
  }

  try {
    log('info', 'Finding nearby stores for address', { address: sanitizedAddress })
    
    // Use the sanitized address for the API call
    const nearbyStores = await new NearbyStores(sanitizedAddress)
    
    log('info', 'Dominos API response received', { 
      storesFound: nearbyStores.stores?.length || 0,
      hasStores: !!nearbyStores.stores
    })
    
    if (!nearbyStores.stores || nearbyStores.stores.length === 0) {
      log('info', 'No stores found in API response', { searchLocation: sanitizedAddress })
      return res.status(200).json({
        stores: [],
        searchLocation: sanitizedAddress,
        message: 'No stores found for this location'
      })
    }
    
    // Filter and sort stores by distance
    const availableStores = nearbyStores.stores
      .filter(store => {
        const isAvailable = store.IsOnlineCapable && 
                           store.IsDeliveryStore && 
                           store.IsOpen &&
                           store.ServiceIsOpen?.Delivery
        
        log('debug', 'Store availability check', {
          storeId: store.StoreID,
          onlineCapable: store.IsOnlineCapable,
          deliveryStore: store.IsDeliveryStore,
          isOpen: store.IsOpen,
          serviceOpen: store.ServiceIsOpen?.Delivery,
          available: isAvailable
        })
        
        return isAvailable
      })
      .sort((a, b) => a.MinDistance - b.MinDistance)
      .slice(0, 10) // Limit to 10 closest stores
      .map(store => ({
        storeId: store.StoreID,
        address: store.StoreCoordinates?.Description || store.AddressDescription,
        distance: store.MinDistance,
        phone: store.Phone,
        isOpen: store.IsOpen,
        deliveryMinutes: store.ServiceEstimatedWaitMinutes?.Delivery
      }))

    log('info', 'Store filtering completed', { 
      totalStores: nearbyStores.stores.length,
      availableStores: availableStores.length 
    })

    // Update rate limit
    if (clientData) {
      clientData.count++
    } else {
      rateLimit.set(clientId, {
        count: 1,
        resetTime: now + RATE_LIMIT_WINDOW
      })
    }

    const updatedData = rateLimit.get(clientId)
    
    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT.toString())
    res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - updatedData.count).toString())
    res.setHeader('X-RateLimit-Reset', new Date(updatedData.resetTime).toISOString())

    // Cache for 5 minutes to reduce API calls
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate')

    const duration = Date.now() - startTime
    log('info', 'Request completed successfully', {
      duration,
      storesReturned: availableStores.length,
      requestsRemaining: RATE_LIMIT - updatedData.count
    })

    res.status(200).json({
      stores: availableStores,
      searchLocation: sanitizedAddress,
      _meta: {
        requestsRemaining: RATE_LIMIT - updatedData.count,
        resetTime: updatedData.resetTime
      }
    })

  } catch (error) {
    const duration = Date.now() - startTime
    log('error', 'Error finding nearby stores', { 
      error: error.message,
      stack: error.stack,
      duration,
      address: sanitizedAddress
    })
    
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ 
      error: 'Failed to find nearby stores',
      message: errorMessage,
      debug: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
    })
  }
}
