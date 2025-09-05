/**
 * api/email/send-coupons.js
 * 
 * Email API endpoint for sending Domino's coupons to users
 * Requirements: Node.js 18+, Resend API, crypto module
 * Dependencies: ../auth.js, resend, ./templates/base-template.js, crypto
 */

import { verifyToken } from '../auth.js'
import { Resend } from 'resend'
import { generateBaseTemplate } from './templates/base-template.js'
import crypto from 'crypto'

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
    service: 'email-api',
    ...context
  }

  if (process.env.NODE_ENV === 'development') {
    console[level](`[${logEntry.timestamp}] ${logEntry.level}: ${message}`, context)
  } else {
    console[level](JSON.stringify(logEntry))
  }
}

// Initialize Resend with API key
const resend = new Resend(process.env.RESEND_API_KEY)

// Enhanced rate limiting with Redis support for production
const rateLimit = new Map()

// Security utilities
const SECURITY = {
  // HTML entities for sanitization
  HTML_ENTITIES: {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  },
  
  // Dangerous patterns to check for
  DANGEROUS_PATTERNS: [
    /[<>]/,                    // HTML tags
    /javascript:/i,            // JavaScript protocol
    /data:/i,                  // Data protocol
    /vbscript:/i,             // VBScript protocol
    /on\w+\s*=/i,             // Event handlers
    /\bscript\b/i,            // Script tags
    /\x00/,                   // Null bytes
    /[\r\n]/,                 // Line breaks in email
    /[;|&`$]/                 // Command injection chars
  ]
}

// Configuration constants
const CONFIG = {
    RATE_LIMIT: 5,
    RATE_LIMIT_WINDOW: 10 * 60 * 1000, // 10 minutes in milliseconds
    EMAIL_FROM: process.env.EMAIL_FROM || 'Domino\'s Coupons <noreply@yourdomain.com>',
    MAX_COUPONS: 50, // Prevent abuse with too many coupons
    MAX_EMAIL_LENGTH: 254 // RFC 5321 limit
}

// Rate limiting utilities
/**
 * Removes expired rate limit entries from memory
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
 * Generates a unique client identifier from request headers
 * @param {Object} req - Express request object
 * @returns {string} Client identifier
 */
/**
 * Sanitizes HTML content by escaping dangerous characters
 * @param {string} input - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHtml(input) {
  if (typeof input !== 'string') {
    return String(input)
  }
  
  return input.replace(/[&<>"'`=/]/g, (match) => SECURITY.HTML_ENTITIES[match] || match)
}

/**
 * Sanitizes user input for safe storage and display
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return ''
  }
  
  return input
    .trim()
    .replace(/[\x00-\x1F\x7F]/g, '') // Remove control characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .substring(0, 1000) // Limit length
}

/**
 * Validates email address against injection attacks
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is safe
 */
function isEmailSafe(email) {
  if (typeof email !== 'string') {
    return false
  }
  
  return !SECURITY.DANGEROUS_PATTERNS.some(pattern => pattern.test(email))
}

function getClientId(req) {
    const forwarded = req.headers['x-forwarded-for']
    const ip = typeof forwarded === 'string' ? forwarded.split(',')[0].trim() : 'unknown'
    const userAgent = sanitizeInput(req.headers['user-agent'] || 'unknown')
    
    // Create a hash to prevent header injection
    const hash = crypto.createHash('sha256')
      .update(`${ip}:${userAgent}`)
      .digest('hex')
      .substring(0, 16)
    
    return hash
}

function checkRateLimit(clientId) {
    const now = Date.now()
    const clientData = rateLimit.get(clientId)

    if (clientData) {
        if (clientData.resetTime > now && clientData.count >= CONFIG.RATE_LIMIT) {
            const minutesRemaining = Math.ceil((clientData.resetTime - now) / 1000 / 60)
            return {
                exceeded: true,
                minutesRemaining,
                resetTime: clientData.resetTime
            }
        }

        if (clientData.resetTime <= now) {
            // Reset the counter
            clientData.count = 0
            clientData.resetTime = now + CONFIG.RATE_LIMIT_WINDOW
        }
    }

    return { exceeded: false }
}

function updateRateLimit(clientId) {
    const now = Date.now()
    const clientData = rateLimit.get(clientId)

    if (clientData) {
        clientData.count++
    } else {
        rateLimit.set(clientId, {
            count: 1,
            resetTime: now + CONFIG.RATE_LIMIT_WINDOW
        })
    }

    return rateLimit.get(clientId)
}

