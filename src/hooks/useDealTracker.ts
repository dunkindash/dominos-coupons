import { useState, useCallback, useMemo } from "react";
import type {
  DealTrackerState,
  UserPreferences,
  DealHistory,
  SavedDeal,
  FavoriteStore,
  DealRecommendation,
  DealScore,
  PersonalStats,
  DealTrackerStorageData,
  DealFilterOptions,
} from "@/types/deal-tracker";
import type { Coupon, StoreInfo } from "@/types/dominos";

const STORAGE_KEY = "dealTrackerData";
const STORAGE_VERSION = "1.0.0";

const DEFAULT_USER_PREFERENCES: UserPreferences = {
  favoriteStores: [],
  preferredCategories: [],
  budgetRange: { min: 0, max: 100 },
  orderFrequency: "weekly",
  preferredOrderTimes: ["dinner"],
  dietaryRestrictions: [],
  notificationSettings: {
    enabled: true,
    newDeals: true,
    expiringDeals: true,
    priceDrops: true,
    favoriteStoreUpdates: true,
    weeklyDigest: true,
    emailNotifications: false,
  },
};

const DEFAULT_STATE: DealTrackerState = {
  userPreferences: DEFAULT_USER_PREFERENCES,
  dealHistory: [],
  savedDeals: [],
  favoriteStores: [],
  insights: [],
  lastUpdated: new Date(),
  isLoading: false,
};

