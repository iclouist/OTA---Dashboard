// Core entity types for OTA Operations Dashboard

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';
export type AvailabilityStatus = 'available' | 'sold_out' | 'stale' | 'mismatch';
export type ParityStatus = 'match' | 'warning' | 'mismatch';

export interface Property {
  id: string;
  name: string;
  city: string;
  country: string;
  activeChannels: string[];
  roomTypes: string[];
  ratePlans: string[];
  lastSync: string;
  alertCount: number;
  healthStatus: HealthStatus;
}

export interface Channel {
  id: string;
  name: string;
  logo?: string;
  propertiesTracked: number;
  lastScrape: string;
  successRate: number;
  activeIssues: number;
  status: HealthStatus;
  recentActivity: ChannelActivity[];
}

export interface ChannelActivity {
  id: string;
  channelId: string;
  action: string;
  timestamp: string;
  status: 'success' | 'failed' | 'pending';
}

export interface PriceRecord {
  id: string;
  propertyId: string;
  propertyName: string;
  channelId: string;
  channelName: string;
  roomType: string;
  ratePlan: string;
  stayDate: string;
  displayPrice: number;
  referencePrice: number;
  priceDelta: number;
  deltaPercent: number;
  currency: string;
  capturedAt: string;
  parityStatus: ParityStatus;
}

export interface AvailabilityRecord {
  id: string;
  propertyId: string;
  propertyName: string;
  channelId: string;
  channelName: string;
  roomType: string;
  stayDate: string;
  status: AvailabilityStatus;
  capturedAt: string;
}

export interface Alert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  propertyId: string;
  propertyName: string;
  channelId?: string;
  channelName?: string;
  roomType?: string;
  issueType: 'parity' | 'availability' | 'scrape_failure' | 'stale_data' | 'mapping';
  firstSeen: string;
  lastSeen: string;
  status: AlertStatus;
  hasEvidence: boolean;
}

export interface Evidence {
  id: string;
  propertyId: string;
  propertyName: string;
  channelId: string;
  channelName: string;
  roomType?: string;
  capturedAt: string;
  screenshotUrl: string;
  thumbnailUrl: string;
  extractedData: Record<string, string | number>;
  sourcePageUrl: string;
  sourcePageLabel: string;
  status: 'pending' | 'verified' | 'flagged';
  relatedAlertIds: string[];
}

export interface Mapping {
  id: string;
  propertyId: string;
  propertyName: string;
  otaPropertyId: string;
  otaPropertyName: string;
  channelId: string;
  channelName: string;
  roomTypeId: string;
  roomTypeName: string;
  otaRoomId: string;
  otaRoomName: string;
  ratePlanId: string;
  ratePlanName: string;
  otaRatePlanId: string;
  otaRatePlanName: string;
  status: 'active' | 'inactive' | 'pending';
  lastVerified: string;
}

export interface ScrapeProfile {
  id: string;
  name: string;
  cadenceMinutes: number;
  enabled: boolean;
  channels: string[];
}

export interface Settings {
  scrapeProfiles: ScrapeProfile[];
  alertThresholds: {
    parityWarningPercent: number;
    parityCriticalPercent: number;
    staleDataHours: number;
  };
  parityTolerance: number;
  evidenceRetentionDays: number;
}

// KPI types
export interface KPIData {
  totalProperties: number;
  trackedChannels: number;
  activeAlerts: number;
  scrapeHealthScore: number;
  parityIssues: number;
  soldOutAnomalies: number;
}