function setRateLimitHeaders(res, clientData) {
    res.setHeader('X-RateLimit-Limit', CONFIG.RATE_LIMIT.toString())
    res.setHeader('X-RateLimit-Remaining', Math.max(0, CONFIG.RATE_LIMIT - clientData.count).toString())
    res.setHeader('X-RateLimit-Reset', new Date(clientData.resetTime).toISOString())
}

// CORS middleware
function setCorsHeaders(res) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
}

// Validation utilities
function validateEmail(email) {
    if (!email || typeof email !== 'string') {
        return { valid: false, error: 'Email address is required' }
    }

    const sanitizedEmail = sanitizeInput(email)
    
    if (sanitizedEmail.length > CONFIG.MAX_EMAIL_LENGTH) {
        return { valid: false, error: `Email address too long (max ${CONFIG.MAX_EMAIL_LENGTH} characters)` }
    }

    // Check for security threats
    if (!isEmailSafe(sanitizedEmail)) {
        return { valid: false, error: 'Email contains invalid or potentially dangerous characters' }
    }

    // More comprehensive email validation
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (!emailRegex.test(sanitizedEmail)) {
        return { valid: false, error: 'Please enter a valid email address' }
    }

    // Check for common typos in domains
    const commonDomainTypos = {
        'gmail.co': 'gmail.com',
        'gmail.cm': 'gmail.com',
        'gmial.com': 'gmail.com',
        'yahoo.co': 'yahoo.com',
        'yahoo.cm': 'yahoo.com',
        'hotmail.co': 'hotmail.com',
        'hotmail.cm': 'hotmail.com'
    }

    const domain = sanitizedEmail.split('@')[1]?.toLowerCase()
    if (domain && commonDomainTypos[domain]) {
        return {
            valid: false,
            error: `Did you mean ${sanitizedEmail.replace(domain, commonDomainTypos[domain])}?`,
            suggestion: sanitizedEmail.replace(domain, commonDomainTypos[domain])
        }
    }

    return { valid: true, sanitizedEmail }
}

/**
 * Sanitizes coupon data for safe processing
 * @param {Object} coupon - Coupon object to sanitize
 * @returns {Object} Sanitized coupon object
 */
function sanitizeCoupon(coupon) {
    if (!coupon || typeof coupon !== 'object') {
        return {}
    }
    
    const sanitized = {}
    
    // List of allowed fields and their sanitization
    const allowedFields = {
        ID: sanitizeInput,
        Name: sanitizeInput,
        Description: sanitizeInput,
        Price: sanitizeInput,
        Code: sanitizeInput,
        VirtualCode: sanitizeInput,
        ExpirationDate: sanitizeInput,
        Tags: sanitizeInput,
        Local: (val) => String(val) === 'true' ? 'true' : 'false',
        Bundle: (val) => String(val) === 'true' ? 'true' : 'false'
    }
    
    Object.entries(allowedFields).forEach(([field, sanitizer]) => {
        if (coupon[field] !== undefined && coupon[field] !== null) {
            sanitized[field] = sanitizer(coupon[field])
        }
    })
    
    return sanitized
}

function validateCoupons(coupons) {
    if (!Array.isArray(coupons)) {
        return { valid: false, error: 'Coupons must be provided as an array' }
    }

    if (coupons.length === 0) {
        return { valid: false, error: 'At least one coupon must be selected' }
    }

    if (coupons.length > CONFIG.MAX_COUPONS) {
        return { valid: false, error: `Too many coupons selected (max ${CONFIG.MAX_COUPONS})` }
    }

    const sanitizedCoupons = []

    // Validate and sanitize each coupon
    for (let i = 0; i < coupons.length; i++) {
        const coupon = coupons[i]

        if (!coupon || typeof coupon !== 'object') {
            return { valid: false, error: `Invalid coupon data at position ${i + 1}` }
        }

        const sanitizedCoupon = sanitizeCoupon(coupon)

        // Must have a name
        if (!sanitizedCoupon.Name || !sanitizedCoupon.Name.trim()) {
            return { valid: false, error: `Coupon at position ${i + 1} is missing a name` }
        }

        // Must have either Code or VirtualCode
        const hasCode = (sanitizedCoupon.Code && sanitizedCoupon.Code.trim()) ||
            (sanitizedCoupon.VirtualCode && sanitizedCoupon.VirtualCode.trim())

        if (!hasCode) {
            return { valid: false, error: `Coupon "${sanitizedCoupon.Name}" is missing a valid code` }
        }

        sanitizedCoupons.push(sanitizedCoupon)
    }

    return { valid: true, sanitizedCoupons }
}

