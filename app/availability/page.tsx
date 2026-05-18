'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import {
  AvailabilityHero,
  AvailabilityKPIStrip,
  AvailabilityMatrix,
  ChannelSellabilityMatrix,
  ActionableIssuesList,
} from '@/components/dashboard/availability';
import { PageHeader, PageMetaItem } from '@/components/dashboard/page-header';
import { StateBanner } from '@/components/dashboard/state-banner';
import {
  availabilitySnapshots,
  channelAvailabilityStatus,
  sellabilityIssues,
  availabilityKPIs,
  properties,
} from '@/lib/mock-data';
import { getRollingDates } from '@/lib/utils';
import type { AvailabilityStatus, SyncFreshnessStatus } from '@/lib/types';

export default function AvailabilityPage() {
  const criticalIssues = sellabilityIssues.filter(i => i.severity === 'critical' && i.status === 'active');
  const highIssues = sellabilityIssues.filter(i => i.severity === 'high' && i.status === 'active');
  const blockedChannels = channelAvailabilityStatus.filter(c => !c.sellable).length;
  const staleChannels = channelAvailabilityStatus.filter(c => c.syncStatus === 'stale' || c.syncStatus === 'missing').length;
  
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

        {/* Hero - Critical Issues Banner */}
        <div className="px-5">
          <AvailabilityHero
            criticalIssues={criticalIssues}
            highIssues={highIssues}
            onReviewIssues={handleReviewIssues}
            onOpenMatrix={handleOpenMatrix}
          />
        </div>

        {/* KPI Strip */}
        <div className="px-5">
          <AvailabilityKPIStrip kpis={availabilityKPIs} />
        </div>

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
        <section ref={issuesSectionRef} className="px-5 pb-6">
          <ActionableIssuesList issues={sellabilityIssues} />
        </section>
      </div>
    </DashboardLayout>
  );
}
