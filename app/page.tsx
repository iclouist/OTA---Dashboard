import { DashboardLayout } from '@/components/dashboard/layout';
import { AlertList } from '@/components/dashboard/alert-row';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { Button } from '@/components/ui/button';
import {
  overviewKPIs,
  alerts,
  properties,
  bookingEvents,
  priceCaptures,
  sourceConfidenceSummary,
  availabilityKPIs,
  channelAvailabilityStatus,
  sellabilityIssues,
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
  CalendarCheck,
  Ban,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn, formatCompact, formatVND } from '@/lib/utils';

export default function OverviewPage() {
  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const criticalAlerts = activeAlerts.filter((a) => a.severity === 'critical' || a.severity === 'high');
  const recentBookings = bookingEvents.slice(0, 8);
  
  // Calculate if there are urgent items
  const hasUrgentIssues = criticalAlerts.length > 0 || properties.some(p => p.healthStatus === 'critical');
  
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
      <div className="space-y-8">
        {/* Hero: Critical Alert Banner - only shows when there are urgent issues */}
        {hasUrgentIssues && (
          <div className="relative overflow-hidden rounded-lg border border-critical/30 bg-gradient-to-r from-critical/10 via-critical/5 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-critical/20">
                  <AlertTriangle className="h-5 w-5 text-critical animate-pulse" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">
                    {criticalAlerts.length} critical issue{criticalAlerts.length !== 1 ? 's' : ''} require immediate attention
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    Price parity violations and property health alerts detected
                  </p>
                </div>
              </div>
              <Link href="/alerts">
                <Button variant="outline" size="sm" className="border-critical/30 text-critical hover:bg-critical/10">
                  Review Now
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* Section 1: Performance Overview */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-success/10">
                <TrendingUp className="h-4 w-4 text-success" />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-foreground">Revenue Performance</h2>
                <p className="text-[11px] text-muted-foreground">Booking revenue across all properties and channels</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
            {/* Gross Booking Value - Hero KPI */}
            <div className="col-span-2 md:col-span-1 rounded-xl border border-border bg-gradient-to-br from-card via-card to-muted/20 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Banknote className="h-4 w-4" />
                <span className="text-[11px] font-medium uppercase tracking-wide">Gross Booking Value</span>
              </div>
              <p className="mt-3 text-4xl font-bold tabular-nums tracking-tight text-foreground">
                {formatCompact(overviewKPIs.grossBookingValue)}
              </p>
              <p className="mt-1 text-[11px] text-muted-foreground">THB equivalent</p>
            </div>

            {/* Secondary KPIs - more compact but still readable */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <BedDouble className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Room Nights</span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{overviewKPIs.roomNightsSold}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Confirmed bookings</p>
            </div>

            <div className="rounded-xl border border-warning/20 bg-warning/5 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-warning">
                <Percent className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">OTA Commission</span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-warning">{formatCompact(overviewKPIs.estimatedOTACommission)}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">~15% average rate</p>
            </div>

            <div className="rounded-xl border border-success/30 bg-success/5 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-success">
                <TrendingUp className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Net Revenue</span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-success">{formatCompact(overviewKPIs.netRevenue)}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">After commission</p>
            </div>

            <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Properties</span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">{overviewKPIs.totalProperties}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">{properties.filter(p => p.onboardingStatus === 'active').length} active</p>
            </div>
          </div>
        </section>

        {/* Section 2: Needs Attention Now */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md",
                criticalAlerts.length > 0 || mismatchSummary.critical > 0 ? "bg-critical/10" : "bg-warning/10"
              )}>
                <AlertTriangle className={cn(
                  "h-4 w-4",
                  criticalAlerts.length > 0 || mismatchSummary.critical > 0 ? "text-critical" : "text-warning"
                )} />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-foreground">Needs Attention</h2>
                <p className="text-[11px] text-muted-foreground">Active alerts, price issues, and properties requiring review</p>
              </div>
            </div>
            {(criticalAlerts.length > 0 || mismatchSummary.critical > 0) && (
              <span className="rounded-full bg-critical/15 px-2.5 py-1 text-[11px] font-semibold text-critical">
                {criticalAlerts.length + mismatchSummary.critical} critical
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Price Issues - Prominent */}
            <div className="lg:col-span-4">
              <div className={cn(
                "h-full rounded-xl border p-5 shadow-sm",
                mismatchSummary.critical > 0 ? "border-critical/40 bg-gradient-to-br from-critical/10 via-critical/5 to-transparent" : "border-border bg-card"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className={cn("h-4 w-4", mismatchSummary.critical > 0 ? "text-critical" : "text-warning")} />
                    <span className="text-[13px] font-semibold text-foreground">Price Parity Issues</span>
                  </div>
                  <Link href="/price-monitor" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    Review
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                
                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className={cn("text-3xl font-bold tabular-nums", mismatchSummary.critical > 0 ? "text-critical" : "text-muted-foreground")}>
                      {mismatchSummary.critical}
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-critical">Critical</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold tabular-nums text-warning">{mismatchSummary.medium}</p>
                    <p className="mt-1 text-[10px] font-medium text-warning">Medium</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold tabular-nums text-info">{mismatchSummary.low}</p>
                    <p className="mt-1 text-[10px] font-medium text-info">Low</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">vs</span>
                    <Smartphone className="h-3.5 w-3.5 text-muted-foreground" />
                  </div>
                  <span className={cn("text-[11px] font-semibold tabular-nums", desktopMobileDiffs.length > 0 ? "text-warning" : "text-muted-foreground")}>
                    {desktopMobileDiffs.length} desktop/mobile divergences
                  </span>
                </div>
              </div>
            </div>

            {/* Active Alerts */}
            <div className="lg:col-span-4">
              <div className="h-full rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-critical" />
                    <span className="text-[13px] font-semibold text-foreground">Active Alerts</span>
                    <span className={cn(
                      "rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      criticalAlerts.length > 0 ? "bg-critical/15 text-critical" : "bg-warning/15 text-warning"
                    )}>
                      {activeAlerts.length}
                    </span>
                  </div>
                  <Link href="/alerts" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    View all
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <AlertList alerts={activeAlerts} maxItems={4} compact />
              </div>
            </div>

            {/* Properties Requiring Attention */}
            <div className="lg:col-span-4">
              <div className="h-full rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-warning" />
                    <span className="text-[13px] font-semibold text-foreground">Properties at Risk</span>
                  </div>
                  <Link href="/properties" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    View all
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div>
                  {propertiesNeedingAttention.length === 0 ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-[11px] text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">All properties healthy</span>
                    </div>
                  ) : (
                    propertiesNeedingAttention.slice(0, 4).map((p) => (
                      <Link
                        key={p.id}
                        href={`/properties/${p.id}`}
                        className="flex items-center gap-3 border-b border-border/50 px-5 py-3 transition-colors last:border-0 hover:bg-muted/30"
                      >
                        <StatusDot status={p.healthStatus} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-foreground">{p.name}</p>
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
                        <div className="flex flex-col items-end gap-1">
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

        {/* Section 2.5: Availability Health */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md",
                availabilityKPIs.propertiesAtRisk > 0 || availabilityKPIs.channelsWithSellabilityIssues > 0 ? "bg-warning/10" : "bg-success/10"
              )}>
                <CalendarCheck className={cn(
                  "h-4 w-4",
                  availabilityKPIs.propertiesAtRisk > 0 || availabilityKPIs.channelsWithSellabilityIssues > 0 ? "text-warning" : "text-success"
                )} />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-foreground">Availability Health</h2>
                <p className="text-[11px] text-muted-foreground">Channel sellability and inventory status across properties</p>
              </div>
            </div>
            <Link href="/availability" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
              View all
              <ChevronRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Availability Summary Card */}
            <div className="lg:col-span-4">
              <div className={cn(
                "h-full rounded-xl border p-5 shadow-sm",
                availabilityKPIs.channelsWithSellabilityIssues > 0 ? "border-warning/40 bg-gradient-to-br from-warning/10 via-warning/5 to-transparent" : "border-border bg-card"
              )}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarCheck className={cn("h-4 w-4", availabilityKPIs.channelsWithSellabilityIssues > 0 ? "text-warning" : "text-success")} />
                    <span className="text-[13px] font-semibold text-foreground">Availability Status</span>
                  </div>
                  <Link href="/availability" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    Details
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                
                <div className="mt-5 grid grid-cols-3 gap-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold tabular-nums text-success">
                      {availabilityKPIs.propertiesOpen}
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-success">Open</p>
                  </div>
                  <div className="text-center">
                    <p className={cn("text-3xl font-bold tabular-nums", availabilityKPIs.closedDates > 0 ? "text-critical" : "text-muted-foreground")}>
                      {availabilityKPIs.closedDates}
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-muted-foreground">Closed Dates</p>
                  </div>
                  <div className="text-center">
                    <p className={cn("text-3xl font-bold tabular-nums", availabilityKPIs.staleSyncs > 0 ? "text-warning" : "text-muted-foreground")}>
                      {availabilityKPIs.staleSyncs}
                    </p>
                    <p className="mt-1 text-[10px] font-medium text-muted-foreground">Stale Syncs</p>
                  </div>
                </div>

                <div className="mt-5 flex items-center justify-between border-t border-border/50 pt-4">
                  <div className="flex items-center gap-2">
                    <Ban className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-[10px] text-muted-foreground">Not sellable</span>
                  </div>
                  <span className={cn("text-[11px] font-semibold tabular-nums", availabilityKPIs.channelsWithSellabilityIssues > 0 ? "text-critical" : "text-muted-foreground")}>
                    {availabilityKPIs.channelsWithSellabilityIssues} channels
                  </span>
                </div>
              </div>
            </div>

            {/* Channel Availability Issues */}
            <div className="lg:col-span-4">
              <div className="h-full rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 text-warning" />
                    <span className="text-[13px] font-semibold text-foreground">Sellability Issues</span>
                    {sellabilityIssues.filter(i => i.status === 'active').length > 0 && (
                      <span className="rounded-full bg-warning/15 px-2 py-0.5 text-[10px] font-semibold text-warning">
                        {sellabilityIssues.filter(i => i.status === 'active').length}
                      </span>
                    )}
                  </div>
                  <Link href="/availability" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    View all
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div>
                  {sellabilityIssues.filter(i => i.status === 'active').length === 0 ? (
                    <div className="flex items-center justify-center gap-2 py-10 text-[11px] text-success">
                      <CheckCircle2 className="h-5 w-5" />
                      <span className="font-medium">All channels sellable</span>
                    </div>
                  ) : (
                    sellabilityIssues
                      .filter(i => i.status === 'active')
                      .sort((a, b) => {
                        const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                        return severityOrder[a.severity] - severityOrder[b.severity];
                      })
                      .slice(0, 4)
                      .map((issue) => (
                        <Link
                          key={issue.id}
                          href="/availability"
                          className="flex items-center gap-3 border-b border-border/50 px-5 py-3 transition-colors last:border-0 hover:bg-muted/30"
                        >
                          <div className={cn(
                            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                            issue.severity === 'critical' && "bg-critical/15",
                            issue.severity === 'high' && "bg-warning/15",
                            issue.severity === 'medium' && "bg-info/15",
                            issue.severity === 'low' && "bg-muted"
                          )}>
                            <AlertTriangle className={cn(
                              "h-3 w-3",
                              issue.severity === 'critical' && "text-critical",
                              issue.severity === 'high' && "text-warning",
                              issue.severity === 'medium' && "text-info",
                              issue.severity === 'low' && "text-muted-foreground"
                            )} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[11px] font-medium text-foreground">{issue.title}</p>
                            <p className="text-[10px] text-muted-foreground">{issue.propertyName}</p>
                          </div>
                        </Link>
                      ))
                  )}
                </div>
              </div>
            </div>

            {/* Channels with Issues */}
            <div className="lg:col-span-4">
              <div className="h-full rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[13px] font-semibold text-foreground">Channel Health</span>
                  </div>
                </div>
                <div className="p-5">
                  {channelAvailabilityStatus
                    .filter(c => !c.sellable || c.syncStatus === 'stale' || c.syncStatus === 'missing')
                    .slice(0, 4)
                    .map((channel) => (
                      <div key={channel.id} className="flex items-center justify-between py-2 border-b border-border/30 last:border-0">
                        <div className="flex items-center gap-2">
                          <XCircle className="h-3.5 w-3.5 text-critical" />
                          <div>
                            <p className="text-[11px] font-medium text-foreground">{channel.channelName}</p>
                            <p className="text-[10px] text-muted-foreground">{channel.propertyName.split(' ').slice(0, 2).join(' ')}</p>
                          </div>
                        </div>
                        <span className={cn(
                          "rounded-full px-2 py-0.5 text-[9px] font-semibold",
                          !channel.sellable ? "bg-critical/15 text-critical" : "bg-warning/15 text-warning"
                        )}>
                          {!channel.sellable ? 'Not Sellable' : 'Stale'}
                        </span>
                      </div>
                    ))}
                  {channelAvailabilityStatus.filter(c => !c.sellable || c.syncStatus === 'stale' || c.syncStatus === 'missing').length === 0 && (
                    <div className="flex items-center justify-center gap-2 py-6 text-[11px] text-success">
                      <CheckCircle2 className="h-4 w-4" />
                      <span className="font-medium">All channels healthy</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Verification & Trust Quality */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-info/10">
              <ShieldCheck className="h-4 w-4 text-info" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-foreground">Verification & Data Quality</h2>
              <p className="text-[11px] text-muted-foreground">Booking verification status, source confidence, and evidence quality</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Booking Verification Status */}
            <div className="lg:col-span-3">
              <div className="h-full rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-4 w-4 text-info" />
                  <span className="text-[12px] font-semibold text-foreground">Booking Verification</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success/15">
                        <CheckCircle2 className="h-3 w-3 text-success" />
                      </div>
                      <span className="text-[11px] text-muted-foreground">Verified</span>
                    </div>
                    <span className="text-[13px] font-bold tabular-nums text-success">{verificationStats.verified}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-warning/15">
                        <Eye className="h-3 w-3 text-warning" />
                      </div>
                      <span className="text-[11px] text-muted-foreground">Link Only</span>
                    </div>
                    <span className="text-[13px] font-bold tabular-nums text-warning">{verificationStats.linkOnly}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-critical/15">
                        <AlertCircle className="h-3 w-3 text-critical" />
                      </div>
                      <span className="text-[11px] text-muted-foreground">Needs Review</span>
                    </div>
                    <span className="text-[13px] font-bold tabular-nums text-critical">{verificationStats.needsReview}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Source Confidence */}
            <div className="lg:col-span-3">
              <div className="h-full rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-4 w-4 text-info" />
                  <span className="text-[12px] font-semibold text-foreground">Source Confidence</span>
                </div>
                <div className="space-y-3">
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
                        <span className={cn("w-14 text-[11px] font-medium", item.color)}>{item.label}</span>
                        <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                          <div className={cn("h-full rounded-full transition-all", item.bg)} style={{ width: `${pct}%` }} />
                        </div>
                        <span className={cn("w-8 text-right text-[12px] font-bold tabular-nums", item.color)}>{item.value}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Evidence Quality */}
            <div className="lg:col-span-3">
              <div className="h-full rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Eye className="h-4 w-4 text-info" />
                  <span className="text-[12px] font-semibold text-foreground">Evidence Quality</span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-lg bg-success/10 p-3">
                    <p className="text-2xl font-bold tabular-nums text-success">{evidenceStats.available}</p>
                    <p className="mt-1 text-[10px] font-medium text-success">Available</p>
                  </div>
                  <div className={cn("rounded-lg p-3", evidenceStats.missing > 0 ? "bg-critical/10" : "bg-muted/30")}>
                    <p className={cn("text-2xl font-bold tabular-nums", evidenceStats.missing > 0 ? "text-critical" : "text-muted-foreground")}>{evidenceStats.missing}</p>
                    <p className="mt-1 text-[10px] font-medium text-muted-foreground">Missing</p>
                  </div>
                  <div className={cn("rounded-lg p-3", evidenceStats.stale > 0 ? "bg-warning/10" : "bg-muted/30")}>
                    <p className={cn("text-2xl font-bold tabular-nums", evidenceStats.stale > 0 ? "text-warning" : "text-muted-foreground")}>{evidenceStats.stale}</p>
                    <p className="mt-1 text-[10px] font-medium text-muted-foreground">Stale</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Source Confidence Summary Detail */}
            <div className="lg:col-span-3">
              <div className="h-full rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <ShieldCheck className="h-4 w-4 text-info" />
                  <span className="text-[12px] font-semibold text-foreground">Source Types</span>
                </div>
                <div className="space-y-2.5">
                  {sourceConfidenceSummary.slice(0, 4).map((item) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground truncate pr-2">{item.category}</span>
                      <span className="text-[12px] font-bold tabular-nums text-foreground">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 4: Revenue Breakdown & Recent Activity */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-foreground">Revenue Breakdown & Activity</h2>
              <p className="text-[11px] text-muted-foreground">Property performance, channel distribution, and recent bookings</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            {/* Revenue by Property */}
            <div className="lg:col-span-5">
              <div className="h-full rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <span className="text-[13px] font-semibold text-foreground">Revenue by Property</span>
                  <Link href="/properties" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    View all
                    <ChevronRight className="h-3.5 w-3.5" />
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
                        className="group flex items-center gap-3 border-b border-border/50 px-5 py-3 transition-colors last:border-0 hover:bg-muted/30"
                      >
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{idx + 1}</span>
                        <StatusDot status={property.healthStatus} />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[12px] font-medium text-foreground">{property.name}</p>
                          <div className="mt-1.5 h-1.5 w-full rounded-full bg-muted overflow-hidden">
                            <div className="h-full rounded-full bg-info transition-all" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-[12px] font-bold tabular-nums text-foreground">
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
              <div className="h-full rounded-xl border border-border bg-card shadow-sm">
                <div className="border-b border-border px-5 py-3">
                  <span className="text-[13px] font-semibold text-foreground">Top OTA Channels</span>
                </div>
                <div className="p-5">
                  {topChannels.map(([channel, amount], idx) => (
                    <div key={channel} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-semibold text-muted-foreground">{idx + 1}</span>
                        <span className="text-[12px] font-medium text-foreground">{channel}</span>
                      </div>
                      <span className="text-[12px] font-bold tabular-nums text-foreground">{formatCompact(amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Booking Events */}
            <div className="lg:col-span-4">
              <div className="h-full rounded-xl border border-border bg-card shadow-sm">
                <div className="flex items-center justify-between border-b border-border px-5 py-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-[13px] font-semibold text-foreground">Recent Bookings</span>
                  </div>
                  <Link href="/bookings" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground transition-colors">
                    View all
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
                <div>
                  {recentBookings.slice(0, 5).map((b) => (
                    <div key={b.id} className="flex items-center gap-3 border-b border-border/50 px-5 py-3 last:border-0">
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
                          <span className="text-[12px] font-medium text-foreground">{b.channelName}</span>
                          <span className="text-[10px] text-muted-foreground">·</span>
                          <span className="text-[10px] font-mono text-muted-foreground">{b.bookingRef}</span>
                        </div>
                        <p className="truncate text-[10px] text-muted-foreground">{b.propertyName.split(' ').slice(0, 3).join(' ')}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[12px] font-bold tabular-nums text-foreground">
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
