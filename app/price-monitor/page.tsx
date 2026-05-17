'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { FilterBar, FilterConfig, ToolbarSeparator } from '@/components/dashboard/filter-bar';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { InlineKPI } from '@/components/dashboard/kpi-card';
import { priceCaptures, properties } from '@/lib/mock-data';
import type { PriceCapture } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Download, RefreshCw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const filterConfig: FilterConfig[] = [
  { id: 'search', label: 'Search', type: 'search', placeholder: 'Search...' },
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
    options: [
      { value: 'booking', label: 'Booking.com' },
      { value: 'agoda', label: 'Agoda' },
      { value: 'airbnb', label: 'Airbnb' },
    ],
  },
  {
    id: 'deviceType',
    label: 'Device',
    type: 'select',
    options: [
      { value: 'desktop', label: 'Desktop' },
      { value: 'mobile', label: 'Mobile' },
    ],
  },
  {
    id: 'alertStatus',
    label: 'Alert',
    type: 'select',
    options: [
      { value: 'critical', label: 'Critical' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
      { value: 'none', label: 'No Alert' },
    ],
  },
];

export default function PriceMonitorPage() {
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [selectedCapture, setSelectedCapture] = React.useState<PriceCapture | null>(null);

  const filteredRecords = React.useMemo(() => {
    return priceCaptures.filter((record) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !record.propertyName.toLowerCase().includes(search) &&
          !record.roomType.toLowerCase().includes(search) &&
          !record.channelName.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (filters.property && filters.property !== 'all') {
        if (record.propertyId !== filters.property) return false;
      }
      if (filters.channel && filters.channel !== 'all') {
        if (record.channelId !== filters.channel) return false;
      }
      if (filters.deviceType && filters.deviceType !== 'all') {
        if (record.deviceType !== filters.deviceType) return false;
      }
      if (filters.alertStatus && filters.alertStatus !== 'all') {
        if (record.alertStatus !== filters.alertStatus) return false;
      }
      return true;
    });
  }, [filters]);

  const stats = React.useMemo(() => {
    const total = filteredRecords.length;
    const noAlert = filteredRecords.filter((r) => r.alertStatus === 'none').length;
    const issues = total - noAlert;
    const critical = filteredRecords.filter((r) => r.alertStatus === 'critical').length;
    return { total, noAlert, issues, critical };
  }, [filteredRecords]);

  // Find related captures for the drawer (same property, room, stay date, different device/channel)
  const relatedCaptures = React.useMemo(() => {
    if (!selectedCapture) return [];
    return priceCaptures.filter(
      (pc) =>
        pc.id !== selectedCapture.id &&
        pc.propertyId === selectedCapture.propertyId &&
        pc.roomType === selectedCapture.roomType &&
        pc.stayDate === selectedCapture.stayDate
    );
  }, [selectedCapture]);

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
            <InlineKPI label="Total" value={stats.total} />
            <InlineKPI label="Clean" value={stats.noAlert} status="success" />
            <InlineKPI label="Issues" value={stats.issues} status={stats.issues > 0 ? 'warning' : 'default'} />
            <InlineKPI label="Critical" value={stats.critical} status={stats.critical > 0 ? 'critical' : 'default'} />
          </div>
          <ToolbarSeparator />
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </FilterBar>

        <div className="flex-1 overflow-auto">
          <div className="min-w-[1200px]">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-muted/50">
                  {['Property', 'Channel', 'Device', 'Room', 'Rate Plan', 'Cancel Policy', 'Stay', 'Display', 'Ref', 'Delta', 'Evidence', 'Source', 'Confidence', 'Quality', 'Captured', 'Alert'].map((h) => (
                    <th key={h} className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground first:pl-3 last:pr-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={16} className="py-12 text-center text-[12px] text-muted-foreground">
                      No price captures found
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((pc) => (
                    <tr
                      key={pc.id}
                      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30"
                      onClick={() => setSelectedCapture(pc)}
                    >
                      <td className="px-2 py-1.5 pl-3 text-[11px] font-medium text-foreground">
                        {pc.propertyName.split(' ').slice(0, 2).join(' ')}
                      </td>
                      <td className="px-2 py-1.5 text-[11px] text-muted-foreground">{pc.channelName}</td>
                      <td className="px-2 py-1.5"><StatusBadge status={pc.deviceType} size="xs" /></td>
                      <td className="px-2 py-1.5 text-[11px] text-muted-foreground">{pc.roomType}</td>
                      <td className="px-2 py-1.5 text-[11px] text-muted-foreground">{pc.ratePlan}</td>
                      <td className="px-2 py-1.5"><StatusBadge status={pc.cancellationPolicy} size="xs" /></td>
                      <td className="px-2 py-1.5 text-[11px] tabular-nums text-muted-foreground">{format(new Date(pc.stayDate), 'MMM d')}</td>
                      <td className="px-2 py-1.5 text-[11px] font-medium tabular-nums text-foreground">
                        {pc.currency} {pc.displayPrice.toLocaleString()}
                      </td>
                      <td className="px-2 py-1.5 text-[11px] tabular-nums text-muted-foreground">
                        {pc.currency} {pc.referencePrice.toLocaleString()}
                      </td>
                      <td className={cn(
                        'px-2 py-1.5 text-[11px] font-medium tabular-nums',
                        pc.deltaPercent === 0 ? 'text-muted-foreground' : Math.abs(pc.deltaPercent) > 15 ? 'text-critical' : Math.abs(pc.deltaPercent) > 5 ? 'text-warning' : 'text-success'
                      )}>
                        {pc.deltaPercent > 0 ? '+' : ''}{pc.deltaPercent.toFixed(1)}%
                      </td>
                      <td className="px-2 py-1.5"><StatusBadge status={pc.evidenceStatus} size="xs" /></td>
                      <td className="px-2 py-1.5"><StatusBadge status={pc.sourceType} size="xs" /></td>
                      <td className="px-2 py-1.5"><StatusBadge status={pc.sourceConfidence} size="xs" /></td>
                      <td className="px-2 py-1.5"><StatusBadge status={pc.compareQuality} size="xs" /></td>
                      <td className="px-2 py-1.5 text-[10px] tabular-nums text-muted-foreground">
                        {formatDistanceToNow(new Date(pc.lastCapturedAt), { addSuffix: false })}
                      </td>
                      <td className="px-2 py-1.5 pr-3">
                        {pc.alertStatus !== 'none' ? (
                          <StatusBadge status={pc.alertStatus} size="xs" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Detail Drawer */}
      <Sheet open={!!selectedCapture} onOpenChange={() => setSelectedCapture(null)}>
        <SheetContent className="w-[420px] border-l border-border bg-card p-0 overflow-y-auto">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="text-[13px]">Price Capture Detail</SheetTitle>
          </SheetHeader>

          {selectedCapture && (
            <div className="flex flex-col">
              {/* Main info */}
              <div className="border-b border-border px-4 py-3">
                <p className="text-[13px] font-medium text-foreground">{selectedCapture.propertyName}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {selectedCapture.channelName} · {selectedCapture.deviceType} · {selectedCapture.roomType}
                </p>
              </div>

              {/* Price comparison */}
              <div className="border-b border-border px-4 py-3">
                <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Price</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded bg-muted/30 p-2">
                    <p className="text-[9px] text-muted-foreground">Display</p>
                    <p className="text-[14px] font-semibold tabular-nums text-foreground">
                      {selectedCapture.currency} {selectedCapture.displayPrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded bg-muted/30 p-2">
                    <p className="text-[9px] text-muted-foreground">Reference</p>
                    <p className="text-[14px] font-semibold tabular-nums text-muted-foreground">
                      {selectedCapture.currency} {selectedCapture.referencePrice.toLocaleString()}
                    </p>
                  </div>
                  <div className="rounded bg-muted/30 p-2">
                    <p className="text-[9px] text-muted-foreground">Delta</p>
                    <p className={cn(
                      'text-[14px] font-semibold tabular-nums',
                      selectedCapture.deltaPercent === 0 ? 'text-muted-foreground' : Math.abs(selectedCapture.deltaPercent) > 15 ? 'text-critical' : 'text-warning'
                    )}>
                      {selectedCapture.deltaPercent > 0 ? '+' : ''}{selectedCapture.deltaPercent.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="border-b border-border">
                {[
                  ['Stay Date', format(new Date(selectedCapture.stayDate), 'MMM d, yyyy')],
                  ['Rate Plan', selectedCapture.ratePlan],
                  ['Cancel Policy', selectedCapture.cancellationPolicy],
                  ['Device', selectedCapture.deviceType],
                  ['Source Type', selectedCapture.sourceType],
                  ['Source Confidence', selectedCapture.sourceConfidence],
                  ['Compare Quality', selectedCapture.compareQuality],
                  ['Evidence', selectedCapture.evidenceStatus],
                  ['Last Captured', format(new Date(selectedCapture.lastCapturedAt), 'MMM d, HH:mm')],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b border-border/50 px-4 py-1.5 last:border-0">
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                    <StatusBadge status={String(value)} size="xs" />
                  </div>
                ))}
              </div>

              {/* Commission & promotion notes */}
              <div className="border-b border-border px-4 py-3">
                <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Notes</h4>
                {selectedCapture.commissionAssumption && (
                  <p className="text-[11px] text-muted-foreground">
                    Commission assumption: <span className="text-foreground">{selectedCapture.commissionAssumption}%</span>
                  </p>
                )}
                {selectedCapture.promotionStackingNote && (
                  <p className="mt-1 text-[11px] text-warning">
                    {selectedCapture.promotionStackingNote}
                  </p>
                )}
              </div>

              {/* Related captures (same room/date, different device/channel) */}
              {relatedCaptures.length > 0 && (
                <div className="px-4 py-3">
                  <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                    Same Room / Date Comparison
                  </h4>
                  <div className="space-y-2">
                    {relatedCaptures.map((rc) => (
                      <div
                        key={rc.id}
                        className="flex items-center justify-between rounded bg-muted/30 px-2.5 py-2 cursor-pointer hover:bg-muted/50"
                        onClick={() => setSelectedCapture(rc)}
                      >
                        <div>
                          <p className="text-[11px] font-medium text-foreground">
                            {rc.channelName} · {rc.deviceType}
                          </p>
                          <p className="text-[10px] text-muted-foreground">{rc.ratePlan}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[11px] font-medium tabular-nums text-foreground">
                            {rc.currency} {rc.displayPrice.toLocaleString()}
                          </p>
                          <p className={cn(
                            'text-[10px] font-medium tabular-nums',
                            rc.deltaPercent === 0 ? 'text-muted-foreground' : Math.abs(rc.deltaPercent) > 15 ? 'text-critical' : 'text-warning'
                          )}>
                            {rc.deltaPercent > 0 ? '+' : ''}{rc.deltaPercent.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
