'use client';

import * as React from 'react';
import { AlertTriangle, Clock3, Filter, LayoutGrid, ShieldAlert } from 'lucide-react';
import { DashboardLayout } from '@/components/dashboard/layout';
import {
  AvailabilityHero,
  AvailabilityKPIStrip,
  AvailabilityMatrix,
  ChannelSellabilityMatrix,
  ActionableIssuesList,
} from '@/components/dashboard/availability';
import { PageHeader, PageMetaItem } from '@/components/dashboard/page-header';
import { SectionHeader } from '@/components/dashboard/section-header';
import { StateBanner } from '@/components/dashboard/state-banner';
import {
  availabilitySnapshots,
  channelAvailabilityStatus,
  sellabilityIssues,
  availabilityKPIs,
  properties,
} from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { getRollingDates } from '@/lib/utils';
import type { AvailabilityStatus, SyncFreshnessStatus } from '@/lib/types';

const savedViews = [
  {
    id: 'urgent',
    label: 'Urgent sellability',
    description: 'Focus on critical and high-priority issues blocking bookability now.',
  },
  {
    id: 'sync',
    label: 'Sync watchlist',
    description: 'Review stale and missing channel sync before rates drift further.',
  },
  {
    id: 'inventory',
    label: 'Inventory pressure',
    description: 'Spot low inventory and closures across the next 14 days.',
  },
];