export function useDealTracker() {
  const [state, setState] = useState<DealTrackerState>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return DEFAULT_STATE;

      const data: DealTrackerStorageData = JSON.parse(stored);

      // Validate version and migrate if needed
      if (data.version !== STORAGE_VERSION) {
        console.warn("Deal tracker data version mismatch, using defaults");
        return DEFAULT_STATE;
      }

      return {
        userPreferences: data.userPreferences || DEFAULT_USER_PREFERENCES,
        dealHistory: data.dealHistory || [],
        savedDeals: data.savedDeals || [],
        favoriteStores: data.favoriteStores || [],
        insights: data.insights || [],
        lastUpdated: new Date(),
        isLoading: false,
      };
    } catch (error) {
      console.error("Failed to load deal tracker data:", error);
      return DEFAULT_STATE;
    }
  });

  // Persist state to localStorage
  const persistState = useCallback((newState: DealTrackerState) => {
    try {
      const storageData: DealTrackerStorageData = {
        userPreferences: newState.userPreferences,
        dealHistory: newState.dealHistory,
        savedDeals: newState.savedDeals,
        favoriteStores: newState.favoriteStores,
        insights: newState.insights,
        alerts: [], // Implement alerts later
        version: STORAGE_VERSION,
        lastSyncedAt: new Date(),
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(storageData));
    } catch (error) {
      console.error("Failed to persist deal tracker data:", error);
    }
  }, []);

  // Update user preferences
  const updateUserPreferences = useCallback(
    (preferences: Partial<UserPreferences>) => {
      setState((prevState) => {
        const newState = {
          ...prevState,
          userPreferences: { ...prevState.userPreferences, ...preferences },
          lastUpdated: new Date(),
        };
        persistState(newState);
        return newState;
      });
    },
    [persistState],
  );

  // Track coupon view
  const trackCouponView = useCallback(
    (coupon: Coupon, storeInfo: StoreInfo) => {
      const historyEntry: DealHistory = {
        couponId: coupon.ID || `${coupon.Name}-${Date.now()}`,
        storeId: storeInfo.StoreID.toString(),
        viewedAt: new Date(),
        estimatedSavings: parseFloat(coupon.Price || "0"),
        category: extractCouponCategory(coupon),
        dealScore: calculateDealScore(coupon, state.userPreferences).overall,
      };

      setState((prevState) => {
        const newHistory = [historyEntry, ...prevState.dealHistory].slice(
          0,
          1000,
        ); // Keep only recent 1000 entries

        const newState = {
          ...prevState,
          dealHistory: newHistory,
          lastUpdated: new Date(),
        };
        persistState(newState);
        return newState;
      });
    },
    [state.userPreferences, persistState],
  );

  // Save a deal
  const saveDeal = useCallback(
    (
      coupon: Coupon,
      storeInfo: StoreInfo,
      tags: string[] = [],
      notes?: string,
    ) => {
      const savedDeal: SavedDeal = {
        id: `${coupon.ID || coupon.Name}-${storeInfo.StoreID}-${Date.now()}`,
        coupon,
        storeInfo,
        savedAt: new Date(),
        expiresAt: coupon.ExpirationDate
          ? new Date(coupon.ExpirationDate)
          : undefined,
        tags,
        notes,
        estimatedSavings: parseFloat(coupon.Price || "0"),
      };

      setState((prevState) => {
        const newSavedDeals = [savedDeal, ...prevState.savedDeals].slice(
          0,
          100,
        ); // Keep only 100 saved deals

        const newState = {
          ...prevState,
          savedDeals: newSavedDeals,
          lastUpdated: new Date(),
        };
        persistState(newState);
        return newState;
      });
    },
    [persistState],
  );

  // Remove saved deal
  const removeSavedDeal = useCallback(
    (dealId: string) => {
      setState((prevState) => {
        const newState = {
          ...prevState,
          savedDeals: prevState.savedDeals.filter((deal) => deal.id !== dealId),
          lastUpdated: new Date(),
        };
        persistState(newState);
        return newState;
      });
    },
    [persistState],
  );

  // Add favorite store
  const addFavoriteStore = useCallback(
    (storeInfo: StoreInfo) => {
      const favoriteStore: FavoriteStore = {
        storeId: storeInfo.StoreID.toString(),
        storeInfo,
        addedAt: new Date(),
        lastChecked: new Date(),
        dealCount: 0,
        averageSavings: 0,
      };

      setState((prevState) => {
        // Check if store is already in favorites
        if (
          prevState.favoriteStores.some(
            (store) => store.storeId === favoriteStore.storeId,
          )
        ) {
          return prevState;
        }

        const newFavoriteStores = [
          favoriteStore,
          ...prevState.favoriteStores,
        ].slice(0, 20); // Keep only 20 favorite stores

        const newState = {
          ...prevState,
          favoriteStores: newFavoriteStores,
          lastUpdated: new Date(),
        };
        persistState(newState);
        return newState;
      });
    },
    [persistState],
  );

  // Remove favorite store
  const removeFavoriteStore = useCallback(
    (storeId: string) => {
      setState((prevState) => {
        const newState = {
          ...prevState,
          favoriteStores: prevState.favoriteStores.filter(
            (store) => store.storeId !== storeId,
          ),
          lastUpdated: new Date(),
        };
        persistState(newState);
        return newState;
      });
    },
    [persistState],
  );

  // Generate recommendations
  const getRecommendations = useCallback(
    (
      availableCoupons: Coupon[],
      storeInfo: StoreInfo,
    ): DealRecommendation[] => {
      return availableCoupons
        .map((coupon) => {
          const score = calculateDealScore(coupon, state.userPreferences);
          const reasons = generateRecommendationReasons(
            coupon,
            storeInfo,
            state.userPreferences,
            state.favoriteStores,
          );

          return {
            coupon,
            storeInfo,
            score,
            reasons,
            priority: score.overall,
            category: extractCouponCategory(coupon),
            estimatedSavings: parseFloat(coupon.Price || "0"),
          };
        })
        .filter((rec) => rec.score.overall > 0.3) // Only show decent recommendations
        .sort((a, b) => b.score.overall - a.score.overall)
        .slice(0, 10); // Top 10 recommendations
    },
    [state.userPreferences, state.favoriteStores],
  );

  // Calculate personal statistics
  const personalStats = useMemo((): PersonalStats => {
    const totalDealsViewed = state.dealHistory.length;
    const totalDealsSaved = state.savedDeals.length;
    const totalDealsEmailed = state.dealHistory.filter(
      (h) => h.emailedAt,
    ).length;

    const estimatedTotalSavings = state.dealHistory.reduce(
      (sum, history) => sum + (history.estimatedSavings || 0),
      0,
    );

    // Find most common category
    const categoryCount = new Map<string, number>();
    state.dealHistory.forEach((history) => {
      if (history.category) {
        categoryCount.set(
          history.category,
          (categoryCount.get(history.category) || 0) + 1,
        );
      }
    });

    const favoriteCategory =
      Array.from(categoryCount.entries()).sort(
        ([, a], [, b]) => b - a,
      )[0]?.[0] || "pizza";

    // Find most visited store
    const storeCount = new Map<string, number>();
    state.dealHistory.forEach((history) => {
      storeCount.set(
        history.storeId,
        (storeCount.get(history.storeId) || 0) + 1,
      );
    });

    const mostVisitedStore =
      Array.from(storeCount.entries()).sort(([, a], [, b]) => b - a)[0]?.[0] ||
      "";

    const averageOrderValue =
      estimatedTotalSavings / Math.max(totalDealsViewed, 1);
    const dealEngagementRate = totalDealsSaved / Math.max(totalDealsViewed, 1);

    return {
      totalDealsViewed,
      totalDealsSaved,
      totalDealsEmailed,
      estimatedTotalSavings,
      favoriteCategory,
      mostVisitedStore,
      averageOrderValue,
      dealEngagementRate,
    };
  }, [state.dealHistory, state.savedDeals]);

  // Filter saved deals
  const filterSavedDeals = useCallback(
    (filters: DealFilterOptions) => {
      return state.savedDeals
        .filter((deal) => {
          if (
            filters.stores &&
            !filters.stores.includes(deal.storeInfo.StoreID.toString())
          ) {
            return false;
          }

          if (
            filters.categories &&
            !filters.categories.includes(extractCouponCategory(deal.coupon))
          ) {
            return false;
          }

          if (
            filters.minSavings &&
            (deal.estimatedSavings || 0) < filters.minSavings
          ) {
            return false;
          }

          if (
            filters.maxSavings &&
            (deal.estimatedSavings || 0) > filters.maxSavings
          ) {
            return false;
          }

          if (filters.expiringWithin && deal.expiresAt) {
            const daysUntilExpiry = Math.ceil(
              (deal.expiresAt.getTime() - Date.now()) / (1000 * 60 * 60 * 24),
            );
            if (daysUntilExpiry > filters.expiringWithin) {
              return false;
            }
          }

          return true;
        })
        .sort((a, b) => {
          if (!filters.sortBy) return 0;

          switch (filters.sortBy) {
            case "savings": {
              const aValue = a.estimatedSavings || 0;
              const bValue = b.estimatedSavings || 0;
              return filters.sortOrder === "desc"
                ? bValue - aValue
                : aValue - bValue;
            }

            case "expiration": {
              const aExpiry = a.expiresAt?.getTime() || Infinity;
              const bExpiry = b.expiresAt?.getTime() || Infinity;
              return filters.sortOrder === "desc"
                ? bExpiry - aExpiry
                : aExpiry - bExpiry;
            }

            case "date_added":
              return filters.sortOrder === "desc"
                ? b.savedAt.getTime() - a.savedAt.getTime()
                : a.savedAt.getTime() - b.savedAt.getTime();

            default:
              return 0;
          }
        });
    },
    [state.savedDeals],
  );

  return {
    // State
    ...state,
    personalStats,

    // Actions
    updateUserPreferences,
    trackCouponView,
    saveDeal,
    removeSavedDeal,
    addFavoriteStore,
    removeFavoriteStore,
    getRecommendations,
    filterSavedDeals,
  };
}