function validateStoreInfo(storeInfo) {
    if (!storeInfo || typeof storeInfo !== 'object') {
        return { valid: false, error: 'Store information is required' }
    }

    if (!storeInfo.StoreID) {
        return { valid: false, error: 'Store ID is required' }
    }

    if (typeof storeInfo.StoreID !== 'string' && typeof storeInfo.StoreID !== 'number') {
        return { valid: false, error: 'Store ID must be a valid identifier' }
    }

    return { valid: true }
}

// Email template generation
function generateEmailTemplate(coupons, storeInfo, recipientEmail) {
    const templateData = {
        recipientEmail,
        coupons,
        storeInfo,
        timestamp: new Date().toLocaleString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        })
    }

    return generateBaseTemplate(templateData)
}

// Error response utilities
function createErrorResponse(error, message, statusCode = 400, additionalData = {}) {
    return {
        status: statusCode,
        body: {
            success: false,
            error,
            message,
            timestamp: new Date().toISOString(),
            statusCode,
            ...additionalData
        }
    }
}

function createRateLimitResponse(minutesRemaining, resetTime) {
    return {
        status: 429,
        body: {
            error: 'Rate limit exceeded',
            message: `You have made too many requests. Please wait ${minutesRemaining} minute${minutesRemaining > 1 ? 's' : ''} before trying again.`,
            remaining: 0,
            resetTime
        },
        headers: {
            'X-RateLimit-Limit': CONFIG.RATE_LIMIT.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': new Date(resetTime).toISOString()
        }
    }
}

// Request processing utilities
async function handleMethodValidation(req, res) {
    setCorsHeaders(res)

    if (req.method === 'OPTIONS') {
        res.status(200).end()
        return { shouldReturn: true }
    }

    if (req.method !== 'POST') {
        res.setHeader('Allow', 'POST, OPTIONS')
        res.status(405).json({
            success: false,
            error: 'Method not allowed',
            message: `${req.method} method is not supported. Use POST instead.`,
            allowedMethods: ['POST', 'OPTIONS'],
            timestamp: new Date().toISOString()
        })
        return { shouldReturn: true }
    }

    return { shouldReturn: false }
}

async function handleAuthentication(req, res) {
    const authHeader = req.headers.authorization
    if (!authHeader) {
        res.status(401).json({
            success: false,
            error: 'Missing authorization',
            message: 'Authorization header is required',
            timestamp: new Date().toISOString()
        })
        return { shouldReturn: true }
    }

    if (!authHeader.startsWith('Bearer ')) {
        res.status(401).json({
            success: false,
            error: 'Invalid authorization format',
            message: 'Authorization header must use Bearer token format',
            timestamp: new Date().toISOString()
        })
        return { shouldReturn: true }
    }

    const authToken = authHeader.replace('Bearer ', '')
    if (!authToken || authToken.trim().length === 0) {
        res.status(401).json({
            success: false,
            error: 'Missing token',
            message: 'Authorization token is required',
            timestamp: new Date().toISOString()
        })
        return { shouldReturn: true }
    }

    try {
        if (!verifyToken(authToken)) {
            res.status(401).json({
                success: false,
                error: 'Invalid token',
                message: 'Authorization token is invalid or expired',
                timestamp: new Date().toISOString()
            })
            return { shouldReturn: true }
        }
    } catch (authError) {
        console.error('Token verification error:', authError)
        res.status(401).json({
            success: false,
            error: 'Token verification failed',
            message: 'Unable to verify authorization token',
            timestamp: new Date().toISOString()
        })
        return { shouldReturn: true }
    }

    return { shouldReturn: false }
}

async function handleRateLimiting(req, res) {
    const clientId = getClientId(req)
    cleanupOldEntries()

    const rateLimitResult = checkRateLimit(clientId)
    if (rateLimitResult.exceeded) {
        const response = createRateLimitResponse(rateLimitResult.minutesRemaining, rateLimitResult.resetTime)
        if (response.headers) {
            Object.entries(response.headers).forEach(([key, value]) => {
                res.setHeader(key, value)
            })
        }
        res.status(response.status).json(response.body)
        return { shouldReturn: true, clientId }
    }

    return { shouldReturn: false, clientId }
}

/**
 * Validates request origin for CSRF protection
 * @param {Object} req - Express request object
 * @returns {boolean} True if origin is allowed
 */
