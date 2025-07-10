import crypto from 'crypto'

// Change this to your desired password
const CORRECT_PASSWORD = 'CodeGasm26@'

// Secret key for JWT-like tokens (in production, use environment variable)
const JWT_SECRET = 'your-secret-key-change-this-in-production'

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

// Export function to verify tokens (for other API endpoints)
export function verifyToken(token) {
  console.log('Verifying token:', token ? 'present' : 'missing')
  
  if (!token) {
    console.log('No token provided')
    return false
  }
  
  try {
    const parts = token.split('.')
    if (parts.length !== 2) {
      console.log('Invalid token format')
      return false
    }
    
    const [payloadBase64, signature] = parts
    const payload = JSON.parse(Buffer.from(payloadBase64, 'base64').toString())
    
    // Verify signature
    const expectedSignature = crypto.createHmac('sha256', JWT_SECRET).update(JSON.stringify(payload)).digest('hex')
    if (signature !== expectedSignature) {
      console.log('Invalid token signature')
      return false
    }
    
    // Check expiration
    if (payload.exp < Date.now()) {
      console.log('Token expired')
      return false
    }
    
    console.log('Token verified successfully')
    return true
  } catch (error) {
    console.log('Token verification error:', error.message)
    return false
  }
}