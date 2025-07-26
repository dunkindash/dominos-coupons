import { useState, useCallback } from "react"
import { createEmailApiClient, type SendEmailRequest, type SendEmailResponse, type EmailResult } from "@/lib/email-utils"

interface UseEmailApiState {
  isLoading: boolean
  error: string | null
  lastResponse: SendEmailResponse | null
}

const INITIAL_STATE: UseEmailApiState = {
  isLoading: false,
  error: null,
  lastResponse: null
}

/**
 * Custom hook for email API operations with retry logic
 * @param maxRetries - Maximum retry attempts
 * @param retryDelay - Delay between retries
 */
export function useEmailApi(maxRetries = 3, retryDelay = 1000) {
  const [state, setState] = useState<UseEmailApiState>(INITIAL_STATE)
  
  const emailClient = createEmailApiClient(maxRetries, retryDelay)

  const sendEmail = useCallback(async (request: SendEmailRequest): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const result: EmailResult<SendEmailResponse> = await emailClient.sendEmail(request)
      
      if (result.success) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          lastResponse: result.data,
          error: null
        }))
        return true
      } else {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: result.error.message,
          lastResponse: null
        }))
        return false
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unexpected error occurred'
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
        lastResponse: null
      }))
      return false
    }
  }, [emailClient])

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }))
  }, [])

  const reset = useCallback(() => {
    setState(INITIAL_STATE)
  }, [])

  return {
    ...state,
    sendEmail,
    clearError,
    reset
  }
}