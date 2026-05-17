'use client';

import * as React from 'react';
import { use } from 'react';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/layout';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { KPICard } from '@/components/dashboard/kpi-card';
import { AlertList } from '@/components/dashboard/alert-row';
import {
  AddOTAChannelModal,
  AddMappingModal,
  AddPriceCaptureModal,
  EditCommissionModal,
} from '@/components/dashboard/modals';
import {
  getPropertyById,
  getAlertsByProperty,
  getEvidenceByProperty,
  getPriceCapturesByProperty,
  getBookingsByProperty,
  getMappingsByProperty,
  getChannelAccountsByProperty,
} from '@/lib/mock-data';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ArrowLeft,
  MapPin,
  BedDouble,
  Banknote,
  Percent,
  TrendingUp,
  AlertTriangle,
  ShieldCheck,
  Plus,
  Edit,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { notFound } from 'next/navigation';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = use(params);
  const property = getPropertyById(id);

  const [showAddChannel, setShowAddChannel] = React.useState(false);
  const [showAddMapping, setShowAddMapping] = React.useState(false);
  const [showAddCapture, setShowAddCapture] = React.useState(false);
  const [showEditCommission, setShowEditCommission] = React.useState(false);
  const [selectedChannel, setSelectedChannel] = React.useState<{
    name: string;
    model: 'percentage' | 'fixed-per-night' | 'tiered' | 'unknown';
    percent: number;
    payoutModel: 'collect-and-remit' | 'pay-at-property' | 'virtual-card' | 'bank-transfer' | 'unknown';
    notes: string;
  } | null>(null);

  if (!property) {
    notFound();
  }

  const propertyAlerts = getAlertsByProperty(id);
  const propertyEvidence = getEvidenceByProperty(id);
  const priceCaptures = getPriceCapturesByProperty(id);
  const bookings = getBookingsByProperty(id);
  const mappings = getMappingsByProperty(id);
  const channelAccounts = getChannelAccountsByProperty(id);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <Link href="/properties">
              <Button variant="ghost" size="icon" className="mt-0.5 h-7 w-7">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-semibold text-foreground">{property.name}</h1>
                <StatusBadge status={property.healthStatus} size="sm" />
                <StatusBadge status={property.onboardingStatus} size="sm" variant="outline" />
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                <MapPin className="h-3 w-3" />
                <span>{property.location}</span>
                <span className="text-border">·</span>
                <span>{property.currency}</span>
                <span className="text-border">·</span>
                <span>{property.activeOTAChannels.length} OTA channels</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <Tabs defaultValue="summary" className="space-y-3">
          <TabsList className="h-8 bg-muted/50">
            <TabsTrigger value="summary" className="text-[12px]">Summary</TabsTrigger>
            <TabsTrigger value="prices" className="text-[12px]">Prices</TabsTrigger>
            <TabsTrigger value="bookings" className="text-[12px]">Bookings</TabsTrigger>
            <TabsTrigger value="evidence" className="text-[12px]">Evidence</TabsTrigger>
            <TabsTrigger value="setup" className="text-[12px]">Setup</TabsTrigger>
          </TabsList>

          {/* Summary Tab */}
          <TabsContent value="summary" className="space-y-4">
            <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
              <KPICard title="Room Nights" value={property.roomNightsSold} icon={BedDouble} />
              <KPICard title="Gross Revenue" value={`${property.currency} ${property.grossRevenue.toLocaleString()}`} icon={Banknote} />
              <KPICard title="OTA Commission" value={`${property.currency} ${property.otaCommission.toLocaleString()}`} icon={Percent} status="warning" />
              <KPICard title="Net Revenue" value={`${property.currency} ${property.netRevenue.toLocaleString()}`} icon={TrendingUp} status="success" />
              <KPICard title="Price Issues" value={property.activePriceIssues} icon={AlertTriangle} status={property.activePriceIssues > 0 ? 'warning' : 'success'} />
              <KPICard title="Mapping" value={property.mappingCompleteness} icon={ShieldCheck} />
            </div>

            {/* Source confidence breakdown */}
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              <div className="rounded-md border border-border bg-card">
                <div className="border-b border-border px-3 py-2">
                  <span className="text-[12px] font-medium text-foreground">Source Confidence</span>
                </div>
                <div className="p-3">
                  {(() => {
                    const sources = [
                      { label: 'Email-parsed bookings', count: bookings.filter((b) => b.sourceType === 'email-parsed').length },
                      { label: 'Admin-link signals', count: bookings.filter((b) => b.sourceType === 'admin-link-signal').length },
                      { label: 'Screenshot captures', count: priceCaptures.filter((p) => p.sourceType === 'screenshot-captured').length },
                      { label: 'Manual entries', count: priceCaptures.filter((p) => p.sourceType === 'manual-entry').length },
                    ];
                    return sources.map((s) => (
                      <div key={s.label} className="flex items-center justify-between py-1">
                        <span className="text-[11px] text-muted-foreground">{s.label}</span>
                        <span className="text-[11px] font-medium tabular-nums text-foreground">{s.count}</span>
                      </div>
                    ));
                  })()}
                </div>
              </div>

              {/* Channel readiness */}
              <div className="rounded-md border border-border bg-card">
                <div className="border-b border-border px-3 py-2">
                  <span className="text-[12px] font-medium text-foreground">Channel Readiness</span>
                </div>
                <div>
                  {channelAccounts.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-muted-foreground">
                      No channels configured
                    </div>
                  ) : (
                    channelAccounts.map((ca) => (
                      <div key={ca.id} className="flex items-center gap-2 border-b border-border/50 px-3 py-2 last:border-0">
                        <StatusDot status={ca.setupComplete ? 'healthy' : 'warning'} />
                        <div className="min-w-0 flex-1">
                          <p className="text-[11px] font-medium text-foreground">{ca.channelName}</p>
                          <p className="text-[10px] text-muted-foreground">
                            {ca.commissionModel === 'percentage' ? `${ca.commissionPercent}% commission` : ca.commissionModel}
                          </p>
                        </div>
                        <div className="flex gap-1">
                          <StatusBadge status={ca.setupComplete ? 'complete' : 'partial'} size="xs" />
                          <StatusBadge status={ca.mappingComplete ? 'complete' : 'unmapped'} size="xs" />
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Recent alerts */}
            <div className="rounded-md border border-border bg-card">
              <div className="border-b border-border px-3 py-2">
                <span className="text-[12px] font-medium text-foreground">Alerts ({propertyAlerts.length})</span>
              </div>
              <AlertList alerts={propertyAlerts} maxItems={5} compact />
            </div>
          </TabsContent>

          {/* Prices Tab */}
          <TabsContent value="prices" className="space-y-3">
            <div className="flex items-center justify-end gap-2">
              <Button size="sm" className="h-7 gap-1.5 px-2 text-[11px]" onClick={() => setShowAddCapture(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add Capture
              </Button>
            </div>
            {priceCaptures.length === 0 ? (
              <div className="rounded-md border border-border bg-card py-8 text-center text-[12px] text-muted-foreground">
                No price captures yet
              </div>
            ) : (
              <div className="rounded-md border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Channel</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Device</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Room / Rate</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Stay</th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Display</th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Ref</th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Delta</th>
                        <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Quality</th>
                        <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Evidence</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {priceCaptures.map((pc) => (
                        <tr key={pc.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2 text-[11px] text-foreground">{pc.channelName}</td>
                          <td className="px-3 py-2">
                            <StatusBadge status={pc.deviceType} size="xs" />
                          </td>
                          <td className="px-3 py-2">
                            <p className="text-[11px] text-foreground">{pc.roomType}</p>
                            <p className="text-[10px] text-muted-foreground">{pc.ratePlan}</p>
                          </td>
                          <td className="px-3 py-2 text-[11px] tabular-nums text-muted-foreground">
                            {format(new Date(pc.stayDate), 'MMM d')}
                          </td>
                          <td className="px-3 py-2 text-right text-[11px] font-medium tabular-nums text-foreground">
                            {pc.currency} {pc.displayPrice.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-[11px] tabular-nums text-muted-foreground">
                            {pc.currency} {pc.referencePrice.toLocaleString()}
                          </td>
                          <td className={cn(
                            'px-3 py-2 text-right text-[11px] font-medium tabular-nums',
                            pc.deltaPercent === 0 ? 'text-muted-foreground' : Math.abs(pc.deltaPercent) > 15 ? 'text-critical' : Math.abs(pc.deltaPercent) > 5 ? 'text-warning' : 'text-success'
                          )}>
                            {pc.deltaPercent > 0 ? '+' : ''}{pc.deltaPercent.toFixed(1)}%
                          </td>
                          <td className="px-3 py-2 text-center">
                            <StatusBadge status={pc.compareQuality} size="xs" />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <StatusBadge status={pc.evidenceStatus} size="xs" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Bookings Tab */}
          <TabsContent value="bookings" className="space-y-3">
            {bookings.length === 0 ? (
              <div className="rounded-md border border-border bg-card py-8 text-center text-[12px] text-muted-foreground">
                No booking events yet
              </div>
            ) : (
              <div className="rounded-md border border-border bg-card">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Channel</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Ref</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Type</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Dates</th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Nights</th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Gross</th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Comm</th>
                        <th className="px-3 py-2 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Net</th>
                        <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Source</th>
                        <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {bookings.map((b) => (
                        <tr key={b.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2 text-[11px] text-foreground">{b.channelName}</td>
                          <td className="px-3 py-2 text-[11px] font-mono text-muted-foreground">{b.bookingRef}</td>
                          <td className="px-3 py-2 text-[11px] capitalize text-muted-foreground">{b.eventType}</td>
                          <td className="px-3 py-2 text-[11px] tabular-nums text-muted-foreground">
                            {format(new Date(b.checkIn), 'MMM d')} - {format(new Date(b.checkOut), 'MMM d')}
                          </td>
                          <td className="px-3 py-2 text-right text-[11px] font-medium tabular-nums text-foreground">{b.roomNights}</td>
                          <td className="px-3 py-2 text-right text-[11px] font-medium tabular-nums text-foreground">
                            {b.currency} {b.grossAmount.toLocaleString()}
                          </td>
                          <td className="px-3 py-2 text-right text-[11px] tabular-nums text-muted-foreground">
                            {b.commissionAmount > 0 ? `${b.currency} ${b.commissionAmount.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-3 py-2 text-right text-[11px] font-medium tabular-nums text-success">
                            {b.netAmount > 0 ? `${b.currency} ${b.netAmount.toLocaleString()}` : '-'}
                          </td>
                          <td className="px-3 py-2 text-center">
                            <StatusBadge status={b.sourceType} size="xs" />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <StatusBadge status={b.verificationStatus} size="xs" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </TabsContent>

          {/* Evidence Tab */}
          <TabsContent value="evidence" className="space-y-3">
            {propertyEvidence.length === 0 ? (
              <div className="rounded-md border border-border bg-card py-8 text-center text-[12px] text-muted-foreground">
                No evidence captured yet
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                {propertyEvidence.map((ev) => (
                  <div key={ev.id} className="rounded-md border border-border bg-card">
                    <div className="relative aspect-video bg-muted/30">
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] text-muted-foreground">
                        Screenshot placeholder
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 flex gap-1">
                        <StatusBadge status={ev.status} size="xs" />
                        <StatusBadge status={ev.sourceType} size="xs" />
                      </div>
                    </div>
                    <div className="p-2.5">
                      <div className="flex items-center justify-between">
                        <p className="text-[11px] font-medium text-foreground">{ev.channelName}</p>
                        <span className="text-[9px] text-muted-foreground">
                          {formatDistanceToNow(new Date(ev.capturedAt), { addSuffix: true })}
                        </span>
                      </div>
                      {ev.roomType && (
                        <p className="text-[10px] text-muted-foreground">{ev.roomType}</p>
                      )}
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {Object.entries(ev.extractedFields).slice(0, 3).map(([key, value]) => (
                          <span key={key} className="rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground">
                            {key}: {value}
                          </span>
                        ))}
                      </div>
                      {ev.captureNote && (
                        <p className="mt-1 text-[9px] text-warning">{ev.captureNote}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Setup Tab */}
          <TabsContent value="setup" className="space-y-4">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
              {/* Property Setup Status */}
              <div className="rounded-md border border-border bg-card">
                <div className="border-b border-border px-3 py-2">
                  <span className="text-[12px] font-medium text-foreground">Property Setup Status</span>
                </div>
                <div className="p-3 space-y-2">
                  {[
                    { label: 'Onboarding Status', value: property.onboardingStatus },
                    { label: 'Mapping Completeness', value: property.mappingCompleteness },
                    { label: 'Data Freshness', value: property.dataFreshness },
                    { label: 'Health Status', value: property.healthStatus },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between py-1">
                      <span className="text-[11px] text-muted-foreground">{item.label}</span>
                      <StatusBadge status={item.value} size="sm" />
                    </div>
                  ))}
                </div>
              </div>

              {/* Channel Configuration */}
              <div className="rounded-md border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-3 py-2">
                  <span className="text-[12px] font-medium text-foreground">Channel Configuration</span>
                  <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-[10px]" onClick={() => setShowAddChannel(true)}>
                    <Plus className="h-3 w-3" />
                    Add Channel
                  </Button>
                </div>
                <div>
                  {channelAccounts.length === 0 ? (
                    <div className="p-4 text-center text-[11px] text-muted-foreground">No channels configured</div>
                  ) : (
                    channelAccounts.map((ca) => (
                      <div key={ca.id} className="border-b border-border/50 p-3 last:border-0">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-medium text-foreground">{ca.channelName}</span>
                          <div className="flex items-center gap-1">
                            <StatusBadge status={ca.setupComplete ? 'complete' : 'partial'} size="xs" />
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0"
                              onClick={() => {
                                setSelectedChannel({
                                  name: ca.channelName,
                                  model: ca.commissionModel,
                                  percent: ca.commissionPercent,
                                  payoutModel: ca.payoutModel,
                                  notes: ca.promotionStackingRule,
                                });
                                setShowEditCommission(true);
                              }}
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                        <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-1">
                          <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">OTA Property ID</span>
                            <span className="font-mono text-foreground">{ca.otaPropertyId || '-'}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">Commission</span>
                            <span className="text-foreground">
                              {ca.commissionModel === 'percentage' ? `${ca.commissionPercent}%` : ca.commissionModel}
                            </span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">Payout</span>
                            <span className="text-foreground">{ca.payoutModel}</span>
                          </div>
                          <div className="flex justify-between text-[10px]">
                            <span className="text-muted-foreground">Mapping</span>
                            <StatusBadge status={ca.mappingComplete ? 'complete' : 'unmapped'} size="xs" />
                          </div>
                        </div>
                        {ca.promotionStackingRule !== 'Not configured' && (
                          <p className="mt-1 text-[9px] text-muted-foreground">
                            Promo stacking: {ca.promotionStackingRule}
                          </p>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Mappings */}
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-[12px] font-medium text-foreground">Room/Rate Mappings</span>
                <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-[10px]" onClick={() => setShowAddMapping(true)}>
                  <Plus className="h-3 w-3" />
                  Add Mapping
                </Button>
              </div>
              {mappings.length === 0 ? (
                <div className="p-4 text-center text-[11px] text-muted-foreground">No mappings configured</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Channel</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Room</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">OTA Room</th>
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Rate Plan</th>
                        <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Cancel</th>
                        <th className="px-3 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {mappings.map((m) => (
                        <tr key={m.id} className="hover:bg-muted/30">
                          <td className="px-3 py-2 text-[11px] text-foreground">{m.channelName}</td>
                          <td className="px-3 py-2 text-[11px] text-foreground">{m.roomType}</td>
                          <td className="px-3 py-2 text-[11px] text-muted-foreground">{m.otaRoomName || '-'}</td>
                          <td className="px-3 py-2">
                            <p className="text-[11px] text-foreground">{m.ratePlan || '-'}</p>
                            <p className="text-[10px] text-muted-foreground">{m.otaRatePlanName || ''}</p>
                          </td>
                          <td className="px-3 py-2 text-center">
                            <StatusBadge status={m.cancellationPolicy} size="xs" />
                          </td>
                          <td className="px-3 py-2 text-center">
                            <StatusBadge status={m.status} size="xs" />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Modals */}
      <AddOTAChannelModal
        open={showAddChannel}
        onOpenChange={setShowAddChannel}
        propertyName={property.name}
        onSubmit={(data) => {
          console.log('[v0] Add OTA channel:', data);
        }}
      />

      <AddMappingModal
        open={showAddMapping}
        onOpenChange={setShowAddMapping}
        propertyName={property.name}
        onSubmit={(data) => {
          console.log('[v0] Add mapping:', data);
        }}
      />

      <AddPriceCaptureModal
        open={showAddCapture}
        onOpenChange={setShowAddCapture}
        propertyName={property.name}
        onSubmit={(data) => {
          console.log('[v0] Add price capture:', data);
        }}
      />

      <EditCommissionModal
        open={showEditCommission}
        onOpenChange={setShowEditCommission}
        channelName={selectedChannel?.name}
        initialData={selectedChannel ? {
          model: selectedChannel.model,
          percent: selectedChannel.percent,
          payoutModel: selectedChannel.payoutModel,
          notes: selectedChannel.notes,
        } : undefined}
        onSubmit={(data) => {
          console.log('[v0] Update commission:', data);
        }}
      />
    </DashboardLayout>
  );
}
