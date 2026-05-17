'use client';

import { DashboardLayout } from '@/components/dashboard/layout';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { Button } from '@/components/ui/button';
import {
  availabilitySnapshots,
  channelAvailabilityStatus,
  sellabilityIssues,
  availabilityKPIs,
  properties,
} from '@/lib/mock-data';
import {
  CalendarCheck,
  AlertTriangle,
  Building2,
  RefreshCw,
  ChevronRight,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Ban,
  MinusCircle,
  Eye,
  ExternalLink,
  Layers,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import type { AvailabilityStatus, SyncFreshnessStatus } from '@/lib/types';

// Generate next 14 days for display
const today = new Date('2026-05-17');
const next14Days = Array.from({ length: 14 }, (_, i) => {
  const d = new Date(today);
  d.setDate(d.getDate() + i);
  return {
    date: d.toISOString().split('T')[0],
    dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
    dayNum: d.getDate(),
    isWeekend: d.getDay() === 0 || d.getDay() === 6,
  };
});

function getStatusColor(status: AvailabilityStatus): string {
  switch (status) {
    case 'open': return 'bg-success/80';
    case 'low-inventory': return 'bg-warning/80';
    case 'closed': return 'bg-critical/80';
    case 'sold-out': return 'bg-muted-foreground/60';
    case 'restricted': return 'bg-info/60';
    case 'unknown': return 'bg-muted/50';
    default: return 'bg-muted/50';
  }
}

function getStatusLabel(status: AvailabilityStatus): string {
  switch (status) {
    case 'open': return 'Open';
    case 'low-inventory': return 'Low';
    case 'closed': return 'Closed';
    case 'sold-out': return 'Sold Out';
    case 'restricted': return 'Restricted';
    case 'unknown': return 'Unknown';
    default: return status;
  }
}

function getSyncStatusColor(status: SyncFreshnessStatus): string {
  switch (status) {
    case 'fresh': return 'text-success';
    case 'stale': return 'text-warning';
    case 'missing': return 'text-critical';
    default: return 'text-muted-foreground';
  }
}

export default function AvailabilityPage() {
  const criticalIssues = sellabilityIssues.filter(i => i.severity === 'critical' && i.status === 'active');
  const highIssues = sellabilityIssues.filter(i => i.severity === 'high' && i.status === 'active');
  const activeIssues = sellabilityIssues.filter(i => i.status === 'active');

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
              dates: next14Days.map(day => {
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

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Critical Alert Banner */}
        {criticalIssues.length > 0 && (
          <div className="relative overflow-hidden rounded-lg border border-critical/30 bg-gradient-to-r from-critical/10 via-critical/5 to-transparent p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-critical/20">
                  <AlertTriangle className="h-5 w-5 text-critical animate-pulse" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-foreground">
                    {criticalIssues.length} critical availability issue{criticalIssues.length !== 1 ? 's' : ''} require immediate attention
                  </p>
                  <p className="text-[11px] text-muted-foreground">
                    {criticalIssues[0]?.title}
                    {criticalIssues.length > 1 && ` and ${criticalIssues.length - 1} more`}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="border-critical/30 text-critical hover:bg-critical/10">
                Review Issues
              </Button>
            </div>
          </div>
        )}

        {/* KPI Strip */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-info/10">
                <CalendarCheck className="h-4 w-4 text-info" />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-foreground">Availability Overview</h2>
                <p className="text-[11px] text-muted-foreground">Multi-channel inventory and sellability status</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-2">
              <RefreshCw className="h-3.5 w-3.5" />
              Sync All
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
            <div className="rounded-xl border border-success/30 bg-success/5 p-4 shadow-sm">
              <div className="flex items-center gap-1.5 text-success">
                <Building2 className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Properties Open</span>
              </div>
              <p className="mt-2 text-2xl font-bold tabular-nums text-success">{availabilityKPIs.propertiesOpen}</p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Active & sellable</p>
            </div>

            <div className={cn(
              "rounded-xl border p-4 shadow-sm",
              availabilityKPIs.propertiesAtRisk > 0 ? "border-critical/30 bg-critical/5" : "border-border bg-card"
            )}>
              <div className={cn("flex items-center gap-1.5", availabilityKPIs.propertiesAtRisk > 0 ? "text-critical" : "text-muted-foreground")}>
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">At Risk</span>
              </div>
              <p className={cn("mt-2 text-2xl font-bold tabular-nums", availabilityKPIs.propertiesAtRisk > 0 ? "text-critical" : "text-muted-foreground")}>
                {availabilityKPIs.propertiesAtRisk}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Channels with issues</p>
            </div>

            <div className={cn(
              "rounded-xl border p-4 shadow-sm",
              availabilityKPIs.closedDates > 0 ? "border-warning/30 bg-warning/5" : "border-border bg-card"
            )}>
              <div className={cn("flex items-center gap-1.5", availabilityKPIs.closedDates > 0 ? "text-warning" : "text-muted-foreground")}>
                <XCircle className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Closed Dates</span>
              </div>
              <p className={cn("mt-2 text-2xl font-bold tabular-nums", availabilityKPIs.closedDates > 0 ? "text-warning" : "text-muted-foreground")}>
                {availabilityKPIs.closedDates}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Across all channels</p>
            </div>

            <div className={cn(
              "rounded-xl border p-4 shadow-sm",
              availabilityKPIs.lowInventoryRooms > 0 ? "border-warning/20 bg-warning/5" : "border-border bg-card"
            )}>
              <div className={cn("flex items-center gap-1.5", availabilityKPIs.lowInventoryRooms > 0 ? "text-warning" : "text-muted-foreground")}>
                <MinusCircle className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Low Inventory</span>
              </div>
              <p className={cn("mt-2 text-2xl font-bold tabular-nums", availabilityKPIs.lowInventoryRooms > 0 ? "text-warning" : "text-muted-foreground")}>
                {availabilityKPIs.lowInventoryRooms}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Room-date combos</p>
            </div>

            <div className={cn(
              "rounded-xl border p-4 shadow-sm",
              availabilityKPIs.channelsWithSellabilityIssues > 0 ? "border-critical/20 bg-critical/5" : "border-border bg-card"
            )}>
              <div className={cn("flex items-center gap-1.5", availabilityKPIs.channelsWithSellabilityIssues > 0 ? "text-critical" : "text-muted-foreground")}>
                <Ban className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Not Sellable</span>
              </div>
              <p className={cn("mt-2 text-2xl font-bold tabular-nums", availabilityKPIs.channelsWithSellabilityIssues > 0 ? "text-critical" : "text-muted-foreground")}>
                {availabilityKPIs.channelsWithSellabilityIssues}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Channels blocked</p>
            </div>

            <div className={cn(
              "rounded-xl border p-4 shadow-sm",
              availabilityKPIs.staleSyncs > 0 ? "border-warning/20 bg-warning/5" : "border-border bg-card"
            )}>
              <div className={cn("flex items-center gap-1.5", availabilityKPIs.staleSyncs > 0 ? "text-warning" : "text-muted-foreground")}>
                <Clock className="h-3.5 w-3.5" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Stale Syncs</span>
              </div>
              <p className={cn("mt-2 text-2xl font-bold tabular-nums", availabilityKPIs.staleSyncs > 0 ? "text-warning" : "text-muted-foreground")}>
                {availabilityKPIs.staleSyncs}
              </p>
              <p className="mt-0.5 text-[10px] text-muted-foreground">Need refresh</p>
            </div>
          </div>
        </section>

        {/* Availability Grid / Calendar Matrix */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-foreground">Availability Matrix</h2>
                <p className="text-[11px] text-muted-foreground">Next 14 days by property, room type, and channel</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {/* Legend */}
              <div className="flex items-center gap-2 text-[10px]">
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-sm bg-success/80" />
                  <span className="text-muted-foreground">Open</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-sm bg-warning/80" />
                  <span className="text-muted-foreground">Low</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-sm bg-critical/80" />
                  <span className="text-muted-foreground">Closed</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/60" />
                  <span className="text-muted-foreground">Sold</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="h-2.5 w-2.5 rounded-sm bg-info/60" />
                  <span className="text-muted-foreground">Restricted</span>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px]">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="sticky left-0 z-10 bg-muted/30 px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground w-[200px]">
                      Property / Room / Channel
                    </th>
                    <th className="px-2 py-2.5 text-center text-[10px] font-medium text-muted-foreground w-10">
                      Sync
                    </th>
                    {next14Days.map(day => (
                      <th 
                        key={day.date} 
                        className={cn(
                          "px-1 py-2 text-center min-w-[36px]",
                          day.isWeekend && "bg-muted/20"
                        )}
                      >
                        <div className="text-[9px] font-medium text-muted-foreground">{day.dayName}</div>
                        <div className="text-[11px] font-semibold text-foreground">{day.dayNum}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {propertyRoomAvailability.map((item, propIdx) => (
                    <>
                      {/* Property Header Row */}
                      <tr key={`prop-${item.property.id}`} className="border-b border-border/50 bg-muted/10">
                        <td colSpan={2 + next14Days.length} className="sticky left-0 z-10 bg-muted/10 px-4 py-2">
                          <Link href={`/properties/${item.property.id}`} className="flex items-center gap-2 hover:text-info transition-colors">
                            <StatusDot status={item.property.healthStatus} />
                            <span className="text-[12px] font-semibold text-foreground">{item.property.name}</span>
                            <span className="text-[10px] text-muted-foreground">{item.property.location}</span>
                            <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto" />
                          </Link>
                        </td>
                      </tr>
                      {/* Room Type and Channel Rows */}
                      {item.roomTypes.map((room, roomIdx) => (
                        room.channels.map((channel, channelIdx) => (
                          <tr 
                            key={`${item.property.id}-${room.roomType}-${channel.channelId}`} 
                            className={cn(
                              "border-b border-border/30 hover:bg-muted/20 transition-colors",
                              channelIdx === room.channels.length - 1 && roomIdx === item.roomTypes.length - 1 && "border-b-border/50"
                            )}
                          >
                            <td className="sticky left-0 z-10 bg-card px-4 py-1.5">
                              <div className="flex items-center gap-2 pl-4">
                                {channelIdx === 0 && (
                                  <span className="text-[11px] font-medium text-foreground">{room.roomType}</span>
                                )}
                                {channelIdx > 0 && <span className="text-[11px] text-transparent">{room.roomType}</span>}
                                <span className="text-[10px] text-muted-foreground">·</span>
                                <span className="text-[10px] text-muted-foreground">{channel.channelName}</span>
                              </div>
                            </td>
                            <td className="px-2 py-1.5 text-center">
                              <RefreshCw className={cn("h-3 w-3 mx-auto", getSyncStatusColor(channel.dates[0]?.syncStatus || 'missing'))} />
                            </td>
                            {channel.dates.map((day, dayIdx) => (
                              <td 
                                key={day.date} 
                                className={cn(
                                  "px-1 py-1.5 text-center",
                                  next14Days[dayIdx]?.isWeekend && "bg-muted/10"
                                )}
                              >
                                <div 
                                  className={cn(
                                    "mx-auto h-5 w-5 rounded flex items-center justify-center text-[8px] font-bold text-white cursor-default",
                                    getStatusColor(day.status)
                                  )}
                                  title={`${getStatusLabel(day.status)} - ${day.inventory} units`}
                                >
                                  {day.status === 'open' || day.status === 'low-inventory' ? day.inventory : ''}
                                </div>
                              </td>
                            ))}
                          </tr>
                        ))
                      ))}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Channel Availability Matrix */}
        <section className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-muted">
              <Layers className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-foreground">Channel Availability Health</h2>
              <p className="text-[11px] text-muted-foreground">Property sellability status across all OTA channels</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">Property</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-muted-foreground">Channel</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-medium text-muted-foreground">Mapped</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-medium text-muted-foreground">Inventory</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-medium text-muted-foreground">Rate Plan</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-medium text-muted-foreground">Sellable</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-medium text-muted-foreground">Open</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-medium text-muted-foreground">Closed</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-medium text-muted-foreground">Restricted</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-medium text-muted-foreground">Sync</th>
                    <th className="px-4 py-2.5 text-left text-[10px] font-medium text-muted-foreground">Issues</th>
                  </tr>
                </thead>
                <tbody>
                  {propertyChannelMatrix.map(({ property, channels }) => (
                    channels.map((channel, idx) => (
                      <tr 
                        key={channel.id} 
                        className={cn(
                          "border-b border-border/30 hover:bg-muted/20 transition-colors",
                          idx === channels.length - 1 && "border-b-border/50"
                        )}
                      >
                        <td className="px-4 py-2.5">
                          {idx === 0 && (
                            <Link href={`/properties/${property.id}`} className="flex items-center gap-2 hover:text-info transition-colors">
                              <StatusDot status={property.healthStatus} />
                              <span className="text-[12px] font-medium text-foreground">{property.name}</span>
                            </Link>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          <span className="text-[11px] text-foreground">{channel.channelName}</span>
                        </td>
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
                        <td className="px-3 py-2.5 text-center">
                          {channel.sellable ? (
                            <span className="inline-flex items-center rounded-full bg-success/15 px-2 py-0.5 text-[10px] font-semibold text-success">
                              Yes
                            </span>
                          ) : (
                            <span className="inline-flex items-center rounded-full bg-critical/15 px-2 py-0.5 text-[10px] font-semibold text-critical">
                              No
                            </span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={cn(
                            "text-[12px] font-bold tabular-nums",
                            channel.openDates > 0 ? "text-success" : "text-muted-foreground"
                          )}>
                            {channel.openDates}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={cn(
                            "text-[12px] font-bold tabular-nums",
                            channel.closedDates > 0 ? "text-critical" : "text-muted-foreground"
                          )}>
                            {channel.closedDates}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <span className={cn(
                            "text-[12px] font-bold tabular-nums",
                            channel.restrictedDates > 0 ? "text-warning" : "text-muted-foreground"
                          )}>
                            {channel.restrictedDates}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <RefreshCw className={cn("h-3 w-3", getSyncStatusColor(channel.syncStatus))} />
                            {channel.lastSyncAt && (
                              <span className="text-[9px] text-muted-foreground">
                                {formatDistanceToNow(new Date(channel.lastSyncAt), { addSuffix: false })}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-2.5">
                          {channel.issueSummary ? (
                            <span className="text-[10px] text-warning">{channel.issueSummary}</span>
                          ) : (
                            <span className="text-[10px] text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Actionable Exceptions List */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "flex h-7 w-7 items-center justify-center rounded-md",
                criticalIssues.length > 0 || highIssues.length > 0 ? "bg-critical/10" : "bg-warning/10"
              )}>
                <AlertCircle className={cn(
                  "h-4 w-4",
                  criticalIssues.length > 0 || highIssues.length > 0 ? "text-critical" : "text-warning"
                )} />
              </div>
              <div>
                <h2 className="text-[13px] font-semibold text-foreground">Sellability Issues</h2>
                <p className="text-[11px] text-muted-foreground">Prioritized exceptions requiring action</p>
              </div>
            </div>
            {activeIssues.length > 0 && (
              <span className={cn(
                "rounded-full px-2.5 py-1 text-[11px] font-semibold",
                criticalIssues.length > 0 ? "bg-critical/15 text-critical" : "bg-warning/15 text-warning"
              )}>
                {activeIssues.length} active
              </span>
            )}
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            {activeIssues.length === 0 ? (
              <div className="flex items-center justify-center gap-2 py-10 text-[11px] text-success">
                <CheckCircle2 className="h-5 w-5" />
                <span className="font-medium">No sellability issues detected</span>
              </div>
            ) : (
              <div>
                {sellabilityIssues
                  .filter(i => i.status === 'active' || i.status === 'acknowledged')
                  .sort((a, b) => {
                    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
                    return severityOrder[a.severity] - severityOrder[b.severity];
                  })
                  .map((issue) => (
                    <div 
                      key={issue.id} 
                      className={cn(
                        "flex items-start gap-4 border-b border-border/50 px-5 py-4 transition-colors last:border-0 hover:bg-muted/20",
                        issue.severity === 'critical' && "bg-critical/5"
                      )}
                    >
                      <div className={cn(
                        "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                        issue.severity === 'critical' && "bg-critical/20",
                        issue.severity === 'high' && "bg-warning/20",
                        issue.severity === 'medium' && "bg-info/20",
                        issue.severity === 'low' && "bg-muted"
                      )}>
                        <AlertTriangle className={cn(
                          "h-3.5 w-3.5",
                          issue.severity === 'critical' && "text-critical",
                          issue.severity === 'high' && "text-warning",
                          issue.severity === 'medium' && "text-info",
                          issue.severity === 'low' && "text-muted-foreground"
                        )} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[12px] font-semibold text-foreground">{issue.title}</span>
                          <StatusBadge status={issue.severity} size="xs" />
                          {issue.status === 'acknowledged' && (
                            <span className="rounded-full bg-info/15 px-1.5 py-0.5 text-[9px] font-medium text-info">
                              Acknowledged
                            </span>
                          )}
                        </div>
                        <div className="mt-1 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <span className="font-medium text-foreground">{issue.propertyName}</span>
                          {issue.channelName && (
                            <>
                              <span>·</span>
                              <span>{issue.channelName}</span>
                            </>
                          )}
                          {issue.roomType && (
                            <>
                              <span>·</span>
                              <span>{issue.roomType}</span>
                            </>
                          )}
                          {issue.dateRange && (
                            <>
                              <span>·</span>
                              <span>{issue.dateRange}</span>
                            </>
                          )}
                        </div>
                        <p className="mt-1.5 text-[11px] text-muted-foreground">{issue.description}</p>
                        <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>Last seen {formatDistanceToNow(new Date(issue.lastSeen), { addSuffix: true })}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Link href={`/properties/${issue.propertyId}`}>
                          <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[10px]">
                            <Eye className="h-3 w-3" />
                            View Property
                          </Button>
                        </Link>
                        {issue.channelId && (
                          <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[10px]">
                            <ExternalLink className="h-3 w-3" />
                            Open Channel
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
