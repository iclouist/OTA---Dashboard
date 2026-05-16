'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { FilterBar, FilterConfig } from '@/components/dashboard/filter-bar';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { priceRecords, properties, channels } from '@/lib/mock-data';
import type { PriceRecord } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';

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
    options: channels.map((c) => ({ value: c.id, label: c.name })),
  },
  {
    id: 'parityStatus',
    label: 'Parity',
    type: 'select',
    options: [
      { value: 'match', label: 'Match' },
      { value: 'warning', label: 'Warning' },
      { value: 'mismatch', label: 'Mismatch' },
    ],
  },
  { id: 'stayDateFrom', label: 'From', type: 'date' },
  { id: 'stayDateTo', label: 'To', type: 'date' },
];

const columns: Column<PriceRecord>[] = [
  {
    id: 'property',
    header: 'Property',
    sortable: true,
    cell: (row) => (
      <span className="text-sm font-medium text-foreground">
        {row.propertyName}
      </span>
    ),
  },
  {
    id: 'channel',
    header: 'Channel',
    cell: (row) => (
      <span className="text-sm text-muted-foreground">{row.channelName}</span>
    ),
  },
  {
    id: 'roomType',
    header: 'Room Type',
    cell: (row) => (
      <span className="text-sm text-muted-foreground">{row.roomType}</span>
    ),
  },
  {
    id: 'ratePlan',
    header: 'Rate Plan',
    cell: (row) => (
      <span className="text-sm text-muted-foreground">{row.ratePlan}</span>
    ),
  },
  {
    id: 'stayDate',
    header: 'Stay Date',
    sortable: true,
    accessorKey: 'stayDate',
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {format(new Date(row.stayDate), 'MMM d, yyyy')}
      </span>
    ),
  },
  {
    id: 'displayPrice',
    header: 'Display Price',
    sortable: true,
    accessorKey: 'displayPrice',
    cell: (row) => (
      <span className="text-sm font-medium text-foreground">
        {row.currency} {row.displayPrice.toLocaleString()}
      </span>
    ),
    className: 'text-right',
  },
  {
    id: 'referencePrice',
    header: 'Reference',
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.currency} {row.referencePrice.toLocaleString()}
      </span>
    ),
    className: 'text-right',
  },
  {
    id: 'delta',
    header: 'Delta',
    sortable: true,
    accessorKey: 'deltaPercent',
    cell: (row) => (
      <span
        className={cn(
          'text-sm font-medium',
          row.deltaPercent === 0
            ? 'text-muted-foreground'
            : Math.abs(row.deltaPercent) > 15
            ? 'text-critical'
            : Math.abs(row.deltaPercent) > 5
            ? 'text-warning'
            : 'text-success'
        )}
      >
        {row.deltaPercent > 0 ? '+' : ''}
        {row.deltaPercent.toFixed(1)}%
      </span>
    ),
    className: 'text-right',
  },
  {
    id: 'capturedAt',
    header: 'Captured',
    sortable: true,
    accessorKey: 'capturedAt',
    cell: (row) => (
      <span className="text-xs text-muted-foreground">
        {formatDistanceToNow(new Date(row.capturedAt), { addSuffix: true })}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    cell: (row) => <StatusBadge status={row.parityStatus} size="sm" />,
    className: 'text-center',
  },
];

export default function PriceMonitorPage() {
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  const filteredRecords = React.useMemo(() => {
    return priceRecords.filter((record) => {
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
      if (filters.parityStatus && filters.parityStatus !== 'all') {
        if (record.parityStatus !== filters.parityStatus) return false;
      }
      if (filters.stayDateFrom) {
        if (new Date(record.stayDate) < new Date(filters.stayDateFrom)) return false;
      }
      if (filters.stayDateTo) {
        if (new Date(record.stayDate) > new Date(filters.stayDateTo)) return false;
      }
      return true;
    });
  }, [filters]);

  const stats = React.useMemo(() => {
    const total = filteredRecords.length;
    const matched = filteredRecords.filter((r) => r.parityStatus === 'match').length;
    const warnings = filteredRecords.filter((r) => r.parityStatus === 'warning').length;
    const mismatches = filteredRecords.filter((r) => r.parityStatus === 'mismatch').length;
    return { total, matched, warnings, mismatches };
  }, [filteredRecords]);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Price Monitor</h1>
            <p className="text-sm text-muted-foreground">
              Track and compare prices across all OTA channels
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total Records:</span>
            <span className="font-medium text-foreground">{stats.total}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Match:</span>
            <span className="font-medium text-success">{stats.matched}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Warning:</span>
            <span className="font-medium text-warning">{stats.warnings}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-critical" />
            <span className="text-sm text-muted-foreground">Mismatch:</span>
            <span className="font-medium text-critical">{stats.mismatches}</span>
          </div>
        </div>

        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
          onClear={() => setFilters({})}
        />

        <DataTable
          columns={columns}
          data={filteredRecords}
          getRowClassName={(row) =>
            row.parityStatus === 'mismatch'
              ? 'bg-critical/5 hover:bg-critical/10'
              : row.parityStatus === 'warning'
              ? 'bg-warning/5 hover:bg-warning/10'
              : 'hover:bg-accent/50'
          }
          emptyMessage="No price records found"
        />
      </div>
    </DashboardLayout>
  );
}
