/**
 * Email service utilities for sending coupons via email
 */

import type { Coupon, StoreInfo } from "@/types/dominos"
import { EMAIL_CONSTANTS, COMMON_EMAIL_TYPOS, HTTP_STATUS, VALIDATION_PATTERNS } from "@/lib/constants"

export interface SendEmailRequest {
  email: string
  coupons: Coupon[]
  storeInfo: StoreInfo
  language?: string
}

export interface SendEmailResponse {
  success: boolean
  message: string
  emailId?: string
  _meta?: {
    requestsRemaining: number
    resetTime: number
  }
}

export interface EmailError {
  error: string
  message: string
  code?: string
  details?: any
  statusCode?: number
}

// Result type for better error handling
export type EmailResult<T> = {
  success: true
  data: T
} | {
  success: false
  error: EmailError
}

// Email validation result
export interface EmailValidationResult {
  isValid: boolean
  suggestion?: string
  error?: string
}

// HTTP status code mappings
const HTTP_STATUS_HANDLERS = {
  [HTTP_STATUS.UNAUTHORIZED]: () => {
    sessionStorage.removeItem('authToken')
    return 'Session expired. Please refresh the page and try again.'
  },
  [HTTP_STATUS.TOO_MANY_REQUESTS]: (response: Response) => {
    const resetTime = response.headers.get('X-RateLimit-Reset')
    const resetDate = resetTime ? new Date(resetTime) : null
    const minutesRemaining = resetDate ? 
      Math.ceil((resetDate.getTime() - Date.now()) / 1000 / 60) : EMAIL_CONSTANTS.DEFAULT_RATE_LIMIT_MINUTES

    return `Rate limit exceeded. Please wait ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''} before trying again.`
  },
  [HTTP_STATUS.BAD_REQUEST]: (response: Response, data: any) => {
    const errorMessage = data.message || 'Invalid request data'
    
    if (data.field === 'email') {
      return data.suggestion ? 
        `Invalid email address. Did you mean ${data.suggestion}?` : 
        errorMessage
    }
    
    return errorMessage
  },
  [HTTP_STATUS.INTERNAL_SERVER_ERROR]: () => 'Email service is temporarily unavailable. Please try again later.',
  [HTTP_STATUS.SERVICE_UNAVAILABLE]: () => 'Email service is currently unavailable. Please try again in a few minutes.'
} as const

/**
 * Validates the email request data
 * @param request - Email request to validate
 * @throws Error if validation fails
 */
function validateEmailRequest(request: SendEmailRequest): void {
  const { email, coupons, storeInfo } = request

  if (!email?.trim()) {
    throw new Error('Email address is required')
  }

  if (!coupons?.length) {
    throw new Error('At least one coupon must be selected')
  }

  if (!storeInfo?.StoreID) {
    throw new Error('Store information is required')
  }
}

/**
 * Gets authentication token from session storage
 * @returns Authentication token
 * @throws Error if token is not available
 */
function getAuthToken(): string {
  const authToken = sessionStorage.getItem('authToken')
  if (!authToken) {
    throw new Error('Authentication required. Please refresh the page.')
  }
  return authToken
}

/**
 * Handles HTTP response errors based on status code
 * @param response - Fetch response object
 * @param responseData - Parsed response data
 * @throws Error with appropriate message
 */
function handleHttpError(response: Response, responseData: any): never {
  const status = response.status as keyof typeof HTTP_STATUS_HANDLERS
  const handler = HTTP_STATUS_HANDLERS[status]
  
  if (handler) {
    const errorMessage = handler(response, responseData)
    throw new Error(errorMessage)
  }

  // Handle other HTTP errors
  throw new Error(responseData.message || `Request failed with status ${response.status}`)
}

/**
 * Handles fetch-related errors
 * @param error - Error from fetch operation
 * @throws Error with user-friendly message
 */
function handleFetchError(error: unknown): never {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    throw new Error('Network error. Please check your connection and try again.')
  }

  if (error instanceof SyntaxError) {
    throw new Error('Invalid response from server. Please try again.')
  }

  if (error instanceof Error) {
    throw error
  }

  throw new Error('An unexpected error occurred. Please try again.')
}

/**
 * Makes the API request to send coupons via email
 * @param requestBody - Request payload
 * @param authToken - Authentication token
 * @returns Promise resolving to API response
 */
