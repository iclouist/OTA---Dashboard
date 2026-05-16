'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { FilterBar, FilterConfig, ToolbarSeparator } from '@/components/dashboard/filter-bar';
import { StatusBadge, SeverityBar } from '@/components/dashboard/status-badge';
import { InlineKPI } from '@/components/dashboard/kpi-card';
import { alerts, properties, channels } from '@/lib/mock-data';
import type { Alert } from '@/lib/types';
import { formatDistanceToNow, format } from 'date-fns';
import { Camera, ChevronRight, Check, Eye, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const filterConfig: FilterConfig[] = [
  { id: 'search', label: 'Search', type: 'search', placeholder: 'Search alerts...' },
  {
    id: 'severity',
    label: 'Severity',
    type: 'select',
    options: [
      { value: 'critical', label: 'Critical' },
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
    ],
  },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'acknowledged', label: 'Acknowledged' },
      { value: 'resolved', label: 'Resolved' },
    ],
  },
  {
    id: 'issueType',
    label: 'Type',
    type: 'select',
    options: [
      { value: 'parity', label: 'Parity' },
      { value: 'availability', label: 'Availability' },
      { value: 'scrape_failure', label: 'Scrape Failure' },
      { value: 'stale_data', label: 'Stale Data' },
      { value: 'mapping', label: 'Mapping' },
    ],
  },
];

const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