// Helper functions
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

function calculateDealScore(
  coupon: Coupon,
  preferences: UserPreferences,
): DealScore {
  const category = extractCouponCategory(coupon);
  const savings = parseFloat(coupon.Price || "0");

  // Value score (0-1) based on savings amount
  const valueScore = Math.min(savings / 20, 1); // Normalize to $20 max

  // Personal relevance (0-1) based on preferences
  const personalRelevance = preferences.preferredCategories.includes(category)
    ? 0.8
    : 0.5;

  // Time relevance (0-1) based on current time
  const now = new Date();
  const currentHour = now.getHours();
  let timeRelevance = 0.5;

  if (currentHour >= 11 && currentHour <= 14) {
    // Lunch time
    timeRelevance = 0.8;
  } else if (currentHour >= 17 && currentHour <= 21) {
    // Dinner time
    timeRelevance = 0.9;
  }

  // Overall score is weighted average
  const overall =
    valueScore * 0.4 + personalRelevance * 0.3 + timeRelevance * 0.3;

  return {
    overall,
    value: valueScore,
    popularity: 0.5, // Could be enhanced with actual popularity data
    timeRelevance,
    personalRelevance,
  };
}

function generateRecommendationReasons(
  coupon: Coupon,
  storeInfo: StoreInfo,
  preferences: UserPreferences,
  favoriteStores: FavoriteStore[],
) {
  const reasons = [];
  const category = extractCouponCategory(coupon);
  const savings = parseFloat(coupon.Price || "0");

  // Check if it's a favorite store
  if (
    favoriteStores.some(
      (store) => store.storeId === storeInfo.StoreID.toString(),
    )
  ) {
    reasons.push({
      type: "favorite_store" as const,
      description: "This is one of your favorite stores",
      weight: 0.8,
    });
  }

  // Check if it's a preferred category
  if (preferences.preferredCategories.includes(category)) {
    reasons.push({
      type: "preferred_category" as const,
      description: `Matches your preferred category: ${category}`,
      weight: 0.7,
    });
  }

  // Check if price matches budget range
  if (
    savings >= preferences.budgetRange.min &&
    savings <= preferences.budgetRange.max
  ) {
    reasons.push({
      type: "price_match" as const,
      description: "Savings amount matches your budget range",
      weight: 0.6,
    });
  }

  // Check for time relevance
  const currentHour = new Date().getHours();
  if (
    (currentHour >= 11 && currentHour <= 14) ||
    (currentHour >= 17 && currentHour <= 21)
  ) {
    reasons.push({
      type: "time_relevant" as const,
      description: "Perfect timing for your meal",
      weight: 0.5,
    });
  }

  // Check if expiring soon
  if (coupon.ExpirationDate) {
    const expirationDate = new Date(coupon.ExpirationDate);
    const hoursUntilExpiry =
      (expirationDate.getTime() - Date.now()) / (1000 * 60 * 60);
    if (hoursUntilExpiry <= 24 && hoursUntilExpiry > 0) {
      reasons.push({
        type: "expiring_soon" as const,
        description: "This deal expires soon - don't miss out!",
        weight: 0.9,
      });
    }
  }

  return reasons;
}
