import { useState, useMemo } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useDealTracker } from "@/hooks/useDealTracker";
import type { Coupon, StoreInfo } from "@/types/dominos";
import type { DealFilterOptions } from "@/types/deal-tracker";

interface DealDashboardProps {
  currentCoupons?: Coupon[];
  currentStoreInfo?: StoreInfo | null;
  className?: string;
}

export default function DealDashboard({
  currentCoupons = [],
  currentStoreInfo,
  className = "",
}: DealDashboardProps) {
  const {
    personalStats,
    savedDeals,
    favoriteStores,
    getRecommendations,
    filterSavedDeals,
    addFavoriteStore,
    removeFavoriteStore,
    saveDeal,
    removeSavedDeal,
  } = useDealTracker();

  const [activeTab, setActiveTab] = useState<
    "overview" | "saved" | "favorites" | "recommendations"
  >("overview");
  const [dealFilters, setDealFilters] = useState<DealFilterOptions>({
    sortBy: "date_added",
    sortOrder: "desc",
  });

  // Generate recommendations based on current coupons
  const recommendations = useMemo(() => {
    if (currentCoupons.length === 0 || !currentStoreInfo) {
      return [];
    }
    return getRecommendations(currentCoupons, currentStoreInfo);
  }, [currentCoupons, currentStoreInfo, getRecommendations]);

  // Filter saved deals based on current filters
  const filteredSavedDeals = useMemo(() => {
    return filterSavedDeals(dealFilters);
  }, [filterSavedDeals, dealFilters]);

  // Check if current store is favorited
  const isCurrentStoreFavorited = currentStoreInfo
    ? favoriteStores.some(
        (store) => store.storeId === currentStoreInfo.StoreID.toString(),
      )
    : false;

  const handleToggleFavoriteStore = () => {
    if (!currentStoreInfo) return;

    if (isCurrentStoreFavorited) {
      removeFavoriteStore(currentStoreInfo.StoreID.toString());
    } else {
      addFavoriteStore(currentStoreInfo);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(date);
  };

  const getDaysUntilExpiry = (expiresAt: Date) => {
    const diffTime = expiresAt.getTime() - Date.now();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  return (
    <div className={`dominos-card space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="dominos-heading-lg text-gray-900 mb-1">
            Smart Deal Tracker
          </h2>
          <p className="dominos-subheading text-sm">
            Your personalized deals dashboard
          </p>
        </div>
        {currentStoreInfo && (
          <Button
            onClick={handleToggleFavoriteStore}
            variant={isCurrentStoreFavorited ? "default" : "outline"}
            size="sm"
            className={
              isCurrentStoreFavorited
                ? "bg-dominos-red hover:bg-dominos-red-hover"
                : "border-dominos-red text-dominos-red hover:bg-dominos-red hover:text-white"
            }
          >
            {isCurrentStoreFavorited ? (
              <>
                <span className="mr-2">⭐</span>
                Favorited
              </>
            ) : (
              <>
                <span className="mr-2">☆</span>
                Add to Favorites
              </>
            )}
          </Button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
        {[
          { key: "overview", label: "Overview", icon: "📊" },
          {
            key: "saved",
            label: "Saved Deals",
            icon: "💾",
            count: savedDeals.length,
          },
          {
            key: "favorites",
            label: "Favorite Stores",
            icon: "⭐",
            count: favoriteStores.length,
          },
          {
            key: "recommendations",
            label: "Recommendations",
            icon: "🎯",
            count: recommendations.length,
          },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex-1 flex items-center justify-center px-3 py-2 text-sm font-medium rounded-md transition-colors ${
              activeTab === tab.key
                ? "bg-white text-dominos-red shadow-sm"
                : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-2 px-2 py-0.5 text-xs rounded-full ${
                  activeTab === tab.key
                    ? "bg-dominos-red text-white"
                    : "bg-gray-200 text-gray-600"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="min-h-[300px]">
        {activeTab === "overview" && (
          <div className="space-y-6">
            {/* Stats Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">👀</span>
                    <div>
                      <p className="text-sm text-gray-600">Deals Viewed</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {personalStats.totalDealsViewed}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">💰</span>
                    <div>
                      <p className="text-sm text-gray-600">Total Savings</p>
                      <p className="text-2xl font-bold text-dominos-red">
                        {formatCurrency(personalStats.estimatedTotalSavings)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">🍕</span>
                    <div>
                      <p className="text-sm text-gray-600">Favorite Category</p>
                      <p className="text-lg font-bold text-gray-900 capitalize">
                        {personalStats.favoriteCategory}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-gray-200">
                <CardContent className="p-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">📈</span>
                    <div>
                      <p className="text-sm text-gray-600">Engagement Rate</p>
                      <p className="text-2xl font-bold text-dominos-blue">
                        {Math.round(personalStats.dealEngagementRate * 100)}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="border-gray-200">
              <CardHeader>
                <CardTitle level={3} className="text-lg">
                  Quick Actions
                </CardTitle>
                <CardDescription>
                  Manage your deal preferences and favorites
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-3">
                  {currentStoreInfo && (
                    <Button
                      onClick={handleToggleFavoriteStore}
                      variant="outline"
                      size="sm"
                      className="border-dominos-red text-dominos-red hover:bg-dominos-red hover:text-white"
                    >
                      {isCurrentStoreFavorited
                        ? "Remove from Favorites"
                        : "Add Store to Favorites"}
                    </Button>
                  )}
                  <Button
                    onClick={() => setActiveTab("recommendations")}
                    variant="outline"
                    size="sm"
                    className="border-dominos-blue text-dominos-blue hover:bg-dominos-blue hover:text-white"
                  >
                    View Recommendations
                  </Button>
                  <Button
                    onClick={() => setActiveTab("saved")}
                    variant="outline"
                    size="sm"
                  >
                    View Saved Deals
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="sort-by"
                  className="text-sm font-medium text-gray-700"
                >
                  Sort by:
                </label>
                <select
                  id="sort-by"
                  value={dealFilters.sortBy || ""}
                  onChange={(e) =>
                    setDealFilters((prev) => ({
                      ...prev,
                      sortBy: e.target.value as DealFilterOptions["sortBy"],
                    }))
                  }
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-dominos-red focus:border-dominos-red"
                >
                  <option value="date_added">Date Added</option>
                  <option value="savings">Savings Amount</option>
                  <option value="expiration">Expiration Date</option>
                </select>
              </div>
              <div className="flex items-center space-x-2">
                <label
                  htmlFor="sort-order"
                  className="text-sm font-medium text-gray-700"
                >
                  Order:
                </label>
                <select
                  id="sort-order"
                  value={dealFilters.sortOrder || ""}
                  onChange={(e) =>
                    setDealFilters((prev) => ({
                      ...prev,
                      sortOrder: e.target.value as "asc" | "desc",
                    }))
                  }
                  className="px-3 py-1 text-sm border border-gray-300 rounded-md focus:ring-dominos-red focus:border-dominos-red"
                >
                  <option value="desc">Descending</option>
                  <option value="asc">Ascending</option>
                </select>
              </div>
            </div>

            {/* Saved Deals List */}
            {filteredSavedDeals.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💾</div>
                <h3 className="dominos-heading-md text-gray-900 mb-2">
                  No Saved Deals
                </h3>
                <p className="dominos-subheading text-gray-600">
                  Start saving deals you're interested in to see them here!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSavedDeals.map((deal) => (
                  <Card
                    key={deal.id}
                    className="border-gray-200 hover:border-dominos-red transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {deal.coupon.Name}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {deal.coupon.Description}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Store: {deal.storeInfo.StoreID}</span>
                            <span>Saved: {formatDate(deal.savedAt)}</span>
                            {deal.expiresAt && (
                              <span
                                className={`px-2 py-1 rounded-full ${
                                  getDaysUntilExpiry(deal.expiresAt) <= 1
                                    ? "bg-red-100 text-red-800"
                                    : getDaysUntilExpiry(deal.expiresAt) <= 7
                                      ? "bg-yellow-100 text-yellow-800"
                                      : "bg-green-100 text-green-800"
                                }`}
                              >
                                Expires: {formatDate(deal.expiresAt)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <div className="text-right">
                            <p className="text-lg font-bold text-dominos-red">
                              {formatCurrency(deal.estimatedSavings || 0)}
                            </p>
                            <p className="text-xs text-gray-500">savings</p>
                          </div>
                          <Button
                            onClick={() => removeSavedDeal(deal.id)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "favorites" && (
          <div className="space-y-4">
            {favoriteStores.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⭐</div>
                <h3 className="dominos-heading-md text-gray-900 mb-2">
                  No Favorite Stores
                </h3>
                <p className="dominos-subheading text-gray-600">
                  Add stores to your favorites to track their deals and get
                  personalized recommendations!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {favoriteStores.map((store) => (
                  <Card
                    key={store.storeId}
                    className="border-gray-200 hover:border-dominos-blue transition-colors"
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900 mb-1">
                            Store #{store.storeId}
                          </h4>
                          {store.storeInfo?.AddressDescription && (
                            <p className="text-sm text-gray-600 mb-2">
                              {store.storeInfo.AddressDescription}
                            </p>
                          )}
                          <div className="flex items-center space-x-4 text-xs text-gray-500">
                            <span>Added: {formatDate(store.addedAt)}</span>
                            {store.dealCount !== undefined && (
                              <span>{store.dealCount} deals tracked</span>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center space-x-2 ml-4">
                          <Button
                            onClick={() => removeFavoriteStore(store.storeId)}
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-300 hover:bg-red-50 hover:border-red-400"
                          >
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "recommendations" && (
          <div className="space-y-4">
            {recommendations.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🎯</div>
                <h3 className="dominos-heading-md text-gray-900 mb-2">
                  No Recommendations Available
                </h3>
                <p className="dominos-subheading text-gray-600">
                  {currentCoupons.length === 0
                    ? "Browse some deals first to get personalized recommendations!"
                    : "We're still learning your preferences. Save some deals to get better recommendations!"}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="dominos-heading-sm text-gray-900">
                    Recommended for You
                  </h3>
                  <span className="text-sm text-gray-600">
                    {recommendations.length} recommendations
                  </span>
                </div>

                <div className="space-y-3">
                  {recommendations.map((rec, index) => (
                    <Card
                      key={`${rec.coupon.ID || rec.coupon.Name}-${index}`}
                      className="border-gray-200 hover:border-dominos-blue transition-colors"
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <h4 className="font-semibold text-gray-900">
                                {rec.coupon.Name}
                              </h4>
                              <span className="px-2 py-1 text-xs font-medium bg-dominos-blue text-white rounded-full">
                                {Math.round(rec.score.overall * 100)}% match
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">
                              {rec.coupon.Description}
                            </p>

                            {/* Recommendation Reasons */}
                            <div className="flex flex-wrap gap-1 mb-2">
                              {rec.reasons
                                .slice(0, 3)
                                .map((reason, reasonIndex) => (
                                  <span
                                    key={reasonIndex}
                                    className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
                                    title={reason.description}
                                  >
                                    {reason.type === "favorite_store" &&
                                      "⭐ Favorite Store"}
                                    {reason.type === "preferred_category" &&
                                      "🍕 Preferred Category"}
                                    {reason.type === "price_match" &&
                                      "💰 Budget Match"}
                                    {reason.type === "time_relevant" &&
                                      "⏰ Perfect Timing"}
                                    {reason.type === "expiring_soon" &&
                                      "🚨 Expires Soon"}
                                  </span>
                                ))}
                            </div>

                            <div className="text-xs text-gray-500">
                              Store: {rec.storeInfo.StoreID} • Category:{" "}
                              {rec.category}
                            </div>
                          </div>

                          <div className="flex items-center space-x-2 ml-4">
                            <div className="text-right">
                              <p className="text-lg font-bold text-dominos-red">
                                {formatCurrency(rec.estimatedSavings)}
                              </p>
                              <p className="text-xs text-gray-500">savings</p>
                            </div>
                            <Button
                              onClick={() =>
                                saveDeal(
                                  rec.coupon,
                                  rec.storeInfo,
                                  [rec.category],
                                  "Recommended deal",
                                )
                              }
                              variant="outline"
                              size="sm"
                              className="border-dominos-red text-dominos-red hover:bg-dominos-red hover:text-white"
                            >
                              Save Deal
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
