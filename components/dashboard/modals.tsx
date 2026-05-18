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
import { cn, computeRoomSummary, validateRoomInventory } from '@/lib/utils';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  HelpCircle,
  ArrowRight,
  Link2,
  ShieldCheck,
  ImageIcon,
  Plus,
  Trash2,
  BedDouble,
} from 'lucide-react';
import type {
  OnboardingStatus,
  CancellationPolicy,
  CommissionModel,
  PayoutModel,
  SourceType,
  SourceConfidence,
  MappingStatus,
  PropertyRoomInventory,
} from '@/lib/types';

// ============================================================
// Add Property Modal
// ============================================================

interface AddPropertyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit?: (data: AddPropertyData) => void;
}

export interface AddPropertyRoomDraft {
  name: string;
  quantity: number;
  sellingPrice: number;
  beds: number;
  capacity: number;
}

export interface AddPropertyData {
  name: string;
  location: string;
  currency: string;
  timezone: string;
  rooms: AddPropertyRoomDraft[];
  onboardingStatus: OnboardingStatus;
}

const makeEmptyRoom = (): AddPropertyRoomDraft => ({
  name: '',
  quantity: 1,
  sellingPrice: 0,
  beds: 1,
  capacity: 2,
});

const DEFAULT_ROOM_ROWS = 3;

