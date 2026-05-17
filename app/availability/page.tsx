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
        {/* Hero - Critical Issues Banner */}
        <AvailabilityHero
          criticalIssues={criticalIssues}
          highIssues={highIssues}
          onReviewIssues={handleReviewIssues}
          onOpenMatrix={handleOpenMatrix}
        />

        {/* KPI Strip */}
        <AvailabilityKPIStrip kpis={availabilityKPIs} />

        {/* Availability Matrix */}
        <section ref={matrixSectionRef}>
          <AvailabilityMatrix 
            propertyRoomAvailability={propertyRoomAvailability}
            daysToShow={14}
          />
        </section>

        {/* Channel Sellability Matrix */}
        <ChannelSellabilityMatrix propertyChannelMatrix={propertyChannelMatrix} />

        {/* Actionable Issues List */}
        <section ref={issuesSectionRef}>
          <ActionableIssuesList issues={sellabilityIssues} />
        </section>
      </div>
    </DashboardLayout>
  );
}
