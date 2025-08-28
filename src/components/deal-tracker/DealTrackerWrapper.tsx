import { useEffect, useState } from "react";
import { useDealTracker } from "@/hooks/useDealTracker";
import DealDashboard from "./DealDashboard";
import PreferencesModal from "./PreferencesModal";
import DealNotifications from "./DealNotifications";
import { Button } from "@/components/ui/button";
import type { Coupon, StoreInfo } from "@/types/dominos";

interface DealTrackerWrapperProps {
  currentCoupons: Coupon[];
  currentStoreInfo: StoreInfo | null;
  onCouponView?: (coupon: Coupon, storeInfo: StoreInfo) => void;
  className?: string;
}

export default function DealTrackerWrapper({
  currentCoupons,
  currentStoreInfo,
  onCouponView,
  className = "",
}: DealTrackerWrapperProps) {
  const { trackCouponView, personalStats, savedDeals, favoriteStores } =
    useDealTracker();
  const [showDashboard, setShowDashboard] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);

  // Auto-track coupon views when coupons change
  useEffect(() => {
    if (currentCoupons.length > 0 && currentStoreInfo) {
      // Track that user viewed this store's coupons
      // We'll track individual coupon views when they interact with them
      currentCoupons.slice(0, 3).forEach((coupon) => {
        trackCouponView(coupon, currentStoreInfo);
        onCouponView?.(coupon, currentStoreInfo);
      });
    }
  }, [currentCoupons, currentStoreInfo, trackCouponView, onCouponView]);

  const toggleDashboard = () => {
    setShowDashboard(!showDashboard);
  };

  const openPreferences = () => {
    setShowPreferences(true);
  };

  const closePreferences = () => {
    setShowPreferences(false);
  };

  // Show compact stats when dashboard is closed
  if (!showDashboard) {
    return (
      <div className={`space-y-4 ${className}`}>
        {/* Deal Notifications */}
        <DealNotifications />

        <div className="dominos-card-compact">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-2">
                <span className="text-lg">📊</span>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Smart Deal Tracker
                  </p>
                  <p className="text-xs text-gray-600">
                    {personalStats.totalDealsViewed} deals viewed •{" "}
                    {savedDeals.length} saved
                  </p>
                </div>
              </div>

              {favoriteStores.length > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm">⭐</span>
                  <span className="text-xs text-gray-600">
                    {favoriteStores.length} favorite store
                    {favoriteStores.length !== 1 ? "s" : ""}
                  </span>
                </div>
              )}

              {personalStats.estimatedTotalSavings > 0 && (
                <div className="flex items-center space-x-2">
                  <span className="text-sm">💰</span>
                  <span className="text-xs text-dominos-red font-medium">
                    ${personalStats.estimatedTotalSavings.toFixed(0)} saved
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Button
                onClick={openPreferences}
                variant="outline"
                size="sm"
                className="text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
              >
                <span className="mr-1">⚙️</span>
                Settings
              </Button>
              <Button
                onClick={toggleDashboard}
                variant="outline"
                size="sm"
                className="text-xs border-dominos-red text-dominos-red hover:bg-dominos-red hover:text-white"
              >
                <span className="mr-1">📊</span>
                Open Dashboard
              </Button>
            </div>
          </div>

          <PreferencesModal
            isOpen={showPreferences}
            onClose={closePreferences}
          />
        </div>
      </div>
    );
  }

  // Show full dashboard when expanded
  return (
    <div className={`space-y-4 ${className}`}>
      {/* Deal Notifications */}
      <DealNotifications />

      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Button
              onClick={toggleDashboard}
              variant="outline"
              size="sm"
              className="text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <span className="mr-1">📊</span>
              Collapse Dashboard
            </Button>
            <Button
              onClick={openPreferences}
              variant="outline"
              size="sm"
              className="text-xs border-gray-300 text-gray-600 hover:bg-gray-50"
            >
              <span className="mr-1">⚙️</span>
              Preferences
            </Button>
          </div>
        </div>

        <DealDashboard
          currentCoupons={currentCoupons}
          currentStoreInfo={currentStoreInfo}
        />

        <PreferencesModal isOpen={showPreferences} onClose={closePreferences} />
      </div>
    </div>
  );
}