export default function AvailabilityPage() {
  const criticalIssues = sellabilityIssues.filter(i => i.severity === 'critical' && i.status === 'active');
  const highIssues = sellabilityIssues.filter(i => i.severity === 'high' && i.status === 'active');
  const mediumIssues = sellabilityIssues.filter(i => i.severity === 'medium' && i.status === 'active');
  const blockedChannels = channelAvailabilityStatus.filter(c => !c.sellable).length;
  const staleChannels = channelAvailabilityStatus.filter(c => c.syncStatus === 'stale' || c.syncStatus === 'missing').length;
  const missingSyncChannels = channelAvailabilityStatus.filter(c => c.syncStatus === 'missing').length;
  const freshChannels = channelAvailabilityStatus.filter(c => c.syncStatus === 'fresh').length;
  const totalChannels = channelAvailabilityStatus.length;
  const activeIssues = sellabilityIssues.filter(i => i.status === 'active');
  
  // Use dynamic rolling dates
  const rollingDates = getRollingDates(14);

  // Group availability by property and room type
  const propertyRoomAvailability = properties.map(property => {
    const propertyAvail = availabilitySnapshots.filter(a => a.propertyId === property.id);
    const roomTypes = [...new Set(propertyAvail.map(a => a.roomType))];
    
    return {
      property,
      roomTypes: roomTypes.map(roomType => {
        const roomAvail = propertyAvail.filter(a => a.roomType === roomType);
        const channelIds = [...new Set(roomAvail.map(a => a.channelId))];
        
        return {
          roomType,
          channels: channelIds.map(channelId => {
            const channelAvail = roomAvail.filter(a => a.channelId === channelId);
            return {
              channelId,
              channelName: channelAvail[0]?.channelName || channelId,
              dates: rollingDates.map(day => {
                const dayAvail = channelAvail.find(a => a.date === day.date);
                return {
                  date: day.date,
                  status: dayAvail?.availabilityStatus || 'unknown' as AvailabilityStatus,
                  inventory: dayAvail?.inventoryCount || 0,
                  syncStatus: dayAvail?.syncStatus || 'missing' as SyncFreshnessStatus,
                };
              }),
            };
          }),
        };
      }),
    };
  });

  // Get unique properties with channel status
  const propertyChannelMatrix = properties.map(property => {
    const channels = channelAvailabilityStatus.filter(c => c.propertyId === property.id);
    return { property, channels };
  });

  // Scroll to issues section
  const issuesSectionRef = React.useRef<HTMLElement>(null);
  const matrixSectionRef = React.useRef<HTMLElement>(null);

  const handleReviewIssues = () => {
    issuesSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleOpenMatrix = () => {
    matrixSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Inventory & Sellability"
          title="Availability"
          description="Track channel sellability, spot blocked inventory, and review stale sync before availability issues turn into lost bookings."
          meta={
            <>
              <PageMetaItem label="Properties open" value={availabilityKPIs.propertiesOpen} tone="success" />
              <PageMetaItem label="At risk" value={availabilityKPIs.propertiesAtRisk} tone={availabilityKPIs.propertiesAtRisk > 0 ? 'critical' : 'default'} />
              <PageMetaItem label="Blocked channels" value={blockedChannels} tone={blockedChannels > 0 ? 'critical' : 'default'} />
              <PageMetaItem label="Stale sync" value={staleChannels} tone={staleChannels > 0 ? 'warning' : 'default'} />
            </>
          }
        />

        {(criticalIssues.length > 0 || highIssues.length > 0 || staleChannels > 0) && (
          <div className="px-5">
            <StateBanner
              tone={criticalIssues.length > 0 ? 'critical' : 'warning'}
              title={criticalIssues.length > 0 ? 'Availability issues are actively blocking sellability.' : 'Some availability signals need refresh or review.'}
              description={`Critical issues: ${criticalIssues.length} · High priority: ${highIssues.length} · Stale or missing sync channels: ${staleChannels}`}
            />
          </div>
        )}

        <section className="px-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-12">
            <div className="lg:col-span-7 space-y-4">
              {/* Hero - Critical Issues Banner */}
              <AvailabilityHero
                criticalIssues={criticalIssues}
                highIssues={highIssues}
                onReviewIssues={handleReviewIssues}
                onOpenMatrix={handleOpenMatrix}
              />

              {/* KPI Strip */}
              <AvailabilityKPIStrip kpis={availabilityKPIs} />
            </div>

            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <SectionHeader
                  title="Saved views"
                  description="Quick operator lenses for the same availability data."
                  badge={<span className="rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{savedViews.length}</span>}
                />
                <div className="mt-4 space-y-2.5">
                  {savedViews.map((view, index) => (
                    <button
                      key={view.id}
                      type="button"
                      className="w-full rounded-lg border border-border/70 bg-background px-3 py-3 text-left transition-colors hover:bg-muted/30"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-[12px] font-semibold text-foreground">{view.label}</p>
                          <p className="mt-1 text-[11px] text-muted-foreground">{view.description}</p>
                        </div>
                        <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                          V{index + 1}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
                <SectionHeader
                  title="Freshness & trust"
                  description="How much of the availability surface is safe to operate on right now."
                  badge={<span className="rounded-full bg-success/10 px-2 py-0.5 text-[10px] font-medium text-success">{freshChannels}/{totalChannels} fresh</span>}
                />
                <div className="mt-4 space-y-3">
                  <StateBanner
                    tone={missingSyncChannels > 0 ? 'critical' : staleChannels > 0 ? 'warning' : 'success'}
                    icon={missingSyncChannels > 0 ? <ShieldAlert className="h-4 w-4 text-critical" /> : <Clock3 className="h-4 w-4 text-warning" />}
                    title={missingSyncChannels > 0 ? 'Some channels have no reliable sync signal.' : staleChannels > 0 ? 'Some channel data is getting stale.' : 'Freshness looks healthy across channels.'}
                    description={`Fresh: ${freshChannels} · Stale/missing: ${staleChannels} · Missing only: ${missingSyncChannels}`}
                  />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border/60 bg-background p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Critical</p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-critical">{criticalIssues.length}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">Immediate blockers</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">High</p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-warning">{highIssues.length}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">Next to clear</p>
                    </div>
                    <div className="rounded-lg border border-border/60 bg-background p-3">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Medium</p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-info">{mediumIssues.length}</p>
                      <p className="mt-1 text-[10px] text-muted-foreground">Watchlist load</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section ref={issuesSectionRef} className="px-5">
          <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
            <SectionHeader
              title="Issue queue"
              description="Triage the highest-impact availability problems before reviewing the full matrix."
              badge={<span className="rounded-full bg-warning/10 px-2 py-0.5 text-[10px] font-medium text-warning">{activeIssues.length} active</span>}
              actions={
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]">
                    <Filter className="h-3.5 w-3.5" />
                    Filter queue
                  </Button>
                  <Button variant="outline" size="sm" className="h-8 gap-1.5 text-[11px]" onClick={handleOpenMatrix}>
                    <LayoutGrid className="h-3.5 w-3.5" />
                    Open matrix
                  </Button>
                </div>
              }
            />
            <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
              <div className="rounded-lg border border-critical/30 bg-critical/5 p-3">
                <div className="flex items-center gap-2 text-critical">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">Critical blockers</span>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums text-critical">{criticalIssues.length}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Channels or properties that are not safely sellable.</p>
              </div>
              <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                <div className="flex items-center gap-2 text-warning">
                  <Clock3 className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">Sync watchlist</span>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums text-warning">{staleChannels}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Channels with stale or missing refresh signals.</p>
              </div>
              <div className="rounded-lg border border-info/30 bg-info/5 p-3">
                <div className="flex items-center gap-2 text-info">
                  <ShieldAlert className="h-4 w-4" />
                  <span className="text-[11px] font-semibold uppercase tracking-wide">Needs review</span>
                </div>
                <p className="mt-2 text-2xl font-bold tabular-nums text-info">{mediumIssues.length + highIssues.length}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Items that may soon affect bookability or trust.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Availability Matrix */}
        <section ref={matrixSectionRef} className="px-5">
          <AvailabilityMatrix 
            propertyRoomAvailability={propertyRoomAvailability}
            daysToShow={14}
          />
        </section>

        {/* Channel Sellability Matrix */}
        <div className="px-5">
          <ChannelSellabilityMatrix propertyChannelMatrix={propertyChannelMatrix} />
        </div>

        {/* Actionable Issues List */}
        <section className="px-5 pb-6">
          <ActionableIssuesList issues={sellabilityIssues} />
        </section>
      </div>
    </DashboardLayout>
  );
}
