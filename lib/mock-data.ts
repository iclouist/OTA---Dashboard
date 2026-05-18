import type {
  Property,
  PropertyChannelAccount,
  PriceCapture,
  BookingEvent,
  Alert,
  EvidenceItem,
  MappingRecord,
  Settings,
  OverviewKPIs,
  SourceConfidenceSummary,
  AvailabilitySnapshot,
  ChannelAvailabilityStatus,
  SellabilityIssue,
  AvailabilityKPIs,
} from './types';

// ============================================================
// Properties
// ============================================================

export const properties: Property[] = [
  {
    id: 'prop-1',
    name: 'Grand Marina Resort & Spa',
    location: 'Phuket, Thailand',
    timezone: 'Asia/Bangkok',
    currency: 'THB',
    rooms: [
      { id: 'rm-1-1', name: 'Deluxe Ocean View', quantity: 24, sellingPrice: 4200, beds: 1, capacity: 2, roomCode: 'DOV', status: 'active' },
      { id: 'rm-1-2', name: 'Premier Suite', quantity: 12, sellingPrice: 7800, beds: 1, capacity: 3, roomCode: 'PRS', status: 'active' },
      { id: 'rm-1-3', name: 'Pool Villa', quantity: 8, sellingPrice: 12000, beds: 2, capacity: 4, roomCode: 'PVL', status: 'active' },
    ],
    activeOTAChannels: ['booking', 'agoda', 'airbnb'],
    roomNightsSold: 142,
    grossRevenue: 1_284_500,
    otaCommission: 192_675,
    netRevenue: 1_091_825,
    activePriceIssues: 4,
    mappingCompleteness: 'complete',
    dataFreshness: 'fresh',
    healthStatus: 'warning',
    onboardingStatus: 'active',
    alertCount: 3,
  },
  {
    id: 'prop-2',
    name: 'Urban Boutique Hotel',
    location: 'Bangkok, Thailand',
    timezone: 'Asia/Bangkok',
    currency: 'THB',
    rooms: [
      { id: 'rm-2-1', name: 'Superior Room', quantity: 18, sellingPrice: 2800, beds: 1, capacity: 2, roomCode: 'SUP', status: 'active' },
      { id: 'rm-2-2', name: 'Deluxe Room', quantity: 10, sellingPrice: 3500, beds: 1, capacity: 2, roomCode: 'DLX', status: 'active' },
      { id: 'rm-2-3', name: 'Junior Suite', quantity: 4, sellingPrice: 5200, beds: 1, capacity: 3, roomCode: 'JRS', status: 'active' },
    ],
    activeOTAChannels: ['booking', 'agoda'],
    roomNightsSold: 98,
    grossRevenue: 686_000,
    otaCommission: 102_900,
    netRevenue: 583_100,
    activePriceIssues: 0,
    mappingCompleteness: 'complete',
    dataFreshness: 'fresh',
    healthStatus: 'healthy',
    onboardingStatus: 'active',
    alertCount: 0,
  },
  {
    id: 'prop-3',
    name: 'Seaside Villas Collection',
    location: 'Bali, Indonesia',
    timezone: 'Asia/Makassar',
    currency: 'USD',
    rooms: [
      { id: 'rm-3-1', name: '2BR Villa', quantity: 6, sellingPrice: 280, beds: 2, capacity: 4, roomCode: '2BR', status: 'active' },
      { id: 'rm-3-2', name: 'Private Pool Villa', quantity: 4, sellingPrice: 450, beds: 2, capacity: 4, roomCode: 'PPV', status: 'active' },
      { id: 'rm-3-3', name: 'Beachfront Villa', quantity: 2, sellingPrice: 720, beds: 3, capacity: 6, roomCode: 'BFV', status: 'active' },
    ],
    activeOTAChannels: ['booking', 'airbnb'],
    roomNightsSold: 64,
    grossRevenue: 38_400,
    otaCommission: 5_760,
    netRevenue: 32_640,
    activePriceIssues: 5,
    mappingCompleteness: 'partial',
    dataFreshness: 'stale',
    healthStatus: 'critical',
    onboardingStatus: 'verification-pending',
    alertCount: 5,
  },
  {
    id: 'prop-4',
    name: 'Mountain View Lodge',
    location: 'Chiang Mai, Thailand',
    timezone: 'Asia/Bangkok',
    currency: 'THB',
    rooms: [
      { id: 'rm-4-1', name: 'Mountain View Room', quantity: 14, sellingPrice: 2800, beds: 1, capacity: 2, roomCode: 'MVR', status: 'active' },
      { id: 'rm-4-2', name: 'Garden Bungalow', quantity: 8, sellingPrice: 3200, beds: 1, capacity: 2, roomCode: 'GBG', status: 'active' },
      { id: 'rm-4-3', name: 'Family Suite', quantity: 4, sellingPrice: 4800, beds: 2, capacity: 4, roomCode: 'FAM', status: 'active' },
    ],
    activeOTAChannels: ['booking', 'agoda'],
    roomNightsSold: 52,
    grossRevenue: 416_000,
    otaCommission: 62_400,
    netRevenue: 353_600,
    activePriceIssues: 1,
    mappingCompleteness: 'complete',
    dataFreshness: 'fresh',
    healthStatus: 'healthy',
    onboardingStatus: 'active',
    alertCount: 1,
  },
  {
    id: 'prop-5',
    name: 'City Center Apartments',
    location: 'Singapore',
    timezone: 'Asia/Singapore',
    currency: 'SGD',
    rooms: [
      { id: 'rm-5-1', name: 'Studio Apartment', quantity: 12, sellingPrice: 160, beds: 1, capacity: 2, roomCode: 'STU', status: 'active' },
      { id: 'rm-5-2', name: '1BR Apartment', quantity: 16, sellingPrice: 200, beds: 1, capacity: 2, roomCode: '1BR', status: 'active' },
      { id: 'rm-5-3', name: '2BR Apartment', quantity: 6, sellingPrice: 320, beds: 2, capacity: 4, roomCode: '2BR', status: 'active' },
      { id: 'rm-5-4', name: 'Penthouse', quantity: 2, sellingPrice: 500, beds: 3, capacity: 6, roomCode: 'PEN', status: 'active' },
    ],
    activeOTAChannels: ['booking', 'airbnb', 'agoda'],
    roomNightsSold: 78,
    grossRevenue: 54_600,
    otaCommission: 8_190,
    netRevenue: 46_410,
    activePriceIssues: 2,
    mappingCompleteness: 'partial',
    dataFreshness: 'fresh',
    healthStatus: 'warning',
    onboardingStatus: 'active',
    alertCount: 2,
  },
  {
    id: 'prop-6',
    name: 'Heritage Mansion',
    location: 'Penang, Malaysia',
    timezone: 'Asia/Kuala_Lumpur',
    currency: 'MYR',
    rooms: [
      { id: 'rm-6-1', name: 'Heritage Room', quantity: 6, sellingPrice: 380, beds: 1, capacity: 2, roomCode: 'HER', status: 'draft' },
      { id: 'rm-6-2', name: 'Courtyard Suite', quantity: 4, sellingPrice: 620, beds: 1, capacity: 3, roomCode: 'CYS', status: 'draft' },
    ],
    activeOTAChannels: ['booking'],
    roomNightsSold: 0,
    grossRevenue: 0,
    otaCommission: 0,
    netRevenue: 0,
    activePriceIssues: 0,
    mappingCompleteness: 'unmapped',
    dataFreshness: 'missing',
    healthStatus: 'unknown',
    onboardingStatus: 'draft',
    alertCount: 1,
  },
];

