'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { ChannelCard } from '@/components/dashboard/channel-card';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { KPICard } from '@/components/dashboard/kpi-card';
import { Toolbar, ToolbarSeparator } from '@/components/dashboard/filter-bar';
import { channels } from '@/lib/mock-data';
import type { Channel, ChannelActivity } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { RefreshCw, Grid, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

const activityColumns: Column<ChannelActivity>[] = [
  {
    id: 'action',
    header: 'Action',
    cell: (row) => (
      <span className="text-foreground">{row.action}</span>
    ),
  },
  {
    id: 'timestamp',
    header: 'Time',
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {formatDistanceToNow(new Date(row.timestamp), { addSuffix: false })}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge status={row.status} size="xs" />,
  },
];

export default function ChannelsPage() {
  const [selectedChannel, setSelectedChannel] = React.useState<Channel | null>(null);
  const [view, setView] = React.useState<'grid' | 'list'>('grid');

  const stats = React.useMemo(() => {
    const total = channels.length;
    const healthy = channels.filter((c) => c.status === 'healthy').length;
    const warning = channels.filter((c) => c.status === 'warning').length;
    const critical = channels.filter((c) => c.status === 'critical').length;
    const avgSuccessRate =
      channels.reduce((sum, c) => sum + c.successRate, 0) / channels.length;
    const totalIssues = channels.reduce((sum, c) => sum + c.activeIssues, 0);
    return { total, healthy, warning, critical, avgSuccessRate, totalIssues };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        {/* Toolbar */}
        <Toolbar>
          <div className="flex items-center gap-3 px-1">
            <span className="text-[11px] text-muted-foreground">Channels: <span className="font-medium text-foreground">{stats.total}</span></span>
            <span className="text-[11px] text-muted-foreground">Healthy: <span className="font-medium text-success">{stats.healthy}</span></span>
            <span className="text-[11px] text-muted-foreground">Warning: <span className="font-medium text-warning">{stats.warning}</span></span>
            <span className="text-[11px] text-muted-foreground">Critical: <span className="font-medium text-critical">{stats.critical}</span></span>
          </div>
          <ToolbarSeparator />
          <div className="flex items-center gap-1">
            <Button
              variant={view === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setView('grid')}
            >
              <Grid className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant={view === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              className="h-7 w-7 p-0"
              onClick={() => setView('list')}
            >
              <List className="h-3.5 w-3.5" />
            </Button>
          </div>
          <ToolbarSeparator />
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh All
          </Button>
        </Toolbar>

        <div className="flex-1 overflow-auto p-3">
          <div className="space-y-3">
            {/* KPI row */}
            <div className="grid grid-cols-4 gap-3">
              <KPICard title="Avg Success Rate" value={`${stats.avgSuccessRate.toFixed(1)}%`} status={stats.avgSuccessRate >= 95 ? 'success' : stats.avgSuccessRate >= 85 ? 'warning' : 'critical'} />
              <KPICard title="Total Issues" value={stats.totalIssues} status={stats.totalIssues === 0 ? 'success' : 'critical'} />
              <KPICard title="Props Tracked" value={channels.reduce((sum, c) => sum + c.propertiesTracked, 0)} />
              <KPICard title="Last Full Scrape" value="12m ago" />
            </div>

            {view === 'grid' ? (
              <div className="grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                {channels.map((channel) => (
                  <ChannelCard
                    key={channel.id}
                    channel={channel}
                    onClick={() => setSelectedChannel(channel)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-border bg-card">
                {channels.map((channel) => (
                  <div
                    key={channel.id}
                    className="group flex cursor-pointer items-center gap-3 border-b border-border/50 px-3 py-2 transition-colors last:border-0 hover:bg-muted/30"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <StatusDot status={channel.status} />
                    <span className="min-w-0 flex-1 text-[12px] font-medium text-foreground">
                      {channel.name}
                    </span>
                    <span className="text-[11px] tabular-nums text-muted-foreground">
                      {channel.propertiesTracked} props
                    </span>
                    <span
                      className={cn(
                        'w-14 text-right text-[11px] font-medium tabular-nums',
                        channel.successRate >= 95 && 'text-success',
                        channel.successRate >= 85 && channel.successRate < 95 && 'text-warning',
                        channel.successRate < 85 && 'text-critical'
                      )}
                    >
                      {channel.successRate.toFixed(0)}%
                    </span>
                    <span
                      className={cn(
                        'w-8 text-right text-[11px] font-medium tabular-nums',
                        channel.activeIssues === 0 ? 'text-muted-foreground' : 'text-critical'
                      )}
                    >
                      {channel.activeIssues}
                    </span>
                    <span className="w-16 text-right text-[10px] tabular-nums text-muted-foreground">
                      {formatDistanceToNow(new Date(channel.lastScrape), { addSuffix: false })}
                    </span>
                    <StatusBadge status={channel.status} size="xs" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Channel detail sheet */}
      <Sheet open={!!selectedChannel} onOpenChange={() => setSelectedChannel(null)}>
        <SheetContent className="w-[360px] border-l border-border bg-card p-0">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-[13px]">
              <StatusDot status={selectedChannel?.status || 'unknown'} />
              {selectedChannel?.name}
            </SheetTitle>
          </SheetHeader>
          {selectedChannel && (
            <div className="flex flex-col">
              <div className="grid grid-cols-2 gap-2 border-b border-border p-3">
                <div className="rounded bg-muted/30 px-2.5 py-2">
                  <p className="text-[10px] text-muted-foreground">Properties</p>
                  <p className="mt-0.5 text-lg font-semibold tabular-nums text-foreground">
                    {selectedChannel.propertiesTracked}
                  </p>
                </div>
                <div className="rounded bg-muted/30 px-2.5 py-2">
                  <p className="text-[10px] text-muted-foreground">Success Rate</p>
                  <p
                    className={cn(
                      'mt-0.5 text-lg font-semibold tabular-nums',
                      selectedChannel.successRate >= 95 ? 'text-success' : selectedChannel.successRate >= 85 ? 'text-warning' : 'text-critical'
                    )}
                  >
                    {selectedChannel.successRate.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded bg-muted/30 px-2.5 py-2">
                  <p className="text-[10px] text-muted-foreground">Active Issues</p>
                  <p
                    className={cn(
                      'mt-0.5 text-lg font-semibold tabular-nums',
                      selectedChannel.activeIssues === 0 ? 'text-foreground' : 'text-critical'
                    )}
                  >
                    {selectedChannel.activeIssues}
                  </p>
                </div>
                <div className="rounded bg-muted/30 px-2.5 py-2">
                  <p className="text-[10px] text-muted-foreground">Last Scrape</p>
                  <p className="mt-0.5 text-[13px] font-medium tabular-nums text-foreground">
                    {formatDistanceToNow(new Date(selectedChannel.lastScrape), { addSuffix: true })}
                  </p>
                </div>
              </div>

              {selectedChannel.recentActivity.length > 0 && (
                <div className="p-3">
                  <h3 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Recent Activity
                  </h3>
                  <DataTable
                    columns={activityColumns}
                    data={selectedChannel.recentActivity}
                    compact
                    emptyMessage="No recent activity"
                  />
                </div>
              )}

              <div className="mt-auto border-t border-border p-3">
                <Button size="sm" className="h-7 w-full text-[11px]">
                  <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                  Run Scrape Now
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
