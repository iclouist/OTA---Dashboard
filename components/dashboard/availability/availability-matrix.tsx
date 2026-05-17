'use client';

import * as React from 'react';
import { Calendar, ChevronRight, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { cn, generateRollingDates, formatSyncAge } from '@/lib/utils';
import { StatusDot } from '@/components/dashboard/status-badge';
import type { AvailabilitySnapshot, AvailabilityStatus, SyncFreshnessStatus, Property } from '@/lib/types';

interface AvailabilityMatrixProps {
  properties: Property[];
  snapshots: AvailabilitySnapshot[];
  days?: number;
}

function getStatusColor(status: AvailabilityStatus): string {
  switch (status) {
    case 'open': return 'bg-success';
    case 'low-inventory': return 'bg-warning';
    case 'closed': return 'bg-critical';
    case 'sold-out': return 'bg-muted-foreground/70';
    case 'restricted': return 'bg-info';
    case 'unknown': return 'bg-muted/60';
    default: return 'bg-muted/60';
  }
}

function getStatusLabel(status: AvailabilityStatus): string {
  switch (status) {
    case 'open': return 'Open';
    case 'low-inventory': return 'Low';
    case 'closed': return 'Closed';
    case 'sold-out': return 'Sold';
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

export function AvailabilityMatrix({ properties, snapshots, days = 14 }: AvailabilityMatrixProps) {
  const rollingDates = generateRollingDates(days);

  // Group availability by property and room type
  const propertyRoomAvailability = properties.map(property => {
    const propertyAvail = snapshots.filter(a => a.propertyId === property.id);
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
              syncStatus: channelAvail[0]?.syncStatus || 'missing' as SyncFreshnessStatus,
              lastUpdatedAt: channelAvail[0]?.lastUpdatedAt || '',
              dates: rollingDates.map(day => {
                const dayAvail = channelAvail.find(a => a.date === day.date);
                return {
                  date: day.date,
                  status: dayAvail?.availabilityStatus || 'unknown' as AvailabilityStatus,
                  inventory: dayAvail?.inventoryCount || 0,
                };
              }),
            };
          }),
        };
      }),
    };
  });

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-muted/80 ring-1 ring-border">
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">Availability Matrix</h2>
            <p className="text-[11px] text-muted-foreground">Next {days} days by property, room, and channel</p>
          </div>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-success" />
            <span className="text-muted-foreground">Open</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-warning" />
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-critical" />
            <span className="text-muted-foreground">Closed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-muted-foreground/70" />
            <span className="text-muted-foreground">Sold</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-info" />
            <span className="text-muted-foreground">Restricted</span>
          </div>
        </div>
      </div>

      {/* Matrix Table */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px]">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="sticky left-0 z-10 bg-muted/40 px-4 py-3 text-left text-[11px] font-semibold text-muted-foreground w-[200px]">
                  Property / Room / Channel
                </th>
                <th className="px-2 py-3 text-center text-[10px] font-medium text-muted-foreground w-12">
                  Sync
                </th>
                {rollingDates.map(day => (
                  <th 
                    key={day.date} 
                    className={cn(
                      "px-0.5 py-2 text-center min-w-[38px]",
                      day.isWeekend && "bg-muted/30",
                      day.isToday && "bg-info/10"
                    )}
                  >
                    <div className={cn(
                      "text-[9px] font-medium",
                      day.isToday ? "text-info" : "text-muted-foreground"
                    )}>
                      {day.dayName}
                    </div>
                    <div className={cn(
                      "text-[12px] font-semibold",
                      day.isToday ? "text-info" : "text-foreground"
                    )}>
                      {day.dayNum}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {propertyRoomAvailability.map((item) => (
                <React.Fragment key={`prop-${item.property.id}`}>
                  {/* Property Header Row */}
                  <tr className="border-b border-border/60 bg-muted/20">
                    <td colSpan={2 + rollingDates.length} className="sticky left-0 z-10 bg-muted/20 px-4 py-2.5">
                      <Link href={`/properties/${item.property.id}`} className="flex items-center gap-2 group">
                        <StatusDot status={item.property.healthStatus} />
                        <span className="text-[12px] font-semibold text-foreground group-hover:text-info transition-colors">
                          {item.property.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground">{item.property.location}</span>
                        <ChevronRight className="h-3 w-3 text-muted-foreground ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </td>
                  </tr>
                  
                  {/* Room Type and Channel Rows */}
                  {item.roomTypes.map((room, roomIdx) => (
                    room.channels.map((channel, channelIdx) => {
                      const syncInfo = formatSyncAge(channel.lastUpdatedAt);
                      return (
                        <tr 
                          key={`${item.property.id}-${room.roomType}-${channel.channelId}`} 
                          className={cn(
                            "border-b border-border/30 hover:bg-muted/30 transition-colors",
                            channelIdx === room.channels.length - 1 && roomIdx === item.roomTypes.length - 1 && "border-b-border/50"
                          )}
                        >
                          <td className="sticky left-0 z-10 bg-card px-4 py-1.5">
                            <div className="flex items-center gap-2 pl-4">
                              {channelIdx === 0 ? (
                                <span className="text-[11px] font-medium text-foreground">{room.roomType}</span>
                              ) : (
                                <span className="text-[11px] text-transparent select-none">{room.roomType}</span>
                              )}
                              <span className="text-[10px] text-muted-foreground/50">·</span>
                              <span className="text-[10px] text-muted-foreground">{channel.channelName}</span>
                            </div>
                          </td>
                          <td className="px-2 py-1.5 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <RefreshCw className={cn("h-3 w-3", getSyncStatusColor(syncInfo.status))} />
                              <span className={cn(
                                "text-[8px] font-medium",
                                syncInfo.status === 'fresh' ? 'text-success' : 
                                syncInfo.status === 'stale' ? 'text-warning' : 'text-critical'
                              )}>
                                {syncInfo.label}
                              </span>
                            </div>
                          </td>
                          {channel.dates.map((day, dayIdx) => (
                            <td 
                              key={day.date} 
                              className={cn(
                                "px-0.5 py-1.5 text-center",
                                rollingDates[dayIdx]?.isWeekend && "bg-muted/20",
                                rollingDates[dayIdx]?.isToday && "bg-info/5"
                              )}
                            >
                              <div 
                                className={cn(
                                  "mx-auto h-6 w-6 rounded-md flex items-center justify-center text-[9px] font-bold transition-all cursor-default",
                                  getStatusColor(day.status),
                                  day.status === 'open' || day.status === 'low-inventory' 
                                    ? 'text-white' 
                                    : day.status === 'closed' || day.status === 'sold-out'
                                    ? 'text-white'
                                    : 'text-white'
                                )}
                                title={`${getStatusLabel(day.status)} - ${day.inventory} units`}
                              >
                                {(day.status === 'open' || day.status === 'low-inventory') && day.inventory > 0 
                                  ? day.inventory 
                                  : day.status === 'closed' ? '×' 
                                  : day.status === 'sold-out' ? '−'
                                  : day.status === 'restricted' ? 'R'
                                  : '?'
                                }
                              </div>
                            </td>
                          ))}
                        </tr>
                      );
                    })
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
