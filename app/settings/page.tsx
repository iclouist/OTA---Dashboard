'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { EditCommissionModal } from '@/components/dashboard/modals';
import { settings } from '@/lib/mock-data';
import type { CommissionModel, PayoutModel } from '@/lib/types';
import {
  AlertTriangle,
  Clock,
  Percent,
  ShieldCheck,
  BookOpen,
  Webhook,
  Database,
  FileText,
  Edit,
  Building2,
  Scale,
  Eye,
  CheckCircle2,
  Mail,
  ImageIcon,
  MousePointer,
  HelpCircle,
  Info,
  Plus,
  Trash2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import type { OTAChannelProfile } from '@/lib/types';

// Original static definitions for fallback
const originalOtaProfiles: OTAChannelProfile[] = [
  {
    id: 'booking',
    name: 'Booking.com',
    color: 'blue',
    defaultCommissionModel: 'percentage',
    defaultCommissionPercent: 15,
    payoutModel: 'collect-and-remit',
    expectedSourceType: 'admin-link-signal',
    expectedVerificationMode: 'Admin extranet login required',
    promoStackingBehavior: 'Genius + mobile discount may stack',
    compareCaveats: 'Desktop/mobile prices may differ. Genius discounts visible only to logged-in users.',
    notes: 'Commission deducted from guest payment before remit. Booking.com collects, remits to property minus commission.',
    feeVisibility: 'All-inclusive pricing shown to guest',
    cancellationBehavior: 'Policy-dependent refunds processed through Booking.com',
    enabled: true,
  },
  {
    id: 'agoda',
    name: 'Agoda',
    color: 'red',
    defaultCommissionModel: 'percentage',
    defaultCommissionPercent: 18,
    payoutModel: 'virtual-card',
    expectedSourceType: 'email-parsed',
    expectedVerificationMode: 'Email parsing provides rich booking data',
    promoStackingBehavior: 'Secret deals + insider deals may stack',
    compareCaveats: 'Insider deals show lower prices for logged-in users. Mobile app may have additional discounts.',
    notes: 'Agoda collects full amount, remits via virtual card minus commission. Higher commission but often better conversion.',
    feeVisibility: 'May show base price + fees separately in some markets',
    cancellationBehavior: 'Refunds processed via virtual card reversal or new payment',
    enabled: true,
  },
  {
    id: 'airbnb',
    name: 'Airbnb',
    color: 'pink',
    defaultCommissionModel: 'percentage',
    defaultCommissionPercent: 3,
    payoutModel: 'bank-transfer',
    expectedSourceType: 'screenshot-captured',
    expectedVerificationMode: 'Manual screenshot or host dashboard verification',
    promoStackingBehavior: 'Host discount only - no platform promos',
    compareCaveats: 'Service fee (14-16%) charged to guest separately, not visible to host. Display price includes this fee.',
    notes: 'Host-only fee model (3%). Airbnb charges guest a separate service fee not visible in host pricing.',
    feeVisibility: 'Display price includes guest service fee (14-16%)',
    cancellationBehavior: 'Host sets policy, Airbnb mediates disputes',
    enabled: true,
  },
  {
    id: 'expedia',
    name: 'Expedia',
    color: 'yellow',
    defaultCommissionModel: 'percentage',
    defaultCommissionPercent: 18,
    payoutModel: 'virtual-card',
    expectedSourceType: 'admin-link-signal',
    expectedVerificationMode: 'Partner Central extranet',
    promoStackingBehavior: 'Member pricing + package deals may stack',
    compareCaveats: 'Package deals bundle flight+hotel, making room-only comparison difficult.',
    notes: 'Similar to Agoda (same group). Virtual card payout with variable timing.',
    feeVisibility: 'May show differently in package vs. standalone booking',
    cancellationBehavior: 'Policy-dependent, processed through Expedia',
    enabled: true,
  },
];

// Compare interpretation rules
const compareInterpretationRules = [
  {
    quality: 'strict',
    label: 'Strict Compare',
    conditions: ['Mapping complete', 'Same cancellation policy', 'Fresh evidence (<24h)', 'Same device type'],
    meaning: 'High confidence price comparison. Delta is meaningful and actionable.',
    color: 'success',
  },
  {
    quality: 'normalized',
    label: 'Normalized Compare',
    conditions: ['Same room mapped', 'Different fee/promo treatment', 'Evidence available'],
    meaning: 'Comparison adjusted for known differences. Delta may include expected variations.',
    color: 'info',
  },
  {
    quality: 'uncertain',
    label: 'Uncertain Compare',
    conditions: ['Mapping incomplete', 'Evidence stale/missing', 'Unknown fee structure', 'Mixed cancellation policies'],
    meaning: 'Low confidence comparison. Delta may not be meaningful without further investigation.',
    color: 'warning',
  },
];

// Verification strategies
const verificationStrategies = [
  {
    channel: 'Booking.com',
    primary: 'Admin-link signal',
    verification: 'Extranet login required to confirm booking details',
    trustLevel: 'Medium until admin-verified',
    icon: MousePointer,
  },
  {
    channel: 'Agoda',
    primary: 'Email-parsed',
    verification: 'Rich booking data from confirmation emails',
    trustLevel: 'High (email parsing accurate)',
    icon: Mail,
  },
  {
    channel: 'Airbnb',
    primary: 'Screenshot/Manual',
    verification: 'Manual screenshot capture or host dashboard',
    trustLevel: 'High when screenshot fresh',
    icon: ImageIcon,
  },
];

export default function SettingsPage() {
  const [profiles, setProfiles] = React.useState<OTAChannelProfile[]>(originalOtaProfiles);
  const [showEditCommission, setShowEditCommission] = React.useState(false);
  const [editingProfileId, setEditingProfileId] = React.useState<string | null>(null);
  const [selectedCommission, setSelectedCommission] = React.useState<{
    channelName: string;
    model: CommissionModel;
    percent: number;
    payoutModel: PayoutModel;
    notes: string;
  } | null>(null);

  // Profile Edit fields
  const [editCommission, setEditCommission] = React.useState<number>(15);
  const [editPayout, setEditPayout] = React.useState<PayoutModel>('collect-and-remit');
  const [editNotes, setEditNotes] = React.useState<string>('');

  const handleSaveProfile = (id: string) => {
    setProfiles((prev) =>
      prev.map((p) =>
        p.id === id
          ? {
              ...p,
              defaultCommissionPercent: editCommission,
              payoutModel: editPayout,
              notes: editNotes,
            }
          : p
      )
    );
    setEditingProfileId(null);
    console.log('[v0] Saved profile edits for:', id);
  };

  const handleAddChannel = () => {
    const newId = `custom-${Date.now()}`;
    const newProfile: OTAChannelProfile = {
      id: newId,
      name: `Custom OTA #${profiles.length + 1}`,
      color: 'muted',
      defaultCommissionModel: 'percentage',
      defaultCommissionPercent: 15,
      payoutModel: 'unknown',
      expectedSourceType: 'manual-entry',
      expectedVerificationMode: 'Manual admin verification required',
      promoStackingBehavior: 'Standard rules apply',
      compareCaveats: 'None configured yet.',
      notes: 'Custom configured channel account.',
      feeVisibility: 'All visible',
      cancellationBehavior: 'Policy-dependent',
      enabled: true,
    };
    setProfiles((prev) => [...prev, newProfile]);
    console.log('[v0] Added new channel profile:', newProfile);
  };

  const handleDeleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    console.log('[v0] Deleted channel profile:', id);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            OTA channel profiles, commercial rules, verification strategies, and comparison interpretation
          </p>
        </div>

        <Tabs defaultValue="channels" className="space-y-4">
          <TabsList className="h-9 bg-muted/50">
            <TabsTrigger value="channels" className="text-[12px]">OTA Channels</TabsTrigger>
            <TabsTrigger value="commercial" className="text-[12px]">Commercial Rules</TabsTrigger>
            <TabsTrigger value="verification" className="text-[12px]">Verification</TabsTrigger>
            <TabsTrigger value="comparison" className="text-[12px]">Comparison Rules</TabsTrigger>
            <TabsTrigger value="thresholds" className="text-[12px]">Thresholds</TabsTrigger>
            <TabsTrigger value="integrations" className="text-[12px]">Integrations</TabsTrigger>
          </TabsList>

          {/* OTA Channel Profiles Tab */}
          <TabsContent value="channels" className="space-y-4">
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-3">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <h2 className="text-[13px] font-medium text-foreground">OTA Channel Profiles</h2>
                    <p className="text-[11px] text-muted-foreground">Default behaviors and expectations for each OTA</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 gap-1 px-2 text-[10px]"
                  onClick={handleAddChannel}
                >
                  <Plus className="h-3.5 w-3.5" />
                  Add Channel Profile
                </Button>
              </div>
              <div className="divide-y divide-border/50">
                {profiles.map((ota) => (
                  <div key={ota.id} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-lg text-[14px] font-bold",
                          ota.color === 'blue' ? "bg-blue-500/15 text-blue-600" :
                          ota.color === 'red' ? "bg-red-500/15 text-red-600" :
                          ota.color === 'pink' ? "bg-pink-500/15 text-pink-600" :
                          ota.color === 'yellow' ? "bg-yellow-500/15 text-yellow-600" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {ota.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[13px] font-semibold text-foreground">{ota.name}</p>
                          <p className="text-[10px] text-muted-foreground">{ota.notes}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        {editingProfileId === ota.id ? (
                          <>
                            <Button
                              size="sm"
                              className="h-7 text-[10px] px-2.5"
                              onClick={() => handleSaveProfile(ota.id)}
                            >
                              Save
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[10px] px-2.5"
                              onClick={() => setEditingProfileId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[10px] px-2 gap-1"
                              onClick={() => {
                                setEditingProfileId(ota.id);
                                setEditCommission(ota.defaultCommissionPercent);
                                setEditPayout(ota.payoutModel);
                                setEditNotes(ota.notes);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                              Customize
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-7 text-[10px] px-2 text-critical hover:bg-critical/10"
                              onClick={() => handleDeleteProfile(ota.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>

                    {editingProfileId === ota.id ? (
                      <div className="mt-4 p-3 rounded-lg border border-border bg-muted/20 space-y-3">
                        <p className="text-[10px] font-bold text-foreground">Customize Channel Rules</p>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground">Default Commission (%)</label>
                            <Input
                              type="number"
                              value={editCommission}
                              onChange={(e) => setEditCommission(parseFloat(e.target.value) || 0)}
                              className="h-8 text-[11px]"
                            />
                          </div>
                          <div className="space-y-1">
                            <label className="text-[10px] text-muted-foreground">Payout Model</label>
                            <Select
                              value={editPayout}
                              onValueChange={(v) => setEditPayout(v as PayoutModel)}
                            >
                              <SelectTrigger className="h-8 text-[11px]">
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
                          <div className="space-y-1 md:col-span-3">
                            <label className="text-[10px] text-muted-foreground">Profile Notes</label>
                            <Textarea
                              value={editNotes}
                              onChange={(e) => setEditNotes(e.target.value)}
                              className="min-h-[50px] text-[11px]"
                            />
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="mt-4 grid grid-cols-2 gap-4 lg:grid-cols-4">
                          <div className="rounded-lg border border-border bg-muted/20 p-3">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Commission</p>
                            <p className="mt-1 text-[14px] font-bold text-foreground">{ota.defaultCommissionPercent}%</p>
                            <p className="text-[10px] text-muted-foreground">{ota.defaultCommissionModel}</p>
                          </div>
                          <div className="rounded-lg border border-border bg-muted/20 p-3">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Payout</p>
                            <p className="mt-1">
                              <StatusBadge status={ota.payoutModel} size="sm" />
                            </p>
                          </div>
                          <div className="rounded-lg border border-border bg-muted/20 p-3">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Primary Source</p>
                            <p className="mt-1">
                              <StatusBadge status={ota.expectedSourceType} size="sm" />
                            </p>
                          </div>
                          <div className="rounded-lg border border-border bg-muted/20 p-3">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Verification</p>
                            <p className="mt-1 text-[10px] text-foreground">{ota.expectedVerificationMode}</p>
                          </div>
                        </div>

                        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                          <div className="rounded border border-info/30 bg-info/5 p-2.5">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-info">Promo Stacking</p>
                            <p className="mt-1 text-[10px] text-foreground">{ota.promoStackingBehavior}</p>
                          </div>
                          <div className="rounded border border-warning/30 bg-warning/5 p-2.5">
                            <p className="text-[9px] font-semibold uppercase tracking-wider text-warning">Compare Caveats</p>
                            <p className="mt-1 text-[10px] text-foreground">{ota.compareCaveats}</p>
                          </div>
                        </div>

                        <div className="mt-3 flex gap-4 text-[10px]">
                          <div>
                            <span className="text-muted-foreground">Fee visibility: </span>
                            <span className="text-foreground">{ota.feeVisibility}</span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Cancellation: </span>
                            <span className="text-foreground">{ota.cancellationBehavior}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Commercial Rules Tab */}
          <TabsContent value="commercial" className="space-y-4">
            {/* Commission Assumptions Table */}
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Percent className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h2 className="text-[13px] font-medium text-foreground">Commission Assumptions</h2>
                  <p className="text-[11px] text-muted-foreground">Default commission rates used for revenue calculations</p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Channel</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Model</th>
                      <th className="px-4 py-2.5 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Default %</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Payout</th>
                      <th className="px-4 py-2.5 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Notes</th>
                      <th className="w-10 px-4 py-2.5"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/50">
                    {settings.commissionAssumptions.map((ca) => (
                      <tr key={ca.channelId} className="hover:bg-muted/30">
                        <td className="px-4 py-3 text-[12px] font-medium text-foreground">{ca.channelName}</td>
                        <td className="px-4 py-3 text-[12px] capitalize text-muted-foreground">{ca.model}</td>
                        <td className="px-4 py-3 text-right text-[12px] font-medium tabular-nums text-foreground">{ca.defaultPercent}%</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={ca.payoutModel} size="xs" />
                        </td>
                        <td className="max-w-[300px] px-4 py-3 text-[11px] text-muted-foreground">{ca.notes}</td>
                        <td className="px-4 py-3">
                          <Button
                            size="sm"
                            variant="ghost"
                            className="h-6 w-6 p-0"
                            onClick={() => {
                              setSelectedCommission({
                                channelName: ca.channelName,
                                model: ca.model,
                                percent: ca.defaultPercent,
                                payoutModel: ca.payoutModel,
                                notes: ca.notes,
                              });
                              setShowEditCommission(true);
                            }}
                          >
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Fee & Payout Interpretation */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Scale className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-[13px] font-medium text-foreground">Fee Visibility Rules</h2>
                </div>
                <div className="p-4 space-y-3">
                  <div className="rounded border border-border bg-muted/20 p-3">
                    <p className="text-[11px] font-medium text-foreground">Booking.com / Agoda</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      All-inclusive pricing. Display price = what guest pays. Commission deducted before payout.
                    </p>
                  </div>
                  <div className="rounded border border-border bg-muted/20 p-3">
                    <p className="text-[11px] font-medium text-foreground">Airbnb</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Display price includes 14-16% guest service fee not shown to host. Internal rate should exclude this fee.
                    </p>
                  </div>
                  <div className="rounded border border-border bg-muted/20 p-3">
                    <p className="text-[11px] font-medium text-foreground">Package OTAs (Expedia)</p>
                    <p className="mt-1 text-[10px] text-muted-foreground">
                      Bundled pricing may not reflect standalone room rate. Compare with caution.
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-[13px] font-medium text-foreground">Cancellation Behavior</h2>
                </div>
                <div className="p-4 space-y-3">
                  {settings.cancellationPolicies.map((policy) => (
                    <div key={policy.id} className="flex items-center justify-between rounded border border-border bg-muted/20 p-2.5">
                      <StatusBadge status={policy.id} size="sm" />
                      <span className="text-[10px] text-muted-foreground">{policy.label}</span>
                    </div>
                  ))}
                  <div className="mt-2 rounded border border-info/30 bg-info/5 p-2.5">
                    <p className="text-[9px] font-semibold uppercase text-info">Impact on Compare</p>
                    <p className="mt-1 text-[10px] text-foreground">
                      Different cancellation policies can explain price differences. Non-refundable rates typically 10-20% lower.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Verification Tab */}
          <TabsContent value="verification" className="space-y-4">
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <ShieldCheck className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h2 className="text-[13px] font-medium text-foreground">Verification Strategy by OTA</h2>
                  <p className="text-[11px] text-muted-foreground">How to verify data from each channel</p>
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {verificationStrategies.map((strategy) => (
                  <div key={strategy.channel} className="flex items-start gap-4 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted/50">
                      <strategy.icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[12px] font-semibold text-foreground">{strategy.channel}</p>
                      <div className="mt-2 grid grid-cols-3 gap-4">
                        <div>
                          <p className="text-[9px] font-semibold uppercase text-muted-foreground">Primary Source</p>
                          <p className="mt-1 text-[11px] text-foreground">{strategy.primary}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold uppercase text-muted-foreground">Verification Method</p>
                          <p className="mt-1 text-[11px] text-foreground">{strategy.verification}</p>
                        </div>
                        <div>
                          <p className="text-[9px] font-semibold uppercase text-muted-foreground">Trust Level</p>
                          <p className="mt-1 text-[11px] text-foreground">{strategy.trustLevel}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Source Confidence Rules */}
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Eye className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[13px] font-medium text-foreground">Source Confidence Rules</h2>
              </div>
              <div className="p-4">
                <div className="space-y-2">
                  {settings.sourceConfidenceRules.map((rule, i) => (
                    <div key={i} className="flex items-start gap-3 rounded border border-border bg-muted/20 p-3">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      <p className="text-[11px] text-foreground">{rule}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Comparison Rules Tab */}
          <TabsContent value="comparison" className="space-y-4">
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <Scale className="h-4 w-4 text-muted-foreground" />
                <div>
                  <h2 className="text-[13px] font-medium text-foreground">Compare Interpretation Rules</h2>
                  <p className="text-[11px] text-muted-foreground">How to interpret price comparison quality levels</p>
                </div>
              </div>
              <div className="divide-y divide-border/50">
                {compareInterpretationRules.map((rule) => (
                  <div key={rule.quality} className="p-4">
                    <div className="flex items-center gap-3">
                      <StatusBadge status={rule.quality} size="sm" />
                      <p className="text-[12px] font-semibold text-foreground">{rule.label}</p>
                    </div>
                    <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-2">
                      <div className={cn(
                        "rounded border p-3",
                        rule.color === 'success' ? "border-success/30 bg-success/5" :
                        rule.color === 'info' ? "border-info/30 bg-info/5" :
                        "border-warning/30 bg-warning/5"
                      )}>
                        <p className="text-[9px] font-semibold uppercase text-muted-foreground">Conditions</p>
                        <ul className="mt-2 space-y-1">
                          {rule.conditions.map((condition, i) => (
                            <li key={i} className="flex items-center gap-2 text-[10px] text-foreground">
                              <CheckCircle2 className={cn(
                                "h-3 w-3",
                                rule.color === 'success' ? "text-success" :
                                rule.color === 'info' ? "text-info" : "text-warning"
                              )} />
                              {condition}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded border border-border bg-muted/20 p-3">
                        <p className="text-[9px] font-semibold uppercase text-muted-foreground">Meaning</p>
                        <p className="mt-2 text-[11px] text-foreground">{rule.meaning}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Why Mismatch Likely */}
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                <HelpCircle className="h-4 w-4 text-muted-foreground" />
                <h2 className="text-[13px] font-medium text-foreground">Common Mismatch Reasons</h2>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                  {[
                    { reason: 'Mobile discount suspected', description: 'OTAs often offer 5-15% mobile-only discounts' },
                    { reason: 'Stacked promo suspected', description: 'Multiple promotions (Genius + mobile + member) may combine' },
                    { reason: 'Incomplete mapping', description: 'Room or rate plan not properly mapped, wrong comparison' },
                    { reason: 'Fee included in display', description: 'Airbnb includes service fee in displayed price' },
                    { reason: 'Stale evidence', description: 'Price capture older than 48h may no longer be accurate' },
                    { reason: 'Different cancellation policy', description: 'Non-refundable vs flexible can explain 10-20% difference' },
                  ].map((item) => (
                    <div key={item.reason} className="rounded border border-border bg-muted/20 p-3">
                      <p className="text-[11px] font-medium text-foreground">{item.reason}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Thresholds Tab */}
          <TabsContent value="thresholds" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Parity Thresholds */}
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-[13px] font-medium text-foreground">Parity Thresholds</h2>
                </div>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground">Warning Threshold (%)</label>
                    <div className="flex items-center gap-3">
                      <Input type="number" value={settings.parityThresholds.warningPercent} className="h-9 w-24 text-[12px]" disabled />
                      <span className="text-[10px] text-muted-foreground">Trigger warning when price differs by this percent</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground">Critical Threshold (%)</label>
                    <div className="flex items-center gap-3">
                      <Input type="number" value={settings.parityThresholds.criticalPercent} className="h-9 w-24 text-[12px]" disabled />
                      <span className="text-[10px] text-muted-foreground">Trigger critical alert at this threshold</span>
                    </div>
                  </div>
                  <div className="rounded border border-info/30 bg-info/5 p-3">
                    <div className="flex items-start gap-2">
                      <Info className="mt-0.5 h-3.5 w-3.5 text-info" />
                      <p className="text-[10px] text-info">
                        Thresholds apply to absolute delta percentage. Both positive (OTA higher) and negative (OTA lower) deltas are flagged.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Evidence Retention */}
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-[13px] font-medium text-foreground">Evidence & Comparison</h2>
                </div>
                <div className="space-y-4 p-4">
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground">Evidence Retention (days)</label>
                    <Input type="number" value={settings.evidenceRetentionDays} className="h-9 w-24 text-[12px]" disabled />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium text-muted-foreground">Default Comparison Window (days)</label>
                    <Input type="number" value={settings.defaultComparisonWindowDays} className="h-9 w-24 text-[12px]" disabled />
                  </div>
                  <div className="rounded border border-warning/30 bg-warning/5 p-3">
                    <p className="text-[9px] font-semibold uppercase text-warning">Staleness Rules</p>
                    <ul className="mt-1.5 space-y-1">
                      <li className="text-[10px] text-foreground">• Fresh: &lt;24h old</li>
                      <li className="text-[10px] text-foreground">• Aging: 24-48h old</li>
                      <li className="text-[10px] text-foreground">• Stale: &gt;48h old</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          {/* Integrations Tab */}
          <TabsContent value="integrations" className="space-y-4">
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {/* Future Integrations */}
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Webhook className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-[13px] font-medium text-foreground">Planned Integrations</h2>
                </div>
                <div className="space-y-3 p-4">
                  {[
                    { name: 'Make.com Email Ingestion', description: 'Auto-parse booking emails from OTAs', status: 'Planned' },
                    { name: 'Browser Extraction', description: 'Authenticated admin scraping for booking details', status: 'Planned' },
                    { name: 'Screenshot Verification', description: 'Automated screenshot capture pipeline', status: 'Planned' },
                  ].map((item) => (
                    <div key={item.name} className="flex items-center justify-between rounded border border-dashed border-border bg-muted/20 p-3">
                      <div>
                        <p className="text-[12px] font-medium text-foreground">{item.name}</p>
                        <p className="text-[10px] text-muted-foreground">{item.description}</p>
                      </div>
                      <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{item.status}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Database */}
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center gap-3 border-b border-border px-4 py-3">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-[13px] font-medium text-foreground">Database</h2>
                </div>
                <div className="p-4">
                  <div className="flex items-center justify-between rounded border border-dashed border-border bg-muted/20 p-3">
                    <div>
                      <p className="text-[12px] font-medium text-foreground">Supabase</p>
                      <p className="text-[10px] text-muted-foreground">Connect to persist operational data</p>
                    </div>
                    <Button variant="outline" size="sm" className="h-7 text-[11px]" disabled>
                      Connect
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2.5">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-[11px] text-muted-foreground">
                Settings are read-only in V1. Backend integration required for persistence.
              </span>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Edit Commission Modal */}
      <EditCommissionModal
        open={showEditCommission}
        onOpenChange={setShowEditCommission}
        channelName={selectedCommission?.channelName}
        initialData={selectedCommission ? {
          model: selectedCommission.model,
          percent: selectedCommission.percent,
          payoutModel: selectedCommission.payoutModel,
          notes: selectedCommission.notes,
        } : undefined}
        onSubmit={(data) => {
          console.log('[v0] Update commission assumption:', data);
        }}
      />
    </DashboardLayout>
  );
}