// ============================================================
// Property Channel Accounts
// ============================================================

export const propertyChannelAccounts: PropertyChannelAccount[] = [
  { id: 'pca-1', propertyId: 'prop-1', channelId: 'booking', channelName: 'Booking.com', otaPropertyId: 'bcom-12345', otaPropertyName: 'Grand Marina Resort Phuket', commissionModel: 'percentage', commissionPercent: 15, payoutModel: 'collect-and-remit', promotionStackingRule: 'Genius + mobile discount may stack', setupComplete: true, mappingComplete: true, verificationReady: true, lastDataAt: '2026-05-17T09:15:00Z' },
  { id: 'pca-2', propertyId: 'prop-1', channelId: 'agoda', channelName: 'Agoda', otaPropertyId: 'agoda-67890', otaPropertyName: 'Grand Marina Resort & Spa', commissionModel: 'percentage', commissionPercent: 18, payoutModel: 'virtual-card', promotionStackingRule: 'Secret deals + insider deals may stack', setupComplete: true, mappingComplete: true, verificationReady: true, lastDataAt: '2026-05-17T09:12:00Z' },
  { id: 'pca-3', propertyId: 'prop-1', channelId: 'airbnb', channelName: 'Airbnb', otaPropertyId: 'abnb-villa-001', otaPropertyName: 'Luxury Pool Villa Grand Marina', commissionModel: 'percentage', commissionPercent: 3, payoutModel: 'bank-transfer', promotionStackingRule: 'Host discount only', setupComplete: true, mappingComplete: true, verificationReady: true, lastDataAt: '2026-05-17T09:00:00Z' },
  { id: 'pca-4', propertyId: 'prop-2', channelId: 'booking', channelName: 'Booking.com', otaPropertyId: 'bcom-22222', otaPropertyName: 'Urban Boutique Hotel Bangkok', commissionModel: 'percentage', commissionPercent: 15, payoutModel: 'collect-and-remit', promotionStackingRule: 'Genius level 2 applied', setupComplete: true, mappingComplete: true, verificationReady: true, lastDataAt: '2026-05-17T09:12:00Z' },
  { id: 'pca-5', propertyId: 'prop-2', channelId: 'agoda', channelName: 'Agoda', otaPropertyId: 'agoda-22222', otaPropertyName: 'Urban Boutique Hotel', commissionModel: 'percentage', commissionPercent: 17, payoutModel: 'virtual-card', promotionStackingRule: 'Standard deals', setupComplete: true, mappingComplete: true, verificationReady: true, lastDataAt: '2026-05-17T09:10:00Z' },
  { id: 'pca-6', propertyId: 'prop-3', channelId: 'booking', channelName: 'Booking.com', otaPropertyId: 'bcom-33333', otaPropertyName: 'Seaside Villas Bali', commissionModel: 'percentage', commissionPercent: 15, payoutModel: 'collect-and-remit', promotionStackingRule: 'Early booker + Genius stack suspected', setupComplete: true, mappingComplete: false, verificationReady: false, lastDataAt: '2026-05-15T12:00:00Z' },
  { id: 'pca-7', propertyId: 'prop-3', channelId: 'airbnb', channelName: 'Airbnb', otaPropertyId: 'abnb-33333', otaPropertyName: 'Seaside Villas Collection Bali', commissionModel: 'percentage', commissionPercent: 3, payoutModel: 'bank-transfer', promotionStackingRule: 'None', setupComplete: true, mappingComplete: true, verificationReady: true, lastDataAt: '2026-05-17T09:00:00Z' },
  { id: 'pca-8', propertyId: 'prop-5', channelId: 'booking', channelName: 'Booking.com', otaPropertyId: 'bcom-55555', otaPropertyName: 'City Center Apartments SG', commissionModel: 'percentage', commissionPercent: 15, payoutModel: 'collect-and-remit', promotionStackingRule: 'Mobile rate active', setupComplete: true, mappingComplete: true, verificationReady: true, lastDataAt: '2026-05-16T23:45:00Z' },
  { id: 'pca-9', propertyId: 'prop-6', channelId: 'booking', channelName: 'Booking.com', otaPropertyId: '', otaPropertyName: '', commissionModel: 'unknown', commissionPercent: 0, payoutModel: 'unknown', promotionStackingRule: 'Not configured', setupComplete: false, mappingComplete: false, verificationReady: false, lastDataAt: '' },
];

// ============================================================
// Price Captures (with device type, source trust, compare quality)
// ============================================================

