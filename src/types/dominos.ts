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