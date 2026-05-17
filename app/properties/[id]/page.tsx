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
  CheckCircle2,
  XCircle,
  Clock,
  Link2,
  Mail,
  ImageIcon,
  MousePointer,
  Layers,
  Settings2,
  Activity,
  AlertCircle,
  Radio,
  CreditCard,
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

  // Compute per-channel stats
  const getChannelStats = (channelId: string) => {
    const channelCaptures = priceCaptures.filter((pc) => pc.channelId === channelId);
    const channelMappings = mappings.filter((m) => m.channelId === channelId);
    const channelBookings = bookings.filter((b) => b.channelId === channelId);
    const channelAlerts = propertyAlerts.filter((a) => a.channelId === channelId);
    
    return {
      activeMismatches: channelCaptures.filter((pc) => pc.alertStatus === 'critical' || pc.alertStatus === 'medium').length,
      staleEvidence: channelCaptures.filter((pc) => pc.evidenceStatus === 'stale').length,
      missingEvidence: channelCaptures.filter((pc) => pc.evidenceStatus === 'missing').length,
      pendingVerifications: channelBookings.filter((b) => b.verificationStatus === 'needs-admin-review' || b.verificationStatus === 'link-only').length,
      mappingGaps: channelMappings.filter((m) => m.status === 'partial' || m.status === 'unmapped').length,
      uncertainCompares: channelCaptures.filter((pc) => pc.compareQuality === 'uncertain').length,
      totalCaptures: channelCaptures.length,
      totalBookings: channelBookings.length,
      criticalAlerts: channelAlerts.filter((a) => a.severity === 'critical').length,
    };
  };

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
            <TabsTrigger value="channels" className="text-[12px]">Channels</TabsTrigger>
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

              {/* Channel readiness overview */}
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
                    channelAccounts.map((ca) => {
                      const stats = getChannelStats(ca.channelId);
                      const hasIssues = stats.activeMismatches > 0 || stats.staleEvidence > 0 || stats.pendingVerifications > 0;
                      return (
                        <div key={ca.id} className="flex items-center gap-2 border-b border-border/50 px-3 py-2 last:border-0">
                          <StatusDot status={ca.setupComplete && ca.mappingComplete ? 'healthy' : hasIssues ? 'warning' : 'unknown'} />
                          <div className="min-w-0 flex-1">
                            <p className="text-[11px] font-medium text-foreground">{ca.channelName}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {ca.commissionModel === 'percentage' ? `${ca.commissionPercent}% commission` : ca.commissionModel}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            {stats.activeMismatches > 0 && (
                              <span className="rounded bg-critical/15 px-1.5 py-0.5 text-[9px] font-semibold text-critical">
                                {stats.activeMismatches} issues
                              </span>
                            )}
                            <StatusBadge status={ca.setupComplete ? 'complete' : 'partial'} size="xs" />
                            <StatusBadge status={ca.mappingComplete ? 'complete' : 'unmapped'} size="xs" />
                          </div>
                        </div>
                      );
                    })
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

          {/* Channels Tab - Enhanced Channel Profiles */}
          <TabsContent value="channels" className="space-y-4">
            {/* Property × OTA Matrix */}
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <Layers className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[12px] font-medium text-foreground">Property × OTA Matrix</span>
                </div>
                <Button size="sm" variant="ghost" className="h-6 gap-1 px-2 text-[10px]" onClick={() => setShowAddChannel(true)}>
                  <Plus className="h-3 w-3" />
                  Add Channel
                </Button>
              </div>
              {channelAccounts.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-muted-foreground">
                  No OTA channels configured. Add a channel to start monitoring.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-3 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">OTA</th>
                        <th className="px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Setup</th>
                        <th className="px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Mapping</th>
                        <th className="px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Verify</th>
                        <th className="px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Capture</th>
                        <th className="px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Evidence</th>
                        <th className="px-2 py-2 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Comm</th>
                        <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Payout</th>
                        <th className="px-2 py-2 text-center text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Risk</th>
                        <th className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Last Sync</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/50">
                      {channelAccounts.map((ca) => {
                        const stats = getChannelStats(ca.channelId);
                        const riskScore = stats.activeMismatches + stats.staleEvidence + stats.mappingGaps;
                        return (
                          <tr key={ca.id} className="hover:bg-muted/30">
                            <td className="px-3 py-2.5">
                              <p className="text-[11px] font-medium text-foreground">{ca.channelName}</p>
                              <p className="text-[9px] font-mono text-muted-foreground">{ca.otaPropertyId || '—'}</p>
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              {ca.setupComplete ? (
                                <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                              ) : (
                                <XCircle className="mx-auto h-4 w-4 text-muted-foreground" />
                              )}
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              {ca.mappingComplete ? (
                                <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                              ) : (
                                <AlertCircle className="mx-auto h-4 w-4 text-warning" />
                              )}
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              {ca.verificationReady ? (
                                <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                              ) : (
                                <Clock className="mx-auto h-4 w-4 text-muted-foreground" />
                              )}
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              <span className="text-[11px] font-medium tabular-nums text-foreground">{stats.totalCaptures}</span>
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              {stats.staleEvidence > 0 ? (
                                <span className="rounded bg-warning/15 px-1.5 py-0.5 text-[9px] font-semibold text-warning">
                                  {stats.staleEvidence} stale
                                </span>
                              ) : stats.missingEvidence > 0 ? (
                                <span className="rounded bg-critical/15 px-1.5 py-0.5 text-[9px] font-semibold text-critical">
                                  {stats.missingEvidence} missing
                                </span>
                              ) : (
                                <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                              )}
                            </td>
                            <td className="px-2 py-2.5 text-right text-[11px] font-medium tabular-nums text-foreground">
                              {ca.commissionModel === 'percentage' ? `${ca.commissionPercent}%` : ca.commissionModel}
                            </td>
                            <td className="px-2 py-2.5">
                              <StatusBadge status={ca.payoutModel} size="xs" />
                            </td>
                            <td className="px-2 py-2.5 text-center">
                              {riskScore === 0 ? (
                                <span className="rounded bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">OK</span>
                              ) : riskScore <= 2 ? (
                                <span className="rounded bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">{riskScore}</span>
                              ) : (
                                <span className="rounded bg-critical/15 px-2 py-0.5 text-[10px] font-semibold text-critical">{riskScore}</span>
                              )}
                            </td>
                            <td className="px-2 py-2.5 text-[10px] tabular-nums text-muted-foreground">
                              {ca.lastDataAt ? formatDistanceToNow(new Date(ca.lastDataAt), { addSuffix: false }) : '—'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Channel Profiles - Detailed Cards */}
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2 xl:grid-cols-3">
              {channelAccounts.map((ca) => {
                const stats = getChannelStats(ca.channelId);
                const hasIssues = stats.activeMismatches > 0 || stats.staleEvidence > 0 || stats.pendingVerifications > 0;
                return (
                  <div key={ca.id} className={cn(
                    "rounded-lg border bg-card",
                    hasIssues ? "border-warning/50" : "border-border"
                  )}>
                    {/* Channel Header */}
                    <div className="flex items-center justify-between border-b border-border/50 px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div className={cn(
                          "flex h-8 w-8 items-center justify-center rounded-lg text-[11px] font-bold",
                          ca.channelName === 'Booking.com' ? "bg-blue-500/15 text-blue-600" :
                          ca.channelName === 'Agoda' ? "bg-red-500/15 text-red-600" :
                          ca.channelName === 'Airbnb' ? "bg-pink-500/15 text-pink-600" :
                          "bg-muted text-muted-foreground"
                        )}>
                          {ca.channelName.charAt(0)}
                        </div>
                        <div>
                          <p className="text-[12px] font-semibold text-foreground">{ca.channelName}</p>
                          <p className="text-[9px] font-mono text-muted-foreground">{ca.otaPropertyId || 'No ID'}</p>
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-6 w-6 p-0"
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
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </div>

                    {/* Identity */}
                    <div className="border-b border-border/30 px-4 py-3">
                      <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Identity</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">OTA Property Name</span>
                          <span className="max-w-[140px] truncate font-medium text-foreground">{ca.otaPropertyName || '—'}</span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Last Data</span>
                          <span className="text-foreground">
                            {ca.lastDataAt ? formatDistanceToNow(new Date(ca.lastDataAt), { addSuffix: true }) : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Commercial */}
                    <div className="border-b border-border/30 px-4 py-3">
                      <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Commercial</p>
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Commission</span>
                          <span className="font-semibold text-foreground">
                            {ca.commissionModel === 'percentage' ? `${ca.commissionPercent}%` : ca.commissionModel}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px]">
                          <span className="text-muted-foreground">Payout</span>
                          <StatusBadge status={ca.payoutModel} size="xs" />
                        </div>
                        {ca.promotionStackingRule && ca.promotionStackingRule !== 'Not configured' && (
                          <div className="mt-1 rounded bg-info/10 p-1.5">
                            <p className="text-[9px] text-info">{ca.promotionStackingRule}</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Operational Readiness */}
                    <div className="border-b border-border/30 px-4 py-3">
                      <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Operational Readiness</p>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex flex-col items-center rounded bg-muted/30 p-1.5">
                          {ca.setupComplete ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <XCircle className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span className="mt-0.5 text-[8px] text-muted-foreground">Setup</span>
                        </div>
                        <div className="flex flex-col items-center rounded bg-muted/30 p-1.5">
                          {ca.mappingComplete ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <AlertCircle className="h-3.5 w-3.5 text-warning" />
                          )}
                          <span className="mt-0.5 text-[8px] text-muted-foreground">Mapping</span>
                        </div>
                        <div className="flex flex-col items-center rounded bg-muted/30 p-1.5">
                          {ca.verificationReady ? (
                            <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          ) : (
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <span className="mt-0.5 text-[8px] text-muted-foreground">Verify</span>
                        </div>
                      </div>
                    </div>

                    {/* Risk / Issues */}
                    <div className="px-4 py-3">
                      <p className="mb-2 text-[9px] font-semibold uppercase tracking-wider text-muted-foreground">Issues</p>
                      {stats.activeMismatches === 0 && stats.staleEvidence === 0 && stats.pendingVerifications === 0 && stats.uncertainCompares === 0 ? (
                        <div className="flex items-center gap-2 rounded bg-success/10 p-2">
                          <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                          <span className="text-[10px] font-medium text-success">No active issues</span>
                        </div>
                      ) : (
                        <div className="space-y-1">
                          {stats.activeMismatches > 0 && (
                            <div className="flex items-center gap-2 rounded bg-critical/10 px-2 py-1">
                              <AlertTriangle className="h-3 w-3 text-critical" />
                              <span className="text-[10px] text-critical">{stats.activeMismatches} price mismatch{stats.activeMismatches > 1 ? 'es' : ''}</span>
                            </div>
                          )}
                          {stats.staleEvidence > 0 && (
                            <div className="flex items-center gap-2 rounded bg-warning/10 px-2 py-1">
                              <Clock className="h-3 w-3 text-warning" />
                              <span className="text-[10px] text-warning">{stats.staleEvidence} stale capture{stats.staleEvidence > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {stats.pendingVerifications > 0 && (
                            <div className="flex items-center gap-2 rounded bg-info/10 px-2 py-1">
                              <Clock className="h-3 w-3 text-info" />
                              <span className="text-[10px] text-info">{stats.pendingVerifications} pending verification{stats.pendingVerifications > 1 ? 's' : ''}</span>
                            </div>
                          )}
                          {stats.uncertainCompares > 0 && (
                            <div className="flex items-center gap-2 rounded bg-muted px-2 py-1">
                              <AlertCircle className="h-3 w-3 text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground">{stats.uncertainCompares} uncertain compare{stats.uncertainCompares > 1 ? 's' : ''}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
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

          {/* Setup Tab - Enhanced Onboarding Center */}
          <TabsContent value="setup" className="space-y-4">
            {/* Onboarding Readiness Overview */}
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-4 py-3">
                <Settings2 className="h-4 w-4 text-muted-foreground" />
                <span className="text-[13px] font-medium text-foreground">Onboarding Readiness</span>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
                  {[
                    { label: 'Property Setup', done: property.onboardingStatus !== 'draft', icon: CheckCircle2 },
                    { label: 'Email Source', done: bookings.some((b) => b.sourceType === 'email-parsed'), icon: Mail },
                    { label: 'Booking Parse', done: bookings.filter((b) => b.verificationStatus === 'parsed').length > 0, icon: Activity },
                    { label: 'Mapping Complete', done: property.mappingCompleteness === 'complete', icon: Link2 },
                    { label: 'Capture Active', done: priceCaptures.length > 0, icon: ImageIcon },
                    { label: 'Verification Ready', done: channelAccounts.every((ca) => ca.verificationReady), icon: ShieldCheck },
                  ].map((item) => (
                    <div key={item.label} className={cn(
                      "rounded-lg border p-3 text-center",
                      item.done ? "border-success/30 bg-success/5" : "border-border bg-muted/20"
                    )}>
                      <item.icon className={cn(
                        "mx-auto h-5 w-5",
                        item.done ? "text-success" : "text-muted-foreground"
                      )} />
                      <p className={cn(
                        "mt-2 text-[10px] font-medium",
                        item.done ? "text-success" : "text-muted-foreground"
                      )}>{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Channel-by-Channel Onboarding */}
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Radio className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[13px] font-medium text-foreground">Channel Onboarding Status</span>
                </div>
                <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-[10px]" onClick={() => setShowAddChannel(true)}>
                  <Plus className="h-3 w-3" />
                  Add Channel
                </Button>
              </div>
              {channelAccounts.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-muted-foreground">
                  No OTA channels configured yet.
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {channelAccounts.map((ca) => {
                    const channelMappings = mappings.filter((m) => m.channelId === ca.channelId);
                    const stats = getChannelStats(ca.channelId);
                    return (
                      <div key={ca.id} className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex h-9 w-9 items-center justify-center rounded-lg text-[12px] font-bold",
                              ca.channelName === 'Booking.com' ? "bg-blue-500/15 text-blue-600" :
                              ca.channelName === 'Agoda' ? "bg-red-500/15 text-red-600" :
                              ca.channelName === 'Airbnb' ? "bg-pink-500/15 text-pink-600" :
                              "bg-muted text-muted-foreground"
                            )}>
                              {ca.channelName.charAt(0)}
                            </div>
                            <div>
                              <p className="text-[12px] font-semibold text-foreground">{ca.channelName}</p>
                              <p className="text-[10px] text-muted-foreground">
                                {ca.otaPropertyId ? `ID: ${ca.otaPropertyId}` : 'No OTA Property ID'}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-6 w-6 p-0"
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
                              <Edit className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>

                        {/* Onboarding Checklist */}
                        <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
                          <div className={cn(
                            "rounded border px-2 py-1.5 text-center",
                            ca.otaPropertyId ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"
                          )}>
                            <p className={cn("text-[10px] font-medium", ca.otaPropertyId ? "text-success" : "text-warning")}>
                              {ca.otaPropertyId ? 'ID Set' : 'ID Missing'}
                            </p>
                            <p className="text-[8px] text-muted-foreground">OTA Property ID</p>
                          </div>
                          <div className={cn(
                            "rounded border px-2 py-1.5 text-center",
                            ca.commissionModel !== 'unknown' ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"
                          )}>
                            <p className={cn("text-[10px] font-medium", ca.commissionModel !== 'unknown' ? "text-success" : "text-warning")}>
                              {ca.commissionModel !== 'unknown' ? `${ca.commissionPercent}%` : 'Unknown'}
                            </p>
                            <p className="text-[8px] text-muted-foreground">Commission</p>
                          </div>
                          <div className={cn(
                            "rounded border px-2 py-1.5 text-center",
                            ca.payoutModel !== 'unknown' ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"
                          )}>
                            <p className={cn("text-[10px] font-medium truncate", ca.payoutModel !== 'unknown' ? "text-success" : "text-warning")}>
                              {ca.payoutModel !== 'unknown' ? ca.payoutModel.split('-').slice(0, 2).join(' ') : 'Unknown'}
                            </p>
                            <p className="text-[8px] text-muted-foreground">Payout</p>
                          </div>
                          <div className={cn(
                            "rounded border px-2 py-1.5 text-center",
                            ca.mappingComplete ? "border-success/30 bg-success/5" : "border-warning/30 bg-warning/5"
                          )}>
                            <p className={cn("text-[10px] font-medium", ca.mappingComplete ? "text-success" : "text-warning")}>
                              {channelMappings.filter((m) => m.status === 'complete').length}/{channelMappings.length || 0}
                            </p>
                            <p className="text-[8px] text-muted-foreground">Mappings</p>
                          </div>
                          <div className={cn(
                            "rounded border px-2 py-1.5 text-center",
                            stats.totalCaptures > 0 ? "border-success/30 bg-success/5" : "border-muted bg-muted/20"
                          )}>
                            <p className={cn("text-[10px] font-medium", stats.totalCaptures > 0 ? "text-success" : "text-muted-foreground")}>
                              {stats.totalCaptures}
                            </p>
                            <p className="text-[8px] text-muted-foreground">Captures</p>
                          </div>
                          <div className={cn(
                            "rounded border px-2 py-1.5 text-center",
                            ca.verificationReady ? "border-success/30 bg-success/5" : "border-muted bg-muted/20"
                          )}>
                            <p className={cn("text-[10px] font-medium", ca.verificationReady ? "text-success" : "text-muted-foreground")}>
                              {ca.verificationReady ? 'Ready' : 'Pending'}
                            </p>
                            <p className="text-[8px] text-muted-foreground">Verification</p>
                          </div>
                        </div>

                        {/* Warnings */}
                        {(!ca.otaPropertyId || ca.commissionModel === 'unknown' || !ca.mappingComplete) && (
                          <div className="mt-3 rounded border border-warning/30 bg-warning/5 p-2">
                            <p className="text-[10px] font-medium text-warning">Setup incomplete:</p>
                            <ul className="mt-1 space-y-0.5">
                              {!ca.otaPropertyId && (
                                <li className="text-[9px] text-warning">• Missing OTA Property ID - cannot link captures</li>
                              )}
                              {ca.commissionModel === 'unknown' && (
                                <li className="text-[9px] text-warning">• Commission model unknown - net revenue cannot be calculated</li>
                              )}
                              {!ca.mappingComplete && (
                                <li className="text-[9px] text-warning">• Mapping incomplete - price comparisons may be unreliable</li>
                              )}
                            </ul>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Room/Rate Mappings */}
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <div className="flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-muted-foreground" />
                  <span className="text-[13px] font-medium text-foreground">Room/Rate Mappings</span>
                </div>
                <Button size="sm" variant="outline" className="h-7 gap-1.5 px-2 text-[10px]" onClick={() => setShowAddMapping(true)}>
                  <Plus className="h-3 w-3" />
                  Add Mapping
                </Button>
              </div>
              {mappings.length === 0 ? (
                <div className="p-6 text-center text-[11px] text-muted-foreground">No mappings configured</div>
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