export const priceCaptures: PriceCapture[] = [
  { id: 'pc-1', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'booking', channelName: 'Booking.com', deviceType: 'desktop', roomType: 'Deluxe Ocean View', ratePlan: 'Flexible', cancellationPolicy: 'free-cancellation', stayDate: '2026-05-20', displayPrice: 4500, referencePrice: 4200, delta: 300, deltaPercent: 7.14, currency: 'THB', evidenceStatus: 'available', sourceType: 'screenshot-captured', sourceConfidence: 'high', compareQuality: 'strict', lastCapturedAt: '2026-05-17T09:15:00Z', alertStatus: 'medium', commissionAssumption: 15 },
  { id: 'pc-2', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'booking', channelName: 'Booking.com', deviceType: 'mobile', roomType: 'Deluxe Ocean View', ratePlan: 'Flexible', cancellationPolicy: 'free-cancellation', stayDate: '2026-05-20', displayPrice: 4275, referencePrice: 4200, delta: 75, deltaPercent: 1.79, currency: 'THB', evidenceStatus: 'available', sourceType: 'screenshot-captured', sourceConfidence: 'high', compareQuality: 'strict', lastCapturedAt: '2026-05-17T09:16:00Z', alertStatus: 'none', promotionStackingNote: 'Mobile discount applied', commissionAssumption: 15 },
  { id: 'pc-3', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'agoda', channelName: 'Agoda', deviceType: 'desktop', roomType: 'Deluxe Ocean View', ratePlan: 'Standard', cancellationPolicy: 'free-cancellation', stayDate: '2026-05-20', displayPrice: 4100, referencePrice: 4200, delta: -100, deltaPercent: -2.38, currency: 'THB', evidenceStatus: 'available', sourceType: 'email-parsed', sourceConfidence: 'high', compareQuality: 'normalized', lastCapturedAt: '2026-05-17T09:12:00Z', alertStatus: 'none', commissionAssumption: 18 },
  { id: 'pc-4', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'agoda', channelName: 'Agoda', deviceType: 'mobile', roomType: 'Deluxe Ocean View', ratePlan: 'Standard', cancellationPolicy: 'free-cancellation', stayDate: '2026-05-20', displayPrice: 3895, referencePrice: 4200, delta: -305, deltaPercent: -7.26, currency: 'THB', evidenceStatus: 'missing', sourceType: 'manual-entry', sourceConfidence: 'low', compareQuality: 'uncertain', lastCapturedAt: '2026-05-17T08:00:00Z', alertStatus: 'low', promotionStackingNote: 'Insider deal + mobile discount suspected' },
  { id: 'pc-5', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'airbnb', channelName: 'Airbnb', deviceType: 'desktop', roomType: 'Pool Villa', ratePlan: 'Flexible', cancellationPolicy: 'flexible', stayDate: '2026-05-20', displayPrice: 12500, referencePrice: 10000, delta: 2500, deltaPercent: 25.0, currency: 'THB', evidenceStatus: 'available', sourceType: 'screenshot-captured', sourceConfidence: 'high', compareQuality: 'uncertain', lastCapturedAt: '2026-05-17T09:00:00Z', alertStatus: 'critical', promotionStackingNote: 'Service fee included in display price', commissionAssumption: 3 },
  { id: 'pc-6', propertyId: 'prop-2', propertyName: 'Urban Boutique Hotel', channelId: 'booking', channelName: 'Booking.com', deviceType: 'desktop', roomType: 'Superior Room', ratePlan: 'Non-refundable', cancellationPolicy: 'non-refundable', stayDate: '2026-05-21', displayPrice: 2800, referencePrice: 2800, delta: 0, deltaPercent: 0, currency: 'THB', evidenceStatus: 'available', sourceType: 'admin-link-signal', sourceConfidence: 'medium', compareQuality: 'strict', lastCapturedAt: '2026-05-17T09:15:00Z', alertStatus: 'none', commissionAssumption: 15 },
  { id: 'pc-7', propertyId: 'prop-2', propertyName: 'Urban Boutique Hotel', channelId: 'booking', channelName: 'Booking.com', deviceType: 'mobile', roomType: 'Superior Room', ratePlan: 'Non-refundable', cancellationPolicy: 'non-refundable', stayDate: '2026-05-21', displayPrice: 2660, referencePrice: 2800, delta: -140, deltaPercent: -5.0, currency: 'THB', evidenceStatus: 'available', sourceType: 'screenshot-captured', sourceConfidence: 'high', compareQuality: 'strict', lastCapturedAt: '2026-05-17T09:16:00Z', alertStatus: 'low', promotionStackingNote: 'Mobile rate -5%' },
  { id: 'pc-8', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'booking', channelName: 'Booking.com', deviceType: 'desktop', roomType: '2BR Villa', ratePlan: 'Weekly Discount', cancellationPolicy: 'free-cancellation', stayDate: '2026-05-22', displayPrice: 350, referencePrice: 280, delta: 70, deltaPercent: 25.0, currency: 'USD', evidenceStatus: 'stale', sourceType: 'screenshot-captured', sourceConfidence: 'low', compareQuality: 'uncertain', lastCapturedAt: '2026-05-15T07:30:00Z', alertStatus: 'critical', promotionStackingNote: 'Early booker + Genius stack may inflate display' },
  { id: 'pc-9', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'airbnb', channelName: 'Airbnb', deviceType: 'desktop', roomType: 'Private Pool Villa', ratePlan: 'Flexible', cancellationPolicy: 'flexible', stayDate: '2026-05-23', displayPrice: 480, referencePrice: 450, delta: 30, deltaPercent: 6.67, currency: 'USD', evidenceStatus: 'available', sourceType: 'screenshot-captured', sourceConfidence: 'high', compareQuality: 'normalized', lastCapturedAt: '2026-05-17T09:00:00Z', alertStatus: 'medium' },
  { id: 'pc-10', propertyId: 'prop-4', propertyName: 'Mountain View Lodge', channelId: 'agoda', channelName: 'Agoda', deviceType: 'desktop', roomType: 'Garden Bungalow', ratePlan: 'Breakfast Included', cancellationPolicy: 'free-cancellation', stayDate: '2026-05-24', displayPrice: 3200, referencePrice: 3200, delta: 0, deltaPercent: 0, currency: 'THB', evidenceStatus: 'available', sourceType: 'email-parsed', sourceConfidence: 'high', compareQuality: 'strict', lastCapturedAt: '2026-05-17T09:12:00Z', alertStatus: 'none', commissionAssumption: 17 },
  { id: 'pc-11', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'booking', channelName: 'Booking.com', deviceType: 'desktop', roomType: '1BR Apartment', ratePlan: 'Flexible', cancellationPolicy: 'free-cancellation', stayDate: '2026-05-25', displayPrice: 220, referencePrice: 200, delta: 20, deltaPercent: 10.0, currency: 'SGD', evidenceStatus: 'available', sourceType: 'admin-link-signal', sourceConfidence: 'medium', compareQuality: 'normalized', lastCapturedAt: '2026-05-16T23:45:00Z', alertStatus: 'medium', commissionAssumption: 15 },
  { id: 'pc-12', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'booking', channelName: 'Booking.com', deviceType: 'mobile', roomType: '1BR Apartment', ratePlan: 'Flexible', cancellationPolicy: 'free-cancellation', stayDate: '2026-05-25', displayPrice: 209, referencePrice: 200, delta: 9, deltaPercent: 4.5, currency: 'SGD', evidenceStatus: 'missing', sourceType: 'manual-entry', sourceConfidence: 'low', compareQuality: 'uncertain', lastCapturedAt: '2026-05-16T22:00:00Z', alertStatus: 'none' },
  { id: 'pc-13', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'airbnb', channelName: 'Airbnb', deviceType: 'desktop', roomType: 'Penthouse', ratePlan: 'Non-refundable', cancellationPolicy: 'strict', stayDate: '2026-05-26', displayPrice: 650, referencePrice: 500, delta: 150, deltaPercent: 30.0, currency: 'SGD', evidenceStatus: 'available', sourceType: 'screenshot-captured', sourceConfidence: 'high', compareQuality: 'strict', lastCapturedAt: '2026-05-17T08:30:00Z', alertStatus: 'critical', commissionAssumption: 3 },
  { id: 'pc-14', propertyId: 'prop-4', propertyName: 'Mountain View Lodge', channelId: 'booking', channelName: 'Booking.com', deviceType: 'desktop', roomType: 'Mountain View Room', ratePlan: 'Flexible', cancellationPolicy: 'free-cancellation', stayDate: '2026-05-24', displayPrice: 2800, referencePrice: 2800, delta: 0, deltaPercent: 0, currency: 'THB', evidenceStatus: 'available', sourceType: 'admin-link-signal', sourceConfidence: 'medium', compareQuality: 'strict', lastCapturedAt: '2026-05-17T09:00:00Z', alertStatus: 'none', commissionAssumption: 15 },
  { id: 'pc-15', propertyId: 'prop-4', propertyName: 'Mountain View Lodge', channelId: 'booking', channelName: 'Booking.com', deviceType: 'mobile', roomType: 'Mountain View Room', ratePlan: 'Flexible', cancellationPolicy: 'free-cancellation', stayDate: '2026-05-24', displayPrice: 2660, referencePrice: 2800, delta: -140, deltaPercent: -5.0, currency: 'THB', evidenceStatus: 'missing', sourceType: 'manual-entry', sourceConfidence: 'pending-verification', compareQuality: 'uncertain', lastCapturedAt: '2026-05-17T08:30:00Z', alertStatus: 'low' },
];

// ============================================================
// Booking Events (Agoda rich vs Booking.com link-only)
// ============================================================

