'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { FilterBar, FilterConfig } from '@/components/dashboard/filter-bar';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { mappings, properties, channels } from '@/lib/mock-data';
import type { Mapping } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { Link2, ChevronRight, Edit, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const filterConfig: FilterConfig[] = [
  { id: 'search', label: 'Search', type: 'search', placeholder: 'Search mappings...' },
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
      { value: 'active', label: 'Active' },
      { value: 'pending', label: 'Pending' },
      { value: 'inactive', label: 'Inactive' },
    ],
  },
];

export default function MappingsPage() {
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [selectedMapping, setSelectedMapping] = React.useState<Mapping | null>(null);

  const filteredMappings = React.useMemo(() => {
    return mappings.filter((mapping) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !mapping.propertyName.toLowerCase().includes(search) &&
          !mapping.otaPropertyName.toLowerCase().includes(search) &&
          !mapping.roomTypeName.toLowerCase().includes(search) &&
          !mapping.otaRoomName.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (filters.property && filters.property !== 'all') {
        if (mapping.propertyId !== filters.property) return false;
      }
      if (filters.channel && filters.channel !== 'all') {
        if (mapping.channelId !== filters.channel) return false;
      }
      if (filters.status && filters.status !== 'all') {
        if (mapping.status !== filters.status) return false;
      }
      return true;
    });
  }, [filters]);

  const stats = React.useMemo(() => {
    const total = mappings.length;
    const active = mappings.filter((m) => m.status === 'active').length;
    const pending = mappings.filter((m) => m.status === 'pending').length;
    const inactive = mappings.filter((m) => m.status === 'inactive').length;
    return { total, active, pending, inactive };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Mappings</h1>
            <p className="text-sm text-muted-foreground">
              Manage entity mappings between internal systems and OTA channels
            </p>
          </div>
          <Button size="sm" disabled>
            <Link2 className="mr-2 h-4 w-4" />
            Add Mapping
          </Button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total Mappings:</span>
            <span className="font-medium text-foreground">{stats.total}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Active:</span>
            <span className="font-medium text-success">{stats.active}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Pending:</span>
            <span className="font-medium text-warning">{stats.pending}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-muted-foreground" />
            <span className="text-sm text-muted-foreground">Inactive:</span>
            <span className="font-medium text-muted-foreground">{stats.inactive}</span>
          </div>
        </div>

        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
          onClear={() => setFilters({})}
        />

        {/* Mappings table */}
        <div className="overflow-x-auto rounded-lg border border-border bg-card">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Property
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Channel
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Internal Room
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  <Link2 className="mx-auto h-3.5 w-3.5" />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  OTA Room
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">
                  Rate Plan
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-muted-foreground">
                  Status
                </th>
                <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">
                  Verified
                </th>
                <th className="px-4 py-3 w-12"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredMappings.length === 0 ? (
                <tr>
                  <td
                    colSpan={9}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No mappings found
                  </td>
                </tr>
              ) : (
                filteredMappings.map((mapping) => (
                  <tr
                    key={mapping.id}
                    className="cursor-pointer hover:bg-accent/50"
                    onClick={() => setSelectedMapping(mapping)}
                  >
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {mapping.propertyName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {mapping.otaPropertyName}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {mapping.channelName}
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-foreground">{mapping.roomTypeName}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <ChevronRight className="mx-auto h-4 w-4 text-muted-foreground" />
                    </td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-muted-foreground">
                        {mapping.otaRoomName}
                      </p>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="text-sm text-foreground">{mapping.ratePlanName}</p>
                        <p className="text-xs text-muted-foreground">
                          {mapping.otaRatePlanName}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={mapping.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(mapping.lastVerified), {
                        addSuffix: true,
                      })}
                    </td>
                    <td className="px-4 py-3">
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mapping detail sheet */}
      <Sheet open={!!selectedMapping} onOpenChange={() => setSelectedMapping(null)}>
        <SheetContent className="w-[400px] sm:w-[540px]">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Link2 className="h-5 w-5 text-muted-foreground" />
              Mapping Detail
            </SheetTitle>
          </SheetHeader>

          {selectedMapping && (
            <div className="mt-6 space-y-6">
              <div className="flex items-center gap-2">
                <StatusBadge status={selectedMapping.status} size="md" />
                <span className="text-xs text-muted-foreground">
                  Last verified{' '}
                  {formatDistanceToNow(new Date(selectedMapping.lastVerified), {
                    addSuffix: true,
                  })}
                </span>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h4 className="mb-3 text-xs font-medium uppercase text-muted-foreground">
                    Property
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Internal</span>
                      <span className="text-sm font-medium text-foreground">
                        {selectedMapping.propertyName}
                      </span>
                    </div>
                    <div className="flex items-center justify-center py-1">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {selectedMapping.channelName}
                      </span>
                      <span className="text-sm text-foreground">
                        {selectedMapping.otaPropertyName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h4 className="mb-3 text-xs font-medium uppercase text-muted-foreground">
                    Room Type
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Internal</span>
                      <span className="text-sm font-medium text-foreground">
                        {selectedMapping.roomTypeName}
                      </span>
                    </div>
                    <div className="flex items-center justify-center py-1">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {selectedMapping.channelName}
                      </span>
                      <span className="text-sm text-foreground">
                        {selectedMapping.otaRoomName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h4 className="mb-3 text-xs font-medium uppercase text-muted-foreground">
                    Rate Plan
                  </h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Internal</span>
                      <span className="text-sm font-medium text-foreground">
                        {selectedMapping.ratePlanName}
                      </span>
                    </div>
                    <div className="flex items-center justify-center py-1">
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {selectedMapping.channelName}
                      </span>
                      <span className="text-sm text-foreground">
                        {selectedMapping.otaRatePlanName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <h4 className="mb-3 text-xs font-medium uppercase text-muted-foreground">
                    OTA IDs
                  </h4>
                  <div className="space-y-2 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Property ID</span>
                      <span className="text-foreground">{selectedMapping.otaPropertyId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Room ID</span>
                      <span className="text-foreground">{selectedMapping.otaRoomId}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-muted-foreground">Rate Plan ID</span>
                      <span className="text-foreground">{selectedMapping.otaRatePlanId}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  <Edit className="mr-2 h-3.5 w-3.5" />
                  Edit Mapping
                </Button>
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  <ExternalLink className="mr-2 h-3.5 w-3.5" />
                  View on OTA
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
