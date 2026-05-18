'use client';

import * as React from 'react';
import Link from 'next/link';
import { Calendar, ChevronDown, ChevronRight, RefreshCw } from 'lucide-react';
import { StatusDot } from '@/components/dashboard/status-badge';
import { cn, getRollingDates, formatSyncAge } from '@/lib/utils';
import type { AvailabilityStatus, SyncFreshnessStatus, Property } from '@/lib/types';

interface AvailabilityMatrixProps {
  propertyRoomAvailability: Array<{
    property: Property;
    roomTypes: Array<{
      roomType: string;
      channels: Array<{
        channelId: string;
        channelName: string;
        dates: Array<{
          date: string;
          status: AvailabilityStatus;
          inventory: number;
          syncStatus: SyncFreshnessStatus;
        }>;
      }>;
    }>;
  }>;
  daysToShow?: number;
  title?: string;
  subtitle?: string;
}

function getStatusColor(status: AvailabilityStatus): string {
  switch (status) {
    case 'open': return 'bg-success';
    case 'low-inventory': return 'bg-warning';
    case 'closed': return 'bg-critical';
    case 'sold-out': return 'bg-muted-foreground';
    case 'restricted': return 'bg-info';
    case 'unknown': return 'bg-muted';
    default: return 'bg-muted';
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

function getSyncColor(status: SyncFreshnessStatus): string {
  switch (status) {
    case 'fresh': return 'text-success';
    case 'stale': return 'text-warning';
    case 'missing': return 'text-critical';
    default: return 'text-muted-foreground';
  }
}

function StatusCell({ 
  status, 
  inventory, 
  isWeekend,
  isToday,
}: { 
  status: AvailabilityStatus; 
  inventory: number;
  isWeekend: boolean;
  isToday: boolean;
}) {
  const showCount = status === 'open' || status === 'low-inventory';
  
  return (
    <td className={cn(
      "px-0.5 py-1",
      isWeekend && "bg-muted/30",
      isToday && "bg-info/10"
    )}>
      <div 
        className={cn(
          "mx-auto flex h-6 w-6 items-center justify-center rounded text-[9px] font-bold tabular-nums",
          getStatusColor(status),
          status === 'open' && "text-success-foreground",
          status === 'low-inventory' && "text-warning-foreground",
          status === 'closed' && "text-critical-foreground",
          status === 'sold-out' && "text-white/70",
          status === 'restricted' && "text-info-foreground",
          status === 'unknown' && "text-muted-foreground"
        )}
        title={`${getStatusLabel(status)}${showCount ? ` - ${inventory} units` : ''}`}
      >
        {showCount ? inventory : status === 'closed' ? '×' : status === 'restricted' ? 'R' : '–'}
      </div>
    </td>
  );
}

export function AvailabilityMatrix({
  propertyRoomAvailability,
  daysToShow = 14,
  title = 'Availability Matrix',
  subtitle,
}: AvailabilityMatrixProps) {
  const [expandedProperties, setExpandedProperties] = React.useState<Set<string>>(
    new Set(propertyRoomAvailability.map(p => p.property.id))
  );
  
  const rollingDates = getRollingDates(daysToShow);

  const toggleProperty = (propertyId: string) => {
    setExpandedProperties(prev => {
      const next = new Set(prev);
      if (next.has(propertyId)) {
        next.delete(propertyId);
      } else {
        next.add(propertyId);
      }
      return next;
    });
  };

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-[13px] font-semibold text-foreground">{title}</span>
          <span className="text-[11px] text-muted-foreground">{subtitle ?? `Next ${daysToShow} days`}</span>
        </div>
        
        {/* Legend */}
        <div className="flex items-center gap-3 text-[10px]">
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-success" />
            <span className="text-muted-foreground">Open</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-warning" />
            <span className="text-muted-foreground">Low</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-critical" />
            <span className="text-muted-foreground">Closed</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-muted-foreground" />
            <span className="text-muted-foreground">Sold</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="h-2.5 w-2.5 rounded-sm bg-info" />
            <span className="text-muted-foreground">Restricted</span>
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="sticky left-0 z-10 bg-muted/40 px-3 py-2 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground w-[220px] border-r border-border/50">
                  Property / Room / Channel
                </th>
                <th className="px-1.5 py-2 text-center text-[9px] font-medium text-muted-foreground w-10 border-r border-border/50">
                  Sync
                </th>
                {rollingDates.map((day, idx) => (
                  <th 
                    key={day.date} 
                    className={cn(
                      "px-0.5 py-1.5 text-center min-w-[32px]",
                      day.isWeekend && "bg-muted/30",
                      day.isToday && "bg-info/10",
                      idx === rollingDates.length - 1 && "border-r-0"
                    )}
                  >
                    <div className={cn(
                      "text-[9px] font-medium",
                      day.isToday ? "text-info" : "text-muted-foreground"
                    )}>
                      {day.dayName}
                    </div>
                    <div className={cn(
                      "text-[11px] font-semibold",
                      day.isToday ? "text-info" : "text-foreground"
                    )}>
                      {day.dayNum}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {propertyRoomAvailability.map((item) => {
                const isExpanded = expandedProperties.has(item.property.id);
                
                return (
                  <React.Fragment key={item.property.id}>
                    {/* Property Header Row */}
                    <tr className="bg-muted/20 hover:bg-muted/30 transition-colors">
                      <td 
                        colSpan={2 + rollingDates.length} 
                        className="sticky left-0 z-10 bg-muted/20 px-3 py-2 cursor-pointer"
                        onClick={() => toggleProperty(item.property.id)}
                      >
                        <div className="flex items-center gap-2">
                          {isExpanded ? (
                            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                          <StatusDot status={item.property.healthStatus} />
                          <Link 
                            href={`/properties/${item.property.id}`} 
                            className="text-[12px] font-semibold text-foreground hover:text-info transition-colors"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {item.property.name}
                          </Link>
                          <span className="text-[10px] text-muted-foreground">{item.property.location}</span>
                        </div>
                      </td>
                    </tr>
                    
                    {/* Room and Channel Rows */}
                    {isExpanded && item.roomTypes.map((room) => (
                      room.channels.map((channel, channelIdx) => (
                        <tr 
                          key={`${item.property.id}-${room.roomType}-${channel.channelId}`}
                          className="hover:bg-muted/10 transition-colors"
                        >
                          <td className="sticky left-0 z-10 bg-card px-3 py-1 border-r border-border/50">
                            <div className="flex items-center gap-2 pl-5">
                              {channelIdx === 0 ? (
                                <span className="text-[11px] font-medium text-foreground">{room.roomType}</span>
                              ) : (
                                <span className="text-[11px] text-transparent select-none">{room.roomType}</span>
                              )}
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <span className="text-[10px] text-muted-foreground">{channel.channelName}</span>
                            </div>
                          </td>
                          <td className="px-1.5 py-1 text-center border-r border-border/50">
                            <div className="flex items-center justify-center gap-1" title={`Sync: ${channel.dates[0]?.syncStatus || 'unknown'}`}>
                              <RefreshCw className={cn("h-3 w-3", getSyncColor(channel.dates[0]?.syncStatus || 'missing'))} />
                            </div>
                          </td>
                          {channel.dates.slice(0, daysToShow).map((day, dayIdx) => (
                            <StatusCell
                              key={day.date}
                              status={day.status}
                              inventory={day.inventory}
                              isWeekend={rollingDates[dayIdx]?.isWeekend || false}
                              isToday={rollingDates[dayIdx]?.isToday || false}
                            />
                          ))}
                        </tr>
                      ))
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