export const bookingEvents: BookingEvent[] = [
  { id: 'bk-1', eventTime: '2026-05-17T08:30:00Z', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'agoda', channelName: 'Agoda', bookingRef: 'AGD-884712', sourceType: 'email-parsed', eventType: 'new', checkIn: '2026-05-22', checkOut: '2026-05-25', roomNights: 3, grossAmount: 12300, commissionAmount: 2214, netAmount: 10086, currency: 'THB', verificationStatus: 'parsed', roomType: 'Deluxe Ocean View', guestName: 'Tanaka H.' },
  { id: 'bk-2', eventTime: '2026-05-17T07:45:00Z', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'booking', channelName: 'Booking.com', bookingRef: 'BDC-3391827', sourceType: 'admin-link-signal', eventType: 'new', checkIn: '2026-05-23', checkOut: '2026-05-26', roomNights: 3, grossAmount: 13500, commissionAmount: 2025, netAmount: 11475, currency: 'THB', verificationStatus: 'link-only', roomType: 'Deluxe Ocean View', guestName: 'Mueller A.' },
  { id: 'bk-3', eventTime: '2026-05-17T06:20:00Z', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'agoda', channelName: 'Agoda', bookingRef: 'AGD-884698', sourceType: 'email-parsed', eventType: 'new', checkIn: '2026-05-20', checkOut: '2026-05-22', roomNights: 2, grossAmount: 25000, commissionAmount: 4500, netAmount: 20500, currency: 'THB', verificationStatus: 'parsed', roomType: 'Pool Villa', guestName: 'Chen W.' },
  { id: 'bk-4', eventTime: '2026-05-17T05:10:00Z', propertyId: 'prop-2', propertyName: 'Urban Boutique Hotel', channelId: 'booking', channelName: 'Booking.com', bookingRef: 'BDC-3391801', sourceType: 'admin-link-signal', eventType: 'new', checkIn: '2026-05-21', checkOut: '2026-05-23', roomNights: 2, grossAmount: 5600, commissionAmount: 840, netAmount: 4760, currency: 'THB', verificationStatus: 'needs-admin-review', roomType: 'Superior Room' },
  { id: 'bk-5', eventTime: '2026-05-17T04:00:00Z', propertyId: 'prop-2', propertyName: 'Urban Boutique Hotel', channelId: 'agoda', channelName: 'Agoda', bookingRef: 'AGD-884655', sourceType: 'email-parsed', eventType: 'new', checkIn: '2026-05-24', checkOut: '2026-05-27', roomNights: 3, grossAmount: 10500, commissionAmount: 1785, netAmount: 8715, currency: 'THB', verificationStatus: 'parsed', roomType: 'Deluxe Room', guestName: 'Park J.' },
  { id: 'bk-6', eventTime: '2026-05-16T22:15:00Z', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'airbnb', channelName: 'Airbnb', bookingRef: 'ABNB-HM8832', sourceType: 'email-parsed', eventType: 'new', checkIn: '2026-05-28', checkOut: '2026-06-04', roomNights: 7, grossAmount: 3360, commissionAmount: 100.8, netAmount: 3259.2, currency: 'USD', verificationStatus: 'parsed', roomType: 'Private Pool Villa', guestName: 'Smith R.' },
  { id: 'bk-7', eventTime: '2026-05-16T18:00:00Z', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'booking', channelName: 'Booking.com', bookingRef: 'BDC-3391750', sourceType: 'admin-link-signal', eventType: 'modification', checkIn: '2026-05-25', checkOut: '2026-05-28', roomNights: 3, grossAmount: 1050, commissionAmount: 157.5, netAmount: 892.5, currency: 'USD', verificationStatus: 'link-only', roomType: '2BR Villa' },
  { id: 'bk-8', eventTime: '2026-05-16T14:30:00Z', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'booking', channelName: 'Booking.com', bookingRef: 'BDC-3391720', sourceType: 'admin-link-signal', eventType: 'cancellation', checkIn: '2026-05-20', checkOut: '2026-05-22', roomNights: 2, grossAmount: 0, commissionAmount: 0, netAmount: 0, currency: 'SGD', verificationStatus: 'needs-admin-review', roomType: '1BR Apartment' },
  { id: 'bk-9', eventTime: '2026-05-16T12:00:00Z', propertyId: 'prop-4', propertyName: 'Mountain View Lodge', channelId: 'agoda', channelName: 'Agoda', bookingRef: 'AGD-884590', sourceType: 'email-parsed', eventType: 'new', checkIn: '2026-05-26', checkOut: '2026-05-29', roomNights: 3, grossAmount: 9600, commissionAmount: 1632, netAmount: 7968, currency: 'THB', verificationStatus: 'parsed', roomType: 'Garden Bungalow', guestName: 'Sato K.' },
  { id: 'bk-10', eventTime: '2026-05-16T10:30:00Z', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'agoda', channelName: 'Agoda', bookingRef: 'AGD-884570', sourceType: 'email-parsed', eventType: 'new', checkIn: '2026-05-22', checkOut: '2026-05-25', roomNights: 3, grossAmount: 660, commissionAmount: 112.2, netAmount: 547.8, currency: 'SGD', verificationStatus: 'parsed', roomType: '1BR Apartment', guestName: 'Lee M.' },
  { id: 'bk-11', eventTime: '2026-05-16T08:00:00Z', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'airbnb', channelName: 'Airbnb', bookingRef: 'ABNB-HM8801', sourceType: 'email-parsed', eventType: 'new', checkIn: '2026-05-30', checkOut: '2026-06-02', roomNights: 3, grossAmount: 37500, commissionAmount: 1125, netAmount: 36375, currency: 'THB', verificationStatus: 'verified-by-screenshot', roomType: 'Pool Villa', guestName: 'Johnson D.' },
  { id: 'bk-12', eventTime: '2026-05-15T16:00:00Z', propertyId: 'prop-6', propertyName: 'Heritage Mansion', channelId: 'booking', channelName: 'Booking.com', bookingRef: 'BDC-3391600', sourceType: 'admin-link-signal', eventType: 'new', checkIn: '2026-06-01', checkOut: '2026-06-03', roomNights: 2, grossAmount: 900, commissionAmount: 0, netAmount: 0, currency: 'MYR', verificationStatus: 'stale', roomType: 'Heritage Room' },
];

// ============================================================
// Alerts
// ============================================================

