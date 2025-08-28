import { useCallback } from "react";
import { useErrorHandler } from "@/hooks/useErrorHandler";
import { ErrorFactory } from "@/lib/error-factory";
import type { Coupon, StoreInfo } from "@/types/dominos";

interface UseCouponDataOptions {
  onSuccess?: (coupons: Coupon[], storeInfo: StoreInfo | null) => void;
  onError?: (error: string) => void;
  onRateLimitUpdate?: (
    requestCount: number,
    firstRequestTime: number | null,
  ) => void;
}

// Helper function to extract menu item hints from coupon descriptions
const extractMenuItemHints = (description: string): string[] => {
  const hints: string[] = [];
  const lowerDesc = description.toLowerCase();

  // Common menu item keywords (order matters - more specific first)
  const menuItems = [
    "large pizza",
    "medium pizza",
    "small pizza",
    "specialty pizza",
    "cheese pizza",
    "pepperoni pizza",
    "hand tossed",
    "thin crust",
    "pan pizza",
    "boneless wings",
    "traditional wings",
    "cheesy bread",
    "bread",
    "pizza",
    "wings",
    "pasta",
    "sandwich",
    "sandwiches",
    "breadsticks",
    "soda",
    "drink",
    "beverages",
    "dessert",
    "cookie",
    "brownies",
    "salad",
    "sides",
    "supreme",
    "pepperoni",
    "chicken",
    "beef",
    "italian sausage",
    "delivery",
    "carryout",
    "pickup",
    "topping",
    "toppings",
  ];

  menuItems.forEach((item) => {
    if (lowerDesc.includes(item)) {
      hints.push(item);
    }
  });

  // Extract specific pricing mentions
  const priceMatches = description.match(/\$\d+\.?\d*/g);
  if (priceMatches) {
    hints.push(...priceMatches.map((price) => `Price: ${price}`));
  }

  // Extract quantity mentions
  const quantityMatches = description.match(
    /\b(\d+)\s*(piece|pc|order|item)/gi,
  );
  if (quantityMatches) {
    hints.push(...quantityMatches.map((qty) => `Quantity: ${qty}`));
  }

  // Detect time-sensitive language
  const timeSensitiveTerms = [
    "today only",
    "limited time",
    "ends tonight",
    "ends at midnight",
    "ends today",
    "while supplies last",
    "limited offer",
    "ends soon",
    "expires today",
    "flash sale",
    "hourly special",
    "lunch special",
    "dinner special",
    "happy hour",
  ];

  timeSensitiveTerms.forEach((term) => {
    if (lowerDesc.includes(term)) {
      hints.push(`⏰ ${term}`);
    }
  });

  return [...new Set(hints)]; // Remove duplicates
};

