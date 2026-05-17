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
// Add OTA Channel Modal
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit?.(formData);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Add OTA Channel</DialogTitle>
          <DialogDescription className="text-[12px]">
            Connect an OTA channel to {propertyName || 'this property'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
// Add Room/Rate Mapping Modal
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
      <DialogContent className="sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Add Room/Rate Mapping</DialogTitle>
          <DialogDescription className="text-[12px]">
            Map your internal room type to {channelName || 'OTA'} listing for {propertyName || 'this property'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
// Add Manual Price Capture Modal
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Add Manual Price Capture</DialogTitle>
          <DialogDescription className="text-[12px]">
            Record a manually observed OTA price for {propertyName || 'this property'}.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
            <div className="grid grid-cols-4 gap-3">
              <div className="grid gap-2">
                <Label className="text-[11px]">Display Price</Label>
                <Input
                  type="number"
                  min={0}
                  value={formData.displayPrice}
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
                  value={formData.referencePrice}
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
            <div className="grid gap-2">
              <Label className="text-[11px]">Notes (optional)</Label>
              <Textarea
                value={formData.note}
                onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                placeholder="e.g., Observed mobile discount active, Genius stacking suspected"
                className="min-h-[60px] text-[12px]"
              />
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
      <DialogContent className="sm:max-w-[440px]">
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
