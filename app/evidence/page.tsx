'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { FilterBar, FilterConfig } from '@/components/dashboard/filter-bar';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { EvidenceCard } from '@/components/dashboard/evidence-card';
import { evidenceItems, properties, channels } from '@/lib/mock-data';
import type { Evidence } from '@/lib/types';
import { formatDistanceToNow, format } from 'date-fns';
import {
  ExternalLink,
  Image as ImageIcon,
  X,
  AlertTriangle,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

const filterConfig: FilterConfig[] = [
  { id: 'search', label: 'Search', type: 'search', placeholder: 'Search evidence...' },
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
      { value: 'pending', label: 'Pending' },
      { value: 'verified', label: 'Verified' },
      { value: 'flagged', label: 'Flagged' },
    ],
  },
];

export default function EvidencePage() {
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [selectedEvidence, setSelectedEvidence] = React.useState<Evidence | null>(null);

  const filteredEvidence = React.useMemo(() => {
    return evidenceItems.filter((evidence) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !evidence.propertyName.toLowerCase().includes(search) &&
          !evidence.channelName.toLowerCase().includes(search) &&
          !(evidence.roomType?.toLowerCase().includes(search))
        ) {
          return false;
        }
      }
      if (filters.property && filters.property !== 'all') {
        if (evidence.propertyId !== filters.property) return false;
      }
      if (filters.channel && filters.channel !== 'all') {
        if (evidence.channelId !== filters.channel) return false;
      }
      if (filters.status && filters.status !== 'all') {
        if (evidence.status !== filters.status) return false;
      }
      return true;
    });
  }, [filters]);

  const stats = React.useMemo(() => {
    const total = evidenceItems.length;
    const pending = evidenceItems.filter((e) => e.status === 'pending').length;
    const verified = evidenceItems.filter((e) => e.status === 'verified').length;
    const flagged = evidenceItems.filter((e) => e.status === 'flagged').length;
    return { total, pending, verified, flagged };
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-lg font-semibold text-foreground">Evidence</h1>
            <p className="text-sm text-muted-foreground">
              Screenshot evidence and extracted data from OTA channels
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 rounded-lg border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Total Evidence:</span>
            <span className="font-medium text-foreground">{stats.total}</span>
          </div>
          <div className="h-4 w-px bg-border" />
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-warning" />
            <span className="text-sm text-muted-foreground">Pending:</span>
            <span className="font-medium text-warning">{stats.pending}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            <span className="text-sm text-muted-foreground">Verified:</span>
            <span className="font-medium text-success">{stats.verified}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-critical" />
            <span className="text-sm text-muted-foreground">Flagged:</span>
            <span className="font-medium text-critical">{stats.flagged}</span>
          </div>
        </div>

        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
          onClear={() => setFilters({})}
        />

        {/* Evidence grid */}
        {filteredEvidence.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No evidence found
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {filteredEvidence.map((evidence) => (
              <EvidenceCard
                key={evidence.id}
                evidence={evidence}
                onClick={() => setSelectedEvidence(evidence)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Evidence detail dialog */}
      <Dialog
        open={!!selectedEvidence}
        onOpenChange={() => setSelectedEvidence(null)}
      >
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-muted-foreground" />
              Evidence Detail
            </DialogTitle>
          </DialogHeader>

          {selectedEvidence && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {/* Screenshot preview */}
              <div className="space-y-4">
                <div className="relative aspect-video overflow-hidden rounded-lg border border-border bg-muted">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <ImageIcon className="h-12 w-12 text-muted-foreground/30" />
                  </div>
                  <div className="absolute bottom-2 left-2">
                    <StatusBadge status={selectedEvidence.status} size="sm" />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <ExternalLink className="mr-2 h-3.5 w-3.5" />
                    View Full Size
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    Open Source Page
                  </Button>
                </div>
              </div>

              {/* Metadata */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    {selectedEvidence.propertyName}
                  </h3>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {selectedEvidence.channelName}
                    {selectedEvidence.roomType && ` · ${selectedEvidence.roomType}`}
                  </p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-medium uppercase text-muted-foreground">
                    Extracted Data
                  </h4>
                  <div className="rounded-lg border border-border bg-muted/30 p-3">
                    <div className="space-y-2">
                      {Object.entries(selectedEvidence.extractedData).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between">
                          <span className="text-xs capitalize text-muted-foreground">
                            {key}
                          </span>
                          <span className="text-sm font-medium text-foreground">
                            {value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-xs font-medium uppercase text-muted-foreground">
                    Capture Info
                  </h4>
                  <div className="space-y-2 rounded-lg border border-border bg-muted/30 p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Captured</span>
                      <span className="text-sm text-foreground">
                        {format(new Date(selectedEvidence.capturedAt), 'MMM d, yyyy HH:mm')}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Source</span>
                      <span className="text-sm text-foreground">
                        {selectedEvidence.sourcePageLabel}
                      </span>
                    </div>
                  </div>
                </div>

                {selectedEvidence.relatedAlertIds.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-medium uppercase text-muted-foreground">
                      Related Alerts
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvidence.relatedAlertIds.map((alertId) => (
                        <span
                          key={alertId}
                          className="inline-flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1 text-xs text-muted-foreground"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          {alertId}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  {selectedEvidence.status === 'pending' && (
                    <>
                      <Button variant="outline" size="sm" className="flex-1">
                        Flag
                      </Button>
                      <Button variant="default" size="sm" className="flex-1">
                        Verify
                      </Button>
                    </>
                  )}
                  {selectedEvidence.status === 'flagged' && (
                    <Button variant="outline" size="sm" className="flex-1">
                      Review
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
}
