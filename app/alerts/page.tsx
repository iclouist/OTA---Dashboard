'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { FilterBar, FilterConfig } from '@/components/dashboard/filter-bar';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { alerts, properties, channels } from '@/lib/mock-data';
import type { Alert } from '@/lib/types';
import { formatDistanceToNow, format } from 'date-fns';
import {
  AlertTriangle,
  Camera,
  ChevronRight,
  X,
} from 'lucide-react';
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
    id: 'property',
    label: 'Property',
    type: 'select',
    options: properties.map((p) => ({ value: p.id, label: p.name })),
  },
  {
    id: 'channel',
    label: 'Channel',
    type: 'select',
    options: channels.map((c) => ({ value: c.id, label: c.name })),
  },
  {
    id: 'issueType',
    label: 'Issue Type',
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
      if (filters.property && filters.property !== 'all') {
        if (alert.propertyId !== filters.property) return false;
      }
      if (filters.channel && filters.channel !== 'all') {
        if (alert.channelId !== filters.channel) return false;
      }
      if (filters.issueType && filters.issueType !== 'all') {
        if (alert.issueType !== filters.issueType) return false;
      }
      return true;
    });

    // Sort by severity, then by lastSeen
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
    return { active, critical, high };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Alerts</h1>
            <p className="text-sm text-muted-foreground">
              Monitor and manage operational alerts
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Active Alerts:</span>
            <span className="font-medium text-foreground">{stats.active}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-critical" />
            <span className="text-sm text-muted-foreground">Critical:</span>
            <span className="font-medium text-critical">{stats.critical}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-critical/70" />
            <span className="text-sm text-muted-foreground">High:</span>
            <span className="font-medium text-critical">{stats.high}</span>
          </div>
        </div>

        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
          onClear={() => setFilters({})}
        />

        {/* Alerts list */}
        <div className="rounded-lg border border-border bg-card">
          {filteredAlerts.length === 0 ? (
            <div className="py-12 text-center text-sm text-muted-foreground">
              No alerts found
            </div>
          ) : (
            <div className="divide-y divide-border">
              {filteredAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    'flex cursor-pointer items-center gap-4 px-4 py-4 transition-colors hover:bg-accent/50',
                    alert.severity === 'critical' && 'bg-critical/5',
                    alert.severity === 'high' && 'bg-critical/3'
                  )}
                  onClick={() => setSelectedAlert(alert)}
                >
                  <div
                    className={cn(
                      'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg',
                      alert.severity === 'critical' && 'bg-critical/15 text-critical',
                      alert.severity === 'high' && 'bg-critical/15 text-critical',
                      alert.severity === 'medium' && 'bg-warning/15 text-warning',
                      alert.severity === 'low' && 'bg-info/15 text-info'
                    )}
                  >
                    <AlertTriangle className="h-5 w-5" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">
                        {alert.title}
                      </p>
                      {alert.hasEvidence && (
                        <Camera className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                      )}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {alert.propertyName}
                      {alert.channelName && ` · ${alert.channelName}`}
                      {alert.roomType && ` · ${alert.roomType}`}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <StatusBadge status={alert.severity} size="sm" />
                    <StatusBadge status={alert.status} size="sm" />
                    <div className="text-right">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(alert.lastSeen), { addSuffix: true })}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Alert detail sheet */}
      <Sheet open={!!selectedAlert} onOpenChange={() => setSelectedAlert(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-md',
                  selectedAlert?.severity === 'critical' && 'bg-critical/15 text-critical',
                  selectedAlert?.severity === 'high' && 'bg-critical/15 text-critical',
                  selectedAlert?.severity === 'medium' && 'bg-warning/15 text-warning',
                  selectedAlert?.severity === 'low' && 'bg-info/15 text-info'
                )}
              >
                <AlertTriangle className="h-4 w-4" />
              </div>
              <span className="truncate">{selectedAlert?.title}</span>
            </SheetTitle>
          </SheetHeader>

          {selectedAlert && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedAlert.severity} size="md" />
                <StatusBadge status={selectedAlert.status} size="md" />
                {selectedAlert.hasEvidence && (
                  <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground">
                    <Camera className="h-3 w-3" />
                    Evidence
                  </span>
                )}
              </div>

              <div>
                <p className="text-sm text-foreground">{selectedAlert.description}</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Property</span>
                  <span className="text-sm font-medium text-foreground">
                    {selectedAlert.propertyName}
                  </span>
                </div>
                {selectedAlert.channelName && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Channel</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedAlert.channelName}
                    </span>
                  </div>
                )}
                {selectedAlert.roomType && (
                  <div className="flex items-center justify-between py-2 border-b border-border">
                    <span className="text-sm text-muted-foreground">Room Type</span>
                    <span className="text-sm font-medium text-foreground">
                      {selectedAlert.roomType}
                    </span>
                  </div>
                )}
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Issue Type</span>
                  <span className="text-sm font-medium capitalize text-foreground">
                    {selectedAlert.issueType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">First Seen</span>
                  <span className="text-sm text-foreground">
                    {format(new Date(selectedAlert.firstSeen), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
                <div className="flex items-center justify-between py-2 border-b border-border">
                  <span className="text-sm text-muted-foreground">Last Seen</span>
                  <span className="text-sm text-foreground">
                    {format(new Date(selectedAlert.lastSeen), 'MMM d, yyyy HH:mm')}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                {selectedAlert.status === 'active' && (
                  <Button variant="outline" size="sm" className="flex-1">
                    Acknowledge
                  </Button>
                )}
                <Button variant="outline" size="sm" className="flex-1">
                  View Evidence
                </Button>
                {selectedAlert.status !== 'resolved' && (
                  <Button variant="default" size="sm" className="flex-1">
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
