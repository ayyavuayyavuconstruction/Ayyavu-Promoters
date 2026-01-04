
import { Project, SiteStatus } from './types';

export const SQFT_TO_CENTS = 435.6;

const SAMPLE_TAGS = ['Premium', 'Corner Plot', 'Park Facing', 'Near Entrance', 'Vastu Compliant', 'Ready to Move'];

export const MOCK_PROJECTS: Project[] = [
  {
    id: 'p1',
    name: 'Emerald Garden Heights',
    location: 'Bangalore, Karnataka',
    sites: Array.from({ length: 24 }, (_, i) => ({
      id: `s1-${i + 1}`,
      number: `E-${101 + i}`,
      status: i % 5 === 0 ? SiteStatus.SOLD : (i % 3 === 0 ? SiteStatus.BOOKED : SiteStatus.UNSOLD),
      customerName: i % 5 === 0 ? 'Rahul Sharma' : (i % 3 === 0 ? 'Amit Varma' : undefined),
      customerPhone: i % 5 === 0 ? '+91 98765 43210' : (i % 3 === 0 ? '+91 91234 56789' : undefined),
      facing: ['North', 'East', 'West', 'South'][i % 4],
      dimensions: { north: 30, south: 30, east: 40, west: 40 },
      landAreaSqFt: 1200,
      landCostPerSqFt: 4500,
      constructionAreaSqFt: 1800,
      constructionRatePerSqFt: 2200,
      tags: i % 2 === 0 ? [SAMPLE_TAGS[i % SAMPLE_TAGS.length]] : [],
      imageUrls: [],
    }))
  },
  {
    id: 'p2',
    name: 'Sapphire Residency',
    location: 'Hyderabad, Telangana',
    sites: Array.from({ length: 15 }, (_, i) => ({
      id: `s2-${i + 1}`,
      number: `S-${201 + i}`,
      status: i % 4 === 0 ? SiteStatus.SOLD : SiteStatus.UNSOLD,
      customerName: i % 4 === 0 ? 'Priya Singh' : undefined,
      customerPhone: i % 4 === 0 ? '+91 88888 77777' : undefined,
      facing: ['North-East', 'South-West'][i % 2],
      dimensions: { north: 40, south: 40, east: 60, west: 60 },
      landAreaSqFt: 2400,
      landCostPerSqFt: 6200,
      constructionAreaSqFt: 3500,
      constructionRatePerSqFt: 2500,
      tags: i % 3 === 0 ? ['Premium', 'High Ground'] : [],
      imageUrls: [],
    }))
  },
  {
    id: 'p3',
    name: 'Oakwood Estates',
    location: 'Mysuru, Karnataka',
    sites: Array.from({ length: 10 }, (_, i) => ({
      id: `s3-${i + 1}`,
      number: `O-${301 + i}`,
      status: i === 0 ? SiteStatus.SOLD : SiteStatus.UNSOLD,
      customerName: i === 0 ? 'Deepak Kumar' : undefined,
      customerPhone: i === 0 ? '+91 77766 55544' : undefined,
      facing: 'East',
      dimensions: { north: 50, south: 50, east: 80, west: 80 },
      landAreaSqFt: 4000,
      landCostPerSqFt: 3500,
      constructionAreaSqFt: 2500,
      constructionRatePerSqFt: 2000,
      tags: ['Luxury', 'Spacious'],
      imageUrls: [],
    }))
  }
];
