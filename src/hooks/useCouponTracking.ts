import { useCallback } from "react";
import { useDealTracker } from "./useDealTracker";
import type { Coupon, StoreInfo } from "@/types/dominos";

// Hook for easy integration with existing coupon components
export function useCouponTracking() {
  const { trackCouponView, saveDeal } = useDealTracker();

  const onCouponView = useCallback(
    (coupon: Coupon, storeInfo: StoreInfo) => {
      trackCouponView(coupon, storeInfo);
    },
    [trackCouponView],
  );

  const onSaveDeal = useCallback(
    (coupon: Coupon, storeInfo: StoreInfo, tags?: string[], notes?: string) => {
      saveDeal(coupon, storeInfo, tags, notes);
    },
    [saveDeal],
  );

  return {
    onCouponView,
    onSaveDeal,
  };
}
