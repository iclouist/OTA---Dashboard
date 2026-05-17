'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { FilterBar, FilterConfig, ToolbarSeparator } from '@/components/dashboard/filter-bar';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { InlineKPI } from '@/components/dashboard/kpi-card';
import { properties } from '@/lib/mock-data';
import type { Property } from '@/lib/types';
import { Download, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const filterConfig: FilterConfig[] = [
  { id: 'search', label: 'Search', type: 'search', placeholder: 'Search properties...' },
  {
    id: 'status',
    label: 'Health',
    type: 'select',
    options: [
      { value: 'healthy', label: 'Healthy' },
      { value: 'warning', label: 'Warning' },
      { value: 'critical', label: 'Critical' },
      { value: 'unknown', label: 'Unknown' },
    ],
  },
  {
    id: 'onboarding',
    label: 'Status',
    type: 'select',
    options: [
      { value: 'active', label: 'Active' },
      { value: 'draft', label: 'Draft' },
      { value: 'verification-pending', label: 'Verification Pending' },
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
          <p className="text-[10px] text-muted-foreground">{row.location}</p>
        </div>
      </div>
    ),
  },
  {
    id: 'channels',
    header: 'OTA Channels',
    width: '100px',
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">{row.activeOTAChannels.length}</span>
    ),
    className: 'text-center',
  },
  {
    id: 'roomNights',
    header: 'Nights',
    width: '70px',
    sortable: true,
    accessorKey: 'roomNightsSold',
    cell: (row) => (
      <span className="tabular-nums font-medium text-foreground">{row.roomNightsSold}</span>
    ),
    className: 'text-right',
  },
  {
    id: 'grossRevenue',
    header: 'Gross Rev',
    width: '110px',
    sortable: true,
    accessorKey: 'grossRevenue',
    cell: (row) => (
      <span className="tabular-nums font-medium text-foreground">
        {row.currency} {row.grossRevenue.toLocaleString()}
      </span>
    ),
    className: 'text-right',
  },
  {
    id: 'commission',
    header: 'Commission',
    width: '100px',
    cell: (row) => (
      <span className="tabular-nums text-muted-foreground">
        {row.currency} {row.otaCommission.toLocaleString()}
      </span>
    ),
    className: 'text-right',
  },
  {
    id: 'netRevenue',
    header: 'Net Rev',
    width: '110px',
    sortable: true,
    accessorKey: 'netRevenue',
    cell: (row) => (
      <span className="tabular-nums font-medium text-success">
        {row.currency} {row.netRevenue.toLocaleString()}
      </span>
    ),
    className: 'text-right',
  },
  {
    id: 'priceIssues',
    header: 'Issues',
    width: '65px',
    sortable: true,
    accessorKey: 'activePriceIssues',
    cell: (row) => (
      <span
        className={
          row.activePriceIssues === 0
            ? 'tabular-nums text-muted-foreground'
            : row.activePriceIssues > 3
            ? 'tabular-nums font-medium text-critical'
            : 'tabular-nums font-medium text-warning'
        }
      >
        {row.activePriceIssues}
      </span>
    ),
    className: 'text-center',
  },
  {
    id: 'mapping',
    header: 'Mapping',
    width: '90px',
    cell: (row) => <StatusBadge status={row.mappingCompleteness} size="xs" />,
  },
  {
    id: 'freshness',
    header: 'Data',
    width: '70px',
    cell: (row) => <StatusBadge status={row.dataFreshness} size="xs" />,
  },
  {
    id: 'healthStatus',
    header: 'Health',
    width: '80px',
    cell: (row) => <StatusBadge status={row.healthStatus} size="xs" />,
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
          !property.location.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (filters.status && filters.status !== 'all') {
        if (property.healthStatus !== filters.status) return false;
      }
      if (filters.onboarding && filters.onboarding !== 'all') {
        if (property.onboardingStatus !== filters.onboarding) return false;
      }
      return true;
    });
  }, [filters]);

  const healthyCount = filteredProperties.filter((p) => p.healthStatus === 'healthy').length;
  const totalNights = filteredProperties.reduce((s, p) => s + p.roomNightsSold, 0);

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
            <InlineKPI label="Nights" value={totalNights} />
          </div>
          <ToolbarSeparator />
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <Plus className="h-3.5 w-3.5" />
            Add Property
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
