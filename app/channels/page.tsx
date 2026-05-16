'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { ChannelCard } from '@/components/dashboard/channel-card';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { channels } from '@/lib/mock-data';
import type { Channel, ChannelActivity } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const activityColumns: Column<ChannelActivity>[] = [
  {
    id: 'action',
    header: 'Action',
    cell: (row) => (
      <span className="text-sm text-foreground">{row.action}</span>
    ),
  },
  {
    id: 'timestamp',
    header: 'Time',
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(row.timestamp), { addSuffix: true })}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge status={row.status} size="sm" />,
    className: 'text-center',
  },
];

export default function ChannelsPage() {
  const [selectedChannel, setSelectedChannel] = React.useState<Channel | null>(null);

  // Summary stats
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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Channels</h1>
            <p className="text-sm text-muted-foreground">
              Monitor OTA channel health and scraping status
            </p>
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Channels</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {stats.total}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Healthy</p>
            <p className="mt-1 text-2xl font-semibold text-success">
              {stats.healthy}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Warning</p>
            <p className="mt-1 text-2xl font-semibold text-warning">
              {stats.warning}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Critical</p>
            <p className="mt-1 text-2xl font-semibold text-critical">
              {stats.critical}
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Avg Success Rate</p>
            <p className="mt-1 text-2xl font-semibold text-foreground">
              {stats.avgSuccessRate.toFixed(1)}%
            </p>
          </div>
          <div className="rounded-lg border border-border bg-card p-4">
            <p className="text-xs text-muted-foreground">Total Issues</p>
            <p
              className={`mt-1 text-2xl font-semibold ${
                stats.totalIssues === 0 ? 'text-success' : 'text-critical'
              }`}
            >
              {stats.totalIssues}
            </p>
          </div>
        </div>

        {/* Channel cards */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {channels.map((channel) => (
            <ChannelCard
              key={channel.id}
              channel={channel}
              onClick={() => setSelectedChannel(channel)}
            />
          ))}
        </div>

        {/* Channel table view */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-foreground">
              Channel Overview
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Channel
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">
                    Properties
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">
                    Success Rate
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">
                    Issues
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                    Last Scrape
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {channels.map((channel) => (
                  <tr
                    key={channel.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setSelectedChannel(channel)}
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <StatusDot status={channel.status} />
                        <span className="text-sm font-medium text-foreground">
                          {channel.name}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-muted-foreground">
                      {channel.propertiesTracked}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-sm font-medium ${
                          channel.successRate >= 95
                            ? 'text-success'
                            : channel.successRate >= 85
                            ? 'text-warning'
                            : 'text-critical'
                        }`}
                      >
                        {channel.successRate.toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`text-sm font-medium ${
                          channel.activeIssues === 0
                            ? 'text-success'
                            : 'text-critical'
                        }`}
                      >
                        {channel.activeIssues}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(channel.lastScrape), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={channel.status} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Channel detail dialog */}
      <Dialog
        open={!!selectedChannel}
        onOpenChange={() => setSelectedChannel(null)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <StatusDot status={selectedChannel?.status || 'unknown'} />
              {selectedChannel?.name}
            </DialogTitle>
          </DialogHeader>
          {selectedChannel && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Properties</p>
                  <p className="mt-1 text-xl font-semibold text-foreground">
                    {selectedChannel.propertiesTracked}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Success Rate</p>
                  <p
                    className={`mt-1 text-xl font-semibold ${
                      selectedChannel.successRate >= 95
                        ? 'text-success'
                        : selectedChannel.successRate >= 85
                        ? 'text-warning'
                        : 'text-critical'
                    }`}
                  >
                    {selectedChannel.successRate.toFixed(1)}%
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Active Issues</p>
                  <p
                    className={`mt-1 text-xl font-semibold ${
                      selectedChannel.activeIssues === 0
                        ? 'text-success'
                        : 'text-critical'
                    }`}
                  >
                    {selectedChannel.activeIssues}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Last Scrape</p>
                  <p className="mt-1 text-sm font-medium text-foreground">
                    {formatDistanceToNow(new Date(selectedChannel.lastScrape), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
              </div>

              {selectedChannel.recentActivity.length > 0 && (
                <div>
                  <h3 className="mb-2 text-sm font-medium text-foreground">
                    Recent Activity
                  </h3>
                  <DataTable
                    columns={activityColumns}
                    data={selectedChannel.recentActivity}
                    emptyMessage="No recent activity"
                  />
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
