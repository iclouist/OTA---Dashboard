import { DashboardLayout } from '@/components/dashboard/layout';
import { KPICard } from '@/components/dashboard/kpi-card';
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
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}K`;
  return value.toFixed(0);
}

export default function OverviewPage() {
  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const recentBookings = bookingEvents.slice(0, 6);
  const riskyProperties = properties.filter(
    (p) => p.healthStatus !== 'healthy' && p.healthStatus !== 'unknown'
  );
  const highRiskProperties = properties.filter(
    (p) => p.healthStatus === 'critical' || p.onboardingStatus === 'draft'
  );

  // Revenue by property
  const revenueByProperty = properties
    .filter((p) => p.grossRevenue > 0)
    .sort((a, b) => b.grossRevenue - a.grossRevenue);

  // Room nights by property
  const roomNightsByProperty = properties
    .filter((p) => p.roomNightsSold > 0)
    .sort((a, b) => b.roomNightsSold - a.roomNightsSold);

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
      <div className="space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          <KPICard title="Properties" value={overviewKPIs.totalProperties} icon={Building2} />
          <KPICard title="Room Nights" value={overviewKPIs.roomNightsSold} icon={BedDouble} />
          <KPICard
            title="Gross Revenue"
            value={formatCurrency(overviewKPIs.grossBookingValue)}
            icon={Banknote}
          />
          <KPICard
            title="OTA Commission"
            value={formatCurrency(overviewKPIs.estimatedOTACommission)}
            icon={Percent}
            status="warning"
          />
          <KPICard
            title="Net Revenue"
            value={formatCurrency(overviewKPIs.netRevenue)}
            icon={TrendingUp}
            status="success"
          />
          <KPICard
            title="Price Issues"
            value={overviewKPIs.activePriceMismatches}
            icon={AlertTriangle}
            status={overviewKPIs.activePriceMismatches > 5 ? 'critical' : overviewKPIs.activePriceMismatches > 0 ? 'warning' : 'success'}
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Revenue by Property - 4 cols */}
          <div className="lg:col-span-4">
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-[12px] font-medium text-foreground">Revenue by Property</span>
                <Link
                  href="/properties"
                  className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div>
                {revenueByProperty.map((property) => (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="group flex items-center gap-2 border-b border-border/50 px-3 py-2 transition-colors last:border-0 hover:bg-muted/30"
                  >
                    <StatusDot status={property.healthStatus} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-medium text-foreground">
                        {property.name}
                      </p>
                      <p className="text-[10px] text-muted-foreground">{property.location}</p>
                    </div>
                    <span className="text-[11px] font-medium tabular-nums text-foreground">
                      {property.currency} {property.grossRevenue.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Room Nights + Top Channels - 4 cols */}
          <div className="flex flex-col gap-3 lg:col-span-4">
            {/* Room Nights by Property */}
            <div className="rounded-md border border-border bg-card">
              <div className="border-b border-border px-3 py-2">
                <span className="text-[12px] font-medium text-foreground">Room Nights by Property</span>
              </div>
              <div>
                {roomNightsByProperty.slice(0, 5).map((property) => {
                  const maxNights = roomNightsByProperty[0]?.roomNightsSold || 1;
                  const pct = (property.roomNightsSold / maxNights) * 100;
                  return (
                    <div
                      key={property.id}
                      className="flex items-center gap-3 border-b border-border/50 px-3 py-1.5 last:border-0"
                    >
                      <span className="w-28 truncate text-[11px] text-foreground">
                        {property.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                      <div className="flex-1">
                        <div className="h-1.5 w-full rounded-full bg-muted">
                          <div
                            className="h-1.5 rounded-full bg-info"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      <span className="w-8 text-right text-[11px] font-medium tabular-nums text-foreground">
                        {property.roomNightsSold}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Top OTA Channels by Sales */}
            <div className="rounded-md border border-border bg-card">
              <div className="border-b border-border px-3 py-2">
                <span className="text-[12px] font-medium text-foreground">
                  Top OTA Channels by Sales
                </span>
              </div>
              <div>
                {topChannels.map(([channel, amount]) => (
                  <div
                    key={channel}
                    className="flex items-center justify-between border-b border-border/50 px-3 py-1.5 last:border-0"
                  >
                    <span className="text-[11px] text-foreground">{channel}</span>
                    <span className="text-[11px] font-medium tabular-nums text-muted-foreground">
                      {formatCurrency(amount)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Alerts + High Risk - 4 cols */}
          <div className="flex flex-col gap-3 lg:col-span-4">
            {/* Active Alerts */}
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-medium text-foreground">Alerts</span>
                  <span className="rounded bg-critical/10 px-1.5 py-0.5 text-[10px] font-medium text-critical">
                    {activeAlerts.length}
                  </span>
                </div>
                <Link
                  href="/alerts"
                  className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <AlertList alerts={activeAlerts} maxItems={5} compact />
            </div>

            {/* High-Risk Properties */}
            <div className="rounded-md border border-border bg-card">
              <div className="border-b border-border px-3 py-2">
                <span className="text-[12px] font-medium text-foreground">High-Risk Properties</span>
              </div>
              <div>
                {highRiskProperties.length === 0 ? (
                  <div className="py-4 text-center text-[11px] text-muted-foreground">
                    All properties healthy
                  </div>
                ) : (
                  highRiskProperties.map((p) => (
                    <Link
                      key={p.id}
                      href={`/properties/${p.id}`}
                      className="group flex items-center gap-2 border-b border-border/50 px-3 py-2 transition-colors last:border-0 hover:bg-muted/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-foreground">
                          {p.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {p.location} · {p.alertCount} alerts
                        </p>
                      </div>
                      <StatusBadge status={p.healthStatus} size="xs" />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Recent Booking Events - 5 cols */}
          <div className="lg:col-span-5">
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-[12px] font-medium text-foreground">Recent Bookings</span>
                </div>
                <Link
                  href="/bookings"
                  className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div>
                {recentBookings.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center gap-2 border-b border-border/50 px-3 py-1.5 last:border-0"
                  >
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
                      <p className="truncate text-[10px] text-foreground">
                        {b.channelName} · {b.bookingRef}
                      </p>
                      <p className="text-[9px] text-muted-foreground">
                        {b.propertyName.split(' ').slice(0, 3).join(' ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] font-medium tabular-nums text-foreground">
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

          {/* Price Mismatch + Desktop vs Mobile - 3 cols */}
          <div className="flex flex-col gap-3 lg:col-span-3">
            <div className="rounded-md border border-border bg-card">
              <div className="border-b border-border px-3 py-2">
                <span className="text-[12px] font-medium text-foreground">Price Mismatch Summary</span>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between py-1">
                  <span className="text-[11px] text-muted-foreground">Critical</span>
                  <span className="text-[11px] font-medium tabular-nums text-critical">
                    {mismatchSummary.critical}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[11px] text-muted-foreground">Medium</span>
                  <span className="text-[11px] font-medium tabular-nums text-warning">
                    {mismatchSummary.medium}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1">
                  <span className="text-[11px] text-muted-foreground">Low</span>
                  <span className="text-[11px] font-medium tabular-nums text-info">
                    {mismatchSummary.low}
                  </span>
                </div>
                <div className="mt-1 border-t border-border/50 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-medium text-muted-foreground">Total</span>
                    <span className="text-[11px] font-medium tabular-nums text-foreground">
                      {mismatchSummary.total}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-md border border-border bg-card">
              <div className="border-b border-border px-3 py-2">
                <span className="text-[12px] font-medium text-foreground">Desktop vs Mobile</span>
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground">Pairs with difference</span>
                  <span className="text-[11px] font-medium tabular-nums text-warning">
                    {desktopMobileDiffs.length}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Source Confidence Summary - 4 cols */}
          <div className="lg:col-span-4">
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <ShieldCheck className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[12px] font-medium text-foreground">
                  Source Confidence Summary
                </span>
              </div>
              <div>
                {sourceConfidenceSummary.map((item) => (
                  <div
                    key={item.category}
                    className="flex items-center gap-3 border-b border-border/50 px-3 py-2 last:border-0"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-[11px] font-medium text-foreground">{item.category}</p>
                      <p className="truncate text-[9px] text-muted-foreground">
                        {item.description}
                      </p>
                    </div>
                    <span className="text-[13px] font-semibold tabular-nums text-foreground">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
