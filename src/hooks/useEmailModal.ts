import { useState, useCallback, useMemo } from "react"
import { useDebounce } from "@/hooks/useDebounce"
import { getCouponId } from "@/lib/coupon-utils"
import { sendCouponsEmail, getErrorMessage, validateEmailWithFeedback } from "@/lib/email-utils"
import type { Coupon, StoreInfo } from "@/types/dominos"

interface EmailFormState {
  email: string
  selectedCoupons: string[]
  isSubmitting: boolean
}

interface EmailFormErrors {
  email?: string
  selection?: string
  submit?: string
}

interface EmailUIState {
  successMessage?: string
  retryCount?: number
  isRetrying?: boolean
}

const INITIAL_FORM_STATE: EmailFormState = {
  email: '',
  selectedCoupons: [],
  isSubmitting: false
}

const INITIAL_ERRORS: EmailFormErrors = {}
const INITIAL_UI_STATE: EmailUIState = {}

export function useEmailModal() {
  const [formState, setFormState] = useState<EmailFormState>(INITIAL_FORM_STATE)
  const [errors, setErrors] = useState<EmailFormErrors>(INITIAL_ERRORS)
  const [uiState, setUIState] = useState<EmailUIState>(INITIAL_UI_STATE)

  // Email validation using improved validation function
  const validateEmail = useCallback((email: string): string | undefined => {
    const validation = validateEmailWithFeedback(email)
    
    if (!validation.isValid) {
      return validation.suggestion 
        ? `${validation.error}. Did you mean ${validation.suggestion}?`
        : validation.error
    }
    
    return undefined
  }, [])

  // Debounce email for validation
  const debouncedEmail = useDebounce(formState.email, 300)

  // Update email with validation
  const updateEmail = useCallback((email: string) => {
    setFormState(prev => ({ ...prev, email }))
    
    // Clear previous errors
    if (errors.email) {
      setErrors(prev => ({ ...prev, email: undefined }))
    }
    if (uiState.successMessage) {
      setUIState(prev => ({ ...prev, successMessage: undefined }))
    }
  }, [errors.email, uiState.successMessage])

  // Update selected coupons
  const updateSelectedCoupons = useCallback((selectedCoupons: string[]) => {
    setFormState(prev => ({ ...prev, selectedCoupons }))
    
    // Clear selection error when coupons are selected
    if (selectedCoupons.length > 0 && errors.selection) {
      setErrors(prev => ({ ...prev, selection: undefined }))
    }
    if (uiState.successMessage) {
      setUIState(prev => ({ ...prev, successMessage: undefined }))
    }
  }, [errors.selection, uiState.successMessage])

  // Handle email blur validation with debounced value
  const handleEmailBlur = useCallback(() => {
    const emailError = validateEmail(debouncedEmail)
    setErrors(prev => ({ ...prev, email: emailError }))
  }, [debouncedEmail, validateEmail])

  // Get selected coupon objects
  const getSelectedCoupons = useCallback((allCoupons: Coupon[]) => {
    return allCoupons.filter(coupon => {
      const couponId = getCouponId(coupon)
      return formState.selectedCoupons.includes(couponId)
    })
  }, [formState.selectedCoupons])

  // Form validation
  const validateForm = useCallback(() => {
    const newErrors: EmailFormErrors = {}
    
    // Validate email
    const emailError = validateEmail(formState.email)
    if (emailError) {
      newErrors.email = emailError
    }
    
    // Validate coupon selection
    if (formState.selectedCoupons.length === 0) {
      newErrors.selection = 'Please select at least one coupon'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }, [formState.email, formState.selectedCoupons.length, validateEmail])

  // Reset form
  const resetForm = useCallback(() => {
    setFormState(INITIAL_FORM_STATE)
    setErrors(INITIAL_ERRORS)
    setUIState(INITIAL_UI_STATE)
  }, [])

  // Handle form submission
  const handleSubmit = useCallback(async (
    allCoupons: Coupon[],
    storeInfo: StoreInfo | null,
    onClose: () => void
  ) => {
    // Clear previous errors and messages
    setErrors(INITIAL_ERRORS)
    setUIState(INITIAL_UI_STATE)
    
    // Validate form
    if (!validateForm()) {
      return
    }

    // Validate store info
    if (!storeInfo) {
      setErrors({ submit: 'Store information is required' })
      return
    }
    
    setFormState(prev => ({ ...prev, isSubmitting: true }))
    
    try {
      const selectedCoupons = getSelectedCoupons(allCoupons)
      
      // Send email using the email service
      await sendCouponsEmail({
        email: formState.email,
        coupons: selectedCoupons,
        storeInfo,
        language: 'en' // TODO: Get from app context if needed
      })
      
      // Show success message with coupon count
      const couponCount = selectedCoupons.length
      setUIState({ 
        successMessage: `${couponCount} coupon${couponCount !== 1 ? 's' : ''} sent to ${formState.email}` 
      })
      
      // Close modal after a longer delay to allow user to read success message
      setTimeout(() => {
        onClose()
        // Reset form after closing
        setTimeout(resetForm, 300)
      }, 3500)
      
    } catch (error) {
      const errorMessage = getErrorMessage(error)
      
      // Enhance error message based on error type
      let enhancedMessage = errorMessage
      if (errorMessage.includes('Network error') || errorMessage.includes('fetch')) {
        enhancedMessage = 'Unable to connect to the email service. Please check your internet connection and try again.'
      } else if (errorMessage.includes('Authentication')) {
        enhancedMessage = 'Your session has expired. Please refresh the page and try again.'
      } else if (errorMessage.includes('temporarily unavailable')) {
        enhancedMessage = 'The email service is temporarily unavailable. Please try again in a few minutes.'
      }
      
      setErrors({ submit: enhancedMessage })
      
      // Log error for debugging (in development)
      if (process.env.NODE_ENV === 'development') {
        console.error('Email send error:', error)
      }
    } finally {
      setFormState(prev => ({ ...prev, isSubmitting: false }))
    }
  }, [formState.email, validateForm, getSelectedCoupons, resetForm])

  // Retry last failed submission
  const retrySubmit = useCallback(async (
    allCoupons: Coupon[],
    storeInfo: StoreInfo | null,
    onClose: () => void
  ) => {
    setUIState(prev => ({ 
      ...prev, 
      retryCount: (prev.retryCount || 0) + 1,
      isRetrying: true 
    }))
    
    // Clear previous errors before retrying
    setErrors(prev => ({ ...prev, submit: undefined }))
    
    // Small delay to show retry state
    await new Promise(resolve => setTimeout(resolve, 300))
    
    setUIState(prev => ({ ...prev, isRetrying: false }))
    await handleSubmit(allCoupons, storeInfo, onClose)
  }, [handleSubmit])

  // Computed values
  const isFormValid = useMemo(() => {
    return formState.email.trim() !== '' && 
           formState.selectedCoupons.length > 0 && 
           !errors.email && 
           !errors.selection
  }, [formState.email, formState.selectedCoupons.length, errors.email, errors.selection])

  return {
    formState,
    errors,
    uiState,
    isFormValid,
    updateEmail,
    updateSelectedCoupons,
    handleEmailBlur,
    handleSubmit,
    retrySubmit,
    resetForm,
    getSelectedCoupons
  }
}