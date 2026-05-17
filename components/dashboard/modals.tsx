'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { StatusBadge } from './status-badge';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  HelpCircle,
  ArrowRight,
  Link2,
  ShieldCheck,
  ImageIcon,
} from 'lucide-react';
import type {
  OnboardingStatus,
  CancellationPolicy,
  CommissionModel,
  PayoutModel,
  SourceType,
  SourceConfidence,
  MappingStatus,
} from '@/lib/types';

// ============================================================
// Add Property Modal
// ============================================================

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: AddPropertyData) => void;
}

interface AddPropertyData {
  name: string;
  location: string;
  currency: string;
  timezone: string;
  onboardingStatus: OnboardingStatus;
}

export function AddPropertyModal({ open, onOpenChange, onSubmit }: AddPropertyModalProps) {
  const [formData, setFormData] = React.useState<AddPropertyData>({
    name: '',
    location: '',
    currency: 'THB',
    timezone: 'Asia/Bangkok',
    onboardingStatus: 'draft',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onOpenChange(false);
    setFormData({ name: '', location: '', currency: 'THB', timezone: 'Asia/Bangkok', onboardingStatus: 'draft' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Add New Property</DialogTitle>
          <DialogDescription className="text-[12px]">
            Add a new property to start monitoring OTA prices and booking revenue.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name" className="text-[11px]">Property Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Grand Marina Resort & Spa"
                className="h-9 text-[12px]"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="location" className="text-[11px]">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="e.g., Phuket, Thailand"
                className="h-9 text-[12px]"
                required
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label htmlFor="currency" className="text-[11px]">Currency</Label>
                <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                  <SelectTrigger className="h-9 text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="THB">THB - Thai Baht</SelectItem>
                    <SelectItem value="USD">USD - US Dollar</SelectItem>
                    <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                    <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
                    <SelectItem value="IDR">IDR - Indonesian Rupiah</SelectItem>
                    <SelectItem value="EUR">EUR - Euro</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="timezone" className="text-[11px]">Timezone</Label>
                <Select value={formData.timezone} onValueChange={(v) => setFormData({ ...formData, timezone: v })}>
                  <SelectTrigger className="h-9 text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                    <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                    <SelectItem value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</SelectItem>
                    <SelectItem value="Asia/Jakarta">Asia/Jakarta</SelectItem>
                    <SelectItem value="Asia/Makassar">Asia/Makassar</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px]">Initial Onboarding Status</Label>
              <div className="flex flex-wrap gap-2">
                {(['draft', 'mapping-needed', 'email-live', 'price-monitor-live', 'verification-pending', 'active'] as OnboardingStatus[]).map((status) => (
                  <button
                    key={status}
                    type="button"
                    onClick={() => setFormData({ ...formData, onboardingStatus: status })}
                    className={`rounded border px-2 py-1 text-[10px] transition-colors ${
                      formData.onboardingStatus === status
                        ? 'border-info bg-info/10 text-info'
                        : 'border-border bg-background text-muted-foreground hover:border-muted-foreground'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-[11px]">
              Cancel
            </Button>
            <Button type="submit" className="h-8 text-[11px]">
              Add Property
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Add OTA Channel Modal - Enhanced with OTA-specific context
// ============================================================

interface AddOTAChannelModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyName?: string;
  onSubmit?: (data: AddOTAChannelData) => void;
}

interface AddOTAChannelData {
  channelId: string;
  otaPropertyId: string;
  otaPropertyName: string;
  commissionModel: CommissionModel;
  commissionPercent: number;
  payoutModel: PayoutModel;
  promotionStackingRule: string;
}

// OTA-specific defaults and context
const otaDefaults: Record<string, { commission: number; payout: PayoutModel; hints: string[]; verificationMode: string; sourceType: string }> = {
  booking: {
    commission: 15,
    payout: 'collect-and-remit',
    hints: [
      'Booking details require admin extranet verification',
      'Genius + mobile discounts may stack',
      'Commission deducted before payout',
    ],
    verificationMode: 'Admin extranet login',
    sourceType: 'Admin-link signal',
  },
  agoda: {
    commission: 18,
    payout: 'virtual-card',
    hints: [
      'Email parsing provides rich booking details',
      'Secret deals + insider deals may stack',
      'Higher commission but often better conversion',
    ],
    verificationMode: 'Email parsing',
    sourceType: 'Email-parsed',
  },
  airbnb: {
    commission: 3,
    payout: 'bank-transfer',
    hints: [
      'Host-only fee model (3%)',
      'Guest service fee (14-16%) shown in display price',
      'Manual screenshot verification recommended',
    ],
    verificationMode: 'Screenshot / Host dashboard',
    sourceType: 'Screenshot-captured',
  },
  expedia: {
    commission: 18,
    payout: 'virtual-card',
    hints: [
      'Package deals may bundle flight + hotel',
      'Member pricing may affect displayed rates',
      'Partner Central extranet for verification',
    ],
    verificationMode: 'Partner Central',
    sourceType: 'Admin-link signal',
  },
  trip: {
    commission: 15,
    payout: 'collect-and-remit',
    hints: [
      'Strong in Asian markets',
      'Email confirmation may provide details',
      'Commission varies by market',
    ],
    verificationMode: 'Email / Extranet',
    sourceType: 'Email-parsed',
  },
};

export function AddOTAChannelModal({ open, onOpenChange, propertyName, onSubmit }: AddOTAChannelModalProps) {
  const [formData, setFormData] = React.useState<AddOTAChannelData>({
    channelId: 'booking',
    otaPropertyId: '',
    otaPropertyName: '',
    commissionModel: 'percentage',
    commissionPercent: 15,
    payoutModel: 'collect-and-remit',
    promotionStackingRule: '',
  });

  // Update defaults when channel changes
  React.useEffect(() => {
    const defaults = otaDefaults[formData.channelId];
    if (defaults) {
      setFormData((prev) => ({
        ...prev,
        commissionPercent: defaults.commission,
        payoutModel: defaults.payout,
      }));
    }
  }, [formData.channelId]);

  const currentDefaults = otaDefaults[formData.channelId] || otaDefaults.booking;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onOpenChange(false);
  };

  // Validation warnings
  const warnings = [];
  if (!formData.otaPropertyId) warnings.push('Missing OTA Property ID - captures cannot be linked');
  if (formData.commissionModel === 'unknown') warnings.push('Commission unknown - net revenue cannot be calculated');
  if (formData.payoutModel === 'unknown') warnings.push('Payout model unknown');
  if (!formData.promotionStackingRule) warnings.push('Stacking rule not set - may miss promo-driven price differences');

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Add OTA Channel</DialogTitle>
          <DialogDescription className="text-[12px]">
            Connect an OTA channel to {propertyName || 'this property'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            {/* Section 1: OTA Identity */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px]">1</span>
                OTA Identity
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                <div className="grid gap-2">
                  <Label className="text-[11px]">OTA Channel</Label>
                  <Select value={formData.channelId} onValueChange={(v) => setFormData({ ...formData, channelId: v })}>
                    <SelectTrigger className="h-9 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking.com</SelectItem>
                      <SelectItem value="agoda">Agoda</SelectItem>
                      <SelectItem value="airbnb">Airbnb</SelectItem>
                      <SelectItem value="expedia">Expedia</SelectItem>
                      <SelectItem value="trip">Trip.com</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid gap-2">
                    <Label className="text-[11px]">OTA Property ID</Label>
                    <Input
                      value={formData.otaPropertyId}
                      onChange={(e) => setFormData({ ...formData, otaPropertyId: e.target.value })}
                      placeholder="e.g., bcom-12345"
                      className="h-9 text-[12px]"
                    />
                    <p className="text-[9px] text-muted-foreground">Required to link price captures</p>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[11px]">OTA Property Name</Label>
                    <Input
                      value={formData.otaPropertyName}
                      onChange={(e) => setFormData({ ...formData, otaPropertyName: e.target.value })}
                      placeholder="Name as shown on OTA"
                      className="h-9 text-[12px]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Commercial Rules */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px]">2</span>
                Commercial Rules
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-2">
                    <Label className="text-[11px]">Commission Model</Label>
                    <Select
                      value={formData.commissionModel}
                      onValueChange={(v) => setFormData({ ...formData, commissionModel: v as CommissionModel })}
                    >
                      <SelectTrigger className="h-9 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage</SelectItem>
                        <SelectItem value="fixed-per-night">Fixed per Night</SelectItem>
                        <SelectItem value="tiered">Tiered</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[11px]">Commission %</Label>
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      step={0.5}
                      value={formData.commissionPercent}
                      onChange={(e) => setFormData({ ...formData, commissionPercent: parseFloat(e.target.value) || 0 })}
                      className="h-9 text-[12px]"
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[11px]">Payout Model</Label>
                    <Select
                      value={formData.payoutModel}
                      onValueChange={(v) => setFormData({ ...formData, payoutModel: v as PayoutModel })}
                    >
                      <SelectTrigger className="h-9 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="collect-and-remit">Collect & Remit</SelectItem>
                        <SelectItem value="pay-at-property">Pay at Property</SelectItem>
                        <SelectItem value="virtual-card">Virtual Card</SelectItem>
                        <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                        <SelectItem value="unknown">Unknown</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px]">Promotion Stacking Rule (optional)</Label>
                  <Input
                    value={formData.promotionStackingRule}
                    onChange={(e) => setFormData({ ...formData, promotionStackingRule: e.target.value })}
                    placeholder="e.g., Genius + mobile discount may stack"
                    className="h-9 text-[12px]"
                  />
                </div>
              </div>
            </div>

            {/* Section 3: Verification & Source Assumptions */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px]">3</span>
                Verification & Source Assumptions
              </div>
              <div className="rounded-lg border border-info/30 bg-info/5 p-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-semibold uppercase text-info">Expected Verification Mode</p>
                    <p className="mt-1 text-[11px] text-foreground">{currentDefaults.verificationMode}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase text-info">Primary Source Type</p>
                    <p className="mt-1 text-[11px] text-foreground">{currentDefaults.sourceType}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Readiness Impact Preview */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px]">4</span>
                Readiness Impact
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                  <div className="flex items-center gap-2 rounded bg-muted/50 p-2">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] font-medium text-foreground">Mapping</p>
                      <p className="text-[9px] text-warning">Required</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded bg-muted/50 p-2">
                    <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] font-medium text-foreground">Verification</p>
                      <p className="text-[9px] text-muted-foreground">{currentDefaults.verificationMode}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded bg-muted/50 p-2">
                    <ImageIcon className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] font-medium text-foreground">Source Trust</p>
                      <p className="text-[9px] text-muted-foreground">{currentDefaults.sourceType}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded bg-muted/50 p-2">
                    <CheckCircle2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <div>
                      <p className="text-[10px] font-medium text-foreground">Commercial</p>
                      <p className="text-[9px] text-muted-foreground">{formData.commissionPercent}% applied</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* OTA-specific hints */}
            <div className="rounded-lg border border-border bg-muted/10 p-3">
              <div className="flex items-center gap-2 mb-2">
                <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />
                <p className="text-[10px] font-semibold text-muted-foreground">Channel-Specific Notes</p>
              </div>
              <ul className="space-y-1">
                {currentDefaults.hints.map((hint, i) => (
                  <li key={i} className="flex items-start gap-2 text-[10px] text-muted-foreground">
                    <ArrowRight className="mt-0.5 h-3 w-3 shrink-0" />
                    {hint}
                  </li>
                ))}
              </ul>
            </div>

            {/* Warnings */}
            {warnings.length > 0 && (
              <div className="rounded-lg border border-warning/40 bg-warning/10 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  <p className="text-[10px] font-semibold text-warning">Setup Warnings</p>
                </div>
                <ul className="space-y-1">
                  {warnings.map((warning, i) => (
                    <li key={i} className="flex items-start gap-2 text-[10px] text-warning">
                      <span className="mt-0.5">•</span>
                      {warning}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-[11px]">
              Cancel
            </Button>
            <Button type="submit" className="h-8 text-[11px]">
              Add Channel
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Add Room/Rate Mapping Modal - Enhanced with compare impact
// ============================================================

interface AddMappingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyName?: string;
  channelName?: string;
  onSubmit?: (data: AddMappingData) => void;
}

interface AddMappingData {
  roomType: string;
  otaRoomName: string;
  ratePlan: string;
  otaRatePlanName: string;
  cancellationPolicy: CancellationPolicy;
  status: MappingStatus;
}

export function AddMappingModal({ open, onOpenChange, propertyName, channelName, onSubmit }: AddMappingModalProps) {
  const [formData, setFormData] = React.useState<AddMappingData>({
    roomType: '',
    otaRoomName: '',
    ratePlan: '',
    otaRatePlanName: '',
    cancellationPolicy: 'free-cancellation',
    status: 'complete',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[580px]">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Add Room/Rate Mapping</DialogTitle>
          <DialogDescription className="text-[12px]">
            Map your internal room type to {channelName || 'OTA'} listing for {propertyName || 'this property'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            {/* Room Mapping */}
            <div className="space-y-3">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Room Mapping</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label className="text-[11px]">Internal Room Type</Label>
                  <Input
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    placeholder="e.g., Deluxe Ocean View"
                    className="h-9 text-[12px]"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px]">OTA Room Name</Label>
                  <Input
                    value={formData.otaRoomName}
                    onChange={(e) => setFormData({ ...formData, otaRoomName: e.target.value })}
                    placeholder="Name as shown on OTA"
                    className="h-9 text-[12px]"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Rate Plan Mapping */}
            <div className="space-y-3">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Rate Plan Mapping</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label className="text-[11px]">Internal Rate Plan</Label>
                  <Input
                    value={formData.ratePlan}
                    onChange={(e) => setFormData({ ...formData, ratePlan: e.target.value })}
                    placeholder="e.g., Flexible"
                    className="h-9 text-[12px]"
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px]">OTA Rate Plan Name</Label>
                  <Input
                    value={formData.otaRatePlanName}
                    onChange={(e) => setFormData({ ...formData, otaRatePlanName: e.target.value })}
                    placeholder="Rate plan name on OTA"
                    className="h-9 text-[12px]"
                  />
                </div>
              </div>
              <div className="rounded border border-info/30 bg-info/5 p-2.5">
                <div className="flex items-start gap-2">
                  <Info className="mt-0.5 h-3.5 w-3.5 text-info" />
                  <p className="text-[10px] text-info">
                    Rate plan equivalence is important for accurate comparison. Different rate plans (e.g., Flexible vs Non-refundable) typically have 10-20% price difference.
                  </p>
                </div>
              </div>
            </div>

            {/* Cancellation & Status */}
            <div className="space-y-3">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Cancellation & Status</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label className="text-[11px]">Cancellation Policy</Label>
                  <Select
                    value={formData.cancellationPolicy}
                    onValueChange={(v) => setFormData({ ...formData, cancellationPolicy: v as CancellationPolicy })}
                  >
                    <SelectTrigger className="h-9 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free-cancellation">Free Cancellation</SelectItem>
                      <SelectItem value="non-refundable">Non-refundable</SelectItem>
                      <SelectItem value="partial-refund">Partial Refund</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="strict">Strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px]">Mapping Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(v) => setFormData({ ...formData, status: v as MappingStatus })}
                  >
                    <SelectTrigger className="h-9 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="complete">Complete</SelectItem>
                      <SelectItem value="partial">Partial</SelectItem>
                      <SelectItem value="needs-verification">Needs Verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="rounded border border-warning/30 bg-warning/5 p-2.5">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="mt-0.5 h-3.5 w-3.5 text-warning" />
                  <p className="text-[10px] text-warning">
                    Cancellation policy alignment is critical. Comparing free-cancellation rates with non-refundable will show misleading deltas.
                  </p>
                </div>
              </div>
            </div>

            {/* Compare Impact Preview */}
            <div className="rounded-lg border border-border bg-muted/20 p-3">
              <p className="text-[10px] font-semibold text-muted-foreground mb-2">Compare Impact</p>
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center">
                  <p className={cn(
                    "text-[11px] font-semibold",
                    formData.status === 'complete' ? "text-success" : formData.status === 'partial' ? "text-warning" : "text-muted-foreground"
                  )}>
                    {formData.status === 'complete' ? 'Strict' : formData.status === 'partial' ? 'Normalized' : 'Uncertain'}
                  </p>
                  <p className="text-[9px] text-muted-foreground">Compare Quality</p>
                </div>
                <div className="text-center">
                  <p className="text-[11px] font-semibold text-foreground">
                    {formData.cancellationPolicy === 'non-refundable' ? '-10-20%' : '0%'}
                  </p>
                  <p className="text-[9px] text-muted-foreground">Expected Delta</p>
                </div>
                <div className="text-center">
                  <p className={cn(
                    "text-[11px] font-semibold",
                    formData.status === 'complete' ? "text-success" : "text-warning"
                  )}>
                    {formData.status === 'complete' ? 'High' : 'Medium'}
                  </p>
                  <p className="text-[9px] text-muted-foreground">Confidence</p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-[11px]">
              Cancel
            </Button>
            <Button type="submit" className="h-8 text-[11px]">
              Add Mapping
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Add Manual Price Capture Modal - Enhanced with evidence guidance
// ============================================================

interface AddPriceCaptureModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  propertyName?: string;
  onSubmit?: (data: AddPriceCaptureData) => void;
}

interface AddPriceCaptureData {
  channelId: string;
  deviceType: 'desktop' | 'mobile';
  roomType: string;
  ratePlan: string;
  cancellationPolicy: CancellationPolicy;
  stayDate: string;
  displayPrice: number;
  referencePrice: number;
  currency: string;
  sourceType: SourceType;
  sourceConfidence: SourceConfidence;
  note: string;
}

export function AddPriceCaptureModal({ open, onOpenChange, propertyName, onSubmit }: AddPriceCaptureModalProps) {
  const [formData, setFormData] = React.useState<AddPriceCaptureData>({
    channelId: 'booking',
    deviceType: 'desktop',
    roomType: '',
    ratePlan: '',
    cancellationPolicy: 'free-cancellation',
    stayDate: '',
    displayPrice: 0,
    referencePrice: 0,
    currency: 'THB',
    sourceType: 'manual-entry',
    sourceConfidence: 'low',
    note: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onOpenChange(false);
  };

  // Calculate delta
  const delta = formData.displayPrice - formData.referencePrice;
  const deltaPercent = formData.referencePrice > 0 ? ((delta / formData.referencePrice) * 100) : 0;

  // Source confidence guidance
  const getConfidenceGuidance = () => {
    if (formData.sourceType === 'screenshot-captured') {
      return { level: 'high', text: 'Screenshot evidence provides high confidence' };
    }
    if (formData.sourceType === 'email-parsed') {
      return { level: 'high', text: 'Email parsing provides high confidence' };
    }
    if (formData.sourceType === 'admin-link-signal') {
      return { level: 'medium', text: 'Admin link signal - verify in extranet for high confidence' };
    }
    return { level: 'low', text: 'Manual entry - consider adding screenshot evidence' };
  };

  const confidenceGuidance = getConfidenceGuidance();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[620px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Add Manual Price Capture</DialogTitle>
          <DialogDescription className="text-[12px]">
            Record a manually observed OTA price for {propertyName || 'this property'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            {/* Basic Info */}
            <div className="space-y-3">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Capture Details</Label>
              <div className="grid grid-cols-3 gap-3">
                <div className="grid gap-2">
                  <Label className="text-[11px]">OTA Channel</Label>
                  <Select value={formData.channelId} onValueChange={(v) => setFormData({ ...formData, channelId: v })}>
                    <SelectTrigger className="h-9 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="booking">Booking.com</SelectItem>
                      <SelectItem value="agoda">Agoda</SelectItem>
                      <SelectItem value="airbnb">Airbnb</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px]">Device</Label>
                  <Select
                    value={formData.deviceType}
                    onValueChange={(v) => setFormData({ ...formData, deviceType: v as 'desktop' | 'mobile' })}
                  >
                    <SelectTrigger className="h-9 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="desktop">Desktop</SelectItem>
                      <SelectItem value="mobile">Mobile</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px]">Stay Date</Label>
                  <Input
                    type="date"
                    value={formData.stayDate}
                    onChange={(e) => setFormData({ ...formData, stayDate: e.target.value })}
                    className="h-9 text-[12px]"
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label className="text-[11px]">Room Type</Label>
                  <Input
                    value={formData.roomType}
                    onChange={(e) => setFormData({ ...formData, roomType: e.target.value })}
                    placeholder="e.g., Deluxe Ocean View"
                    className="h-9 text-[12px]"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px]">Rate Plan</Label>
                  <Input
                    value={formData.ratePlan}
                    onChange={(e) => setFormData({ ...formData, ratePlan: e.target.value })}
                    placeholder="e.g., Flexible"
                    className="h-9 text-[12px]"
                  />
                </div>
              </div>
            </div>

            {/* Pricing */}
            <div className="space-y-3">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Pricing</Label>
              <div className="grid grid-cols-4 gap-3">
                <div className="grid gap-2">
                  <Label className="text-[11px]">Display Price</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.displayPrice || ''}
                    onChange={(e) => setFormData({ ...formData, displayPrice: parseFloat(e.target.value) || 0 })}
                    className="h-9 text-[12px]"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px]">Reference Price</Label>
                  <Input
                    type="number"
                    min={0}
                    value={formData.referencePrice || ''}
                    onChange={(e) => setFormData({ ...formData, referencePrice: parseFloat(e.target.value) || 0 })}
                    className="h-9 text-[12px]"
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px]">Currency</Label>
                  <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                    <SelectTrigger className="h-9 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="THB">THB</SelectItem>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="SGD">SGD</SelectItem>
                      <SelectItem value="MYR">MYR</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px]">Cancellation</Label>
                  <Select
                    value={formData.cancellationPolicy}
                    onValueChange={(v) => setFormData({ ...formData, cancellationPolicy: v as CancellationPolicy })}
                  >
                    <SelectTrigger className="h-9 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free-cancellation">Free Cancel</SelectItem>
                      <SelectItem value="non-refundable">Non-refund</SelectItem>
                      <SelectItem value="flexible">Flexible</SelectItem>
                      <SelectItem value="strict">Strict</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Delta Preview */}
              {formData.referencePrice > 0 && (
                <div className={cn(
                  "rounded-lg border p-3",
                  Math.abs(deltaPercent) > 15 ? "border-critical/40 bg-critical/10" :
                  Math.abs(deltaPercent) > 5 ? "border-warning/40 bg-warning/10" :
                  deltaPercent === 0 ? "border-border bg-muted/20" :
                  "border-success/40 bg-success/10"
                )}>
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] text-muted-foreground">Delta</span>
                    <span className={cn(
                      "text-[14px] font-bold",
                      Math.abs(deltaPercent) > 15 ? "text-critical" :
                      Math.abs(deltaPercent) > 5 ? "text-warning" :
                      deltaPercent === 0 ? "text-muted-foreground" :
                      "text-success"
                    )}>
                      {deltaPercent > 0 ? '+' : ''}{deltaPercent.toFixed(1)}%
                      <span className="ml-2 text-[11px] font-normal">
                        ({delta > 0 ? '+' : ''}{formData.currency} {delta.toLocaleString()})
                      </span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Source & Evidence */}
            <div className="space-y-3">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Source & Evidence</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="grid gap-2">
                  <Label className="text-[11px]">Source Type</Label>
                  <Select
                    value={formData.sourceType}
                    onValueChange={(v) => setFormData({ ...formData, sourceType: v as SourceType })}
                  >
                    <SelectTrigger className="h-9 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="manual-entry">Manual Entry</SelectItem>
                      <SelectItem value="screenshot-captured">Screenshot</SelectItem>
                      <SelectItem value="admin-link-signal">Admin Link</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label className="text-[11px]">Confidence Level</Label>
                  <Select
                    value={formData.sourceConfidence}
                    onValueChange={(v) => setFormData({ ...formData, sourceConfidence: v as SourceConfidence })}
                  >
                    <SelectTrigger className="h-9 text-[12px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="pending-verification">Pending Verification</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {/* Confidence guidance */}
              <div className={cn(
                "rounded border p-2.5",
                confidenceGuidance.level === 'high' ? "border-success/30 bg-success/5" :
                confidenceGuidance.level === 'medium' ? "border-info/30 bg-info/5" :
                "border-warning/30 bg-warning/5"
              )}>
                <div className="flex items-start gap-2">
                  <Info className={cn(
                    "mt-0.5 h-3.5 w-3.5",
                    confidenceGuidance.level === 'high' ? "text-success" :
                    confidenceGuidance.level === 'medium' ? "text-info" :
                    "text-warning"
                  )} />
                  <p className={cn(
                    "text-[10px]",
                    confidenceGuidance.level === 'high' ? "text-success" :
                    confidenceGuidance.level === 'medium' ? "text-info" :
                    "text-warning"
                  )}>
                    {confidenceGuidance.text}
                  </p>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <Label className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Notes</Label>
              <div className="grid gap-2">
                <Textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="e.g., Observed mobile discount active, Genius stacking suspected, Price includes service fee"
                  className="min-h-[60px] text-[12px]"
                />
                <p className="text-[9px] text-muted-foreground">
                  Notes help explain why a mismatch may exist. Mention promotions, discounts, or fee inclusions observed.
                </p>
              </div>
            </div>

            {/* When to mark uncertain */}
            <div className="rounded-lg border border-muted bg-muted/10 p-3">
              <p className="text-[10px] font-semibold text-muted-foreground mb-2">When to mark as Uncertain Compare:</p>
              <ul className="space-y-1">
                <li className="flex items-start gap-2 text-[10px] text-muted-foreground">
                  <span>•</span>
                  Room mapping is incomplete or unclear
                </li>
                <li className="flex items-start gap-2 text-[10px] text-muted-foreground">
                  <span>•</span>
                  Cancellation policy differs from reference
                </li>
                <li className="flex items-start gap-2 text-[10px] text-muted-foreground">
                  <span>•</span>
                  Unknown fee structure (e.g., Airbnb service fee)
                </li>
                <li className="flex items-start gap-2 text-[10px] text-muted-foreground">
                  <span>•</span>
                  Multiple promotions may be stacking
                </li>
              </ul>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-[11px]">
              Cancel
            </Button>
            <Button type="submit" className="h-8 text-[11px]">
              Save Capture
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================
// Edit Commission Rules Modal
// ============================================================

interface EditCommissionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channelName?: string;
  initialData?: {
    model: CommissionModel;
    percent: number;
    payoutModel: PayoutModel;
    notes: string;
  };
  onSubmit?: (data: EditCommissionData) => void;
}

interface EditCommissionData {
  model: CommissionModel;
  percent: number;
  payoutModel: PayoutModel;
  notes: string;
}

export function EditCommissionModal({ open, onOpenChange, channelName, initialData, onSubmit }: EditCommissionModalProps) {
  const [formData, setFormData] = React.useState<EditCommissionData>(
    initialData || { model: 'percentage', percent: 15, payoutModel: 'collect-and-remit', notes: '' }
  );

  React.useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Edit Commission Rules</DialogTitle>
          <DialogDescription className="text-[12px]">
            Update commission assumptions for {channelName || 'this OTA channel'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-2">
                <Label className="text-[11px]">Commission Model</Label>
                <Select
                  value={formData.model}
                  onValueChange={(v) => setFormData({ ...formData, model: v as CommissionModel })}
                >
                  <SelectTrigger className="h-9 text-[12px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Percentage</SelectItem>
                    <SelectItem value="fixed-per-night">Fixed per Night</SelectItem>
                    <SelectItem value="tiered">Tiered</SelectItem>
                    <SelectItem value="unknown">Unknown</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label className="text-[11px]">Default Commission %</Label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  step={0.5}
                  value={formData.percent}
                  onChange={(e) => setFormData({ ...formData, percent: parseFloat(e.target.value) || 0 })}
                  className="h-9 text-[12px]"
                />
              </div>
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px]">Payout Model</Label>
              <Select
                value={formData.payoutModel}
                onValueChange={(v) => setFormData({ ...formData, payoutModel: v as PayoutModel })}
              >
                <SelectTrigger className="h-9 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="collect-and-remit">Collect & Remit</SelectItem>
                  <SelectItem value="pay-at-property">Pay at Property</SelectItem>
                  <SelectItem value="virtual-card">Virtual Card</SelectItem>
                  <SelectItem value="bank-transfer">Bank Transfer</SelectItem>
                  <SelectItem value="unknown">Unknown</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label className="text-[11px]">Notes</Label>
              <Textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="e.g., Commission may vary with Genius level, Preferred Partner rates apply"
                className="min-h-[60px] text-[12px]"
              />
            </div>
            <div className="rounded border border-info/30 bg-info/5 p-2.5">
              <div className="flex items-start gap-2">
                <Info className="mt-0.5 h-3.5 w-3.5 text-info" />
                <p className="text-[10px] text-info">
                  Commission assumptions affect net revenue calculations. Changes apply to future captures only.
                </p>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-[11px]">
              Cancel
            </Button>
            <Button type="submit" className="h-8 text-[11px]">
              Save Changes
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
