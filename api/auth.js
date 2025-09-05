/**
 * api/auth.js
 * 
 * Authentication API endpoint for Domino's Coupons application
 * Requirements: Node.js 18+, crypto module (built-in)
 * Dependencies: crypto (built-in)
 */

import crypto from 'crypto'

// Change this to your desired password
const CORRECT_PASSWORD = 'CodeGasm26@'

// Secret key for JWT-like tokens (in production, use environment variable)
const JWT_SECRET = 'your-secret-key-change-this-in-production'

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
    service: 'auth-api',
    ...context
  }

  if (process.env.NODE_ENV === 'development') {
    console[level](`[${logEntry.timestamp}] ${logEntry.level}: ${message}`, context)
  } else {
    console[level](JSON.stringify(logEntry))
  }
}

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { password } = req.body

  if (!password) {
    return res.status(400).json({ error: 'Password required' })
  }

  // Use timing-safe comparison to prevent timing attacks
  const providedPassword = Buffer.from(password, 'utf8')
  const correctPassword = Buffer.from(CORRECT_PASSWORD, 'utf8')
  
  if (providedPassword.length !== correctPassword.length || 
      !crypto.timingSafeEqual(providedPassword, correctPassword)) {
    return res.status(401).json({ error: 'Invalid password' })
  }

  // Generate JWT-like token with expiration
  const expiresAt = Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  const payload = {
    exp: expiresAt,
    iat: Date.now()
  }
  
  const token = Buffer.from(JSON.stringify(payload)).toString('base64') + '.' + 
               crypto.createHmac('sha256', JWT_SECRET).update(JSON.stringify(payload)).digest('hex')

  res.status(200).json({ token, expiresAt })
}

/**
 * Verify JWT-like token for API authentication
 * @param {string} token - The token to verify
 * @returns {boolean} True if token is valid, false otherwise
 */
export function verifyToken(token) {
  log('debug', 'Token verification requested', { hasToken: !!token })
  
  if (!token) {
    log('warn', 'Authentication failed: No token provided')
    return false
  }
  
  try {
    const parts = token.split('.')
    if (parts.length !== 2) {
      log('warn', 'Authentication failed: Invalid token format', { 
        tokenLength: token.length,
        parts: parts.length 
      })
      return false
    }
    
    const [payloadBase64, signature] = parts
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString())
    
    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(JSON.stringify(payload)).digest('hex')
    if (signature !== expectedSignature) {
      log('warn', 'Authentication failed: Invalid token signature')
      return false
    }
    
    // Check expiration
    if (payload.exp < Date.now()) {
      log('warn', 'Authentication failed: Token expired', { 
        expiredAt: new Date(payload.exp).toISOString(),
        currentTime: new Date().toISOString()
      })
      return false
    }
    
    log('info', 'Token verified successfully', { 
      expiresAt: new Date(payload.exp).toISOString() 
    })
    return true
  } catch (error) {
    log('error', 'Token verification error', { 
      error: error.message,
      tokenLength: token?.length || 0
    })
    return false
  }
}
