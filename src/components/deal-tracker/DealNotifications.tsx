import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useDealTracker } from "@/hooks/useDealTracker";
import type { DealInsight } from "@/types/deal-tracker";

interface DealNotificationsProps {
  className?: string;
}

export default function DealNotifications({
  className = "",
}: DealNotificationsProps) {
  const { savedDeals, personalStats, userPreferences } = useDealTracker();
  const [notifications, setNotifications] = useState<DealInsight[]>([]);
  const [dismissedNotifications, setDismissedNotifications] = useState<
    Set<string>
  >(new Set());
  const [isVisible, setIsVisible] = useState(false);

  // Generate notifications based on saved deals and user behavior
  const generateNotifications = useCallback(() => {
    if (!userPreferences.notificationSettings.enabled) {
      setNotifications([]);
      return;
    }

    const newNotifications: DealInsight[] = [];
    const now = new Date();

    // Check for expiring deals
    if (userPreferences.notificationSettings.expiringDeals) {
      savedDeals.forEach((deal) => {
        if (deal.expiresAt) {
          const hoursUntilExpiry =
            (deal.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60);

          if (hoursUntilExpiry <= 24 && hoursUntilExpiry > 0) {
            const notificationId = `expiring-${deal.id}`;
            if (!dismissedNotifications.has(notificationId)) {
              newNotifications.push({
                type: "expiring_soon",
                couponId: deal.id,
                storeId: deal.storeInfo.StoreID.toString(),
                message: `⏰ "${deal.coupon.Name}" expires in ${Math.ceil(hoursUntilExpiry)} hours!`,
                priority:
                  hoursUntilExpiry <= 6
                    ? "high"
                    : hoursUntilExpiry <= 12
                      ? "medium"
                      : "low",
                createdAt: now,
                expiresAt: deal.expiresAt,
              });
            }
          }
        }
      });
    }

    // Check for milestone achievements
    if (personalStats.totalDealsViewed > 0) {
      const milestones = [10, 25, 50, 100, 250, 500];
      const currentMilestone = milestones.find(
        (m) =>
          personalStats.totalDealsViewed >= m &&
          personalStats.totalDealsViewed < m + 5, // Only show for recent achievements
      );

      if (currentMilestone) {
        const notificationId = `milestone-${currentMilestone}`;
        if (!dismissedNotifications.has(notificationId)) {
          newNotifications.push({
            type: "trending",
            couponId: "",
            storeId: "",
            message: `🎉 Congratulations! You've viewed ${currentMilestone} deals and could save over $${Math.round(personalStats.estimatedTotalSavings)}!`,
            priority: "medium",
            createdAt: now,
          });
        }
      }
    }

    // Suggest saving deals if user has viewed many but saved few
    if (
      personalStats.totalDealsViewed >= 10 &&
      personalStats.dealEngagementRate < 0.1
    ) {
      const notificationId = "save-suggestion";
      if (!dismissedNotifications.has(notificationId)) {
        newNotifications.push({
          type: "best_deal",
          couponId: "",
          storeId: "",
          message: `💡 Pro tip: Save deals you like to track them and get expiration reminders!`,
          priority: "low",
          createdAt: now,
        });
      }
    }

    // Weekend deal reminder (Friday-Sunday)
    const dayOfWeek = now.getDay();
    if ((dayOfWeek >= 5 || dayOfWeek === 0) && savedDeals.length > 0) {
      const notificationId = `weekend-reminder-${now.toDateString()}`;
      if (!dismissedNotifications.has(notificationId)) {
        newNotifications.push({
          type: "trending",
          couponId: "",
          storeId: "",
          message: `🍕 Perfect weekend for pizza! You have ${savedDeals.length} saved deals to choose from.`,
          priority: "low",
          createdAt: now,
        });
      }
    }

    setNotifications(newNotifications.slice(0, 5)); // Limit to 5 notifications
    setIsVisible(newNotifications.length > 0);
  }, [savedDeals, personalStats, userPreferences, dismissedNotifications]);

  useEffect(() => {
    generateNotifications();

    // Check for new notifications every minute
    const interval = setInterval(generateNotifications, 60000);
    return () => clearInterval(interval);
  }, [generateNotifications]);

  // Load dismissed notifications from localStorage
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem("dismissedDealNotifications");
      if (dismissed) {
        setDismissedNotifications(new Set(JSON.parse(dismissed)));
      }
    } catch (error) {
      console.warn("Failed to load dismissed notifications:", error);
    }
  }, []);

  const dismissNotification = useCallback(
    (notificationId: string) => {
      const newDismissed = new Set(dismissedNotifications);
      newDismissed.add(notificationId);
      setDismissedNotifications(newDismissed);

      // Persist to localStorage
      try {
        localStorage.setItem(
          "dismissedDealNotifications",
          JSON.stringify([...newDismissed]),
        );
      } catch (error) {
        console.warn("Failed to persist dismissed notifications:", error);
      }

      // Remove from current notifications
      setNotifications((prev) =>
        prev.filter((notif) => getNotificationId(notif) !== notificationId),
      );

      // Hide if no more notifications
      setNotifications((prev) => {
        if (prev.length <= 1) {
          setIsVisible(false);
        }
        return prev.filter(
          (notif) => getNotificationId(notif) !== notificationId,
        );
      });
    },
    [dismissedNotifications],
  );

  const dismissAll = useCallback(() => {
    const allIds = notifications.map(getNotificationId);
    const newDismissed = new Set([...dismissedNotifications, ...allIds]);
    setDismissedNotifications(newDismissed);

    try {
      localStorage.setItem(
        "dismissedDealNotifications",
        JSON.stringify([...newDismissed]),
      );
    } catch (error) {
      console.warn("Failed to persist dismissed notifications:", error);
    }

    setNotifications([]);
    setIsVisible(false);
  }, [notifications, dismissedNotifications]);

  const getNotificationId = (notification: DealInsight): string => {
    return `${notification.type}-${notification.couponId}-${notification.storeId}-${notification.message.slice(0, 20)}`;
  };

  const getPriorityIcon = (priority: string): string => {
    switch (priority) {
      case "high":
        return "🚨";
      case "medium":
        return "⚠️";
      case "low":
        return "ℹ️";
      default:
        return "ℹ️";
    }
  };

  const getPriorityColor = (priority: string): string => {
    switch (priority) {
      case "high":
        return "border-l-red-500 bg-red-50";
      case "medium":
        return "border-l-yellow-500 bg-yellow-50";
      case "low":
        return "border-l-blue-500 bg-blue-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  if (!isVisible || notifications.length === 0) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="dominos-heading-sm text-gray-900">Deal Alerts</h3>
        <Button
          onClick={dismissAll}
          variant="outline"
          size="sm"
          className="text-xs text-gray-500 hover:text-gray-700"
        >
          Dismiss All
        </Button>
      </div>

      {/* Notifications */}
      <div className="space-y-2">
        {notifications.map((notification) => {
          const notificationId = getNotificationId(notification);
          return (
            <Card
              key={notificationId}
              className={`border-l-4 ${getPriorityColor(notification.priority)} transition-all duration-300 transform hover:scale-[1.02]`}
            >
              <CardContent className="p-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-2 flex-1">
                    <span className="text-lg flex-shrink-0">
                      {getPriorityIcon(notification.priority)}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm text-gray-800 leading-relaxed">
                        {notification.message}
                      </p>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-gray-500">
                        <span>
                          {notification.createdAt.toLocaleTimeString()}
                        </span>
                        {notification.expiresAt && (
                          <span>
                            • Expires: {notification.expiresAt.toLocaleString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Button
                    onClick={() => dismissNotification(notificationId)}
                    variant="ghost"
                    size="sm"
                    className="text-gray-400 hover:text-gray-600 p-1 h-auto min-w-0"
                  >
                    ✕
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      {personalStats.totalDealsViewed > 0 && (
        <Card className="border-gray-200 bg-gradient-to-r from-dominos-red/5 to-dominos-blue/5">
          <CardContent className="p-3">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center space-x-4">
                <span className="text-gray-600">
                  📊 {personalStats.totalDealsViewed} deals viewed
                </span>
                <span className="text-gray-600">
                  💾 {personalStats.totalDealsSaved} saved
                </span>
                {personalStats.estimatedTotalSavings > 0 && (
                  <span className="text-dominos-red font-medium">
                    💰 ${Math.round(personalStats.estimatedTotalSavings)} total
                    savings
                  </span>
                )}
              </div>
              <div className="text-gray-500">
                {Math.round(personalStats.dealEngagementRate * 100)}% engagement
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