export const alerts: Alert[] = [
  { id: 'alert-1', severity: 'critical', title: 'Pool Villa price +25% vs reference on Airbnb', description: 'Pool Villa on Airbnb desktop is 25% higher than internal reference price. Service fee inclusion may inflate display.', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'airbnb', channelName: 'Airbnb', alertType: 'price-mismatch', firstSeen: '2026-05-17T06:00:00Z', lastSeen: '2026-05-17T09:00:00Z', status: 'active', hasEvidence: true },
  { id: 'alert-2', severity: 'medium', title: 'Desktop vs Mobile divergence on Booking.com', description: 'Deluxe Ocean View shows THB 225 difference between desktop and mobile on Booking.com. Mobile discount may be stacking.', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'booking', channelName: 'Booking.com', alertType: 'desktop-mobile-divergence', firstSeen: '2026-05-17T08:00:00Z', lastSeen: '2026-05-17T09:16:00Z', status: 'active', hasEvidence: true },
  { id: 'alert-3', severity: 'medium', title: 'Booking.com price 7% above reference', description: 'Deluxe Ocean View desktop price is THB 300 (7.14%) above internal reference.', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'booking', channelName: 'Booking.com', alertType: 'price-mismatch', firstSeen: '2026-05-17T07:00:00Z', lastSeen: '2026-05-17T09:15:00Z', status: 'active', hasEvidence: false },
  { id: 'alert-4', severity: 'critical', title: 'Stale capture - no data in 48+ hours', description: '2BR Villa on Booking.com has no price capture in over 48 hours. Evidence is stale.', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'booking', channelName: 'Booking.com', alertType: 'stale-capture', firstSeen: '2026-05-16T12:00:00Z', lastSeen: '2026-05-17T09:00:00Z', status: 'active', hasEvidence: false },
  { id: 'alert-5', severity: 'critical', title: '2BR Villa +25% price mismatch', description: '2BR Villa on Booking.com desktop is 25% above reference. Possible promotion stacking distortion.', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'booking', channelName: 'Booking.com', alertType: 'price-mismatch', firstSeen: '2026-05-17T05:00:00Z', lastSeen: '2026-05-17T07:30:00Z', status: 'active', hasEvidence: true },
  { id: 'alert-6', severity: 'high', title: 'Booking awaiting admin verification', description: 'BDC-3391801 from Booking.com is notification-only. Commission and net amount require admin login to confirm.', propertyId: 'prop-2', propertyName: 'Urban Boutique Hotel', channelId: 'booking', channelName: 'Booking.com', alertType: 'booking-verification-pending', firstSeen: '2026-05-17T05:10:00Z', lastSeen: '2026-05-17T05:10:00Z', status: 'active', hasEvidence: false },
  { id: 'alert-7', severity: 'critical', title: 'Penthouse +30% price mismatch on Airbnb', description: 'Penthouse on Airbnb is SGD 150 (30%) above internal reference.', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'airbnb', channelName: 'Airbnb', alertType: 'price-mismatch', firstSeen: '2026-05-17T08:30:00Z', lastSeen: '2026-05-17T08:30:00Z', status: 'active', hasEvidence: true },
  { id: 'alert-8', severity: 'medium', title: 'Incomplete mapping for Seaside Villas', description: 'Booking.com channel has partial room/rate mapping. Some price comparisons may be unreliable.', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'booking', channelName: 'Booking.com', alertType: 'incomplete-mapping', firstSeen: '2026-05-16T00:00:00Z', lastSeen: '2026-05-17T09:00:00Z', status: 'active', hasEvidence: false },
  { id: 'alert-9', severity: 'low', title: 'Missing evidence for mobile capture', description: 'City Center Apartments mobile Booking.com capture has no screenshot evidence.', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'booking', channelName: 'Booking.com', alertType: 'missing-evidence', firstSeen: '2026-05-16T22:00:00Z', lastSeen: '2026-05-17T09:00:00Z', status: 'acknowledged', hasEvidence: false },
  { id: 'alert-10', severity: 'high', title: 'Setup incomplete for Heritage Mansion', description: 'Heritage Mansion has no OTA property ID, commission model, or room mappings configured.', propertyId: 'prop-6', propertyName: 'Heritage Mansion', alertType: 'setup-incomplete', firstSeen: '2026-05-15T00:00:00Z', lastSeen: '2026-05-17T09:00:00Z', status: 'active', hasEvidence: false },
  { id: 'alert-11', severity: 'medium', title: 'Payout/net amount missing for Heritage booking', description: 'BDC-3391600 has no commission or net amount. Channel configuration incomplete.', propertyId: 'prop-6', propertyName: 'Heritage Mansion', channelId: 'booking', channelName: 'Booking.com', alertType: 'payout-missing', firstSeen: '2026-05-15T16:00:00Z', lastSeen: '2026-05-17T09:00:00Z', status: 'active', hasEvidence: false },
];

// ============================================================
// Evidence Items
// ============================================================

export const evidenceItems: EvidenceItem[] = [
  { id: 'ev-1', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'airbnb', channelName: 'Airbnb', roomType: 'Pool Villa', capturedAt: '2026-05-17T09:00:00Z', sourceType: 'screenshot-captured', sourceConfidence: 'high', extractedFields: { price: 12500, currency: 'THB', dates: 'May 20-21', roomType: 'Entire villa' }, status: 'verified' },
  { id: 'ev-2', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'booking', channelName: 'Booking.com', roomType: 'Deluxe Ocean View', capturedAt: '2026-05-17T09:15:00Z', sourceType: 'screenshot-captured', sourceConfidence: 'high', extractedFields: { price: 4500, currency: 'THB', dates: 'May 20', device: 'Desktop' }, status: 'verified' },
  { id: 'ev-3', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'booking', channelName: 'Booking.com', roomType: 'Deluxe Ocean View', capturedAt: '2026-05-17T09:16:00Z', sourceType: 'screenshot-captured', sourceConfidence: 'high', extractedFields: { price: 4275, currency: 'THB', dates: 'May 20', device: 'Mobile' }, status: 'verified' },
  { id: 'ev-4', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'booking', channelName: 'Booking.com', roomType: '2BR Villa', capturedAt: '2026-05-15T07:30:00Z', sourceType: 'screenshot-captured', sourceConfidence: 'low', extractedFields: { price: 350, currency: 'USD', dates: 'May 22' }, captureNote: 'Screenshot over 48h old', status: 'stale' },
  { id: 'ev-5', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'airbnb', channelName: 'Airbnb', roomType: 'Penthouse', capturedAt: '2026-05-17T08:30:00Z', sourceType: 'screenshot-captured', sourceConfidence: 'high', extractedFields: { price: 650, currency: 'SGD', dates: 'May 26' }, status: 'pending' },
  { id: 'ev-6', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'agoda', channelName: 'Agoda', roomType: 'Deluxe Ocean View', capturedAt: '2026-05-17T09:12:00Z', sourceType: 'email-parsed', sourceConfidence: 'high', extractedFields: { price: 4100, currency: 'THB', dates: 'May 20', source: 'Agoda confirmation email' }, status: 'verified' },
];

// ============================================================
// Mapping Records
// ============================================================

export const mappingRecords: MappingRecord[] = [
  { id: 'map-1', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'booking', channelName: 'Booking.com', otaPropertyId: 'bcom-12345', otaPropertyName: 'Grand Marina Resort Phuket', roomType: 'Deluxe Ocean View', otaRoomName: 'Deluxe Room with Ocean View', ratePlan: 'Flexible', otaRatePlanName: 'Flexible Rate', cancellationPolicy: 'free-cancellation', status: 'complete', lastVerified: '2026-05-17T00:00:00Z' },
  { id: 'map-2', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'agoda', channelName: 'Agoda', otaPropertyId: 'agoda-67890', otaPropertyName: 'Grand Marina Resort & Spa', roomType: 'Deluxe Ocean View', otaRoomName: 'Deluxe Ocean View Room', ratePlan: 'Standard', otaRatePlanName: 'Standard Cancellation', cancellationPolicy: 'free-cancellation', status: 'complete', lastVerified: '2026-05-16T00:00:00Z' },
  { id: 'map-3', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'airbnb', channelName: 'Airbnb', otaPropertyId: 'abnb-villa-001', otaPropertyName: 'Luxury Pool Villa Grand Marina', roomType: 'Pool Villa', otaRoomName: 'Entire villa', ratePlan: 'Flexible', otaRatePlanName: 'Flexible cancellation', cancellationPolicy: 'flexible', status: 'complete', lastVerified: '2026-05-15T00:00:00Z' },
  { id: 'map-4', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'booking', channelName: 'Booking.com', otaPropertyId: 'bcom-33333', otaPropertyName: 'Seaside Villas Bali', roomType: '2BR Villa', otaRoomName: 'Two-Bedroom Villa', ratePlan: 'Weekly Discount', otaRatePlanName: 'Weekly Stay Rate', cancellationPolicy: 'free-cancellation', status: 'partial', lastVerified: '2026-05-14T00:00:00Z' },
  { id: 'map-5', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'booking', channelName: 'Booking.com', otaPropertyId: 'bcom-55555', otaPropertyName: 'City Center Apartments SG', roomType: '1BR Apartment', otaRoomName: 'One Bedroom Apartment', ratePlan: 'Flexible', otaRatePlanName: 'Flexible Rate', cancellationPolicy: 'free-cancellation', status: 'complete', lastVerified: '2026-05-16T00:00:00Z' },
  { id: 'map-6', propertyId: 'prop-6', propertyName: 'Heritage Mansion', channelId: 'booking', channelName: 'Booking.com', otaPropertyId: '', otaPropertyName: '', roomType: 'Heritage Room', otaRoomName: '', ratePlan: '', otaRatePlanName: '', cancellationPolicy: 'free-cancellation', status: 'unmapped', lastVerified: '' },
];

