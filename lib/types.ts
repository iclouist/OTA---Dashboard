// ============================================================
// OTA Price Monitoring & Booking Revenue Console - Type System
// ============================================================

// --- Enums / Union Types ---

export type HealthStatus = 'healthy' | 'warning' | 'critical' | 'unknown';
export type AlertSeverity = 'low' | 'medium' | 'high' | 'critical';
export type AlertStatus = 'active' | 'acknowledged' | 'resolved';

export type SourceType =
  | 'email-parsed'
  | 'admin-link-signal'
  | 'screenshot-captured'
  | 'internal-reference'
  | 'manual-entry';

export type SourceConfidence = 'high' | 'medium' | 'low' | 'pending-verification';

export type CompareQuality = 'strict' | 'normalized' | 'uncertain';

export type DeviceType = 'desktop' | 'mobile';

export type VerificationStatus =
  | 'parsed'
  | 'link-only'
  | 'needs-admin-review'
  | 'verified-by-screenshot'
  | 'stale'
  | 'pending';

export type OnboardingStatus =
  | 'draft'
  | 'mapping-needed'
  | 'email-live'
  | 'price-monitor-live'
  | 'verification-pending'
  | 'active';

export type AlertType =
  | 'price-mismatch'
  | 'desktop-mobile-divergence'
  | 'missing-evidence'
  | 'stale-capture'
  | 'booking-verification-pending'
  | 'payout-missing'
  | 'incomplete-mapping'
  | 'setup-incomplete'
  | 'channel-config-issue';

export type BookingEventType = 'new' | 'modification' | 'cancellation' | 'no-show';

export type MappingStatus = 'complete' | 'partial' | 'unmapped' | 'needs-verification';

export type CancellationPolicy = 'free-cancellation' | 'non-refundable' | 'partial-refund' | 'flexible' | 'moderate' | 'strict';

export type CommissionModel = 'percentage' | 'fixed-per-night' | 'tiered' | 'unknown';

export type PayoutModel = 'collect-and-remit' | 'pay-at-property' | 'virtual-card' | 'bank-transfer' | 'unknown';

// --- Core Entities ---

export interface Property {
  id: string;
  name: string;
  location: string;
  timezone: string;
  currency: string;
  activeOTAChannels: string[];
  roomNightsSold: number;
  grossRevenue: number;
  otaCommission: number;
  netRevenue: number;
  activePriceIssues: number;
  mappingCompleteness: MappingStatus;
  dataFreshness: 'fresh' | 'stale' | 'missing';
  healthStatus: HealthStatus;
  onboardingStatus: OnboardingStatus;
  alertCount: number;
}

export interface PropertyChannelAccount {
  id: string;
  propertyId: string;
  channelId: string;
  channelName: string;
  otaPropertyId: string;
  otaPropertyName: string;
  commissionModel: CommissionModel;
  commissionPercent: number;
  payoutModel: PayoutModel;
  promotionStackingRule: string;
  setupComplete: boolean;
  mappingComplete: boolean;
  verificationReady: boolean;
  lastDataAt: string;
}

export interface PriceCapture {
  id: string;
  propertyId: string;
  propertyName: string;
  channelId: string;
  channelName: string;
  deviceType: DeviceType;
  roomType: string;
  ratePlan: string;
  cancellationPolicy: CancellationPolicy;
  stayDate: string;
  displayPrice: number;
  referencePrice: number;
  delta: number;
  deltaPercent: number;
  currency: string;
  evidenceStatus: 'available' | 'missing' | 'stale';
  sourceType: SourceType;
  sourceConfidence: SourceConfidence;
  compareQuality: CompareQuality;
  lastCapturedAt: string;
  alertStatus: AlertSeverity | 'none';
  promotionStackingNote?: string;
  commissionAssumption?: number;
}

export interface BookingEvent {
  id: string;
  eventTime: string;
  propertyId: string;
  propertyName: string;
  channelId: string;
  channelName: string;
  bookingRef: string;
  sourceType: SourceType;
  eventType: BookingEventType;
  checkIn: string;
  checkOut: string;
  roomNights: number;
  grossAmount: number;
  commissionAmount: number;
  netAmount: number;
  currency: string;
  verificationStatus: VerificationStatus;
  evidenceLink?: string;
  guestName?: string;
  roomType?: string;
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
  alertType: AlertType;
  firstSeen: string;
  lastSeen: string;
  status: AlertStatus;
  hasEvidence: boolean;
}