function validateOrigin(req) {
    const origin = req.headers.origin
    const referer = req.headers.referer
    
    // In development, allow localhost
    if (process.env.NODE_ENV === 'development' || !process.env.NODE_ENV) {
        return true
    }
    
    // List of allowed origins (configure based on your deployment)
    const allowedOrigins = [
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        process.env.ALLOWED_ORIGIN,
        'http://localhost:5173',  // Vite dev server
        'http://localhost:3000',  // Alternative dev port
        'http://localhost:4173'   // Vite preview
    ].filter(Boolean)
    
    // Check origin header
    if (origin) {
        return allowedOrigins.some(allowed => origin === allowed || origin.endsWith(allowed))
    }
    
    // Fallback to referer header
    if (referer) {
        return allowedOrigins.some(allowed => referer.startsWith(allowed))
    }
    
    return false
}

async function validateRequestData(req, res) {
    // Validate origin for CSRF protection
    if (!validateOrigin(req)) {
        const response = createErrorResponse(
            'Invalid origin',
            'Request origin is not allowed',
            403
        )
        res.status(response.status).json(response.body)
        return { shouldReturn: true }
    }

    // Validate content type
    const contentType = req.headers['content-type']
    if (!contentType || !contentType.includes('application/json')) {
        const response = createErrorResponse(
            'Invalid content type',
            'Request must use application/json content type',
            400,
            { receivedContentType: contentType || 'none' }
        )
        res.status(response.status).json(response.body)
        return { shouldReturn: true }
    }

    const { email, coupons, storeInfo } = req.body

    // Validate request body exists
    if (!req.body || Object.keys(req.body).length === 0) {
        const response = createErrorResponse('Missing request data', 'Request body is required')
        res.status(response.status).json(response.body)
        return { shouldReturn: true }
    }

    // Validate email
    const emailValidation = validateEmail(email)
    if (!emailValidation.valid) {
        const response = createErrorResponse('Invalid email address', emailValidation.error, 400, {
            field: 'email',
            suggestion: emailValidation.suggestion
        })
        res.status(response.status).json(response.body)
        return { shouldReturn: true }
    }

    // Validate coupons
    const couponsValidation = validateCoupons(coupons)
    if (!couponsValidation.valid) {
        const response = createErrorResponse('Invalid coupons data', couponsValidation.error, 400, {
            field: 'coupons'
        })
        res.status(response.status).json(response.body)
        return { shouldReturn: true }
    }

    // Validate store info
    const storeValidation = validateStoreInfo(storeInfo)
    if (!storeValidation.valid) {
        const response = createErrorResponse('Invalid store information', storeValidation.error, 400, {
            field: 'storeInfo'
        })
        res.status(response.status).json(response.body)
        return { shouldReturn: true }
    }

    return { 
        shouldReturn: false, 
        email: emailValidation.sanitizedEmail || email, 
        coupons: couponsValidation.sanitizedCoupons || coupons, 
        storeInfo 
    }
}

/**
 * Processes the email sending request through validation pipeline
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Object|null} Validated data or null if should return early
 */
async function processRequest(req, res) {
    // Handle method validation
    const methodResult = await handleMethodValidation(req, res)
    if (methodResult.shouldReturn) return null

    // Handle authentication
    const authResult = await handleAuthentication(req, res)
    if (authResult.shouldReturn) return null

    // Handle rate limiting
    const rateLimitResult = await handleRateLimiting(req, res)
    if (rateLimitResult.shouldReturn) return null
    const { clientId } = rateLimitResult

    // Validate request data
    const validationResult = await validateRequestData(req, res)
    if (validationResult.shouldReturn) return null
    const { email, coupons, storeInfo } = validationResult

    return { email, coupons, storeInfo, clientId }
}

