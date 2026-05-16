'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { FilterBar, FilterConfig, ToolbarSeparator } from '@/components/dashboard/filter-bar';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { InlineKPI } from '@/components/dashboard/kpi-card';
import { priceRecords, properties, channels } from '@/lib/mock-data';
import type { PriceRecord } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Download, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const filterConfig: FilterConfig[] = [
  { id: 'search', label: 'Search', type: 'search', placeholder: 'Search...' },
  {
    id: 'property',
    label: 'Property',
    type: 'select',
    options: properties.slice(0, 5).map((p) => ({ value: p.id, label: p.name })),
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
];

const columns: Column<PriceRecord>[] = [
  {
    id: 'property',
    header: 'Property',
    sortable: true,
    cell: (row) => (
      <span className="font-medium text-foreground">{row.propertyName}</span>
    ),
  },
  {
    id: 'channel',
    header: 'Channel',
    width: '100px',
    cell: (row) => (
      <span className="text-muted-foreground">{row.channelName}</span>
    ),
  },
  {
    id: 'roomType',
    header: 'Room',
    cell: (row) => (
      <span className="text-muted-foreground">{row.roomType}</span>
    ),
  },
  {
    id: 'ratePlan',
    header: 'Rate',
    cell: (row) => (
      <span className="text-muted-foreground">{row.ratePlan}</span>
    ),
  },
  {
    id: 'stayDate',
    header: 'Stay Date',
    width: '90px',
    sortable: true,
    accessorKey: 'stayDate',
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {format(new Date(row.stayDate), 'MMM d')}
      </span>
    ),
  },
  {
    id: 'displayPrice',
    header: 'Display',
    width: '90px',
    sortable: true,
    accessorKey: 'displayPrice',
    cell: (row) => (
      <span className="tabular-nums font-medium text-foreground">
        {row.currency} {row.displayPrice.toLocaleString()}
      </span>
    ),
    className: 'text-right',
  },
  {
    id: 'referencePrice',
    header: 'Ref',
    width: '90px',
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {row.currency} {row.referencePrice.toLocaleString()}
      </span>
    ),
    className: 'text-right',
  },
  {
    id: 'delta',
    header: 'Delta',
    width: '70px',
    sortable: true,
    accessorKey: 'deltaPercent',
    cell: (row) => (
      <span
        className={cn(
          'tabular-nums font-medium',
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
    width: '80px',
    sortable: true,
    accessorKey: 'capturedAt',
    cell: (row) => (
      <span className="text-[10px] tabular-nums text-muted-foreground">
        {formatDistanceToNow(new Date(row.capturedAt), { addSuffix: false })}
      </span>
    ),
  },
  {
    id: 'status',
    header: 'Status',
    width: '80px',
    cell: (row) => <StatusBadge status={row.parityStatus} size="xs" />,
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
      <div className="flex h-full flex-col">
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
          onClear={() => setFilters({})}
        >
          <div className="flex items-center gap-3">
            <InlineKPI label="Total" value={stats.total} />
            <InlineKPI label="Match" value={stats.matched} status="success" />
            <InlineKPI label="Warning" value={stats.warnings} status={stats.warnings > 0 ? 'warning' : 'default'} />
            <InlineKPI label="Mismatch" value={stats.mismatches} status={stats.mismatches > 0 ? 'critical' : 'default'} />
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

        <div className="flex-1 overflow-auto p-3">
          <DataTable
            columns={columns}
            data={filteredRecords}
            compact
            emptyMessage="No price records found"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
