import crypto from 'crypto'

// Change this to your desired password
const CORRECT_PASSWORD = 'CodeGasm26@'

// Simple session store (resets on deployment)
const sessions = new Map()

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

  // Generate secure session token
  const token = crypto.randomBytes(32).toString('hex')
  const sessionData = {
    token,
    createdAt: Date.now(),
    expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
  }

  sessions.set(token, sessionData)

  // Clean up expired sessions
  for (const [key, session] of sessions.entries()) {
    if (session.expiresAt < Date.now()) {
      sessions.delete(key)
    }
  }

  res.status(200).json({ token, expiresAt: sessionData.expiresAt })
}

// Export function to verify tokens (for other API endpoints)
export function verifyToken(token) {
  if (!token) return false
  
  const session = sessions.get(token)
  if (!session || session.expiresAt < Date.now()) {
    if (session) sessions.delete(token)
    return false
  }
  
  return true
}