export interface EvidenceItem {
  id: string;
  propertyId: string;
  propertyName: string;
  channelId: string;
  channelName: string;
  roomType?: string;
  capturedAt: string;
  sourceType: SourceType;
  sourceConfidence: SourceConfidence;
  extractedFields: Record<string, string | number>;
  captureNote?: string;
  status: 'pending' | 'verified' | 'flagged' | 'stale';
}

export interface MappingRecord {
  id: string;
  propertyId: string;
  propertyName: string;
  channelId: string;
  channelName: string;
  otaPropertyId: string;
  otaPropertyName: string;
  roomType: string;
  otaRoomName: string;
  ratePlan: string;
  otaRatePlanName: string;
  cancellationPolicy: CancellationPolicy;
  status: MappingStatus;
  lastVerified: string;
}

export interface CommissionAssumption {
  channelId: string;
  channelName: string;
  model: CommissionModel;
  defaultPercent: number;
  payoutModel: PayoutModel;
  notes: string;
}

export interface Settings {
  parityThresholds: {
    warningPercent: number;
    criticalPercent: number;
  };
  evidenceRetentionDays: number;
  defaultComparisonWindowDays: number;
  commissionAssumptions: CommissionAssumption[];
  sourceConfidenceRules: string[];
  cancellationPolicies: { id: CancellationPolicy; label: string }[];
}

// --- KPI Types ---

export interface OverviewKPIs {
  totalProperties: number;
  roomNightsSold: number;
  grossBookingValue: number;
  estimatedOTACommission: number;
  netRevenue: number;
  activePriceMismatches: number;
  pendingVerificationEvents: number;
}

// --- Source Confidence Summary ---

export interface SourceConfidenceSummary {
  category: string;
  count: number;
  description: string;
}

// ============================================================
// Availability Module Types
// ============================================================

export type AvailabilityStatus = 'open' | 'low-inventory' | 'closed' | 'sold-out' | 'restricted' | 'unknown';

export type RestrictionType = 'none' | 'cta' | 'ctd' | 'min-los' | 'max-los' | 'advance-booking' | 'closed-to-arrival' | 'closed-to-departure';

export type SyncFreshnessStatus = 'fresh' | 'stale' | 'missing';

export type SellabilityIssueType = 
  | 'channel-closed'
  | 'inventory-missing'
  | 'rate-plan-inactive'
  | 'mapping-incomplete'
  | 'sync-stale'
  | 'restriction-blocking'
  | 'channel-mismatch'
  | 'property-not-sellable'
  | 'room-sold-out';

export interface AvailabilitySnapshot {
  id: string;
  propertyId: string;
  propertyName: string;
  roomType: string;
  channelId: string;
  channelName: string;
  date: string;
  availabilityStatus: AvailabilityStatus;
  inventoryCount: number;
  restrictionType: RestrictionType;
  syncStatus: SyncFreshnessStatus;
  sellable: boolean;
  issueCount: number;
  lastUpdatedAt: string;
}

export interface ChannelAvailabilityStatus {
  id: string;
  propertyId: string;
  propertyName: string;
  channelId: string;
  channelName: string;
  mapped: boolean;
  inventoryLoaded: boolean;
  ratePlanActive: boolean;
  sellable: boolean;
  syncStatus: SyncFreshnessStatus;
  lastSyncAt: string;
  openDates: number;
  closedDates: number;
  restrictedDates: number;
  issueSummary: string;
}

export interface SellabilityIssue {
  id: string;
  severity: AlertSeverity;
  propertyId: string;
  propertyName: string;
  channelId?: string;
  channelName?: string;
  roomType?: string;
  dateRange?: string;
  issueType: SellabilityIssueType;
  title: string;
  description: string;
  lastSeen: string;
  status: AlertStatus;
}

export interface AvailabilityKPIs {
  propertiesOpen: number;
  propertiesAtRisk: number;
  closedDates: number;
  lowInventoryRooms: number;
  channelsWithSellabilityIssues: number;
  staleSyncs: number;
}
