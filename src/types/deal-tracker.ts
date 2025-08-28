import type { Coupon, StoreInfo } from './dominos'

// User preferences and behavior tracking
export interface UserPreferences {
  favoriteStores: string[]
  preferredCategories: string[]
  budgetRange: {
    min: number
    max: number
  }
  orderFrequency: 'daily' | 'weekly' | 'monthly' | 'rarely'
  preferredOrderTimes: string[] // e.g., ['lunch', 'dinner', 'late-night']
  dietaryRestrictions: string[]
  notificationSettings: NotificationSettings
}

export interface NotificationSettings {
  enabled: boolean
  newDeals: boolean
  expiringDeals: boolean
  priceDrops: boolean
  favoriteStoreUpdates: boolean
  weeklyDigest: boolean
  emailNotifications: boolean
}

// Deal tracking and history
export interface DealHistory {
  couponId: string
  storeId: string
  viewedAt: Date
  emailedAt?: Date
  estimatedSavings?: number
  category?: string
  dealScore?: number
}

export interface SavedDeal {
  id: string
  coupon: Coupon
  storeInfo: StoreInfo
  savedAt: Date
  expiresAt?: Date
  tags: string[]
  notes?: string
  estimatedSavings?: number
}

export interface FavoriteStore {
  storeId: string
  storeInfo?: StoreInfo
  addedAt: Date
  lastChecked?: Date
  dealCount?: number
  averageSavings?: number
}

// Analytics and insights
export interface DealScore {
  overall: number
  value: number
  popularity: number
  timeRelevance: number
  personalRelevance: number
}

export interface DealInsight {
  type: 'best_deal' | 'expiring_soon' | 'price_drop' | 'new_deal' | 'trending'
  couponId: string
  storeId: string
  message: string
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  expiresAt?: Date
}

export interface DealTrend {
  period: 'daily' | 'weekly' | 'monthly'
  category: string
  averageDiscount: number
  dealCount: number
  trendDirection: 'up' | 'down' | 'stable'
  bestDays: string[]
}

export interface PersonalStats {
  totalDealsViewed: number
  totalDealsSaved: number
  totalDealsEmailed: number
  estimatedTotalSavings: number
  favoriteCategory: string
  mostVisitedStore: string
  averageOrderValue: number
  dealEngagementRate: number
}

// Recommendation system
export interface DealRecommendation {
  coupon: Coupon
  storeInfo: StoreInfo
  score: DealScore
  reasons: RecommendationReason[]
  priority: number
  category: string
  estimatedSavings: number
}

export interface RecommendationReason {
  type: 'favorite_store' | 'preferred_category' | 'price_match' | 'time_relevant' | 'trending' | 'expiring_soon'
  description: string
  weight: number
}

// Dashboard and analytics data
export interface DealDashboardData {
  favoriteStores: FavoriteStore[]
  savedDeals: SavedDeal[]
  recentInsights: DealInsight[]
  recommendations: DealRecommendation[]
  personalStats: PersonalStats
  dealTrends: DealTrend[]
  upcomingExpirations: SavedDeal[]
}

// API responses and service types
export interface DealTrackerState {
  userPreferences: UserPreferences
  dealHistory: DealHistory[]
  savedDeals: SavedDeal[]
  favoriteStores: FavoriteStore[]
  insights: DealInsight[]
  lastUpdated: Date
  isLoading: boolean
  error?: string
}

export interface DealAlert {
  id: string
  type: 'new_deal' | 'expiring_deal' | 'price_drop' | 'favorite_store_update'
  storeId: string
  couponId?: string
  title: string
  message: string
  priority: 'low' | 'medium' | 'high'
  createdAt: Date
  read: boolean
  actionUrl?: string
}

// Storage and sync types
export interface DealTrackerStorageData {
  userPreferences: UserPreferences
  dealHistory: DealHistory[]
  savedDeals: SavedDeal[]
  favoriteStores: FavoriteStore[]
  insights: DealInsight[]
  alerts: DealAlert[]
  version: string
  lastSyncedAt?: Date
}

// Configuration and settings
export interface DealTrackerConfig {
  maxHistoryEntries: number
  maxSavedDeals: number
  maxFavoriteStores: number
  insightsRetentionDays: number
  recommendationLimit: number
  syncIntervalMinutes: number
  enableAnalytics: boolean
}

// Filter and sort options
export interface DealFilterOptions {
  stores?: string[]
  categories?: string[]
  minSavings?: number
  maxSavings?: number
  expiringWithin?: number // days
  dealTypes?: string[]
  sortBy?: 'savings' | 'expiration' | 'popularity' | 'date_added'
  sortOrder?: 'asc' | 'desc'
}

// Export utility types
export type DealTrackerAction =
  | { type: 'SET_USER_PREFERENCES'; payload: UserPreferences }
  | { type: 'ADD_DEAL_HISTORY'; payload: DealHistory }
  | { type: 'SAVE_DEAL'; payload: SavedDeal }
  | { type: 'REMOVE_SAVED_DEAL'; payload: string }
  | { type: 'ADD_FAVORITE_STORE'; payload: FavoriteStore }
  | { type: 'REMOVE_FAVORITE_STORE'; payload: string }
  | { type: 'ADD_INSIGHT'; payload: DealInsight }
  | { type: 'MARK_ALERT_READ'; payload: string }
  | { type: 'CLEAR_OLD_HISTORY'; payload: number }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }

export type DealCategory =
  | 'pizza'
  | 'wings'
  | 'sides'
  | 'desserts'
  | 'drinks'
  | 'bundles'
  | 'specialty'
  | 'limited_time'

export type TimeOfDay =
  | 'breakfast'
  | 'lunch'
  | 'dinner'
  | 'late_night'
  | 'anytime'
