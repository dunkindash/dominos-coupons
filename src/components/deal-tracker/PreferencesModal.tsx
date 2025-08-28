import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { useDealTracker } from "@/hooks/useDealTracker";
import type {
  UserPreferences,
  DealCategory,
  TimeOfDay,
} from "@/types/deal-tracker";

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEAL_CATEGORIES: { value: DealCategory; label: string; icon: string }[] =
  [
    { value: "pizza", label: "Pizza", icon: "🍕" },
    { value: "wings", label: "Wings", icon: "🍗" },
    { value: "sides", label: "Sides", icon: "🥖" },
    { value: "desserts", label: "Desserts", icon: "🍪" },
    { value: "drinks", label: "Drinks", icon: "🥤" },
    { value: "bundles", label: "Bundles", icon: "📦" },
    { value: "specialty", label: "Specialty", icon: "⭐" },
    { value: "limited_time", label: "Limited Time", icon: "⏰" },
  ];

const ORDER_TIMES: { value: TimeOfDay; label: string; icon: string }[] = [
  { value: "breakfast", label: "Breakfast", icon: "🌅" },
  { value: "lunch", label: "Lunch", icon: "☀️" },
  { value: "dinner", label: "Dinner", icon: "🌆" },
  { value: "late_night", label: "Late Night", icon: "🌙" },
  { value: "anytime", label: "Anytime", icon: "🕐" },
];

const ORDER_FREQUENCIES = [
  { value: "daily", label: "Daily" },
  { value: "weekly", label: "Weekly" },
  { value: "monthly", label: "Monthly" },
  { value: "rarely", label: "Rarely" },
] as const;