export default function AlertsPage() {
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [selectedAlert, setSelectedAlert] = React.useState<Alert | null>(null);

  const filteredAlerts = React.useMemo(() => {
    const filtered = alerts.filter((alert) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !alert.title.toLowerCase().includes(search) &&
          !alert.propertyName.toLowerCase().includes(search) &&
          !(alert.channelName?.toLowerCase().includes(search))
        ) {
          return false;
        }
      }
      if (filters.severity && filters.severity !== 'all') {
        if (alert.severity !== filters.severity) return false;
      }
      if (filters.status && filters.status !== 'all') {
        if (alert.status !== filters.status) return false;
      }
      if (filters.issueType && filters.issueType !== 'all') {
        if (alert.issueType !== filters.issueType) return false;
      }
      return true;
    });

    return filtered.sort((a, b) => {
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return new Date(b.lastSeen).getTime() - new Date(a.lastSeen).getTime();
    });
  }, [filters]);

  const stats = React.useMemo(() => {
    const active = alerts.filter((a) => a.status === 'active').length;
    const critical = alerts.filter((a) => a.severity === 'critical' && a.status === 'active').length;
    const high = alerts.filter((a) => a.severity === 'high' && a.status === 'active').length;
    const acknowledged = alerts.filter((a) => a.status === 'acknowledged').length;
    return { active, critical, high, acknowledged };
  }, []);

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
          onClear={() => setFilters({})}
        >
          <div className="flex items-center gap-3">
            <InlineKPI label="Active" value={stats.active} status={stats.active > 0 ? 'critical' : 'default'} />
            <InlineKPI label="Critical" value={stats.critical} status={stats.critical > 0 ? 'critical' : 'default'} />
            <InlineKPI label="High" value={stats.high} status={stats.high > 0 ? 'warning' : 'default'} />
            <InlineKPI label="Ack" value={stats.acknowledged} />
          </div>
          <ToolbarSeparator />
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <Check className="h-3.5 w-3.5" />
            Acknowledge All
          </Button>
        </FilterBar>

        {/* Alerts list */}
        <div className="flex-1 overflow-auto p-3">
          <div className="rounded-md border border-border bg-card">
            {filteredAlerts.length === 0 ? (
              <div className="py-8 text-center text-[12px] text-muted-foreground">
                No alerts found
              </div>
            ) : (
              filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'group flex cursor-pointer items-stretch border-b border-border/50 transition-colors last:border-0 hover:bg-muted/30',
                  )}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div className="flex w-1 shrink-0 py-2">
                    <SeverityBar severity={alert.severity} />
                  </div>
                  
                  <div className="flex flex-1 items-center gap-3 px-3 py-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-[12px] font-medium text-foreground">
                          {alert.title}
                        </span>
                        {alert.hasEvidence && (
                          <Camera className="h-3 w-3 shrink-0 text-muted-foreground" />
                        )}
                      </div>
                      <div className="mt-0.5 flex items-center gap-1 text-[10px] text-muted-foreground">
                        <span className="truncate">{alert.propertyName}</span>
                        {alert.channelName && (
                          <>
                            <span className="text-border">·</span>
                            <span>{alert.channelName}</span>
                          </>
                        )}
                        {alert.roomType && (
                          <>
                            <span className="text-border">·</span>
                            <span>{alert.roomType}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-center gap-2">
                      <StatusBadge status={alert.severity} size="xs" />
                      <StatusBadge status={alert.status} size="xs" />
                      <span className="text-[10px] tabular-nums text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.lastSeen), { addSuffix: false })}
                      </span>
                      <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Alert detail sheet */}
      <Sheet open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <SheetContent className="w-[380px] border-l border-border bg-card p-0">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="flex items-center gap-2 text-[13px]">
              <SeverityBar severity={selectedAlert?.severity || 'low'} className="h-4" />
              <span className="truncate">{selectedAlert?.title}</span>
            </SheetTitle>
          </SheetHeader>

          {selectedAlert && (
            <div className="flex flex-col">
              <div className="flex items-center gap-2 border-b border-border px-4 py-2">
                <StatusBadge status={selectedAlert.severity} size="sm" />
                <StatusBadge status={selectedAlert.status} size="sm" />
                {selectedAlert.hasEvidence && (
                  <span className="inline-flex items-center gap-1 rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">
                    <Camera className="h-3 w-3" />
                    Evidence
                  </span>
                )}
              </div>

              <div className="border-b border-border px-4 py-3">
                <p className="text-[12px] leading-relaxed text-foreground">{selectedAlert.description}</p>
              </div>

              <div className="border-b border-border">
                <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
                  <span className="text-[11px] text-muted-foreground">Property</span>
                  <span className="text-[11px] font-medium text-foreground">
                    {selectedAlert.propertyName}
                  </span>
                </div>
                {selectedAlert.channelName && (
                  <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
                    <span className="text-[11px] text-muted-foreground">Channel</span>
                    <span className="text-[11px] font-medium text-foreground">
                      {selectedAlert.channelName}
                    </span>
                  </div>
                )}
                {selectedAlert.roomType && (
                  <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
                    <span className="text-[11px] text-muted-foreground">Room Type</span>
                    <span className="text-[11px] font-medium text-foreground">
                      {selectedAlert.roomType}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
                  <span className="text-[11px] text-muted-foreground">Issue Type</span>
                  <span className="text-[11px] font-medium capitalize text-foreground">
                    {selectedAlert.issueType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-border/50 px-4 py-2">
                  <span className="text-[11px] text-muted-foreground">First Seen</span>
                  <span className="text-[11px] tabular-nums text-foreground">
                    {format(new Date(selectedAlert.firstSeen), 'MMM d, HH:mm')}
                  </span>
                </div>
                <div className="flex items-center justify-between px-4 py-2">
                  <span className="text-[11px] text-muted-foreground">Last Seen</span>
                  <span className="text-[11px] tabular-nums text-foreground">
                    {format(new Date(selectedAlert.lastSeen), 'MMM d, HH:mm')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2 p-4">
                {selectedAlert.status === 'active' && (
                  <Button variant="outline" size="sm" className="h-7 flex-1 gap-1.5 text-[11px]">
                    <Clock className="h-3.5 w-3.5" />
                    Acknowledge
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-7 flex-1 gap-1.5 text-[11px]">
                  <Eye className="h-3.5 w-3.5" />
                  Evidence
                </Button>
                {selectedAlert.status !== 'resolved' && (
                  <Button size="sm" className="h-7 flex-1 gap-1.5 text-[11px]">
                    <Check className="h-3.5 w-3.5" />
                    Resolve
                  </Button>
                )}
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
