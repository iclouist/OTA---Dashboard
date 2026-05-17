import { DashboardLayout } from '@/components/dashboard/layout';
import { AlertList } from '@/components/dashboard/alert-row';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import {
  overviewKPIs,
  alerts,
  properties,
  bookingEvents,
  priceCaptures,
  sourceConfidenceSummary,
} from '@/lib/mock-data';
import {
  Building2,
  BedDouble,
  Banknote,
  Percent,
  TrendingUp,
  AlertTriangle,
  ChevronRight,
  Clock,
  ShieldCheck,
  Eye,
  Monitor,
  Smartphone,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
}

export default function OverviewPage() {
  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical' || a.severity === 'high');
  const recentBookings = bookingEvents.slice(0, 8);
  
  // Properties requiring attention
  const propertiesNeedingAttention = properties.filter(
    (p) => p.healthStatus === 'critical' || p.healthStatus === 'warning' || p.onboardingStatus === 'draft' || p.onboardingStatus === 'mapping-needed'
  ).sort((a, b) => {
    const priority = { critical: 0, warning: 1, unknown: 2, healthy: 3 };
    return (priority[a.healthStatus] ?? 3) - (priority[b.healthStatus] ?? 3);
  });

  // Revenue by property
  const revenueByProperty = properties
    .filter((p) => p.grossRevenue > 0)
    .sort((a, b) => b.grossRevenue - a.grossRevenue);

  // Price mismatch summary
  const mismatchSummary = {
    total: priceCaptures.filter((p) => p.alertStatus !== 'none').length,
    critical: priceCaptures.filter((p) => p.alertStatus === 'critical').length,
    medium: priceCaptures.filter((p) => p.alertStatus === 'medium').length,
    low: priceCaptures.filter((p) => p.alertStatus === 'low').length,
  };

  // Desktop vs mobile diff summary
  const desktopMobilePairs = priceCaptures.reduce(
    (acc, pc) => {
      const key = `${pc.propertyId}-${pc.channelId}-${pc.roomType}-${pc.stayDate}`;
      if (!acc[key]) acc[key] = {};
      acc[key][pc.deviceType] = pc.displayPrice;
      return acc;
    },
    {} as Record<string, Record<string, number>>
  );
  const desktopMobileDiffs = Object.values(desktopMobilePairs).filter(
    (pair) => pair.desktop && pair.mobile && pair.desktop !== pair.mobile
  );

  // Booking verification stats
  const verificationStats = {
    verified: bookingEvents.filter((b) => b.verificationStatus === 'parsed' || b.verificationStatus === 'verified-by-screenshot').length,
    linkOnly: bookingEvents.filter((b) => b.verificationStatus === 'link-only').length,
    needsReview: bookingEvents.filter((b) => b.verificationStatus === 'needs-admin-review').length,
    stale: bookingEvents.filter((b) => b.verificationStatus === 'stale').length,
  };

  // Evidence quality
  const evidenceStats = {
    available: priceCaptures.filter((p) => p.evidenceStatus === 'available').length,
    missing: priceCaptures.filter((p) => p.evidenceStatus === 'missing').length,
    stale: priceCaptures.filter((p) => p.evidenceStatus === 'stale').length,
  };

  // Source confidence breakdown
  const confidenceStats = {
    high: priceCaptures.filter((p) => p.sourceConfidence === 'high').length,
    medium: priceCaptures.filter((p) => p.sourceConfidence === 'medium').length,
    low: priceCaptures.filter((p) => p.sourceConfidence === 'low').length,
    pending: priceCaptures.filter((p) => p.sourceConfidence === 'pending-verification').length,
  };

  // Top OTA channels by bookings
  const channelBookings = bookingEvents.reduce(
    (acc, b) => {
      acc[b.channelName] = (acc[b.channelName] || 0) + b.grossAmount;
      return acc;
    },
    {} as Record<string, number>
  );
  const topChannels = Object.entries(channelBookings)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Section 1: Performance Overview */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-success" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Revenue Performance</h2>
          </div>
          
          <div className="grid grid-cols-2 gap-3 md:grid-cols-5">
            {/* Gross Booking Value - Hero KPI */}
            <div className="col-span-2 md:col-span-1 rounded-lg border border-border bg-gradient-to-br from-card to-card/80 p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Banknote className="h-4 w-4" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Gross Booking Value</span>
              </div>
              <p className="mt-2 text-3xl font-bold tabular-nums tracking-tight text-foreground">
                {formatCurrency(overviewKPIs.grossBookingValue)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">THB equivalent</p>
            </div>

            {/* Secondary KPIs */}
            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <BedDouble className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Room Nights</span>
              </div>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums text-foreground">{overviewKPIs.roomNightsSold}</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-warning">
                <Percent className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">OTA Commission</span>
              </div>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums text-warning">{formatCurrency(overviewKPIs.estimatedOTACommission)}</p>
              <p className="text-[10px] text-muted-foreground">~15% avg</p>
            </div>

            <div className="rounded-lg border border-success/30 bg-success/5 p-3">
              <div className="flex items-center gap-1.5 text-success">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Net Revenue</span>
              </div>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums text-success">{formatCurrency(overviewKPIs.netRevenue)}</p>
            </div>

            <div className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Properties</span>
              </div>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums text-foreground">{overviewKPIs.totalProperties}</p>
              <p className="text-[10px] text-muted-foreground">{properties.filter(p => p.onboardingStatus === 'active').length} active</p>
            </div>
          </div>
        </section>

        {/* Section 2: Needs Attention Now */}
        <section>
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-1.5 w-1.5 rounded-full bg-critical animate-pulse" />
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Needs Attention Now</h2>
              {(criticalAlerts.length > 0 || mismatchSummary.critical > 0) && (
                <span className="rounded bg-critical/15 px-1.5 py-0.5 text-[10px] font-semibold text-critical">
                  {criticalAlerts.length + mismatchSummary.critical} critical
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            {/* Price Issues - Prominent */}
            <div className="lg:col-span-4">
              <div className={cn(
                "rounded-lg border p-4",
                mismatchSummary.critical > 0 ? "border-critical/40 bg-critical/5" : "border-border bg-card"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn("h-4 w-4", mismatchSummary.critical > 0 ? "text-critical" : "text-warning")} />
                    <span className="text-[12px] font-medium text-foreground">Price Parity Issues</span>
                  </div>
                  <Link href="/price-monitor" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground">
                    Review
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                
                <div className="mt-4 grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <p className={cn("text-2xl font-bold tabular-nums", mismatchSummary.critical > 0 ? "text-critical" : "text-muted-foreground")}>
                      {mismatchSummary.critical}
                    </p>
                    <p className="text-[10px] text-critical">Critical</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold tabular-nums text-warning">{mismatchSummary.medium}</p>
                    <p className="text-[10px] text-warning">Medium</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold tabular-nums text-info">{mismatchSummary.low}</p>
                    <p className="text-[10px] text-info">Low</p>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-border/50 pt-3">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-3 w-3 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">vs</span>
                    <Smartphone className="h-3 w-3 text-muted-foreground" />
                  </div>
                  <span className={cn("text-[11px] font-medium tabular-nums", desktopMobileDiffs.length > 0 ? "text-warning" : "text-muted-foreground")}>
                    {desktopMobileDiffs.length} divergences
                  </span>
                </div>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="lg:col-span-4">
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-3.5 w-3.5 text-critical" />
                    <span className="text-[12px] font-medium text-foreground">Active Alerts</span>
                    <span className={cn(
                      "rounded px-1.5 py-0.5 text-[10px] font-semibold",
                      criticalAlerts.length > 0 ? "bg-critical/15 text-critical" : "bg-warning/15 text-warning"
                    )}>
                      {activeAlerts.length}
                    </span>
                  </div>
                  <Link href="/alerts" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground">
                    View all
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <AlertList alerts={activeAlerts} maxItems={4} compact />
              </div>
            </div>

            {/* Properties Requiring Attention */}
            <div className="lg:col-span-4">
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-3.5 w-3.5 text-warning" />
                    <span className="text-[12px] font-medium text-foreground">Properties at Risk</span>
                  </div>
                  <Link href="/properties" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground">
                    View all
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <div>
                  {propertiesNeedingAttention.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 py-8 text-[11px] text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      All properties healthy
                    </div>
                  ) : (
                    propertiesNeedingAttention.slice(0, 4).map((p) => (
                      <Link
                        key={p.id}
                        href={`/properties/${p.id}`}
                        className="flex items-center gap-3 border-b border-border/50 px-4 py-2.5 transition-colors last:border-0 hover:bg-muted/30"
                      >
                        <StatusDot status={p.healthStatus} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium text-foreground">{p.name}</p>
                          <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                            <span>{p.location}</span>
                            {p.alertCount > 0 && (
                              <>
                                <span>·</span>
                                <span className="text-warning">{p.alertCount} alerts</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-0.5">
                          <StatusBadge status={p.healthStatus} size="xs" />
                          {p.onboardingStatus !== 'active' && (
                            <StatusBadge status={p.onboardingStatus} size="xs" />
                          )}
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Verification & Trust Quality */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-info" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Verification & Data Quality</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            {/* Booking Verification Status */}
            <div className="lg:col-span-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-info" />
                  <span className="text-[11px] font-medium text-foreground">Booking Verification</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-3 w-3 text-success" />
                      <span className="text-[11px] text-muted-foreground">Verified</span>
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums text-success">{verificationStats.verified}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="h-3 w-3 text-warning" />
                      <span className="text-[11px] text-muted-foreground">Link Only</span>
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums text-warning">{verificationStats.linkOnly}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="h-3 w-3 text-critical" />
                      <span className="text-[11px] text-muted-foreground">Needs Review</span>
                    </div>
                    <span className="text-[12px] font-semibold tabular-nums text-critical">{verificationStats.needsReview}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Source Confidence */}
            <div className="lg:col-span-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-3.5 w-3.5 text-info" />
                  <span className="text-[11px] font-medium text-foreground">Source Confidence</span>
                </div>
                <div className="space-y-2">
                  {[
                    { label: 'High', value: confidenceStats.high, color: 'text-success', bg: 'bg-success' },
                    { label: 'Medium', value: confidenceStats.medium, color: 'text-info', bg: 'bg-info' },
                    { label: 'Low', value: confidenceStats.low, color: 'text-warning', bg: 'bg-warning' },
                    { label: 'Pending', value: confidenceStats.pending, color: 'text-muted-foreground', bg: 'bg-muted-foreground' },
                  ].map((item) => {
                    const total = priceCaptures.length;
                    const pct = total > 0 ? (item.value / total) * 100 : 0;
                    return (
                      <div key={item.label} className="flex items-center gap-3">
                        <span className={cn("w-14 text-[11px]", item.color)}>{item.label}</span>
                        <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full", item.bg)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={cn("w-6 text-right text-[11px] font-medium tabular-nums", item.color)}>{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Evidence Quality */}
            <div className="lg:col-span-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Eye className="h-3.5 w-3.5 text-info" />
                  <span className="text-[11px] font-medium text-foreground">Evidence Quality</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div>
                    <p className="text-xl font-bold tabular-nums text-success">{evidenceStats.available}</p>
                    <p className="text-[10px] text-muted-foreground">Available</p>
                  </div>
                  <div>
                    <p className={cn("text-xl font-bold tabular-nums", evidenceStats.missing > 0 ? "text-critical" : "text-muted-foreground")}>{evidenceStats.missing}</p>
                    <p className="text-[10px] text-muted-foreground">Missing</p>
                  </div>
                  <div>
                    <p className={cn("text-xl font-bold tabular-nums", evidenceStats.stale > 0 ? "text-warning" : "text-muted-foreground")}>{evidenceStats.stale}</p>
                    <p className="text-[10px] text-muted-foreground">Stale</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Source Confidence Summary Detail */}
            <div className="lg:col-span-3">
              <div className="rounded-lg border border-border bg-card p-4">
                <div className="flex items-center gap-2 mb-3">
                  <ShieldCheck className="h-3.5 w-3.5 text-info" />
                  <span className="text-[11px] font-medium text-foreground">Source Types</span>
                </div>
                <div className="space-y-1.5">
                  {sourceConfidenceSummary.slice(0, 4).map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-[10px] text-muted-foreground truncate pr-2">{item.category}</span>
                      <span className="text-[11px] font-medium tabular-nums text-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Revenue Breakdown & Recent Activity */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Revenue Breakdown & Activity</h2>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
            {/* Revenue by Property */}
            <div className="lg:col-span-5">
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <span className="text-[12px] font-medium text-foreground">Revenue by Property</span>
                  <Link href="/properties" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground">
                    View all
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <div>
                  {revenueByProperty.slice(0, 5).map((property, idx) => {
                    const maxRevenue = revenueByProperty[0]?.grossRevenue || 1;
                    const pct = (property.grossRevenue / maxRevenue) * 100;
                    return (
                      <Link
                        key={property.id}
                        href={`/properties/${property.id}`}
                        className="group flex items-center gap-3 border-b border-border/50 px-4 py-2.5 transition-colors last:border-0 hover:bg-muted/30"
                      >
                        <span className="w-4 text-[10px] font-medium text-muted-foreground">{idx + 1}</span>
                        <StatusDot status={property.healthStatus} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[11px] font-medium text-foreground">{property.name}</p>
                          <div className="mt-1 h-1 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-info" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-semibold tabular-nums text-foreground">
                            {property.currency} {property.grossRevenue.toLocaleString()}
                          </p>
                          <p className="text-[10px] tabular-nums text-muted-foreground">{property.roomNightsSold} nights</p>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Top OTA Channels */}
            <div className="lg:col-span-3">
              <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border px-4 py-2.5">
                  <span className="text-[12px] font-medium text-foreground">Top OTA Channels</span>
                </div>
                <div className="p-4">
                  {topChannels.map(([channel, amount], idx) => (
                    <div key={channel} className="flex items-center justify-between py-1.5">
                      <div className="flex items-center gap-2">
                        <span className="w-4 text-[10px] font-medium text-muted-foreground">{idx + 1}</span>
                        <span className="text-[11px] text-foreground">{channel}</span>
                      </div>
                      <span className="text-[11px] font-medium tabular-nums text-foreground">{formatCurrency(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Booking Events */}
            <div className="lg:col-span-4">
              <div className="rounded-lg border border-border bg-card">
                <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[12px] font-medium text-foreground">Recent Bookings</span>
                  </div>
                  <Link href="/bookings" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground">
                    View all
                    <ChevronRight className="h-3 w-3" />
                  </Link>
                </div>
                <div>
                  {recentBookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex items-center gap-2 border-b border-border/50 px-4 py-2 last:border-0">
                      <StatusDot
                        status={
                          b.verificationStatus === 'parsed' || b.verificationStatus === 'verified-by-screenshot'
                            ? 'healthy'
                            : b.verificationStatus === 'link-only' || b.verificationStatus === 'needs-admin-review'
                            ? 'warning'
                            : 'critical'
                        }
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-foreground">{b.channelName}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] text-muted-foreground">{b.bookingRef}</span>
                        </div>
                        <p className="truncate text-[10px] text-muted-foreground">{b.propertyName.split(' ').slice(0, 3).join(' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[11px] font-medium tabular-nums text-foreground">
                          {b.currency} {b.grossAmount.toLocaleString()}
                        </p>
                        <p className="text-[9px] tabular-nums text-muted-foreground">
                          {formatDistanceToNow(new Date(b.eventTime), { addSuffix: false })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
