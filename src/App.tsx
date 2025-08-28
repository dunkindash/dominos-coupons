import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import type { StoreInfo } from "@/types/dominos";

import type { Coupon } from "@/types/dominos";
import PasswordProtection from "./components/PasswordProtection";
import UnifiedSearch from "./components/UnifiedSearch";
import EnhancedHeader from "./components/layout/EnhancedHeader";
import ActionBar from "./components/ActionBar";

import StoreInfoCard from "./components/store/StoreInfoCard";
import CouponDisplay from "./components/coupon/CouponDisplay";
import ErrorBoundary from "./components/common/ErrorBoundary";
import EmailErrorBoundary from "./components/email/EmailErrorBoundary";
import { parseCouponData, processCoupons } from "@/lib/coupon-processor";
import DealTrackerWrapper from "./components/deal-tracker/DealTrackerWrapper";

// Lazy load the email modal for better performance
const EmailModal = lazy(() => import("./components/EmailModal"));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return sessionStorage.getItem("authToken") !== null;
  });
  const [storeId, setStoreId] = useState(() => {
    return localStorage.getItem("lastStoreId") || "";
  });
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem("selectedLanguage") || "en";
  });
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [storeInfo, setStoreInfo] = useState<StoreInfo | null>(null);
  const [requestCount, setRequestCount] = useState(() => {
    const stored = localStorage.getItem("rateLimit");
    return stored ? JSON.parse(stored).requestCount : 0;
  });
  const [firstRequestTime, setFirstRequestTime] = useState<number | null>(
    () => {
      const stored = localStorage.getItem("rateLimit");
      return stored ? JSON.parse(stored).firstRequestTime : null;
    },
  );
  const [, setTick] = useState(0); // Force re-render for timer
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [couponViewMode, setCouponViewMode] = useState<"grid" | "list">(() => {
    try {
      return (
        (localStorage.getItem("couponViewMode") as "grid" | "list") || "grid"
      );
    } catch (error) {
      console.warn(
        "Failed to load view mode preference from localStorage:",
        error,
      );
      return "grid";
    }
  });

  const fetchCoupons = useCallback(async () => {
    if (!storeId) return;

    setLoading(true);
    setError("");

    try {
      // Use Vercel API in production, local proxy in development
      const apiUrl = import.meta.env.PROD
        ? `/api/store/${storeId}/menu?lang=${language}`
        : `/api/power/store/${storeId}/menu?lang=${language}`;

      const authToken = sessionStorage.getItem("authToken");
      const response = await fetch(apiUrl, {
        headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      });

      // Update rate limit info from response headers
      const remaining = parseInt(
        response.headers.get("X-RateLimit-Remaining") || "5",
      );
      const limit = parseInt(response.headers.get("X-RateLimit-Limit") || "5");
      const resetTime = response.headers.get("X-RateLimit-Reset");

      const newRequestCount = limit - remaining;
      const newFirstRequestTime =
        resetTime && remaining < limit
          ? new Date(resetTime).getTime() - 10 * 60 * 1000
          : firstRequestTime;

      setRequestCount(newRequestCount);
      setFirstRequestTime(newFirstRequestTime);

      // Store in localStorage for persistence
      localStorage.setItem(
        "rateLimit",
        JSON.stringify({
          requestCount: newRequestCount,
          firstRequestTime: newFirstRequestTime,
        }),
      );

      if (response.status === 429) {
        const errorData = await response.json();
        setError(errorData.message || "Rate limit exceeded");
        return;
      }

      if (response.status === 401) {
        console.log("Authentication failed, logging out user");
        setError("Session expired. Please refresh the page.");
        setIsAuthenticated(false);
        sessionStorage.removeItem("authToken");
        return;
      }

      if (!response.ok) {
        throw new Error("Failed to fetch menu data");
      }

      const data = await response.json();

      // Extract store information
      setStoreInfo({
        StoreID: data.StoreID,
        BusinessDate: data.BusinessDate,
        MarketName: data.Market,
        StoreAsOfTime: data.StoreAsOfTime,
        Status: data.Status,
        LanguageCode: data.LanguageCode,
        // Backward compatibility aliases
        businessDate: data.BusinessDate,
        market: data.Market,
        storeAsOfTime: data.StoreAsOfTime,
        status: data.Status,
        languageCode: data.LanguageCode,
      });

      // Parse and process coupons from response
      const rawCoupons = parseCouponData(data);
      const processed = processCoupons(rawCoupons);
      setCoupons(processed);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  }, [storeId, language, firstRequestTime]);

  const toggleCardExpansion = useCallback((cardId: string) => {
    setExpandedCards((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cardId)) {
        newSet.delete(cardId);
      } else {
        newSet.add(cardId);
      }
      return newSet;
    });
  }, []);

  const handleViewModeChange = useCallback((mode: "grid" | "list") => {
    setCouponViewMode(mode);
    try {
      localStorage.setItem("couponViewMode", mode);
    } catch (error) {
      console.warn(
        "Failed to save view mode preference to localStorage:",
        error,
      );
    }
  }, []);

  const handleEmailButtonClick = useCallback(() => {
    setIsEmailModalOpen(true);
  }, []);

  const handleEmailModalClose = useCallback(() => {
    setIsEmailModalOpen(false);
  }, []);

  // Update timer every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (firstRequestTime) {
        const elapsed = Date.now() - firstRequestTime;
        if (elapsed >= 10 * 60 * 1000) {
          // Reset after 10 minutes
          setRequestCount(0);
          setFirstRequestTime(null);
          localStorage.removeItem("rateLimit");
        } else {
          // Force re-render to update timer
          setTick((prev) => prev + 1);
        }
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [firstRequestTime]);

  if (!isAuthenticated) {
    return (
      <PasswordProtection onAuthenticated={() => setIsAuthenticated(true)} />
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-white">
        {/* Skip links for keyboard navigation */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-dominos-red focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-dominos-red"
        >
          Skip to main content
        </a>
        <a
          href="#search-section"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-32 focus:z-50 focus:px-4 focus:py-2 focus:bg-dominos-red focus:text-white focus:rounded-md focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-dominos-red"
        >
          Skip to search
        </a>

        <EnhancedHeader />

        {/* Main content container with responsive grid */}
        <main
          id="main-content"
          className="dominos-container py-4 sm:py-6 lg:py-8"
          role="main"
          aria-label="Domino's Coupons Finder"
        >
          {/* Search and Store Info Section - Card-based layout */}
          <section
            id="search-section"
            className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8"
            aria-label="Store search and information"
          >
            {/* Search takes up 2 columns on large screens */}
            <div className="lg:col-span-2">
              <div className="dominos-card">
                <UnifiedSearch
                  onStoreSelect={(selectedStoreId) => {
                    setStoreId(selectedStoreId);
                    localStorage.setItem("lastStoreId", selectedStoreId);
                  }}
                  onRateLimitUpdate={(newRequestCount, newFirstRequestTime) => {
                    setRequestCount(newRequestCount);
                    setFirstRequestTime(newFirstRequestTime);

                    // Store in localStorage for persistence
                    localStorage.setItem(
                      "rateLimit",
                      JSON.stringify({
                        requestCount: newRequestCount,
                        firstRequestTime: newFirstRequestTime,
                      }),
                    );
                  }}
                  currentLanguage={language}
                  onLanguageChange={(newLanguage) => {
                    setLanguage(newLanguage);
                    localStorage.setItem("selectedLanguage", newLanguage);
                  }}
                  requestCount={requestCount}
                  firstRequestTime={firstRequestTime}
                  onFetchCoupons={fetchCoupons}
                  loading={loading}
                  error={error}
                />
              </div>
            </div>

            {/* Store info takes up 1 column on large screens */}
            {storeInfo && (
              <div className="lg:col-span-1">
                <div className="dominos-card h-fit">
                  <StoreInfoCard storeInfo={storeInfo} />
                </div>
              </div>
            )}
          </section>

          {/* Deal Tracker Section */}
          <section
            id="deal-tracker-section"
            className="mb-6 sm:mb-8"
            aria-label="Smart Deal Tracker"
          >
            <DealTrackerWrapper
              currentCoupons={coupons}
              currentStoreInfo={storeInfo}
            />
          </section>

          {/* Coupons Display Section */}
          {coupons.length > 0 && (
            <section
              id="coupons-section"
              className="dominos-card mb-6 sm:mb-8"
              aria-label={`${coupons.length} available coupons`}
            >
              <CouponDisplay
                coupons={coupons}
                onCardToggle={toggleCardExpansion}
                expandedCards={expandedCards}
                viewMode={couponViewMode}
                onViewModeChange={handleViewModeChange}
              />
            </section>
          )}

          {/* Action Bar - Contextual actions for coupons */}
          <EmailErrorBoundary>
            <ActionBar
              visible={coupons.length > 0}
              coupons={coupons}
              onEmailCoupons={handleEmailButtonClick}
            />
          </EmailErrorBoundary>

          {/* Empty State - Updated for white background */}
          {coupons.length === 0 && !loading && !error && (
            <section
              className="dominos-card text-center py-12 sm:py-16"
              aria-label="Getting started instructions"
            >
              <div className="mb-6 sm:mb-8">
                <div
                  className="text-6xl sm:text-8xl mb-4"
                  role="img"
                  aria-label="Pizza emoji"
                >
                  🍕
                </div>
                <h2 className="dominos-heading-lg text-gray-900 mb-2 px-4">
                  Ready to Find Great Deals?
                </h2>
                <p className="dominos-subheading text-base sm:text-lg px-4">
                  Enter a store number or search by address to discover amazing
                  Domino's coupons!
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center text-gray-600 px-4">
                <div className="flex items-center gap-2">
                  <div
                    className="text-xl sm:text-2xl"
                    role="img"
                    aria-label="Store icon"
                  >
                    🏪
                  </div>
                  <span className="text-sm">Enter store number directly</span>
                </div>
                <div
                  className="text-gray-400 hidden sm:block"
                  aria-hidden="true"
                >
                  or
                </div>
                <div className="text-gray-400 sm:hidden" aria-hidden="true">
                  or
                </div>
                <div className="flex items-center gap-2">
                  <div
                    className="text-xl sm:text-2xl"
                    role="img"
                    aria-label="Location pin icon"
                  >
                    📍
                  </div>
                  <span className="text-sm">Search by your address</span>
                </div>
              </div>
            </section>
          )}
        </main>

        {/* Email Modal */}
        <EmailErrorBoundary>
          <Suspense
            fallback={
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                <div className="bg-white rounded-lg p-6 flex items-center gap-3">
                  <div className="animate-spin rounded-full h-6 w-6 border-2 border-red-600 border-t-transparent"></div>
                  <span>Loading email modal...</span>
                </div>
              </div>
            }
          >
            <EmailModal
              isOpen={isEmailModalOpen}
              onClose={handleEmailModalClose}
              coupons={coupons}
              storeInfo={storeInfo}
            />
          </Suspense>
        </EmailErrorBoundary>
      </div>
    </ErrorBoundary>
  );
}

export default App;
