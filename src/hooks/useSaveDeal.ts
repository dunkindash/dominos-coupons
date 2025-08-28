import { useCallback } from "react";
import { useDealTracker } from "./useDealTracker";
import type { Coupon, StoreInfo } from "@/types/dominos";

// Helper function to extract category from coupon
function extractCouponCategory(coupon: Coupon): string {
  const name = (coupon.Name || "").toLowerCase();
  const description = (coupon.Description || "").toLowerCase();
  const text = `${name} ${description}`;

  if (text.includes("wing")) return "wings";
  if (text.includes("pasta")) return "pasta";
  if (text.includes("sandwich")) return "sandwich";
  if (text.includes("bread") || text.includes("side")) return "sides";
  if (
    text.includes("dessert") ||
    text.includes("cookie") ||
    text.includes("brownie")
  )
    return "desserts";
  if (
    text.includes("drink") ||
    text.includes("soda") ||
    text.includes("beverage")
  )
    return "drinks";
  if (
    text.includes("bundle") ||
    text.includes("combo") ||
    text.includes("deal")
  )
    return "bundles";

  return "pizza"; // Default category
}

// Hook for easy integration with saving deals
export function useSaveDeal() {
  const { saveDeal, removeSavedDeal, savedDeals } = useDealTracker();

  const toggleSaveDeal = useCallback(
    (coupon: Coupon, storeInfo: StoreInfo) => {
      const existingSavedDeal = savedDeals.find(
        (deal) =>
          deal.coupon.ID === coupon.ID ||
          (deal.coupon.Name === coupon.Name &&
            deal.storeInfo.StoreID === storeInfo.StoreID),
      );

      if (existingSavedDeal) {
        removeSavedDeal(existingSavedDeal.id);
        return false; // Deal was removed
      } else {
        const category = extractCouponCategory(coupon);
        saveDeal(coupon, storeInfo, [category], "Saved from coupon browser");
        return true; // Deal was saved
      }
    },
    [saveDeal, removeSavedDeal, savedDeals],
  );

  const isDealSaved = useCallback(
    (coupon: Coupon, storeInfo: StoreInfo) => {
      return savedDeals.some(
        (deal) =>
          deal.coupon.ID === coupon.ID ||
          (deal.coupon.Name === coupon.Name &&
            deal.storeInfo.StoreID === storeInfo.StoreID),
      );
    },
    [savedDeals],
  );

  return {
    toggleSaveDeal,
    isDealSaved,
    savedDeals,
    extractCouponCategory,
  };
}