// ============================================================
// Settings
// ============================================================

export const settings: Settings = {
  parityThresholds: { warningPercent: 5, criticalPercent: 15 },
  evidenceRetentionDays: 90,
  defaultComparisonWindowDays: 14,
  commissionAssumptions: [
    { channelId: 'booking', channelName: 'Booking.com', model: 'percentage', defaultPercent: 15, payoutModel: 'collect-and-remit', notes: 'Commission deducted from guest payment before remit. Genius promotions increase visibility but do not change commission rate.' },
    { channelId: 'agoda', channelName: 'Agoda', model: 'percentage', defaultPercent: 18, payoutModel: 'virtual-card', notes: 'Agoda collects full amount, remits via virtual card minus commission. Insider deals / secret deals may change effective rate.' },
    { channelId: 'airbnb', channelName: 'Airbnb', model: 'percentage', defaultPercent: 3, payoutModel: 'bank-transfer', notes: 'Host-only fee model (3%). Airbnb charges guest a separate service fee not visible to host.' },
  ],
  sourceConfidenceRules: [
    'Agoda email-parsed bookings are considered high confidence by default.',
    'Booking.com notification emails are admin-link-signal only; confidence is medium until admin-verified.',
    'Screenshot evidence less than 24h old is high confidence.',
    'Screenshot evidence older than 48h is low confidence (stale).',
    'Manual entries are low confidence unless corroborated by other sources.',
  ],
  cancellationPolicies: [
    { id: 'free-cancellation', label: 'Free Cancellation' },
    { id: 'non-refundable', label: 'Non-Refundable' },
    { id: 'partial-refund', label: 'Partial Refund' },
    { id: 'flexible', label: 'Flexible' },
    { id: 'moderate', label: 'Moderate' },
    { id: 'strict', label: 'Strict' },
  ],
};

// ============================================================
// Computed / Derived Data
// ============================================================

export const overviewKPIs: OverviewKPIs = {
  totalProperties: properties.length,
  roomNightsSold: properties.reduce((s, p) => s + p.roomNightsSold, 0),
  grossBookingValue: properties.reduce((s, p) => s + p.grossRevenue, 0),
  estimatedOTACommission: properties.reduce((s, p) => s + p.otaCommission, 0),
  netRevenue: properties.reduce((s, p) => s + p.netRevenue, 0),
  activePriceMismatches: priceCaptures.filter((pc) => pc.alertStatus !== 'none').length,
  pendingVerificationEvents: bookingEvents.filter((be) => be.verificationStatus === 'needs-admin-review' || be.verificationStatus === 'link-only' || be.verificationStatus === 'pending').length,
};

export const sourceConfidenceSummary: SourceConfidenceSummary[] = [
  { category: 'Agoda parsed email', count: bookingEvents.filter((b) => b.channelId === 'agoda' && b.sourceType === 'email-parsed').length, description: 'Rich booking data parsed directly from Agoda confirmation emails' },
  { category: 'Booking.com notification / link-only', count: bookingEvents.filter((b) => b.channelId === 'booking' && b.sourceType === 'admin-link-signal').length, description: 'Booking notification with admin deep link; full details require extranet login' },
  { category: 'Screenshot-verified', count: evidenceItems.filter((e) => e.status === 'verified').length, description: 'Price or booking data verified by screenshot capture within 24h' },
  { category: 'Internal reference', count: priceCaptures.filter((p) => p.sourceType === 'internal-reference').length, description: 'Prices from internal rate sheet or PMS feed' },
  { category: 'Pending verification', count: bookingEvents.filter((b) => b.verificationStatus === 'needs-admin-review' || b.verificationStatus === 'pending').length, description: 'Data awaiting operator review or admin confirmation' },
  { category: 'Stale or missing evidence', count: evidenceItems.filter((e) => e.status === 'stale').length + priceCaptures.filter((p) => p.evidenceStatus === 'stale' || p.evidenceStatus === 'missing').length, description: 'Evidence older than 48h or not yet captured' },
];

// ============================================================
// Helper Functions
// ============================================================

export function getPropertyById(id: string): Property | undefined {
  return properties.find((p) => p.id === id);
}

export function getBookingsByProperty(propertyId: string): BookingEvent[] {
  return bookingEvents.filter((b) => b.propertyId === propertyId);
}

export function getPriceCapturesByProperty(propertyId: string): PriceCapture[] {
  return priceCaptures.filter((p) => p.propertyId === propertyId);
}

export function getAlertsByProperty(propertyId: string): Alert[] {
  return alerts.filter((a) => a.propertyId === propertyId);
}

export function getEvidenceByProperty(propertyId: string): EvidenceItem[] {
  return evidenceItems.filter((e) => e.propertyId === propertyId);
}

export function getMappingsByProperty(propertyId: string): MappingRecord[] {
  return mappingRecords.filter((m) => m.propertyId === propertyId);
}

export function getChannelAccountsByProperty(propertyId: string): PropertyChannelAccount[] {
  return propertyChannelAccounts.filter((a) => a.propertyId === propertyId);
}

// ============================================================
// Availability Data
// ============================================================

// Generate dates for next 14 days
const today = new Date('2026-05-17');
const generateDates = (days: number) => {
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    return d.toISOString().split('T')[0];
  });
};
const next14Days = generateDates(14);

