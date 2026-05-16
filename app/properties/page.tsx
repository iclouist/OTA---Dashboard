'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { FilterBar, FilterConfig } from '@/components/dashboard/filter-bar';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { properties } from '@/lib/mock-data';
import type { Property } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { MoreHorizontal } from 'lucide-react';
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
      <div>
        <p className="font-medium text-foreground">{row.name}</p>
        <p className="text-xs text-muted-foreground">
          {row.city}, {row.country}
        </p>
      </div>
    ),
  },
  {
    id: 'channels',
    header: 'Channels',
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.activeChannels.length} active
      </span>
    ),
  },
  {
    id: 'roomTypes',
    header: 'Room Types',
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.roomTypes.length}
      </span>
    ),
  },
  {
    id: 'ratePlans',
    header: 'Rate Plans',
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {row.ratePlans.length}
      </span>
    ),
  },
  {
    id: 'lastSync',
    header: 'Last Sync',
    sortable: true,
    accessorKey: 'lastSync',
    cell: (row) => (
      <span className="text-sm text-muted-foreground">
        {formatDistanceToNow(new Date(row.lastSync), { addSuffix: true })}
      </span>
    ),
  },
  {
    id: 'alertCount',
    header: 'Alerts',
    sortable: true,
    accessorKey: 'alertCount',
    cell: (row) => (
      <span
        className={
          row.alertCount === 0
            ? 'text-muted-foreground'
            : row.alertCount > 2
            ? 'font-medium text-critical'
            : 'font-medium text-warning'
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
    cell: (row) => <StatusBadge status={row.healthStatus} size="sm" />,
  },
  {
    id: 'actions',
    header: '',
    cell: () => (
      <Button variant="ghost" size="icon" className="h-8 w-8">
        <MoreHorizontal className="h-4 w-4" />
      </Button>
    ),
    className: 'w-12',
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

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Properties</h1>
            <p className="text-sm text-muted-foreground">
              Manage and monitor all tracked properties
            </p>
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
          data={filteredProperties}
          onRowClick={(property) => router.push(`/properties/${property.id}`)}
          getRowClassName={(row) =>
            row.healthStatus === 'critical'
              ? 'bg-critical/5 hover:bg-critical/10'
              : row.healthStatus === 'warning'
              ? 'bg-warning/5 hover:bg-warning/10'
              : 'hover:bg-accent/50'
          }
          emptyMessage="No properties found"
        />
      </div>
    </DashboardLayout>
  );
}
