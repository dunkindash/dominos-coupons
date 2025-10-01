/**
 * src/App.tsx
 * 
 * Main application component for Domino's Coupons Finder
 * Requirements: React 19+, TypeScript 5.0+
 * Dependencies: React, various custom components and utilities
 */

import { useState, useEffect, lazy, Suspense, useCallback } from "react";
import { RATE_LIMIT_CONSTANTS } from "@/lib/constants";
import PasswordProtection from "./components/PasswordProtection";
import UnifiedSearch from "./components/UnifiedSearch";
import EnhancedHeader from "./components/layout/EnhancedHeader";
import ActionBar from "./components/ActionBar";
import StoreInfoCard from "./components/store/StoreInfoCard";
import CouponDisplay from "./components/coupon/CouponDisplay";
import ErrorBoundary from "./components/common/ErrorBoundary";
import EmailErrorBoundary from "./components/email/EmailErrorBoundary";
import DealTrackerWrapper from "./components/deal-tracker/DealTrackerWrapper";
import SettingsPage from "./components/settings/SettingsPage";
import { useCoupons } from "./hooks/useCoupons";

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
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  const [requestCount, setRequestCount] = useState(() => {
    const stored = localStorage.getItem(RATE_LIMIT_CONSTANTS.STORAGE_KEY);
    return stored ? JSON.parse(stored).requestCount : 0;
  });
  const [firstRequestTime, setFirstRequestTime] = useState<number | null>(
    () => {
      const stored = localStorage.getItem(RATE_LIMIT_CONSTANTS.STORAGE_KEY);
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
  const [activePage, setActivePage] = useState<"home" | "settings">("home");

  // Use the custom hook for coupon management
  const {
    coupons,
    storeInfo,
    loading,
    error,
    fetchCoupons: fetchCouponsHook,
  } = useCoupons(
    (newRequestCount, newFirstRequestTime) => {
      setRequestCount(newRequestCount);
      setFirstRequestTime(newFirstRequestTime);

      // Store in localStorage for persistence
      localStorage.setItem(
        RATE_LIMIT_CONSTANTS.STORAGE_KEY,
        JSON.stringify({
          requestCount: newRequestCount,
          firstRequestTime: newFirstRequestTime,
        }),
      );
    },
    () => {
      // Handle authentication errors by logging out the user
      setIsAuthenticated(false);
    }
  );

  const fetchCoupons = useCallback(async () => {
    if (!storeId) return;
    await fetchCouponsHook(storeId, language);
  }, [storeId, language, fetchCouponsHook]);

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

  const handleNavigate = useCallback(
    (target: "stores" | "deals" | "help" | "settings") => {
      if (target === "settings") {
        setActivePage("settings");
        return;
      }
      // default to home for other targets
      setActivePage("home");

      // If navigating to deals and we have a store but no coupons yet, fetch them
      if (target === "deals" && coupons.length === 0 && storeId) {
        void fetchCoupons();
      }
      // Optionally scroll into view for specific sections in the future
    },
    [coupons.length, storeId, fetchCoupons],
  );

  const handleClearCache = useCallback(() => {
    try {
      localStorage.removeItem("lastStoreId");
      localStorage.removeItem("selectedLanguage");
      localStorage.removeItem("couponViewMode");
      localStorage.removeItem("rateLimit");
    } catch (e) {
      console.warn("Failed to clear local settings", e);
    }
    setStoreId("");
    setLanguage("en");
    setCouponViewMode("grid");
    setRequestCount(0);
    setFirstRequestTime(null);
  }, []);

  const handleLogout = useCallback(() => {
    setIsAuthenticated(false);
    sessionStorage.removeItem("authToken");
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

        <EnhancedHeader
          showNavigation
          onNavigate={handleNavigate}
          customTitle={activePage === "settings" ? "Settings" : undefined}
        />

        {/* Main content container with responsive grid */}
        <main
          id="main-content"
          className="dominos-container py-4 sm:py-6 lg:py-8"
          role="main"
          aria-label="Domino's Coupons Finder"
        >
          {activePage === "settings" ? (
            <section
              className="dominos-card mb-6 sm:mb-8"
              aria-label="Application settings"
            >
              <SettingsPage
                currentLanguage={language}
                onLanguageChange={(newLanguage) => {
                  setLanguage(newLanguage);
                  localStorage.setItem("selectedLanguage", newLanguage);
                }}
                currentViewMode={couponViewMode}
                onViewModeChange={handleViewModeChange}
                requestCount={requestCount}
                firstRequestTime={firstRequestTime}
                onClearCache={handleClearCache}
                onLogout={handleLogout}
              />
            </section>
          ) : (
            <>
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
            </>
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
