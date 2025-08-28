import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { useDealTracker } from "@/hooks/useDealTracker";
import { useSaveDeal } from "@/hooks/useSaveDeal";
import type { Coupon, StoreInfo } from "@/types/dominos";

interface SaveDealButtonProps {
  coupon: Coupon;
  storeInfo: StoreInfo;
  size?: "sm" | "lg" | "default";
  variant?: "default" | "outline" | "ghost";
  className?: string;
  onSaved?: () => void;
}

export default function SaveDealButton({
  coupon,
  storeInfo,
  size = "sm",
  variant = "outline",
  className = "",
  onSaved,
}: SaveDealButtonProps) {
  const { trackCouponView, saveDeal, removeSavedDeal } = useDealTracker();
  const { savedDeals, extractCouponCategory } = useSaveDeal();
  const [isLoading, setIsLoading] = useState(false);

  // Check if this deal is already saved
  const existingSavedDeal = savedDeals.find(
    (deal) =>
      deal.coupon.ID === coupon.ID ||
      (deal.coupon.Name === coupon.Name &&
        deal.storeInfo.StoreID === storeInfo.StoreID),
  );

  const isSaved = Boolean(existingSavedDeal);

  const handleClick = useCallback(async () => {
    if (isLoading) return;

    setIsLoading(true);

    try {
      // Track that user interacted with this coupon
      trackCouponView(coupon, storeInfo);

      if (isSaved && existingSavedDeal) {
        // Remove from saved deals
        removeSavedDeal(existingSavedDeal.id);
      } else {
        // Save the deal with automatic category detection
        const category = extractCouponCategory(coupon);
        saveDeal(coupon, storeInfo, [category], `Saved from coupon browser`);
      }

      onSaved?.();
    } catch (error) {
      console.error("Error saving/removing deal:", error);
    } finally {
      setIsLoading(false);
    }
  }, [
    coupon,
    storeInfo,
    isSaved,
    existingSavedDeal,
    isLoading,
    trackCouponView,
    saveDeal,
    removeSavedDeal,
    onSaved,
    extractCouponCategory,
  ]);

  const getButtonText = () => {
    if (isLoading) return "...";
    return isSaved ? "Saved" : "Save Deal";
  };

  const getButtonIcon = () => {
    if (isLoading) return "⏳";
    return isSaved ? "💾" : "🔖";
  };

  return (
    <Button
      onClick={handleClick}
      variant={isSaved ? "default" : variant}
      size={size}
      disabled={isLoading}
      className={`transition-all duration-200 ${
        isSaved
          ? "bg-dominos-red hover:bg-red-600 text-white"
          : "border-dominos-red text-dominos-red hover:bg-dominos-red hover:text-white"
      } ${className}`}
    >
      <span className="mr-1">{getButtonIcon()}</span>
      {getButtonText()}
    </Button>
  );
}
