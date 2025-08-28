// Define specific types for coupon properties
export type CouponPropertyValue =
  | string
  | number
  | boolean
  | string[]
  | undefined;

export interface Coupon {
  ID?: string;
  Name?: string;
  Description?: string;
  Price?: string;
  Tags?: string;
  Local?: string | boolean;
  Bundle?: string | boolean;
  BundlePrice?: string;
  Code?: string;
  VirtualCode?: string;
  ExpirationDate?: string;
  PriceInfo?: string;
  SortSeq?: string;
  GroupCodes?: string;
  ServiceMethod?: string;
  MinimumOrder?: string | number;
  ValidServiceMethods?: string[];
  EligibleProducts?: string[];
  EligibleCategories?: string[];
  [key: string]: CouponPropertyValue; // Allow additional properties with known types
}

export interface CouponsResponse {
  Columns: string[];
  Data: (string | number | boolean | null)[][];
}

export interface DominosMenu {
  Coupons: CouponsResponse;
}

// Define specific types for store properties
export type StorePropertyValue =
  | string
  | number
  | boolean
  | Record<string, string>
  | {
      Description?: string;
      Latitude?: number;
      Longitude?: number;
      [key: string]: string | number | undefined;
    }
  | {
      Delivery?: Record<string, string>;
      Carryout?: Record<string, string>;
      [key: string]: Record<string, string> | undefined;
    }
  | undefined;

export interface StoreInfo {
  StoreID: string | number;
  AddressDescription?: string;
  BusinessDate?: string;
  Phone?: string;
  MarketName?: string;
  StoreAsOfTime?: string;
  Status?: string;
  LanguageCode?: string;
  IsOpen?: boolean;
  IsOnlineCapable?: boolean;
  IsDeliveryStore?: boolean;
  StoreCoordinates?: {
    Description?: string;
    Latitude?: number;
    Longitude?: number;
    [key: string]: string | number | undefined;
  };
  ServiceHours?: {
    Delivery?: Record<string, string>;
    Carryout?: Record<string, string>;
    [key: string]: Record<string, string> | undefined;
  };
  [key: string]: StorePropertyValue;
}

export interface EmailRequest {
  email: string;
  coupons: Coupon[];
  storeInfo: StoreInfo;
}

export interface EmailResponse {
  success: boolean;
  message: string;
  emailId?: string;
  error?: string;
  _meta?: {
    requestsRemaining: number;
    resetTime: number;
  };
}

export interface RateLimitInfo {
  requestCount: number;
  firstRequestTime: number | null;
}
