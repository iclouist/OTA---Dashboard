'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { FilterBar, FilterConfig, Toolbar, ToolbarSeparator } from '@/components/dashboard/filter-bar';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { InlineKPI } from '@/components/dashboard/kpi-card';
import { properties } from '@/lib/mock-data';
import type { Property } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal, Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const filterConfig: FilterConfig[] = [
  { id: 'search', label: 'Search', type: 'search', placeholder: 'Search properties...' },
  {
    id: 'status',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'healthy', label: 'Healthy' },
      { value: 'warning', label: 'Warning' },
      { value: 'critical', label: 'Critical' },
    ],
  },
  {
    id: 'country',
    label: 'Country',
    type: 'select',
    options: [
      { value: 'Thailand', label: 'Thailand' },
      { value: 'Indonesia', label: 'Indonesia' },
      { value: 'Singapore', label: 'Singapore' },
      { value: 'Malaysia', label: 'Malaysia' },
    ],
  },
];

const columns: Column<Property>[] = [
  {
    id: 'name',
    header: 'Property',
    sortable: true,
    cell: (row) => (
      <div className="flex items-center gap-2">
        <StatusDot status={row.healthStatus} />
        <div>
          <p className="font-medium text-foreground">{row.name}</p>
          <p className="text-[10px] text-muted-foreground">
            {row.city}, {row.country}
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'channels',
    header: 'Channels',
    width: '80px',
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {row.activeChannels.length}
      </span>
    ),
    className: 'text-center',
  },
  {
    id: 'roomTypes',
    header: 'Rooms',
    width: '70px',
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {row.roomTypes.length}
      </span>
    ),
    className: 'text-center',
  },
  {
    id: 'ratePlans',
    header: 'Plans',
    width: '70px',
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {row.ratePlans.length}
      </span>
    ),
    className: 'text-center',
  },
  {
    id: 'lastSync',
    header: 'Last Sync',
    width: '100px',
    sortable: true,
    accessorKey: 'lastSync',
    cell: (row) => (
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {formatDistanceToNow(new Date(row.lastSync), { addSuffix: false })}
      </span>
    ),
  },
  {
    id: 'alertCount',
    header: 'Alerts',
    width: '70px',
    sortable: true,
    accessorKey: 'alertCount',
    cell: (row) => (
      <span
        className={
          row.alertCount === 0
            ? 'tabular-nums text-muted-foreground'
            : row.alertCount > 2
            ? 'tabular-nums font-medium text-critical'
            : 'tabular-nums font-medium text-warning'
        }
      >
        {row.alertCount}
      </span>
    ),
    className: 'text-center',
  },
  {
    id: 'status',
    header: 'Status',
    width: '90px',
    cell: (row) => <StatusBadge status={row.healthStatus} size="xs" />,
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100">
        <MoreHorizontal className="h-3.5 w-3.5" />
      </Button>
    ),
    width: '40px',
  },
];

export default function PropertiesPage() {
  const router = useRouter();
  const [filters, setFilters] = React.useState<Record<string, string>>({});

  const filteredProperties = React.useMemo(() => {
    return properties.filter((property) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !property.name.toLowerCase().includes(search) &&
          !property.city.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (filters.status && filters.status !== 'all') {
        if (property.healthStatus !== filters.status) return false;
      }
      if (filters.country && filters.country !== 'all') {
        if (property.country !== filters.country) return false;
      }
      return true;
    });
  }, [filters]);

  const healthyCount = filteredProperties.filter(p => p.healthStatus === 'healthy').length;
  const warningCount = filteredProperties.filter(p => p.healthStatus === 'warning').length;
  const criticalCount = filteredProperties.filter(p => p.healthStatus === 'critical').length;

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
            <InlineKPI label="Total" value={filteredProperties.length} />
            <InlineKPI label="Healthy" value={healthyCount} status="success" />
            <InlineKPI label="Warning" value={warningCount} status={warningCount > 0 ? 'warning' : 'default'} />
            <InlineKPI label="Critical" value={criticalCount} status={criticalCount > 0 ? 'critical' : 'default'} />
          </div>
          <ToolbarSeparator />
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <Plus className="h-3.5 w-3.5" />
            Add
          </Button>
        </FilterBar>

        <div className="flex-1 overflow-auto p-3">
          <DataTable
            columns={columns}
            data={filteredProperties}
            onRowClick={(property) => router.push(`/properties/${property.id}`)}
            compact
            emptyMessage="No properties found"
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
