'use client';

import Link from 'next/link';
import { Layers, CheckCircle2, XCircle, RefreshCw, AlertCircle } from 'lucide-react';
import { StatusDot } from '@/components/dashboard/status-badge';
import { cn, formatSyncAge } from '@/lib/utils';
import type { ChannelAvailabilityStatus, Property, SyncFreshnessStatus } from '@/lib/types';

interface ChannelSellabilityMatrixProps {
  propertyChannelMatrix: Array<{
    property: Property;
    channels: ChannelAvailabilityStatus[];
  }>;
}

function StatusIcon({ value, label }: { value: boolean; label: string }) {
  return value ? (
    <CheckCircle2 className="h-3.5 w-3.5 text-success" aria-label={`${label}: Yes`} />
  ) : (
    <XCircle className="h-3.5 w-3.5 text-critical" aria-label={`${label}: No`} />
  );
}

function SyncBadge({ status, lastSyncAt }: { status: SyncFreshnessStatus; lastSyncAt: string }) {
  const age = formatSyncAge(lastSyncAt);
  
  return (
    <div className={cn(
      "inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[9px] font-medium",
      status === 'fresh' && "bg-success/10 text-success",
      status === 'stale' && "bg-warning/10 text-warning",
      status === 'missing' && "bg-critical/10 text-critical"
    )}>
      <RefreshCw className="h-2.5 w-2.5" />
      <span>{status === 'missing' ? 'None' : age}</span>
    </div>
  );
}

function SellableBadge({ sellable }: { sellable: boolean }) {
  return sellable ? (
    <span className="inline-flex items-center rounded-md bg-success/15 px-1.5 py-0.5 text-[9px] font-semibold text-success ring-1 ring-inset ring-success/20">
      Sellable
    </span>
  ) : (
    <span className="inline-flex items-center rounded-md bg-critical/15 px-1.5 py-0.5 text-[9px] font-semibold text-critical ring-1 ring-inset ring-critical/20">
      Blocked
    </span>
  );
}

export function ChannelSellabilityMatrix({ propertyChannelMatrix }: ChannelSellabilityMatrixProps) {
  // Compute summary stats
  const allChannels = propertyChannelMatrix.flatMap(p => p.channels);
  const healthyCount = allChannels.filter(c => c.sellable && c.syncStatus === 'fresh').length;
  const blockedCount = allChannels.filter(c => !c.sellable).length;
  const staleCount = allChannels.filter(c => c.syncStatus === 'stale' || c.syncStatus === 'missing').length;
  
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-semibold text-foreground">Channel Sellability</span>
          <span className="text-[11px] text-muted-foreground">Property × OTA status</span>
        </div>
        
        {/* Summary pills */}
        <div className="flex items-center gap-2 text-[10px]">
          <span className="inline-flex items-center gap-1 text-success">
            <CheckCircle2 className="h-3 w-3" />
            {healthyCount} healthy
          </span>
          {blockedCount > 0 && (
            <span className="inline-flex items-center gap-1 text-critical">
              <XCircle className="h-3 w-3" />
              {blockedCount} blocked
            </span>
          )}
          {staleCount > 0 && (
            <span className="inline-flex items-center gap-1 text-warning">
              <AlertCircle className="h-3 w-3" />
              {staleCount} stale
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-[180px]">Property</th>
                <th className="px-2 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-[100px]">Channel</th>
                <th className="px-2 py-2 text-center text-[9px] font-medium text-muted-foreground w-[50px]">Mapped</th>
                <th className="px-2 py-2 text-center text-[9px] font-medium text-muted-foreground w-[50px]">Inventory</th>
                <th className="px-2 py-2 text-center text-[9px] font-medium text-muted-foreground w-[50px]">Rate Plan</th>
                <th className="px-2 py-2 text-center text-[9px] font-medium text-muted-foreground w-[60px]">Sellable</th>
                <th className="px-2 py-2 text-center text-[9px] font-medium text-muted-foreground w-[45px]">Open</th>
                <th className="px-2 py-2 text-center text-[9px] font-medium text-muted-foreground w-[45px]">Closed</th>
                <th className="px-2 py-2 text-center text-[9px] font-medium text-muted-foreground w-[60px]">Sync</th>
                <th className="px-3 py-2 text-left text-[9px] font-medium text-muted-foreground">Issues</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {propertyChannelMatrix.map(({ property, channels }) => (
                channels.map((channel, idx) => {
                  const hasIssues = !channel.sellable || channel.syncStatus !== 'fresh';
                  
                  return (
                    <tr 
                      key={channel.id} 
                      className={cn(
                        "hover:bg-muted/20 transition-colors",
                        hasIssues && "bg-critical/[0.02]"
                      )}
                    >
                      <td className="px-3 py-2">
                        {idx === 0 && (
                          <Link href={`/properties/${property.id}`} className="flex items-center gap-2 hover:text-info transition-colors">
                            <StatusDot status={property.healthStatus} />
                            <span className="text-[11px] font-medium text-foreground truncate max-w-[140px]">
                              {property.name}
                            </span>
                          </Link>
                        )}
                      </td>
                      <td className="px-2 py-2">
                        <span className="text-[11px] text-foreground">{channel.channelName}</span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <StatusIcon value={channel.mapped} label="Mapped" />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <StatusIcon value={channel.inventoryLoaded} label="Inventory" />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <StatusIcon value={channel.ratePlanActive} label="Rate Plan" />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <SellableBadge sellable={channel.sellable} />
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className={cn(
                          "text-[11px] font-semibold tabular-nums",
                          channel.openDates > 0 ? "text-success" : "text-muted-foreground"
                        )}>
                          {channel.openDates}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <span className={cn(
                          "text-[11px] font-semibold tabular-nums",
                          channel.closedDates > 0 ? "text-critical" : "text-muted-foreground"
                        )}>
                          {channel.closedDates}
                        </span>
                      </td>
                      <td className="px-2 py-2 text-center">
                        <SyncBadge status={channel.syncStatus} lastSyncAt={channel.lastSyncAt} />
                      </td>
                      <td className="px-3 py-2">
                        {channel.issueSummary ? (
                          <span className="text-[10px] text-warning line-clamp-1">{channel.issueSummary}</span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">—</span>
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
    </section>
  );
}
