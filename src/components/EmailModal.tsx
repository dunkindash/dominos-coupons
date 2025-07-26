import { useEffect, useCallback } from "react"
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
  const selectedCount = formState.selectedCoupons.length

  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-modal="true"
      aria-labelledby="email-modal-title"
    >
      <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle id="email-modal-title" className="text-lg font-semibold">
              Email Coupons
            </CardTitle>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-8 w-8 rounded-full"
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
            <p className="text-sm text-muted-foreground">
              Store #{storeInfo.StoreID} • {coupons.length} coupons available
            </p>
          )}
        </CardHeader>

        <form onSubmit={handleFormSubmit}>
          <CardContent className="space-y-4">
            {/* Success Message */}
            {uiState.successMessage && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-green-600"
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
                  <p className="text-sm text-green-800">{uiState.successMessage}</p>
                </div>
              </div>
            )}

            {/* Submit Error Message */}
            {errors.submit && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 text-red-600"
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
                  <p className="text-sm text-red-800">{errors.submit}</p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email Address
              </label>
              <Input
                id="email"
                type="email"
                value={formState.email}
                onChange={(e) => updateEmail(e.target.value)}
                onBlur={handleEmailBlur}
                placeholder="Enter your email address"
                className={cn(
                  errors.email && "border-destructive focus-visible:border-destructive"
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

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Select Coupons
              </label>
              <CouponSelector
                coupons={coupons}
                selectedCoupons={formState.selectedCoupons}
                onSelectionChange={updateSelectedCoupons}
              />
              {errors.selection && (
                <p className="text-sm text-destructive">
                  {errors.selection}
                </p>
              )}
            </div>
          </CardContent>

          <CardFooter className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={formState.isSubmitting}
              className="flex-1"
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
              className="flex-1 bg-red-600 hover:bg-red-700"
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
                "Email Sent!"
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