export default function PreferencesModal({
  isOpen,
  onClose,
}: PreferencesModalProps) {
  const { userPreferences, updateUserPreferences } = useDealTracker();

  const [localPreferences, setLocalPreferences] =
    useState<UserPreferences>(userPreferences);

  useEffect(() => {
    setLocalPreferences(userPreferences);
  }, [userPreferences, isOpen]);

  const handleSave = () => {
    updateUserPreferences(localPreferences);
    onClose();
  };

  const handleCancel = () => {
    setLocalPreferences(userPreferences);
    onClose();
  };

  const updateLocalPreferences = (updates: Partial<UserPreferences>) => {
    setLocalPreferences((prev) => ({ ...prev, ...updates }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="dominos-heading-lg text-gray-900">
              Deal Preferences
            </h2>
            <p className="dominos-subheading text-sm mt-1">
              Customize your deal tracking experience
            </p>
          </div>
          <Button
            onClick={onClose}
            variant="outline"
            size="sm"
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </Button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-8">
          {/* Preferred Categories */}
          <div>
            <h3 className="dominos-heading-md text-gray-900 mb-4">
              Favorite Food Categories
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select the types of deals you're most interested in
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {DEAL_CATEGORIES.map((category) => (
                <button
                  key={category.value}
                  type="button"
                  onClick={() => {
                    const currentCategories =
                      localPreferences.preferredCategories;
                    const isSelected = currentCategories.includes(
                      category.value,
                    );

                    updateLocalPreferences({
                      preferredCategories: isSelected
                        ? currentCategories.filter((c) => c !== category.value)
                        : [...currentCategories, category.value],
                    });
                  }}
                  className={`flex flex-col items-center p-3 rounded-lg border-2 transition-colors ${
                    localPreferences.preferredCategories.includes(
                      category.value,
                    )
                      ? "border-dominos-red bg-red-50 text-dominos-red"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <span className="text-2xl mb-1">{category.icon}</span>
                  <span className="text-xs font-medium">{category.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Budget Range */}
          <div>
            <h3 className="dominos-heading-md text-gray-900 mb-4">
              Budget Range
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Set your preferred savings range for deal recommendations
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="min-budget"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Minimum Savings
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    id="min-budget"
                    type="number"
                    min="0"
                    max="100"
                    value={localPreferences.budgetRange.min}
                    onChange={(e) =>
                      updateLocalPreferences({
                        budgetRange: {
                          ...localPreferences.budgetRange,
                          min: parseInt(e.target.value) || 0,
                        },
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-dominos-red focus:border-dominos-red"
                  />
                </div>
              </div>
              <div>
                <label
                  htmlFor="max-budget"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Maximum Savings
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">
                    $
                  </span>
                  <input
                    id="max-budget"
                    type="number"
                    min="0"
                    max="200"
                    value={localPreferences.budgetRange.max}
                    onChange={(e) =>
                      updateLocalPreferences({
                        budgetRange: {
                          ...localPreferences.budgetRange,
                          max: parseInt(e.target.value) || 100,
                        },
                      })
                    }
                    className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-dominos-red focus:border-dominos-red"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Order Frequency */}
          <div>
            <h3 className="dominos-heading-md text-gray-900 mb-4">
              How Often Do You Order?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              This helps us understand your ordering patterns
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {ORDER_FREQUENCIES.map((frequency) => (
                <button
                  key={frequency.value}
                  type="button"
                  onClick={() =>
                    updateLocalPreferences({ orderFrequency: frequency.value })
                  }
                  className={`p-3 rounded-lg border-2 transition-colors text-center ${
                    localPreferences.orderFrequency === frequency.value
                      ? "border-dominos-red bg-red-50 text-dominos-red"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <span className="text-sm font-medium">{frequency.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Preferred Order Times */}
          <div>
            <h3 className="dominos-heading-md text-gray-900 mb-4">
              When Do You Usually Order?
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Select your preferred ordering times (multiple selections allowed)
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ORDER_TIMES.map((time) => (
                <button
                  key={time.value}
                  type="button"
                  onClick={() => {
                    const currentTimes = localPreferences.preferredOrderTimes;
                    const isSelected = currentTimes.includes(time.value);

                    updateLocalPreferences({
                      preferredOrderTimes: isSelected
                        ? currentTimes.filter((t) => t !== time.value)
                        : [...currentTimes, time.value],
                    });
                  }}
                  className={`flex items-center p-3 rounded-lg border-2 transition-colors ${
                    localPreferences.preferredOrderTimes.includes(time.value)
                      ? "border-dominos-red bg-red-50 text-dominos-red"
                      : "border-gray-200 hover:border-gray-300 text-gray-600"
                  }`}
                >
                  <span className="text-xl mr-3">{time.icon}</span>
                  <span className="text-sm font-medium">{time.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Notification Settings */}
          <div>
            <h3 className="dominos-heading-md text-gray-900 mb-4">
              Notification Preferences
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              Choose what types of deal alerts you'd like to receive
            </p>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <label
                    htmlFor="notifications-enabled"
                    className="text-sm font-medium text-gray-700"
                  >
                    Enable Notifications
                  </label>
                  <p className="text-xs text-gray-500">
                    Master toggle for all notifications
                  </p>
                </div>
                <input
                  id="notifications-enabled"
                  type="checkbox"
                  checked={localPreferences.notificationSettings.enabled}
                  onChange={(e) =>
                    updateLocalPreferences({
                      notificationSettings: {
                        ...localPreferences.notificationSettings,
                        enabled: e.target.checked,
                      },
                    })
                  }
                  className="h-4 w-4 text-dominos-red focus:ring-dominos-red border-gray-300 rounded"
                />
              </div>

              {localPreferences.notificationSettings.enabled && (
                <>
                  <div className="flex items-center justify-between">
                    <div>
                      <label
                        htmlFor="new-deals"
                        className="text-sm font-medium text-gray-700"
                      >
                        New Deals
                      </label>
                      <p className="text-xs text-gray-500">
                        Alert when new deals are available
                      </p>
                    </div>
                    <input
                      id="new-deals"
                      type="checkbox"
                      checked={localPreferences.notificationSettings.newDeals}
                      onChange={(e) =>
                        updateLocalPreferences({
                          notificationSettings: {
                            ...localPreferences.notificationSettings,
                            newDeals: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-dominos-red focus:ring-dominos-red border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label
                        htmlFor="expiring-deals"
                        className="text-sm font-medium text-gray-700"
                      >
                        Expiring Deals
                      </label>
                      <p className="text-xs text-gray-500">
                        Alert when saved deals are about to expire
                      </p>
                    </div>
                    <input
                      id="expiring-deals"
                      type="checkbox"
                      checked={
                        localPreferences.notificationSettings.expiringDeals
                      }
                      onChange={(e) =>
                        updateLocalPreferences({
                          notificationSettings: {
                            ...localPreferences.notificationSettings,
                            expiringDeals: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-dominos-red focus:ring-dominos-red border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label
                        htmlFor="favorite-store-updates"
                        className="text-sm font-medium text-gray-700"
                      >
                        Favorite Store Updates
                      </label>
                      <p className="text-xs text-gray-500">
                        Alert when your favorite stores have new deals
                      </p>
                    </div>
                    <input
                      id="favorite-store-updates"
                      type="checkbox"
                      checked={
                        localPreferences.notificationSettings
                          .favoriteStoreUpdates
                      }
                      onChange={(e) =>
                        updateLocalPreferences({
                          notificationSettings: {
                            ...localPreferences.notificationSettings,
                            favoriteStoreUpdates: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-dominos-red focus:ring-dominos-red border-gray-300 rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label
                        htmlFor="weekly-digest"
                        className="text-sm font-medium text-gray-700"
                      >
                        Weekly Digest
                      </label>
                      <p className="text-xs text-gray-500">
                        Weekly summary of the best deals
                      </p>
                    </div>
                    <input
                      id="weekly-digest"
                      type="checkbox"
                      checked={
                        localPreferences.notificationSettings.weeklyDigest
                      }
                      onChange={(e) =>
                        updateLocalPreferences({
                          notificationSettings: {
                            ...localPreferences.notificationSettings,
                            weeklyDigest: e.target.checked,
                          },
                        })
                      }
                      className="h-4 w-4 text-dominos-red focus:ring-dominos-red border-gray-300 rounded"
                    />
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 bg-gray-50">
          <Button
            onClick={handleCancel}
            variant="outline"
            className="text-gray-600 border-gray-300 hover:bg-gray-100"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            className="bg-dominos-red hover:bg-dominos-red-hover text-white"
          >
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
