import { DashboardLayout } from '@/components/dashboard/layout';
import { KPICard } from '@/components/dashboard/kpi-card';
import { AlertList } from '@/components/dashboard/alert-row';
import { ChannelCard } from '@/components/dashboard/channel-card';
import { EvidenceCard } from '@/components/dashboard/evidence-card';
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
} from 'lucide-react';
import Link from 'next/link';

export default function OverviewPage() {
  const activeAlerts = alerts.filter((a) => a.status === 'active');
  const recentEvidence = evidenceItems.slice(0, 4);
  const riskyProperties = properties.filter((p) => p.healthStatus !== 'healthy');

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* KPI Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          <KPICard
            title="Total Properties"
            value={kpiData.totalProperties}
            icon={Building2}
          />
          <KPICard
            title="Tracked Channels"
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
            title="Sold Out Anomalies"
            value={kpiData.soldOutAnomalies}
            icon={XCircle}
            status={kpiData.soldOutAnomalies === 0 ? 'success' : 'critical'}
          />
        </div>

        {/* Main content grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Recent Alerts - Takes 2 columns */}
          <div className="lg:col-span-2">
            <div className="rounded-lg border border-border bg-card">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h2 className="text-sm font-medium text-foreground">Recent Alerts</h2>
                <Link
                  href="/alerts"
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  View all
                  <ChevronRight className="h-3 w-3" />
                </Link>
              </div>
              <AlertList
                alerts={activeAlerts}
                maxItems={5}
                onAlertClick={() => {}}
              />
            </div>
          </div>

          {/* Risky Properties */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium text-foreground">Risky Properties</h2>
              <Link
                href="/properties"
                className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
              >
                View all
                <ChevronRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y divide-border">
              {riskyProperties.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  All properties healthy
                </div>
              ) : (
                riskyProperties.map((property) => (
                  <Link
                    key={property.id}
                    href={`/properties/${property.id}`}
                    className="flex items-center justify-between px-4 py-3 transition-colors hover:bg-accent/50"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-foreground">
                        {property.name}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {property.city} · {property.alertCount} alerts
                      </p>
                    </div>
                    <StatusBadge status={property.healthStatus} size="sm" />
                  </Link>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Channels Status */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Channel Status</h2>
            <Link
              href="/channels"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
            {channels.map((channel) => (
              <ChannelCard key={channel.id} channel={channel} />
            ))}
          </div>
        </div>

        {/* Evidence Feed */}
        <div>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-sm font-medium text-foreground">Recent Evidence</h2>
            <Link
              href="/evidence"
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              View all
              <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            {recentEvidence.map((evidence) => (
              <EvidenceCard key={evidence.id} evidence={evidence} />
            ))}
          </div>
        </div>

        {/* Quick Activity Feed */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-foreground">Latest Activity</h2>
          </div>
          <div className="divide-y divide-border">
            {[
              { action: 'Price scrape completed', channel: 'Booking.com', time: '2 min ago', status: 'success' as const },
              { action: 'Availability sync', channel: 'Agoda', time: '5 min ago', status: 'success' as const },
              { action: 'Rate extraction failed', channel: 'Expedia', time: '12 min ago', status: 'failed' as const },
              { action: 'Evidence captured', channel: 'Airbnb', time: '15 min ago', status: 'success' as const },
              { action: 'Alert triggered', channel: 'Booking.com', time: '22 min ago', status: 'warning' as const },
            ].map((activity, i) => (
              <div key={i} className="flex items-center gap-3 px-4 py-3">
                <StatusDot status={activity.status === 'warning' ? 'warning' : activity.status} />
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.channel}</p>
                </div>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
