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
  console.log('API called with method:', req.method, 'and query:', req.query)
  
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'GET' && req.method !== 'HEAD') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { storeId } = req.query
  
  if (!storeId || typeof storeId !== 'string') {
    return res.status(400).json({ error: 'Store ID is required' })
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

  // For HEAD requests, just return rate limit info without fetching data
  if (req.method === 'HEAD') {
    const currentData = rateLimit.get(clientId)
    const requestsUsed = currentData ? currentData.count : 0
    const resetTime = currentData ? currentData.resetTime : Date.now() + RATE_LIMIT_WINDOW
    
    res.setHeader('X-RateLimit-Limit', RATE_LIMIT.toString())
    res.setHeader('X-RateLimit-Remaining', Math.max(0, RATE_LIMIT - requestsUsed).toString())
    res.setHeader('X-RateLimit-Reset', new Date(resetTime).toISOString())
    
    return res.status(200).end()
  }

  try {
    // Fetch from Domino's API
    const dominosResponse = await fetch(
      `https://order.dominos.com/power/store/${storeId}/menu?lang=en`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Accept': 'application/json',
          'Accept-Language': 'en-US,en;q=0.9',
          'Cache-Control': 'no-cache',
        }
      }
    )

    if (!dominosResponse.ok) {
      return res.status(dominosResponse.status).json({ 
        error: 'Failed to fetch from Dominos',
        status: dominosResponse.status 
      })
    }

    const data = await dominosResponse.json()

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

    return res.status(200).json({
      ...data,
      _meta: {
        requestsRemaining: RATE_LIMIT - updatedData.count,
        resetTime: updatedData.resetTime
      }
    })

  } catch (error) {
    console.error('API Error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return res.status(500).json({ 
      error: 'Internal server error',
      message: errorMessage,
      debug: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
    })
  }
}