import { NearbyStores } from 'dominos'
import { verifyToken } from '../auth.js'

// Simple in-memory rate limiting (resets on each deployment)
const rateLimit = new Map()

const RATE_LIMIT = 5
const RATE_LIMIT_WINDOW = 10 * 60 * 1000 // 10 minutes in milliseconds

function cleanupOldEntries() {
  const now = Date.now()
  for (const [key, value] of rateLimit.entries()) {
    if (value.resetTime < now) {
      rateLimit.delete(key)
    }
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Check authentication
  const authToken = req.headers.authorization?.replace('Bearer ', '')
  if (!verifyToken(authToken)) {
    return res.status(401).json({ error: 'Unauthorized' })
  }

  const { address } = req.body

  if (!address) {
    return res.status(400).json({ error: 'Address is required' })
  }

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
    console.log('Finding nearby stores for address:', address)
    
    // Use the address string directly as the dominos API expects
    const searchLocation = address.trim()
    
    console.log('Search location:', searchLocation)
    
    const nearbyStores = await new NearbyStores(searchLocation)
    
    console.log('Raw stores found:', nearbyStores.stores?.length || 0)
    console.log('First store example:', nearbyStores.stores?.[0])
    
    if (!nearbyStores.stores || nearbyStores.stores.length === 0) {
      console.log('No stores found in API response')
      return res.status(200).json({
        stores: [],
        searchLocation: searchLocation,
        message: 'No stores found for this location'
      })
    }
    
    // Filter and sort stores by distance
    const availableStores = nearbyStores.stores
      .filter(store => {
        console.log(`Store ${store.StoreID}: OnlineCapable=${store.IsOnlineCapable}, DeliveryStore=${store.IsDeliveryStore}, Open=${store.IsOpen}, ServiceOpen=${store.ServiceIsOpen?.Delivery}`)
        return store.IsOnlineCapable && 
               store.IsDeliveryStore && 
               store.IsOpen &&
               store.ServiceIsOpen?.Delivery
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

    console.log(`Found ${availableStores.length} available stores after filtering`)

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

    res.status(200).json({
      stores: availableStores,
      searchLocation: searchLocation,
      _meta: {
        requestsRemaining: RATE_LIMIT - updatedData.count,
        resetTime: updatedData.resetTime
      }
    })

  } catch (error) {
    console.error('Error finding nearby stores:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ 
      error: 'Failed to find nearby stores',
      message: errorMessage,
      debug: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
    })
  }
}