async function makeEmailApiRequest(requestBody: object, authToken: string): Promise<Response> {
  return fetch(EMAIL_CONSTANTS.API_ENDPOINT, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${authToken}`
    },
    body: JSON.stringify(requestBody)
  })
}

/**
 * Sends selected coupons to the specified email address
 * @param request - Email request data
 * @returns Promise resolving to email response
 * @throws Error with user-friendly message on failure
 */
export async function sendCouponsEmail(request: SendEmailRequest): Promise<SendEmailResponse> {
  // Validate input data
  validateEmailRequest(request)
  
  // Get authentication token
  const authToken = getAuthToken()

  // Prepare request body
  const { email, coupons, storeInfo, language = EMAIL_CONSTANTS.DEFAULT_LANGUAGE } = request
  const requestBody = {
    email: email.trim(),
    coupons,
    storeInfo,
    language
  }

  try {
    // Make API request
    const response = await makeEmailApiRequest(requestBody, authToken)
    
    // Parse response
    const responseData = await response.json()

    // Handle HTTP errors
    if (!response.ok) {
      handleHttpError(response, responseData)
    }

    // Check if response indicates success
    if (!responseData.success) {
      throw new Error(responseData.message || 'Failed to send email')
    }

    return responseData as SendEmailResponse

  } catch (error) {
    handleFetchError(error)
  }
}

/**
 * Validates email address format using RFC 5322 compliant regex
 * @param email - Email address to validate
 * @returns True if email is valid, false otherwise
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') {
    return false
  }

  // More comprehensive email validation regex
  const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/
  
  const trimmedEmail = email.trim()
  
  // Check length constraints
  if (trimmedEmail.length > EMAIL_CONSTANTS.MAX_EMAIL_LENGTH) {
    return false
  }
  
  // Check for common invalid patterns
  if (trimmedEmail.includes('..') || trimmedEmail.startsWith('.') || trimmedEmail.endsWith('.')) {
    return false
  }
  
  return VALIDATION_PATTERNS.EMAIL.test(trimmedEmail)
}

/**
 * Suggests corrections for common email typos
 * @param email - Email address to check
 * @returns Suggested correction or null if no suggestion
 */
export function suggestEmailCorrection(email: string): string | null {
  if (!email || typeof email !== 'string') {
    return null
  }



  const domain = email.split('@')[1]?.toLowerCase()
  if (domain && COMMON_EMAIL_TYPOS[domain]) {
    return email.replace(domain, COMMON_EMAIL_TYPOS[domain])
  }

  return null
}

/**
 * Formats coupon count for display
 * @param count - Number of coupons
 * @returns Formatted string
 */
export function formatCouponCount(count: number): string {
  return `${count} coupon${count !== 1 ? 's' : ''}`
}

/**
 * Validates email address with detailed feedback
 * @param email - Email address to validate
 * @returns Validation result with suggestions
 */
export function validateEmailWithFeedback(email: string): EmailValidationResult {
  if (!email || typeof email !== 'string') {
    return {
      isValid: false,
      error: 'Email address is required'
    }
  }

  const trimmedEmail = email.trim()
  
  if (!trimmedEmail) {
    return {
      isValid: false,
      error: 'Email address cannot be empty'
    }
  }

  if (trimmedEmail.length > EMAIL_CONSTANTS.MAX_EMAIL_LENGTH) {
    return {
      isValid: false,
      error: `Email address is too long (maximum ${EMAIL_CONSTANTS.MAX_EMAIL_LENGTH} characters)`
    }
  }

  const suggestion = suggestEmailCorrection(trimmedEmail)
  if (suggestion) {
    return {
      isValid: false,
      error: 'Email address appears to have a typo',
      suggestion
    }
  }

  if (!isValidEmail(trimmedEmail)) {
    return {
      isValid: false,
      error: 'Please enter a valid email address'
    }
  }

  return { isValid: true }
}

/**
 * Extracts error message from API error response
 * @param error - Error object or response
 * @returns User-friendly error message
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === 'object' && error !== null) {
    const errorObj = error as any
    return errorObj.message || errorObj.error || 'An unknown error occurred'
  }

  return 'An unexpected error occurred'
}

/**
 * Creates a safe email API client with retry logic
 * @param maxRetries - Maximum number of retry attempts
 * @param retryDelay - Delay between retries in milliseconds
 */
export function createEmailApiClient(
  maxRetries = EMAIL_CONSTANTS.RETRY_CONFIG.MAX_ATTEMPTS, 
  retryDelay = EMAIL_CONSTANTS.RETRY_CONFIG.DELAY_MS
) {
  return {
    async sendEmail(request: SendEmailRequest): Promise<EmailResult<SendEmailResponse>> {
      let lastError: Error | null = null

      for (let attempt = 1; attempt <= maxRetries; attempt++) {
        try {
          const result = await sendCouponsEmail(request)
          return { success: true, data: result }
        } catch (error) {
          lastError = error instanceof Error ? error : new Error('Unknown error')
          
          // Don't retry on client errors (4xx) except rate limiting
          if (lastError.message.includes('400') && !lastError.message.includes('rate limit')) {
            break
          }

          // Wait before retrying (except on last attempt)
          if (attempt < maxRetries) {
            await new Promise(resolve => setTimeout(resolve, retryDelay * attempt))
          }
        }
      }

      return {
        success: false,
        error: {
          error: 'Email send failed',
          message: lastError?.message || 'Failed to send email after multiple attempts',
          code: 'SEND_FAILED'
        }
      }
    }
  }
}