// Main request handler
export default async function handler(req, res) {
    const startTime = Date.now()
    log('info', 'Email API request received', { method: req.method })

    const requestData = await processRequest(req, res)
    if (!requestData) return

    const { email, coupons, storeInfo, clientId } = requestData



    try {
        // Check email service configuration
        if (!process.env.RESEND_API_KEY) {
            log('error', 'RESEND_API_KEY not configured')
            const response = createErrorResponse(
                'Email service not configured',
                'Email service is temporarily unavailable',
                500
            )
            return res.status(response.status).json(response.body)
        }

        // Generate email content
        let htmlContent
        try {
            htmlContent = generateEmailTemplate(coupons, storeInfo, email)

            // Validate that template was generated successfully
            if (!htmlContent || typeof htmlContent !== 'string' || htmlContent.length < 100) {
                throw new Error('Generated email template is invalid or too short')
            }
        } catch (templateError) {
            log('error', 'Template generation error', { 
                error: templateError.message,
                stack: templateError.stack 
            })
            const response = createErrorResponse(
                'Template generation failed',
                'Failed to generate email content. Please try again.',
                500,
                { templateError: templateError.message }
            )
            return res.status(response.status).json(response.body)
        }

        // Send email
        let emailResult
        try {
            emailResult = await resend.emails.send({
                from: CONFIG.EMAIL_FROM,
                to: [email],
                subject: `Your Domino's Coupons - Store #${storeInfo.StoreID}`,
                html: htmlContent,
            })

            // Validate email result
            if (!emailResult || !emailResult.data) {
                throw new Error('Email service returned invalid response')
            }

            // Check for Resend-specific error responses
            if (emailResult.error) {
                throw new Error(`Resend API error: ${emailResult.error.message || 'Unknown error'}`)
            }

        } catch (emailError) {
            log('error', 'Email sending failed', {
                error: emailError.message,
                stack: emailError.stack,
                email: '[REDACTED]',
                storeId: storeInfo.StoreID
            })
            throw emailError // Re-throw to be handled by outer catch block
        }

        // Update rate limit and set headers
        const updatedData = updateRateLimit(clientId)
        setRateLimitHeaders(res, updatedData)

        const duration = Date.now() - startTime
        log('info', 'Email sent successfully', { 
            emailId: emailResult.data?.id,
            duration,
            storeId: storeInfo.StoreID,
            couponsCount: coupons.length
        })

        return res.status(200).json({
            success: true,
            message: 'Coupons sent successfully',
            emailId: emailResult.data?.id,
            _meta: {
                requestsRemaining: CONFIG.RATE_LIMIT - updatedData.count,
                resetTime: updatedData.resetTime
            }
        })

    } catch (error) {
        console.error('Email sending error:', error)

        // Handle specific Resend errors
        if (error.name === 'ResendError' || error.message?.includes('Resend')) {
            const { errorMessage, statusCode } = getResendErrorDetails(error)
            const response = createErrorResponse('Email service error', errorMessage, statusCode)
            return res.status(response.status).json(response.body)
        }

        // Handle template generation errors
        if (error.message?.includes('template') || error.message?.includes('Template')) {
            const response = createErrorResponse(
                'Template generation error',
                'Failed to generate email content. Please try again.',
                500
            )
            return res.status(response.status).json(response.body)
        }

        // Handle network/connection errors
        if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT') {
            const response = createErrorResponse(
                'Network error',
                'Unable to connect to email service. Please try again later.',
                503
            )
            return res.status(response.status).json(response.body)
        }

        // Handle JSON parsing errors
        if (error instanceof SyntaxError && error.message?.includes('JSON')) {
            const response = createErrorResponse(
                'Invalid request format',
                'Request data is not properly formatted.',
                400
            )
            return res.status(response.status).json(response.body)
        }

        // Generic error handling
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        const response = createErrorResponse(
            'Internal server error',
            'An unexpected error occurred. Please try again later.',
            500
        )

        // Log detailed error for debugging
        console.error('Detailed error info:', {
            message: errorMessage,
            stack: error.stack,
            name: error.name,
            code: error.code,
            timestamp: new Date().toISOString(),
            requestData: {
                email: email ? '[REDACTED]' : 'missing',
                couponsCount: Array.isArray(coupons) ? coupons.length : 'invalid',
                storeId: storeInfo?.StoreID || 'missing'
            }
        })

        return res.status(response.status).json({
            ...response.body,
            debug: process.env.NODE_ENV !== 'production' ? errorMessage : undefined
        })
    }
}

/**
 * Extracts error details from Resend API errors
 * @param {Error} error - Resend error object
 * @returns {Object} Error message and status code
 */
function getResendErrorDetails(error) {
    let errorMessage = 'Failed to send email. Please check your email address and try again.'
    let statusCode = 400

    // Handle specific Resend error types
    if (error.message?.includes('Invalid email')) {
        errorMessage = 'The email address provided is not valid.'
    } else if (error.message?.includes('rate limit') || error.message?.includes('quota')) {
        errorMessage = 'Email service rate limit exceeded. Please try again later.'
        statusCode = 429
    } else if (error.message?.includes('API key')) {
        errorMessage = 'Email service configuration error. Please contact support.'
        statusCode = 500
    } else if (error.message?.includes('timeout')) {
        errorMessage = 'Email service timeout. Please try again.'
        statusCode = 503
    }

    return { errorMessage, statusCode }
}
