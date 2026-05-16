import { DashboardLayout } from '@/components/dashboard/layout';
import { KPICard, InlineKPI } from '@/components/dashboard/kpi-card';
import { AlertList } from '@/components/dashboard/alert-row';
import { ChannelCard, ChannelRow } from '@/components/dashboard/channel-card';
import { EvidenceRow } from '@/components/dashboard/evidence-card';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import {
  kpiData,
  alerts,
  channels,
  evidenceItems,
  properties,
} from '@/lib/mock-data';
import {
  Building2,
  Radio,
  AlertTriangle,
  Activity,
  TrendingDown,
  XCircle,
  ChevronRight,
  Clock,
} from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const recentEvidence = evidenceItems.slice(0, 5);
  const riskyProperties = properties.filter((p) => p.healthStatus !== 'healthy');

  return (
    <DashboardLayout>
      <div className="space-y-4">
        {/* KPI Row */}
        <div className="grid grid-cols-3 gap-3 md:grid-cols-6">
          <KPICard
            title="Properties"
            value={kpiData.totalProperties}
            icon={Building2}
          />
          <KPICard
            title="Channels"
            value={kpiData.trackedChannels}
            icon={Radio}
          />
          <KPICard
            title="Active Alerts"
            value={kpiData.activeAlerts}
            icon={AlertTriangle}
            status={kpiData.activeAlerts > 5 ? 'critical' : kpiData.activeAlerts > 0 ? 'warning' : 'success'}
          />
          <KPICard
            title="Scrape Health"
            value={`${kpiData.scrapeHealthScore}%`}
            icon={Activity}
            status={kpiData.scrapeHealthScore >= 95 ? 'success' : kpiData.scrapeHealthScore >= 85 ? 'warning' : 'critical'}
          />
          <KPICard
            title="Parity Issues"
            value={kpiData.parityIssues}
            icon={TrendingDown}
            status={kpiData.parityIssues === 0 ? 'success' : 'warning'}
          />
          <KPICard
            title="Sold Out"
            value={kpiData.soldOutAnomalies}
            icon={XCircle}
            status={kpiData.soldOutAnomalies === 0 ? 'success' : 'critical'}
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          {/* Alerts - 5 cols */}
          <div className="lg:col-span-5">
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
              <AlertList alerts={activeAlerts} maxItems={6} compact />
            </div>
          </div>

          {/* Risky Properties - 4 cols */}
          <div className="lg:col-span-4">
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-[12px] font-medium text-foreground">Risky Properties</span>
                <Link
                  href="/properties"
                  className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div>
                {riskyProperties.length === 0 ? (
                  <div className="py-6 text-center text-[11px] text-muted-foreground">
                    All properties healthy
                  </div>
                ) : (
                  riskyProperties.slice(0, 6).map((property) => (
                    <Link
                      key={property.id}
                      href={`/properties/${property.id}`}
                      className="group flex items-center gap-2 border-b border-border/50 px-3 py-2 transition-colors last:border-0 hover:bg-muted/30"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[11px] font-medium text-foreground">
                          {property.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {property.city} · {property.alertCount} alerts
                        </p>
                      </div>
                      <StatusBadge status={property.healthStatus} size="xs" />
                    </Link>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Activity Feed - 3 cols */}
          <div className="lg:col-span-3">
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center gap-2 border-b border-border px-3 py-2">
                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-[12px] font-medium text-foreground">Activity</span>
              </div>
              <div>
                {[
                  { action: 'Price scrape', channel: 'Booking.com', time: '2m', status: 'success' as const },
                  { action: 'Availability sync', channel: 'Agoda', time: '5m', status: 'success' as const },
                  { action: 'Rate extraction', channel: 'Expedia', time: '12m', status: 'failed' as const },
                  { action: 'Evidence captured', channel: 'Airbnb', time: '15m', status: 'success' as const },
                  { action: 'Alert triggered', channel: 'Booking.com', time: '22m', status: 'warning' as const },
                  { action: 'Mapping updated', channel: 'Hotels.com', time: '28m', status: 'success' as const },
                ].map((activity, i) => (
                  <div key={i} className="flex items-center gap-2 border-b border-border/50 px-3 py-1.5 last:border-0">
                    <StatusDot status={activity.status === 'warning' ? 'warning' : activity.status} />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[10px] text-foreground">{activity.action}</p>
                      <p className="text-[9px] text-muted-foreground">{activity.channel}</p>
                    </div>
                    <span className="text-[9px] tabular-nums text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Channel Status */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <div className="flex items-center gap-3">
                  <span className="text-[12px] font-medium text-foreground">Channels</span>
                  <div className="flex items-center gap-3">
                    <InlineKPI label="Active" value={channels.filter(c => c.status === 'healthy').length} status="success" />
                    <InlineKPI label="Issues" value={channels.filter(c => c.status !== 'healthy').length} status={channels.filter(c => c.status !== 'healthy').length > 0 ? 'warning' : 'default'} />
                  </div>
                </div>
                <Link
                  href="/channels"
                  className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-2 p-2 md:grid-cols-3 lg:grid-cols-4">
                {channels.slice(0, 8).map((channel) => (
                  <ChannelCard key={channel.id} channel={channel} />
                ))}
              </div>
            </div>
          </div>

          {/* Recent Evidence */}
          <div className="lg:col-span-4">
            <div className="rounded-md border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-3 py-2">
                <span className="text-[12px] font-medium text-foreground">Recent Evidence</span>
                <Link
                  href="/evidence"
                  className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground"
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <div>
                {recentEvidence.map((evidence) => (
                  <EvidenceRow key={evidence.id} evidence={evidence} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
