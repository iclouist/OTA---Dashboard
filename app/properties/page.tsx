'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { DashboardLayout } from '@/components/dashboard/layout';
import { DataTable, Column } from '@/components/dashboard/data-table';
import { FilterBar, FilterConfig, ToolbarSeparator } from '@/components/dashboard/filter-bar';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { InlineKPI } from '@/components/dashboard/kpi-card';
import { AddPropertyModal } from '@/components/dashboard/modals';
import { properties } from '@/lib/mock-data';
import type { Property } from '@/lib/types';
import { Download, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatVND } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

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
    label: 'Onboarding',
    type: 'select',
    options: [
      { value: 'draft', label: 'Draft' },
      { value: 'mapping-needed', label: 'Mapping Needed' },
      { value: 'email-live', label: 'Email Live' },
      { value: 'price-monitor-live', label: 'Price Monitor Live' },
      { value: 'verification-pending', label: 'Verification Pending' },
      { value: 'active', label: 'Active' },
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
    id: 'onboardingStatus',
    header: 'Status',
    width: '120px',
    cell: (row) => <StatusBadge status={row.onboardingStatus} size="sm" />,
  },
  {
    id: 'channels',
    header: 'Channels',
    width: '80px',
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
        {formatVND(row.grossRevenue, true)}
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
        {formatVND(row.otaCommission, true)}
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
        {formatVND(row.netRevenue, true)}
      </span>
    ),
    className: 'text-right',
  },
  {
    id: 'priceIssues',
    header: 'Issues',
    width: '60px',
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
  const [localProperties, setLocalProperties] = React.useState<Property[]>(properties);
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [showAddProperty, setShowAddProperty] = React.useState(false);
  const [propertyToDelete, setPropertyToDelete] = React.useState<Property | null>(null);

  // Extend columns dynamically to include Delete action
  const dynamicColumns = React.useMemo(() => {
    const cols: Column<Property>[] = [
      ...columns,
      {
        id: 'actions',
        header: 'Actions',
        width: '70px',
        cell: (row) => (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 text-muted-foreground hover:text-critical"
            onClick={(e) => {
              e.stopPropagation();
              setPropertyToDelete(row);
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        ),
        className: 'text-center',
      }
    ];
    return cols;
  }, []);

  const filteredProperties = React.useMemo(() => {
    return localProperties.filter((property) => {
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
  }, [localProperties, filters]);

  const healthyCount = filteredProperties.filter((p) => p.healthStatus === 'healthy').length;
  const activeCount = filteredProperties.filter((p) => p.onboardingStatus === 'active').length;
  const draftCount = filteredProperties.filter((p) => p.onboardingStatus === 'draft' || p.onboardingStatus === 'mapping-needed').length;
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
            <InlineKPI label="Active" value={activeCount} status="success" />
            <InlineKPI label="Setup" value={draftCount} status={draftCount > 0 ? 'warning' : 'default'} />
            <InlineKPI label="Healthy" value={healthyCount} status="success" />
            <InlineKPI label="Nights" value={totalNights} />
          </div>
          <ToolbarSeparator />
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm" className="h-7 gap-1.5 px-2 text-[11px]" onClick={() => setShowAddProperty(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Property
          </Button>
        </FilterBar>

        <div className="flex-1 overflow-auto p-3">
          <DataTable
            columns={dynamicColumns}
            data={filteredProperties}
            onRowClick={(property) => router.push(`/properties/${property.id}`)}
            compact
            emptyMessage="No properties found"
          />
        </div>
      </div>

      <AddPropertyModal
        open={showAddProperty}
        onOpenChange={setShowAddProperty}
        onSubmit={(data) => {
          const newProperty: Property = {
            id: `prop-${Date.now()}`,
            name: data.name,
            location: data.location,
            currency: 'VND',
            roomType: data.roomType,
            roomCount: data.roomCount,
            bedsPerRoom: data.bedsPerRoom,
            capacityPerRoom: data.capacityPerRoom,
            activeOTAChannels: [],
            roomNightsSold: 0,
            grossRevenue: 0,
            otaCommission: 0,
            netRevenue: 0,
            activePriceIssues: 0,
            mappingCompleteness: 'unmapped',
            dataFreshness: 'missing',
            healthStatus: 'unknown',
            onboardingStatus: data.onboardingStatus,
            alertCount: 0,
          };
          setLocalProperties((prev) => [newProperty, ...prev]);
          console.log('[v0] Added property:', newProperty);
        }}
      />

      <AlertDialog open={!!propertyToDelete} onOpenChange={(open) => !open && setPropertyToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[14px]">Delete Property</AlertDialogTitle>
            <AlertDialogDescription className="text-[12px]">
              Are you sure you want to delete <strong>{propertyToDelete?.name}</strong>? This action will permanently remove the property from monitoring.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="h-8 text-[11px]">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="h-8 bg-critical hover:bg-critical/90 text-white text-[11px]"
              onClick={() => {
                if (propertyToDelete) {
                  setLocalProperties((prev) => prev.filter((p) => p.id !== propertyToDelete.id));
                  console.log('[v0] Deleted property:', propertyToDelete.id);
                  setPropertyToDelete(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </DashboardLayout>
  );
}
