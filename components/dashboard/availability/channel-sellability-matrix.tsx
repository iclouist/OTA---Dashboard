'use client';

import { Layers, CheckCircle2, XCircle, RefreshCw, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { cn, formatSyncAge } from '@/lib/utils';
import { StatusDot } from '@/components/dashboard/status-badge';
import type { ChannelAvailabilityStatus, Property } from '@/lib/types';

interface ChannelSellabilityMatrixProps {
  properties: Property[];
  channelStatus: ChannelAvailabilityStatus[];
}

// Channel brand colors (subtle)
const channelColors: Record<string, string> = {
  'Booking.com': 'text-blue-500',
  'Agoda': 'text-red-500',
  'Airbnb': 'text-rose-500',
};

export function ChannelSellabilityMatrix({ properties, channelStatus }: ChannelSellabilityMatrixProps) {
  // Group by property
  const propertyChannelMatrix = properties.map(property => {
    const channels = channelStatus.filter(c => c.propertyId === property.id);
    return { property, channels };
  });

  // Count issues
  const totalBlocked = channelStatus.filter(c => !c.sellable).length;
  const totalStale = channelStatus.filter(c => c.syncStatus === 'stale' || c.syncStatus === 'missing').length;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg ring-1",
            totalBlocked > 0 || totalStale > 0 
              ? "bg-warning/10 ring-warning/20" 
              : "bg-muted/80 ring-border"
          )}>
            <Layers className={cn(
              "h-4 w-4",
              totalBlocked > 0 || totalStale > 0 ? "text-warning" : "text-muted-foreground"
            )} />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">Channel Sellability</h2>
            <p className="text-[11px] text-muted-foreground">Property status across all OTA channels</p>
          </div>
        </div>
        
        {/* Summary badges */}
        <div className="flex items-center gap-2">
          {totalBlocked > 0 && (
            <div className="flex items-center gap-1.5 rounded-md bg-critical/10 px-2 py-1 text-[10px] font-medium text-critical ring-1 ring-critical/20">
              <XCircle className="h-3 w-3" />
              {totalBlocked} blocked
            </div>
          )}
          {totalStale > 0 && (
            <div className="flex items-center gap-1.5 rounded-md bg-warning/10 px-2 py-1 text-[10px] font-medium text-warning ring-1 ring-warning/20">
              <AlertTriangle className="h-3 w-3" />
              {totalStale} stale
            </div>
          )}
        </div>
      </div>

      {/* Matrix Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground">Property</th>
                <th className="px-3 py-3 text-left text-[11px] font-semibold text-muted-foreground">Channel</th>
                <th className="px-3 py-3 text-center text-[10px] font-medium text-muted-foreground">Mapped</th>
                <th className="px-3 py-3 text-center text-[10px] font-medium text-muted-foreground">Inventory</th>
                <th className="px-3 py-3 text-center text-[10px] font-medium text-muted-foreground">Rate Plan</th>
                <th className="px-3 py-3 text-center text-[10px] font-medium text-muted-foreground">Sellable</th>
                <th className="px-2 py-3 text-center text-[10px] font-medium text-muted-foreground w-16">Open</th>
                <th className="px-2 py-3 text-center text-[10px] font-medium text-muted-foreground w-16">Closed</th>
                <th className="px-2 py-3 text-center text-[10px] font-medium text-muted-foreground w-16">Restricted</th>
                <th className="px-3 py-3 text-center text-[10px] font-medium text-muted-foreground">Sync</th>
                <th className="px-4 py-3 text-left text-[10px] font-medium text-muted-foreground">Issues</th>
              </tr>
            </thead>
            <tbody>
              {propertyChannelMatrix.map(({ property, channels }) => (
                channels.map((channel, idx) => {
                  const syncInfo = formatSyncAge(channel.lastSyncAt);
                  const hasIssue = !channel.sellable || syncInfo.status === 'stale' || syncInfo.status === 'missing';
                  
                  return (
                    <tr 
                      key={channel.id} 
                      className={cn(
                        "border-b border-border/30 transition-colors",
                        hasIssue ? "bg-warning/3 hover:bg-warning/5" : "hover:bg-muted/30",
                        idx === channels.length - 1 && "border-b-border/50"
                      )}
                    >
                      {/* Property name - only on first row */}
                      <td className="px-4 py-2.5">
                        {idx === 0 && (
                          <Link href={`/properties/${property.id}`} className="flex items-center gap-2 group">
                            <StatusDot status={property.healthStatus} />
                            <span className="text-[12px] font-medium text-foreground group-hover:text-info transition-colors">
                              {property.name}
                            </span>
                          </Link>
                        )}
                      </td>
                      
                      {/* Channel name */}
                      <td className="px-3 py-2.5">
                        <span className={cn("text-[11px] font-medium", channelColors[channel.channelName] || 'text-foreground')}>
                          {channel.channelName}
                        </span>
                      </td>
                      
                      {/* Status indicators */}
                      <td className="px-3 py-2.5 text-center">
                        {channel.mapped ? (
                          <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-critical mx-auto" />
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {channel.inventoryLoaded ? (
                          <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-critical mx-auto" />
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {channel.ratePlanActive ? (
                          <CheckCircle2 className="h-4 w-4 text-success mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-critical mx-auto" />
                        )}
                      </td>
                      
                      {/* Sellable badge */}
                      <td className="px-3 py-2.5 text-center">
                        {channel.sellable ? (
                          <span className="inline-flex items-center rounded-full bg-success/15 px-2.5 py-0.5 text-[10px] font-semibold text-success ring-1 ring-success/20">
                            Yes
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-critical/15 px-2.5 py-0.5 text-[10px] font-semibold text-critical ring-1 ring-critical/20">
                            No
                          </span>
                        )}
                      </td>
                      
                      {/* Date counts */}
                      <td className="px-2 py-2.5 text-center">
                        <span className={cn(
                          "text-[12px] font-bold tabular-nums",
                          channel.openDates > 0 ? "text-success" : "text-muted-foreground/50"
                        )}>
                          {channel.openDates}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <span className={cn(
                          "text-[12px] font-bold tabular-nums",
                          channel.closedDates > 0 ? "text-critical" : "text-muted-foreground/50"
                        )}>
                          {channel.closedDates}
                        </span>
                      </td>
                      <td className="px-2 py-2.5 text-center">
                        <span className={cn(
                          "text-[12px] font-bold tabular-nums",
                          channel.restrictedDates > 0 ? "text-warning" : "text-muted-foreground/50"
                        )}>
                          {channel.restrictedDates}
                        </span>
                      </td>
                      
                      {/* Sync status */}
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-center gap-1.5">
                          <RefreshCw className={cn(
                            "h-3 w-3",
                            syncInfo.status === 'fresh' ? 'text-success' : 
                            syncInfo.status === 'stale' ? 'text-warning' : 'text-critical'
                          )} />
                          <span className={cn(
                            "text-[10px] font-medium",
                            syncInfo.status === 'fresh' ? 'text-success' : 
                            syncInfo.status === 'stale' ? 'text-warning' : 'text-critical'
                          )}>
                            {syncInfo.label}
                          </span>
                        </div>
                      </td>
                      
                      {/* Issues */}
                      <td className="px-4 py-2.5">
                        {channel.issueSummary ? (
                          <span className="text-[10px] text-warning line-clamp-1">{channel.issueSummary}</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/50">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