export function AddPropertyModal({ open, onOpenChange, onSubmit }: AddPropertyModalProps) {
  const initialState = React.useMemo<AddPropertyData>(
    () => ({
      name: '',
      location: '',
      currency: 'VND',
      timezone: 'Asia/Ho_Chi_Minh',
      rooms: Array.from({ length: DEFAULT_ROOM_ROWS }, makeEmptyRoom),
      onboardingStatus: 'draft',
    }),
    [],
  );
  const [formData, setFormData] = React.useState<AddPropertyData>(initialState);
  const [submitted, setSubmitted] = React.useState(false);

  const validation = React.useMemo(() => validateRoomInventory(formData.rooms), [formData.rooms]);
  const summary = React.useMemo(
    () =>
      computeRoomSummary(
        formData.rooms.map((r, idx) => ({
          id: `draft-${idx}`,
          name: r.name,
          quantity: r.quantity,
          sellingPrice: r.sellingPrice,
          beds: r.beds,
          capacity: r.capacity,
        })),
      ),
    [formData.rooms],
  );

  const updateRoom = (index: number, patch: Partial<AddPropertyRoomDraft>) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    }));
  };

  const addRoom = () => {
    setFormData((prev) => ({ ...prev, rooms: [...prev.rooms, makeEmptyRoom()] }));
  };

  const removeRoom = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      rooms: prev.rooms.length <= 1 ? prev.rooms : prev.rooms.filter((_, i) => i !== index),
    }));
  };

  const fieldError = (rowIndex: number, field: string) =>
    submitted && validation.errors.find((e) => e.rowIndex === rowIndex && e.field === field);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (!formData.name.trim() || !formData.location.trim()) return;
    if (validation.hasErrors) return;
    onSubmit?.(formData);
    onOpenChange(false);
    setFormData(initialState);
    setSubmitted(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[760px] max-h-[92vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[14px]">Add New Property</DialogTitle>
          <DialogDescription className="text-[12px]">
            Configure property basics and room inventory. Inventory is first-class — every room type is tracked separately.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-5 py-4">
            {/* Section A — Property Basics */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px]">A</span>
                Property Basics
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-3">
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
                <div className="grid grid-cols-3 gap-3">
                  <div className="grid gap-2">
                    <Label htmlFor="currency" className="text-[11px]">Currency</Label>
                    <Select value={formData.currency} onValueChange={(v) => setFormData({ ...formData, currency: v })}>
                      <SelectTrigger className="h-9 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="VND">VND - Vietnamese Dong</SelectItem>
                        <SelectItem value="THB">THB - Thai Baht</SelectItem>
                        <SelectItem value="USD">USD - US Dollar</SelectItem>
                        <SelectItem value="SGD">SGD - Singapore Dollar</SelectItem>
                        <SelectItem value="MYR">MYR - Malaysian Ringgit</SelectItem>
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
                        <SelectItem value="Asia/Ho_Chi_Minh">Asia/Ho_Chi_Minh</SelectItem>
                        <SelectItem value="Asia/Bangkok">Asia/Bangkok</SelectItem>
                        <SelectItem value="Asia/Singapore">Asia/Singapore</SelectItem>
                        <SelectItem value="Asia/Makassar">Asia/Makassar</SelectItem>
                        <SelectItem value="Asia/Kuala_Lumpur">Asia/Kuala_Lumpur</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid gap-2">
                    <Label className="text-[11px]">Onboarding Status</Label>
                    <Select value={formData.onboardingStatus} onValueChange={(v) => setFormData({ ...formData, onboardingStatus: v as OnboardingStatus })}>
                      <SelectTrigger className="h-9 text-[12px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="mapping-needed">Mapping Needed</SelectItem>
                        <SelectItem value="email-live">Email Live</SelectItem>
                        <SelectItem value="price-monitor-live">Price Monitor Live</SelectItem>
                        <SelectItem value="verification-pending">Verification Pending</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Section B — Inventory Rooms */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px]">B</span>
                  Inventory Rooms
                  <span className="ml-1 rounded bg-muted px-1.5 py-0.5 text-[9px] font-medium normal-case tracking-normal text-foreground">
                    {formData.rooms.length} row{formData.rooms.length === 1 ? '' : 's'}
                  </span>
                </div>
                <Button type="button" size="sm" variant="outline" className="h-7 gap-1 px-2 text-[11px]" onClick={addRoom}>
                  <Plus className="h-3 w-3" />
                  Add Room Type
                </Button>
              </div>
              <div className="rounded-lg border border-border bg-muted/20 p-3">
                <div className="grid grid-cols-[1.6fr_0.7fr_1fr_0.7fr_0.8fr_32px] items-center gap-2 px-1 pb-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">
                  <span>Room Name</span>
                  <span>Qty</span>
                  <span>Selling Price</span>
                  <span>Beds</span>
                  <span>Capacity</span>
                  <span className="sr-only">Remove</span>
                </div>
                <div className="space-y-2">
                  {formData.rooms.map((room, index) => {
                    const nameErr = fieldError(index, 'name');
                    const qtyErr = fieldError(index, 'quantity');
                    const priceErr = fieldError(index, 'sellingPrice');
                    const bedsErr = fieldError(index, 'beds');
                    const capErr = fieldError(index, 'capacity');
                    return (
                      <div
                        key={index}
                        className="grid grid-cols-[1.6fr_0.7fr_1fr_0.7fr_0.8fr_32px] items-start gap-2 rounded-md border border-border/60 bg-card p-2"
                      >
                        <div>
                          <Input
                            value={room.name}
                            onChange={(e) => updateRoom(index, { name: e.target.value })}
                            placeholder={`Room type ${index + 1}`}
                            className={cn('h-8 text-[12px]', nameErr && 'border-critical')}
                          />
                          {nameErr && <p className="mt-1 text-[9px] text-critical">{nameErr.message}</p>}
                        </div>
                        <div>
                          <Input
                            type="number"
                            min={1}
                            value={room.quantity}
                            onChange={(e) => updateRoom(index, { quantity: parseInt(e.target.value || '0', 10) || 0 })}
                            className={cn('h-8 text-[12px] tabular-nums', qtyErr && 'border-critical')}
                          />
                          {qtyErr && <p className="mt-1 text-[9px] text-critical">{qtyErr.message}</p>}
                        </div>
                        <div>
                          <Input
                            type="number"
                            min={0}
                            step={1000}
                            value={room.sellingPrice}
                            onChange={(e) => updateRoom(index, { sellingPrice: parseFloat(e.target.value) || 0 })}
                            placeholder="0"
                            className={cn('h-8 text-[12px] tabular-nums', priceErr && 'border-critical')}
                          />
                          {priceErr && <p className="mt-1 text-[9px] text-critical">{priceErr.message}</p>}
                        </div>
                        <div>
                          <Input
                            type="number"
                            min={1}
                            value={room.beds}
                            onChange={(e) => updateRoom(index, { beds: parseInt(e.target.value || '0', 10) || 0 })}
                            className={cn('h-8 text-[12px] tabular-nums', bedsErr && 'border-critical')}
                          />
                          {bedsErr && <p className="mt-1 text-[9px] text-critical">{bedsErr.message}</p>}
                        </div>
                        <div>
                          <Input
                            type="number"
                            min={1}
                            value={room.capacity}
                            onChange={(e) => updateRoom(index, { capacity: parseInt(e.target.value || '0', 10) || 0 })}
                            className={cn('h-8 text-[12px] tabular-nums', capErr && 'border-critical')}
                          />
                          {capErr && <p className="mt-1 text-[9px] text-critical">{capErr.message}</p>}
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-critical"
                          onClick={() => removeRoom(index)}
                          disabled={formData.rooms.length <= 1}
                          aria-label={`Remove room row ${index + 1}`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Section C — Setup Summary / Readiness */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-muted text-[10px]">C</span>
                Setup Summary
              </div>
              <div className="rounded-lg border border-info/30 bg-info/5 p-3">
                <div className="grid grid-cols-4 gap-3">
                  <div>
                    <p className="text-[9px] font-semibold uppercase text-muted-foreground">Room Types</p>
                    <p className="mt-0.5 text-[14px] font-semibold tabular-nums text-foreground">{summary.roomTypeCount}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase text-muted-foreground">Total Inventory</p>
                    <p className="mt-0.5 text-[14px] font-semibold tabular-nums text-foreground">{summary.totalInventory}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase text-muted-foreground">Price Range</p>
                    <p className="mt-0.5 text-[14px] font-semibold tabular-nums text-foreground">
                      {summary.minPrice === summary.maxPrice
                        ? summary.maxPrice.toLocaleString()
                        : `${summary.minPrice.toLocaleString()}–${summary.maxPrice.toLocaleString()}`}
                      <span className="ml-1 text-[10px] font-normal text-muted-foreground">{formData.currency}</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[9px] font-semibold uppercase text-muted-foreground">Avg Capacity</p>
                    <p className="mt-0.5 text-[14px] font-semibold tabular-nums text-foreground">{summary.avgCapacity} pax</p>
                  </div>
                </div>
              </div>

              {(submitted && validation.hasErrors) || validation.warnings.length > 0 ? (
                <div className="space-y-1.5">
                  {submitted && validation.hasErrors && (
                    <div className="flex items-start gap-2 rounded-md border border-critical/30 bg-critical/5 px-3 py-2 text-[11px] text-critical">
                      <AlertTriangle className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      <span>{validation.errors.length} field issue(s) found in room inventory. Fix highlighted rows to continue.</span>
                    </div>
                  )}
                  {validation.warnings.map((w, i) => (
                    <div key={i} className="flex items-start gap-2 rounded-md border border-warning/30 bg-warning/5 px-3 py-2 text-[11px] text-warning">
                      <Info className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                      <span>{w}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex items-start gap-2 rounded-md border border-success/30 bg-success/5 px-3 py-2 text-[11px] text-success">
                  <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 flex-shrink-0" />
                  <span>Inventory is ready. {summary.totalInventory} rooms across {summary.roomTypeCount} type(s) will be created.</span>
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="h-8 text-[11px]">
              Cancel
            </Button>
            <Button type="submit" className="h-8 text-[11px]" disabled={submitted && validation.hasErrors}>
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
