export interface Coupon {
  ID: string;
  Name: string;
  Description: string;
  Price: string;
  Tags: string[];
  Local: boolean;
  Bundle: boolean;
  BundlePrice: string;
}

export interface CouponsResponse {
  Columns: string[];
  Data: any[][];
}

export interface DominosMenu {
  Coupons: CouponsResponse;
}