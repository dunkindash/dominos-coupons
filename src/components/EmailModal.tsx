import { useEffect, useCallback, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card"
import CouponSelector from "@/components/CouponSelector"
import { cn } from "@/lib/utils"
import { useEmailModal } from "@/hooks/useEmailModal"
import type { Coupon, StoreInfo } from "@/types/dominos"

interface EmailModalProps {
  isOpen: boolean
  onClose: () => void
  coupons: Coupon[]
  storeInfo: StoreInfo | null
}

export default function EmailModal({
  isOpen,
  onClose,
  coupons,
  storeInfo
}: EmailModalProps) {
  const {
    formState,
    errors,
    uiState,
    isFormValid,
    updateEmail,
    updateSelectedCoupons,
    handleEmailBlur,
    handleSubmit,
    retrySubmit,
    resetForm
  } = useEmailModal()

  // Reset form when modal opens
  useEffect(() => {
    if (isOpen) {
      resetForm()
    }
  }, [isOpen, resetForm])

  const handleFormSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    await handleSubmit(coupons, storeInfo, onClose)
  }, [handleSubmit, coupons, storeInfo, onClose])

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !formState.isSubmitting) {
      onClose()
    }
  }, [onClose, formState.isSubmitting])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Escape" && !formState.isSubmitting) {
      onClose()
    }
  }, [onClose, formState.isSubmitting])

  // Memoize computed values to prevent unnecessary re-renders
  const selectedCount = useMemo(() => formState.selectedCoupons.length, [formState.selectedCoupons.length])
  
  const modalTitle = useMemo(() => 
    storeInfo ? `Email Coupons - Store #${storeInfo.StoreID}` : 'Email Coupons',
    [storeInfo]
  )
  
  const availableCouponsText = useMemo(() => 
    `${coupons.length} coupon${coupons.length !== 1 ? 's' : ''} available`,
    [coupons.length]
  )

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      <Card className="w-full sm:max-w-lg max-h-[90vh] sm:max-h-[85vh] overflow-hidden flex flex-col rounded-b-none sm:rounded-b-lg animate-in slide-in-from-bottom sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 shadow-2xl border-0">
        <CardHeader className="flex-shrink-0 bg-gradient-to-r from-[#006491] to-[#0087c3] text-white pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
              </svg>
              <CardTitle id="email-modal-title" className="text-lg font-bold">
                {modalTitle}
              </CardTitle>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 sm:h-8 sm:w-8 -mr-2 rounded-full hover:bg-white/20 text-white transition-colors"
              aria-label="Close modal"
            >
              <svg
                className="h-4 w-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </Button>
          </div>
          {storeInfo && (
            <p className="text-sm text-blue-100 mt-1">
              <span className="inline-flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                {availableCouponsText}
              </span>
            </p>
          )}
        </CardHeader>

        <form onSubmit={handleFormSubmit} className="flex flex-col flex-1 overflow-hidden">
          <CardContent className="space-y-4 flex-1 overflow-y-auto px-4 sm:px-6">
            {/* Success Message */}
            {uiState.successMessage && (
              <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200 shadow-sm" role="status" aria-live="polite">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <svg
                      className="h-5 w-5 text-green-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-green-800">🎉 Email sent successfully!</h4>
                    <p className="text-sm text-green-700 mt-1">{uiState.successMessage}</p>
                    <p className="text-xs text-green-600 mt-2">
                      Check your inbox in a few moments. If you don't see the email, please check your spam folder.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Submit Error Message */}
            {errors.submit && (
              <div className="p-4 rounded-lg bg-red-50 border-2 border-red-200 shadow-sm" role="alert">
                <div className="flex items-start gap-2">
                  <svg
                    className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-red-800">{errors.submit}</p>
                    {errors.submit.includes('rate limit') && (
                      <p className="text-xs text-red-600 mt-1">
                        Try again later or contact support if this persists.
                      </p>
                    )}
                    {!errors.submit.includes('rate limit') && !errors.submit.includes('Invalid') && (
                      <button
                        type="button"
                        onClick={() => retrySubmit(coupons, storeInfo, onClose)}
                        className="mt-2 text-xs text-red-700 hover:text-red-900 underline focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-1 rounded"
                        disabled={formState.isSubmitting}
                      >
                        {uiState.isRetrying ? 'Retrying...' : 'Retry'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <svg className="w-4 h-4 text-[#006491]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                </svg>
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(e) => updateEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="your@email.com"
                className={cn(
                  "h-11 text-base",
                  errors.email && "border-red-500 focus-visible:ring-red-500"
                )}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "email-error" : undefined}
                disabled={formState.isSubmitting}
              />
              {errors.email && (
                <p id="email-error" className="text-sm text-destructive">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <svg className="w-4 h-4 text-[#E31837]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Select Coupons
                </label>
                <span className="text-sm font-medium text-[#006491]">
                  {formState.selectedCoupons.length} of {coupons.length} selected
                </span>
              </div>
              <div className="max-h-[40vh] sm:max-h-[35vh] overflow-y-auto border-2 border-gray-200 rounded-lg bg-gray-50">
                <CouponSelector
                  coupons={coupons}
                  selectedCoupons={formState.selectedCoupons}
                  onSelectionChange={updateSelectedCoupons}
                />
              </div>
              {errors.selection && (
                <p className="text-sm text-destructive mt-1">
                  {errors.selection}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex gap-3 flex-shrink-0 border-t-2 bg-gray-50 px-4 sm:px-6 pb-6 sm:pb-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={formState.isSubmitting}
              className="flex-1 h-11 font-medium"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="destructive"
              disabled={
                formState.isSubmitting ||
                !isFormValid ||
                !!uiState.successMessage
              }
              className={cn(
                "flex-1 h-11 bg-[#E31837] hover:bg-[#c41230] font-semibold touch-manipulation transition-all shadow-md hover:shadow-lg",
                uiState.successMessage && "bg-green-600 hover:bg-green-600"
              )}
            >
              {formState.isSubmitting ? (
                <>
                  <svg
                    className="animate-spin -ml-1 mr-2 h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Sending...
                </>
              ) : uiState.successMessage ? (
                <>
                  <svg
                    className="h-4 w-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Email Sent!
                </>
              ) : (
                `Send ${selectedCount} Coupon${selectedCount !== 1 ? 's' : ''}`
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}