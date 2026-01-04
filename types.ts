
export enum SiteStatus {
  SOLD = 'SOLD',
  UNSOLD = 'UNSOLD',
  BOOKED = 'BOOKED'
}

export interface SiteDimensions {
  north: number;
  south: number;
  east: number;
  west: number;
}

export interface PaymentRecord {
  id: string;
  amount: number;
  date: string;
  method: string;
  notes?: string;
}

export interface Site {
  id: string;
  number: string;
  status: SiteStatus;
  customerName?: string;
  customerPhone?: string;
  facing: string;
  dimensions: SiteDimensions;
  landAreaSqFt: number;
  landCostPerSqFt: number;
  constructionAreaSqFt: number;
  constructionRatePerSqFt: number;
  imageUrls?: string[];
  projectedCompletionDate?: string;
  bookingDate?: string;
  saleDate?: string;
  profitMarginPercentage?: number;
  tags?: string[];
  payments?: PaymentRecord[];
}

export interface Project {
  id: string;
  name: string;
  location: string;
  launchDate?: string;
  sites: Site[];
  imageUrls?: string[];
}

export interface CompanySettings {
  name: string;
  logoUrl?: string;
  street?: string;
  city?: string;
  state?: string;
  zip?: string;
}