export const availabilitySnapshots: AvailabilitySnapshot[] = [
  // Grand Marina Resort & Spa - Generally healthy with some restrictions
  ...next14Days.flatMap((date, idx) => [
    { id: `avail-gm-booking-dov-${date}`, propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', roomType: 'Deluxe Ocean View', channelId: 'booking', channelName: 'Booking.com', date, availabilityStatus: idx < 3 ? 'low-inventory' as const : 'open' as const, inventoryCount: idx < 3 ? 2 : 8, restrictionType: 'none' as const, syncStatus: 'fresh' as const, sellable: true, issueCount: 0, lastUpdatedAt: '2026-05-17T09:15:00Z' },
    { id: `avail-gm-agoda-dov-${date}`, propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', roomType: 'Deluxe Ocean View', channelId: 'agoda', channelName: 'Agoda', date, availabilityStatus: idx < 3 ? 'low-inventory' as const : 'open' as const, inventoryCount: idx < 3 ? 2 : 8, restrictionType: 'none' as const, syncStatus: 'fresh' as const, sellable: true, issueCount: 0, lastUpdatedAt: '2026-05-17T09:12:00Z' },
    { id: `avail-gm-airbnb-pv-${date}`, propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', roomType: 'Pool Villa', channelId: 'airbnb', channelName: 'Airbnb', date, availabilityStatus: idx === 0 || idx === 1 ? 'sold-out' as const : 'open' as const, inventoryCount: idx === 0 || idx === 1 ? 0 : 3, restrictionType: 'none' as const, syncStatus: 'fresh' as const, sellable: idx !== 0 && idx !== 1, issueCount: 0, lastUpdatedAt: '2026-05-17T09:00:00Z' },
  ]),

  // Urban Boutique Hotel - Fully healthy
  ...next14Days.flatMap((date) => [
    { id: `avail-ub-booking-sr-${date}`, propertyId: 'prop-2', propertyName: 'Urban Boutique Hotel', roomType: 'Superior Room', channelId: 'booking', channelName: 'Booking.com', date, availabilityStatus: 'open' as const, inventoryCount: 15, restrictionType: 'none' as const, syncStatus: 'fresh' as const, sellable: true, issueCount: 0, lastUpdatedAt: '2026-05-17T09:12:00Z' },
    { id: `avail-ub-agoda-sr-${date}`, propertyId: 'prop-2', propertyName: 'Urban Boutique Hotel', roomType: 'Superior Room', channelId: 'agoda', channelName: 'Agoda', date, availabilityStatus: 'open' as const, inventoryCount: 15, restrictionType: 'none' as const, syncStatus: 'fresh' as const, sellable: true, issueCount: 0, lastUpdatedAt: '2026-05-17T09:10:00Z' },
  ]),

  // Seaside Villas Collection - Critical: Booking closed, stale sync, Airbnb open
  ...next14Days.flatMap((date, idx) => [
    { id: `avail-sv-booking-2br-${date}`, propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', roomType: '2BR Villa', channelId: 'booking', channelName: 'Booking.com', date, availabilityStatus: idx < 3 ? 'closed' as const : 'restricted' as const, inventoryCount: idx < 3 ? 0 : 2, restrictionType: idx < 3 ? 'none' as const : 'min-los' as const, syncStatus: 'stale' as const, sellable: false, issueCount: 2, lastUpdatedAt: '2026-05-15T12:00:00Z' },
    { id: `avail-sv-airbnb-ppv-${date}`, propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', roomType: 'Private Pool Villa', channelId: 'airbnb', channelName: 'Airbnb', date, availabilityStatus: 'open' as const, inventoryCount: 4, restrictionType: 'none' as const, syncStatus: 'fresh' as const, sellable: true, issueCount: 0, lastUpdatedAt: '2026-05-17T09:00:00Z' },
  ]),

  // Mountain View Lodge - Healthy with minor restrictions
  ...next14Days.flatMap((date, idx) => [
    { id: `avail-mv-booking-mvr-${date}`, propertyId: 'prop-4', propertyName: 'Mountain View Lodge', roomType: 'Mountain View Room', channelId: 'booking', channelName: 'Booking.com', date, availabilityStatus: 'open' as const, inventoryCount: 10, restrictionType: idx >= 10 && idx <= 12 ? 'min-los' as const : 'none' as const, syncStatus: 'fresh' as const, sellable: true, issueCount: 0, lastUpdatedAt: '2026-05-17T09:00:00Z' },
    { id: `avail-mv-agoda-gb-${date}`, propertyId: 'prop-4', propertyName: 'Mountain View Lodge', roomType: 'Garden Bungalow', channelId: 'agoda', channelName: 'Agoda', date, availabilityStatus: 'open' as const, inventoryCount: 5, restrictionType: 'none' as const, syncStatus: 'fresh' as const, sellable: true, issueCount: 0, lastUpdatedAt: '2026-05-17T09:12:00Z' },
  ]),

  // City Center Apartments - Channel mismatch: Booking open, Agoda has issues
  ...next14Days.flatMap((date, idx) => [
    { id: `avail-cc-booking-1br-${date}`, propertyId: 'prop-5', propertyName: 'City Center Apartments', roomType: '1BR Apartment', channelId: 'booking', channelName: 'Booking.com', date, availabilityStatus: 'open' as const, inventoryCount: 8, restrictionType: 'none' as const, syncStatus: 'fresh' as const, sellable: true, issueCount: 0, lastUpdatedAt: '2026-05-16T23:45:00Z' },
    { id: `avail-cc-agoda-1br-${date}`, propertyId: 'prop-5', propertyName: 'City Center Apartments', roomType: '1BR Apartment', channelId: 'agoda', channelName: 'Agoda', date, availabilityStatus: idx < 5 ? 'closed' as const : 'open' as const, inventoryCount: idx < 5 ? 0 : 8, restrictionType: 'none' as const, syncStatus: 'fresh' as const, sellable: idx >= 5, issueCount: idx < 5 ? 1 : 0, lastUpdatedAt: '2026-05-17T08:00:00Z' },
    { id: `avail-cc-airbnb-ph-${date}`, propertyId: 'prop-5', propertyName: 'City Center Apartments', roomType: 'Penthouse', channelId: 'airbnb', channelName: 'Airbnb', date, availabilityStatus: idx === 0 ? 'sold-out' as const : 'low-inventory' as const, inventoryCount: idx === 0 ? 0 : 1, restrictionType: 'none' as const, syncStatus: 'fresh' as const, sellable: idx !== 0, issueCount: 0, lastUpdatedAt: '2026-05-17T08:30:00Z' },
  ]),

  // Heritage Mansion - Draft, no sellable channels
  ...next14Days.flatMap((date) => [
    { id: `avail-hm-booking-hr-${date}`, propertyId: 'prop-6', propertyName: 'Heritage Mansion', roomType: 'Heritage Room', channelId: 'booking', channelName: 'Booking.com', date, availabilityStatus: 'unknown' as const, inventoryCount: 0, restrictionType: 'none' as const, syncStatus: 'missing' as const, sellable: false, issueCount: 1, lastUpdatedAt: '' },
  ]),
];

export const channelAvailabilityStatus: ChannelAvailabilityStatus[] = [
  // Grand Marina Resort & Spa - All channels healthy
  { id: 'cas-gm-booking', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'booking', channelName: 'Booking.com', mapped: true, inventoryLoaded: true, ratePlanActive: true, sellable: true, syncStatus: 'fresh', lastSyncAt: '2026-05-17T09:15:00Z', openDates: 14, closedDates: 0, restrictedDates: 0, issueSummary: '' },
  { id: 'cas-gm-agoda', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'agoda', channelName: 'Agoda', mapped: true, inventoryLoaded: true, ratePlanActive: true, sellable: true, syncStatus: 'fresh', lastSyncAt: '2026-05-17T09:12:00Z', openDates: 14, closedDates: 0, restrictedDates: 0, issueSummary: '' },
  { id: 'cas-gm-airbnb', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'airbnb', channelName: 'Airbnb', mapped: true, inventoryLoaded: true, ratePlanActive: true, sellable: true, syncStatus: 'fresh', lastSyncAt: '2026-05-17T09:00:00Z', openDates: 12, closedDates: 2, restrictedDates: 0, issueSummary: 'Pool Villa sold out for 2 days' },

  // Urban Boutique Hotel - Fully healthy
  { id: 'cas-ub-booking', propertyId: 'prop-2', propertyName: 'Urban Boutique Hotel', channelId: 'booking', channelName: 'Booking.com', mapped: true, inventoryLoaded: true, ratePlanActive: true, sellable: true, syncStatus: 'fresh', lastSyncAt: '2026-05-17T09:12:00Z', openDates: 14, closedDates: 0, restrictedDates: 0, issueSummary: '' },
  { id: 'cas-ub-agoda', propertyId: 'prop-2', propertyName: 'Urban Boutique Hotel', channelId: 'agoda', channelName: 'Agoda', mapped: true, inventoryLoaded: true, ratePlanActive: true, sellable: true, syncStatus: 'fresh', lastSyncAt: '2026-05-17T09:10:00Z', openDates: 14, closedDates: 0, restrictedDates: 0, issueSummary: '' },

  // Seaside Villas Collection - Critical issues on Booking
  { id: 'cas-sv-booking', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'booking', channelName: 'Booking.com', mapped: false, inventoryLoaded: false, ratePlanActive: false, sellable: false, syncStatus: 'stale', lastSyncAt: '2026-05-15T12:00:00Z', openDates: 0, closedDates: 3, restrictedDates: 11, issueSummary: 'Closed for next 3 days, min-LOS restriction blocking' },
  { id: 'cas-sv-airbnb', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'airbnb', channelName: 'Airbnb', mapped: true, inventoryLoaded: true, ratePlanActive: true, sellable: true, syncStatus: 'fresh', lastSyncAt: '2026-05-17T09:00:00Z', openDates: 14, closedDates: 0, restrictedDates: 0, issueSummary: '' },

  // Mountain View Lodge - Healthy with minor restrictions
  { id: 'cas-mv-booking', propertyId: 'prop-4', propertyName: 'Mountain View Lodge', channelId: 'booking', channelName: 'Booking.com', mapped: true, inventoryLoaded: true, ratePlanActive: true, sellable: true, syncStatus: 'fresh', lastSyncAt: '2026-05-17T09:00:00Z', openDates: 11, closedDates: 0, restrictedDates: 3, issueSummary: '3 days with min-LOS restriction' },
  { id: 'cas-mv-agoda', propertyId: 'prop-4', propertyName: 'Mountain View Lodge', channelId: 'agoda', channelName: 'Agoda', mapped: true, inventoryLoaded: true, ratePlanActive: true, sellable: true, syncStatus: 'fresh', lastSyncAt: '2026-05-17T09:12:00Z', openDates: 14, closedDates: 0, restrictedDates: 0, issueSummary: '' },

  // City Center Apartments - Channel mismatch
  { id: 'cas-cc-booking', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'booking', channelName: 'Booking.com', mapped: true, inventoryLoaded: true, ratePlanActive: true, sellable: true, syncStatus: 'fresh', lastSyncAt: '2026-05-16T23:45:00Z', openDates: 14, closedDates: 0, restrictedDates: 0, issueSummary: '' },
  { id: 'cas-cc-agoda', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'agoda', channelName: 'Agoda', mapped: true, inventoryLoaded: true, ratePlanActive: true, sellable: false, syncStatus: 'fresh', lastSyncAt: '2026-05-17T08:00:00Z', openDates: 9, closedDates: 5, restrictedDates: 0, issueSummary: 'Closed for next 5 days on Agoda' },
  { id: 'cas-cc-airbnb', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'airbnb', channelName: 'Airbnb', mapped: true, inventoryLoaded: true, ratePlanActive: true, sellable: true, syncStatus: 'fresh', lastSyncAt: '2026-05-17T08:30:00Z', openDates: 13, closedDates: 1, restrictedDates: 0, issueSummary: 'Penthouse sold out for 1 day' },

  // Heritage Mansion - Not configured
  { id: 'cas-hm-booking', propertyId: 'prop-6', propertyName: 'Heritage Mansion', channelId: 'booking', channelName: 'Booking.com', mapped: false, inventoryLoaded: false, ratePlanActive: false, sellable: false, syncStatus: 'missing', lastSyncAt: '', openDates: 0, closedDates: 0, restrictedDates: 0, issueSummary: 'Property in draft, no channel configuration' },
];

export const sellabilityIssues: SellabilityIssue[] = [
  { id: 'si-1', severity: 'critical', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'booking', channelName: 'Booking.com', roomType: '2BR Villa', dateRange: 'May 17-19', issueType: 'channel-closed', title: 'Booking.com closed for next 3 days', description: 'Booking.com channel is closed while Airbnb remains open. Potential revenue loss and channel parity issue.', lastSeen: '2026-05-17T09:00:00Z', status: 'active' },
  { id: 'si-2', severity: 'critical', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'booking', channelName: 'Booking.com', issueType: 'sync-stale', title: 'Stale sync - last update 48h ago', description: 'Booking.com availability data is over 48 hours old. Cannot verify current sellability state.', lastSeen: '2026-05-17T09:00:00Z', status: 'active' },
  { id: 'si-3', severity: 'high', propertyId: 'prop-5', propertyName: 'City Center Apartments', channelId: 'agoda', channelName: 'Agoda', roomType: '1BR Apartment', dateRange: 'May 17-21', issueType: 'channel-mismatch', title: 'Channel availability mismatch', description: 'Agoda closed for next 5 days while Booking.com is open. This creates a channel parity issue.', lastSeen: '2026-05-17T08:00:00Z', status: 'active' },
  { id: 'si-4', severity: 'high', propertyId: 'prop-6', propertyName: 'Heritage Mansion', channelId: 'booking', channelName: 'Booking.com', issueType: 'property-not-sellable', title: 'Property in draft - no active sellable channels', description: 'Heritage Mansion has no OTA property ID, commission model, or room mappings configured. Cannot accept bookings.', lastSeen: '2026-05-17T09:00:00Z', status: 'active' },
  { id: 'si-5', severity: 'medium', propertyId: 'prop-3', propertyName: 'Seaside Villas Collection', channelId: 'booking', channelName: 'Booking.com', roomType: '2BR Villa', dateRange: 'May 20-30', issueType: 'restriction-blocking', title: 'Min-LOS restriction may block short stays', description: 'Minimum length of stay restriction is active for the next 11 days on Booking.com.', lastSeen: '2026-05-17T09:00:00Z', status: 'active' },
  { id: 'si-6', severity: 'medium', propertyId: 'prop-4', propertyName: 'Mountain View Lodge', channelId: 'booking', channelName: 'Booking.com', roomType: 'Mountain View Room', dateRange: 'May 27-29', issueType: 'restriction-blocking', title: 'Min-LOS restriction active', description: '3-night minimum stay restriction is configured for late May dates.', lastSeen: '2026-05-17T09:00:00Z', status: 'acknowledged' },
  { id: 'si-7', severity: 'low', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', channelId: 'airbnb', channelName: 'Airbnb', roomType: 'Pool Villa', dateRange: 'May 17-18', issueType: 'room-sold-out', title: 'Pool Villa sold out for 2 days', description: 'Pool Villa is sold out on Airbnb for the next 2 days. This is expected high demand.', lastSeen: '2026-05-17T09:00:00Z', status: 'acknowledged' },
  { id: 'si-8', severity: 'low', propertyId: 'prop-1', propertyName: 'Grand Marina Resort & Spa', roomType: 'Deluxe Ocean View', dateRange: 'May 17-19', issueType: 'inventory-missing', title: 'Low inventory on Deluxe Ocean View', description: 'Only 2 rooms available for the next 3 days across all channels. Consider adjusting rates.', lastSeen: '2026-05-17T09:15:00Z', status: 'active' },
];

export const availabilityKPIs: AvailabilityKPIs = {
  propertiesOpen: properties.filter(p => p.onboardingStatus === 'active').length,
  propertiesAtRisk: channelAvailabilityStatus.filter(c => !c.sellable || c.syncStatus === 'stale').length,
  closedDates: channelAvailabilityStatus.reduce((sum, c) => sum + c.closedDates, 0),
  lowInventoryRooms: availabilitySnapshots.filter(a => a.availabilityStatus === 'low-inventory').length,
  channelsWithSellabilityIssues: channelAvailabilityStatus.filter(c => !c.sellable).length,
  staleSyncs: channelAvailabilityStatus.filter(c => c.syncStatus === 'stale' || c.syncStatus === 'missing').length,
};

// Helper functions for availability
export function getAvailabilityByProperty(propertyId: string): AvailabilitySnapshot[] {
  return availabilitySnapshots.filter(a => a.propertyId === propertyId);
}

export function getChannelAvailabilityByProperty(propertyId: string): ChannelAvailabilityStatus[] {
  return channelAvailabilityStatus.filter(c => c.propertyId === propertyId);
}

export function getSellabilityIssuesByProperty(propertyId: string): SellabilityIssue[] {
  return sellabilityIssues.filter(i => i.propertyId === propertyId);
}
