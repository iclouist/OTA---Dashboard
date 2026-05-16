'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { FilterBar, FilterConfig } from '@/components/dashboard/filter-bar';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { availabilityRecords, properties, channels } from '@/lib/mock-data';
import type { AvailabilityRecord, AvailabilityStatus } from '@/lib/types';
import { format, addDays, startOfToday, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

const filterConfig: FilterConfig[] = [
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
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'available', label: 'Available' },
      { value: 'sold_out', label: 'Sold Out' },
      { value: 'stale', label: 'Stale' },
      { value: 'mismatch', label: 'Mismatch' },
    ],
  },
];

const statusColors: Record<AvailabilityStatus, string> = {
  available: 'bg-success/20 border-success/30 text-success',
  sold_out: 'bg-critical/20 border-critical/30 text-critical',
  stale: 'bg-warning/20 border-warning/30 text-warning',
  mismatch: 'bg-critical/20 border-critical/30 text-critical',
};

const statusLabels: Record<AvailabilityStatus, string> = {
  available: 'AVL',
  sold_out: 'SO',
  stale: 'STL',
  mismatch: 'MIS',
};

export default function AvailabilityPage() {
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [startDate, setStartDate] = React.useState(startOfToday());
  const daysToShow = 14;

  const dates = React.useMemo(() => {
    return Array.from({ length: daysToShow }, (_, i) => addDays(startDate, i));
  }, [startDate]);

  const filteredRecords = React.useMemo(() => {
    return availabilityRecords.filter((record) => {
      if (filters.property && filters.property !== 'all') {
        if (record.propertyId !== filters.property) return false;
      }
      if (filters.channel && filters.channel !== 'all') {
        if (record.channelId !== filters.channel) return false;
      }
      if (filters.status && filters.status !== 'all') {
        if (record.status !== filters.status) return false;
      }
      return true;
    });
  }, [filters]);

  // Group records by property+channel+roomType
  const groupedRecords = React.useMemo(() => {
    const groups = new Map<string, AvailabilityRecord[]>();
    filteredRecords.forEach((record) => {
      const key = `${record.propertyId}-${record.channelId}-${record.roomType}`;
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(record);
    });
    return groups;
  }, [filteredRecords]);

  const getRecordForDate = (records: AvailabilityRecord[], date: Date) => {
    return records.find(
      (r) => format(new Date(r.stayDate), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">
              Availability Monitor
            </h1>
            <p className="text-sm text-muted-foreground">
              Track availability status across channels and dates
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 rounded-lg border border-border bg-card px-4 py-2">
          <span className="text-xs text-muted-foreground">Legend:</span>
          {Object.entries(statusLabels).map(([status, label]) => (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className={cn(
                  'flex h-5 w-8 items-center justify-center rounded border text-[10px] font-medium',
                  statusColors[status as AvailabilityStatus]
                )}
              >
                {label}
              </span>
              <span className="text-xs capitalize text-muted-foreground">
                {status.replace('_', ' ')}
              </span>
            </div>
          ))}
        </div>

        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
          onClear={() => setFilters({})}
        />

        {/* Date navigation */}
        <div className="flex items-center justify-between rounded-lg border border-border bg-card px-4 py-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStartDate((d) => addDays(d, -7))}
          >
            <ChevronLeft className="mr-1 h-4 w-4" />
            Previous
          </Button>
          <span className="text-sm font-medium text-foreground">
            {format(startDate, 'MMM d')} - {format(addDays(startDate, daysToShow - 1), 'MMM d, yyyy')}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setStartDate((d) => addDays(d, 7))}
          >
            Next
            <ChevronRight className="ml-1 h-4 w-4" />
          </Button>
        </div>

        {/* Availability grid */}
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="sticky left-0 z-10 min-w-[200px] bg-muted/30 px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                  Property / Channel / Room
                </th>
                {dates.map((date) => (
                  <th
                    key={date.toISOString()}
                    className="min-w-[60px] px-2 py-2 text-center"
                  >
                    <div className="text-[10px] font-medium text-muted-foreground">
                      {format(date, 'EEE')}
                    </div>
                    <div className="text-xs font-medium text-foreground">
                      {format(date, 'd')}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {Array.from(groupedRecords.entries()).map(([key, records]) => {
                const firstRecord = records[0];
                return (
                  <tr key={key} className="hover:bg-accent/30">
                    <td className="sticky left-0 z-10 bg-card px-4 py-3">
                      <div className="text-sm font-medium text-foreground">
                        {firstRecord.propertyName}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {firstRecord.channelName} · {firstRecord.roomType}
                      </div>
                    </td>
                    {dates.map((date) => {
                      const record = getRecordForDate(records, date);
                      return (
                        <td key={date.toISOString()} className="px-2 py-3 text-center">
                          {record ? (
                            <div
                              className={cn(
                                'mx-auto flex h-6 w-10 items-center justify-center rounded border text-[10px] font-medium',
                                statusColors[record.status]
                              )}
                              title={`${record.status} - ${formatDistanceToNow(new Date(record.capturedAt), { addSuffix: true })}`}
                            >
                              {statusLabels[record.status]}
                            </div>
                          ) : (
                            <div className="mx-auto flex h-6 w-10 items-center justify-center rounded border border-border bg-muted/30 text-[10px] text-muted-foreground">
                              -
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
              {groupedRecords.size === 0 && (
                <tr>
                  <td
                    colSpan={daysToShow + 1}
                    className="py-8 text-center text-sm text-muted-foreground"
                  >
                    No availability records found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}
