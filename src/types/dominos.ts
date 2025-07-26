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
  [key: string]: any; // Allow additional properties
}

export interface CouponsResponse {
  Columns: string[];
  Data: any[][];
}

export interface DominosMenu {
  Coupons: CouponsResponse;
}

export interface StoreInfo {
  StoreID: string | number
  AddressDescription?: string
  BusinessDate?: string
  Phone?: string
  MarketName?: string
  IsOpen?: boolean
  IsOnlineCapable?: boolean
  IsDeliveryStore?: boolean
  StoreCoordinates?: {
    Description?: string
    [key: string]: any
  }
  ServiceHours?: {
    Delivery?: Record<string, string>
    [key: string]: any
  }
  [key: string]: any
}

export interface EmailRequest {
  email: string
  coupons: Coupon[]
  storeInfo: StoreInfo
}

export interface EmailResponse {
  success: boolean
  message: string
  emailId?: string
  error?: string
  _meta?: {
    requestsRemaining: number
    resetTime: number
  }
}

export interface RateLimitInfo {
  requestCount: number
  firstRequestTime: number | null
}