export function useCouponData(options: UseCouponDataOptions = {}) {
  const { onSuccess, onError, onRateLimitUpdate } = options;
  const { handleError } = useErrorHandler();

  const fetchCoupons = useCallback(
    async (storeId: string, language: string = "en") => {
      if (!storeId) {
        const error =
          ErrorFactory.validation.createStoreIdValidationError(storeId);
        handleError(error, "fetchCoupons");
        onError?.(error.userMessage);
        return;
      }

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
        const limit = parseInt(
          response.headers.get("X-RateLimit-Limit") || "5",
        );
        const resetTime = response.headers.get("X-RateLimit-Reset");

        const newRequestCount = limit - remaining;
        const newFirstRequestTime =
          resetTime && remaining < limit
            ? new Date(resetTime).getTime() - 10 * 60 * 1000
            : null;

        onRateLimitUpdate?.(newRequestCount, newFirstRequestTime);

        if (response.status === 429) {
          await response.json();
          const error = ErrorFactory.api.createRateLimitError(
            resetTime ? new Date(resetTime).getTime() : undefined,
          );
          handleError(error, "fetchCoupons");
          onError?.(error.userMessage);
          return;
        }

        if (response.status === 401) {
          const error = ErrorFactory.api.createAuthenticationError();
          handleError(error, "fetchCoupons");
          onError?.(error.userMessage);
          // Clear auth token
          sessionStorage.removeItem("authToken");
          return;
        }

        if (!response.ok) {
          const error = ErrorFactory.api.createServerError(
            response.status,
            "Failed to fetch menu data",
          );
          handleError(error, "fetchCoupons");
          onError?.(error.userMessage);
          return;
        }

        const data = await response.json();

        // Extract store information
        const storeInfo = {
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
        };

        // Extract coupons from the structured response
        const couponsData = data.Coupons ||
          data.coupons ||
          data.Coupon || { Columns: [], Data: [] };

        let processedCoupons: Coupon[] = [];

        if (couponsData.Columns && couponsData.Data) {
          // Convert the columnar data to coupon objects
          processedCoupons = couponsData.Data.map((row: unknown[]) => {
            const coupon: Record<string, unknown> = {};
            couponsData.Columns.forEach((column: string, index: number) => {
              coupon[column] = row[index];
            });

            // Parse expiration date, virtual code, and eligible items from Tags field and direct fields

            // Extract expiration date - check Tags first, then direct fields
            if (coupon.Tags && typeof coupon.Tags === "string") {
              // Check for various date formats in Tags
              const expiresOnMatch = coupon.Tags.match(
                /ExpiresOn=(\d{4}-\d{2}-\d{2})/,
              );
              const expiresAtMatch = coupon.Tags.match(
                /ExpiresAt=(\d{2}:\d{2}:\d{2})/,
              );
              const expireDateMatch = coupon.Tags.match(/ExpireDate=([^,]+)/);
              const expirationMatch = coupon.Tags.match(/Expiration=([^,]+)/);

              if (expiresOnMatch) {
                coupon.ExpirationDate = expiresOnMatch[1];
                // If we also have ExpiresAt, append the time
                if (expiresAtMatch) {
                  coupon.ExpirationTime = expiresAtMatch[1];
                }
              } else if (expireDateMatch) {
                coupon.ExpirationDate = expireDateMatch[1];
              } else if (expirationMatch) {
                coupon.ExpirationDate = expirationMatch[1];
              }
            }
            // Fallback to direct fields if not found in Tags
            if (!coupon.ExpirationDate && coupon.ExpiresOn) {
              coupon.ExpirationDate = coupon.ExpiresOn;
            }
            if (!coupon.ExpirationDate && coupon.ExpireDate) {
              coupon.ExpirationDate = coupon.ExpireDate;
            }

            // Extract virtual code - check Tags first, then direct fields
            if (coupon.Tags && typeof coupon.Tags === "string") {
              // Check for various virtual code patterns in Tags
              const virtualCodeMatch = coupon.Tags.match(/VirtualCode=([^,]+)/);
              const onlineCodeMatch = coupon.Tags.match(/OnlineCode=([^,]+)/);
              const webCodeMatch = coupon.Tags.match(/WebCode=([^,]+)/);
              const codeMatch = coupon.Tags.match(/Code=([^,]+)/);

              if (virtualCodeMatch) {
                coupon.VirtualCode = virtualCodeMatch[1];
              } else if (onlineCodeMatch) {
                coupon.VirtualCode = onlineCodeMatch[1];
              } else if (webCodeMatch) {
                coupon.VirtualCode = webCodeMatch[1];
              } else if (codeMatch && !coupon.Code) {
                // Only use generic Code if we don't already have a main Code
                coupon.VirtualCode = codeMatch[1];
              }
            }

            // Continue with other Tags processing
            if (coupon.Tags && typeof coupon.Tags === "string") {
              // Extract eligible product codes and categories
              const productCodesMatch =
                coupon.Tags.match(/ProductCodes=([^,]+)/);
              if (productCodesMatch) {
                coupon.EligibleProducts = productCodesMatch[1].split(":");
              }

              const categoryCodesMatch = coupon.Tags.match(
                /CategoryCodes=([^,]+)/,
              );
              if (categoryCodesMatch) {
                coupon.EligibleCategories = categoryCodesMatch[1].split(":");
              }

              // Extract minimum order requirements
              const minOrderMatch = coupon.Tags.match(/MinOrder=([^,]+)/);
              if (minOrderMatch) {
                coupon.MinimumOrder = minOrderMatch[1];
              }

              // Extract service method restrictions
              const serviceMethodMatch = coupon.Tags.match(
                /ServiceMethod=([^,]+)/,
              );
              if (serviceMethodMatch) {
                coupon.ServiceMethod = serviceMethodMatch[1];
              }

              // Extract valid service methods
              const validServiceMethodsMatch = coupon.Tags.match(
                /ValidServiceMethods=([^,]+)/,
              );
              if (validServiceMethodsMatch) {
                coupon.ValidServiceMethods =
                  validServiceMethodsMatch[1].split(":");
              }

              // Extract time-based restrictions from Tags
              const timeRestrictionMatch = coupon.Tags.match(
                /TimeRestriction=([^,]+)/,
              );
              if (timeRestrictionMatch) {
                coupon.TimeRestriction = timeRestrictionMatch[1];
              }

              const validHoursMatch = coupon.Tags.match(/ValidHours=([^,]+)/);
              if (validHoursMatch) {
                coupon.ValidHours = validHoursMatch[1];
              }
            }

            // Analyze coupon name and description for menu item hints
            const textToAnalyze = [coupon.Name, coupon.Description]
              .filter(Boolean)
              .join(" ");
            if (textToAnalyze) {
              coupon.MenuItemHints = extractMenuItemHints(textToAnalyze);
            }

            return coupon;
          });
        }

        onSuccess?.(processedCoupons, storeInfo);
      } catch (err) {
        const error = ErrorFactory.fromUnknown(err, {
          userMessage: "Failed to load coupons. Please try again.",
        });
        handleError(error, "fetchCoupons");
        onError?.(error.userMessage);
      }
    },
    [handleError, onSuccess, onError, onRateLimitUpdate],
  );

  // Memoized coupon processing functions
  const processCoupons = useCallback((coupons: Coupon[]) => {
    return coupons.map((coupon) => {
      // Analyze coupon name and description for menu item hints
      const textToAnalyze = [coupon.Name, coupon.Description]
        .filter(Boolean)
        .join(" ");
      if (textToAnalyze) {
        coupon.MenuItemHints = extractMenuItemHints(textToAnalyze);
      }
      return coupon;
    });
  }, []);

  const categorizeCoupons = useCallback((coupons: Coupon[]) => {
    const lateNight: Coupon[] = [];
    const regular: Coupon[] = [];

    coupons.forEach((coupon) => {
      const text = [coupon.Name, coupon.Description]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const lateNightKeywords = [
        "late night",
        "after 10",
        "after 11",
        "after midnight",
        "night owl",
        "midnight",
        "10pm",
        "11pm",
        "late",
        "night only",
        "evening",
        "after dark",
      ];

      if (lateNightKeywords.some((keyword) => text.includes(keyword))) {
        lateNight.push(coupon);
      } else {
        regular.push(coupon);
      }
    });

    return { lateNightCoupons: lateNight, regularCoupons: regular };
  }, []);

  return {
    fetchCoupons,
    processCoupons,
    categorizeCoupons,
  };
}

export default useCouponData;
