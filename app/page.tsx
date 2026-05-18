'use client';

import * as React from 'react';
import Link from 'next/link';
import { format, formatDistanceToNow } from 'date-fns';
import { DashboardLayout } from '@/components/dashboard/layout';
import { PageHeader, PageMetaItem } from '@/components/dashboard/page-header';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { Button } from '@/components/ui/button';
import { cn, formatVND } from '@/lib/utils';
import {
  properties,
  bookingEvents,
  priceCaptures,
  availabilitySnapshots,
  alerts,
  overviewKPIs,
} from '@/lib/mock-data';
import type { AvailabilitySnapshot, AvailabilityStatus, RestrictionType } from '@/lib/types';
import {
  Building2,
  CalendarRange,
  ChevronRight,
  TrendingUp,
  Banknote,
  Percent,
  BedDouble,
  CalendarCheck,
  Monitor,
  Smartphone,
  ArrowLeftRight,
  AlertTriangle,
  Clock3,
} from 'lucide-react';

type EditableAvailabilityCell = {
  inventoryCount: number;
  availabilityStatus: AvailabilityStatus;
  restrictionType: RestrictionType;
  price: number;
};

const channelTone: Record<string, string> = {
  booking: 'bg-info/10 text-info',
  agoda: 'bg-success/10 text-success',
  airbnb: 'bg-warning/10 text-warning',
};

export default function OverviewPage() {
  const activeProperties = properties.filter((property) => property.onboardingStatus !== 'draft');
  const [selectedPropertyId, setSelectedPropertyId] = React.useState(activeProperties[0]?.id ?? properties[0]?.id ?? '');

  const selectedProperty = React.useMemo(
    () => properties.find((property) => property.id === selectedPropertyId) ?? properties[0],
    [selectedPropertyId]
  );

  const propertyBookings = React.useMemo(
    () => bookingEvents.filter((booking) => booking.propertyId === selectedProperty?.id),
    [selectedProperty]
  );

  const propertyCaptures = React.useMemo(
    () => priceCaptures.filter((capture) => capture.propertyId === selectedProperty?.id),
    [selectedProperty]
  );

  const propertyAlerts = React.useMemo(
    () => alerts.filter((alert) => alert.propertyId === selectedProperty?.id && alert.status === 'active'),
    [selectedProperty]
  );

  const propertyAvailability = React.useMemo(
    () => availabilitySnapshots.filter((snapshot) => snapshot.propertyId === selectedProperty?.id),
    [selectedProperty]
  );

  const calendarDates = React.useMemo(
    () => Array.from(new Set(propertyAvailability.map((snapshot) => snapshot.date))).sort(),
    [propertyAvailability]
  );

  const calendarSeed = React.useMemo(() => {
    const seed: Record<string, EditableAvailabilityCell> = {};
    propertyAvailability.forEach((snapshot) => {
      const matchingRoom = selectedProperty?.rooms.find((room) => room.name === snapshot.roomType);
      seed[snapshot.id] = {
        inventoryCount: snapshot.inventoryCount,
        availabilityStatus: snapshot.availabilityStatus,
        restrictionType: snapshot.restrictionType,
        price: matchingRoom?.sellingPrice ?? 0,
      };
    });
    return seed;
  }, [propertyAvailability, selectedProperty]);

  const [calendarState, setCalendarState] = React.useState<Record<string, EditableAvailabilityCell>>({});

  React.useEffect(() => {
    setCalendarState(calendarSeed);
  }, [calendarSeed]);

  const groupedCalendarRows = React.useMemo(() => {
    const map = new Map<string, AvailabilitySnapshot[]>();
    propertyAvailability.forEach((snapshot) => {
      const key = `${snapshot.roomType}|||${snapshot.channelId}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(snapshot);
    });
    return Array.from(map.entries())
      .map(([key, snapshots]) => {
        const [roomType, channelId] = key.split('|||');
        const orderedSnapshots = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
        return {
          key,
          roomType,
          channelId,
          channelName: orderedSnapshots[0]?.channelName ?? '',
          snapshots: orderedSnapshots,
        };
      })
      .sort((a, b) => a.roomType.localeCompare(b.roomType) || a.channelName.localeCompare(b.channelName));
  }, [propertyAvailability]);

  const priceMappingRows = React.useMemo(() => {
    const groups = new Map<string, { roomType: string; channelId: string; channelName: string; stayDate: string; desktop?: number; mobile?: number; referencePrice: number; }>();

    propertyCaptures.forEach((capture) => {
      const key = `${capture.roomType}|||${capture.channelId}|||${capture.stayDate}`;
      if (!groups.has(key)) {
        groups.set(key, {
          roomType: capture.roomType,
          channelId: capture.channelId,
          channelName: capture.channelName,
          stayDate: capture.stayDate,
          referencePrice: capture.referencePrice,
        });
      }
      const row = groups.get(key)!;
      if (capture.deviceType === 'desktop') row.desktop = capture.displayPrice;
      if (capture.deviceType === 'mobile') row.mobile = capture.displayPrice;
    });

    return Array.from(groups.values())
      .map((row) => {
        const delta = row.desktop != null && row.mobile != null ? row.mobile - row.desktop : null;
        const deltaPercent = row.desktop && row.mobile != null ? (delta! / row.desktop) * 100 : null;
        return { ...row, delta, deltaPercent };
      })
      .sort((a, b) => {
        const aSeverity = Math.abs(a.deltaPercent ?? 0);
        const bSeverity = Math.abs(b.deltaPercent ?? 0);
        return bSeverity - aSeverity;
      });
  }, [propertyCaptures]);

  const revenueByRoom = React.useMemo(() => {
    const grouped = new Map<string, { roomType: string; bookings: number; grossAmount: number; roomNights: number }>();
    propertyBookings.forEach((booking) => {
      const roomType = booking.roomType || 'Unknown Room';
      if (!grouped.has(roomType)) {
        grouped.set(roomType, { roomType, bookings: 0, grossAmount: 0, roomNights: 0 });
      }
      const item = grouped.get(roomType)!;
      item.bookings += 1;
      item.grossAmount += booking.grossAmount;
      item.roomNights += booking.roomNights;
    });
    return Array.from(grouped.values()).sort((a, b) => b.grossAmount - a.grossAmount);
  }, [propertyBookings]);

  const channelRevenue = React.useMemo(() => {
    const grouped = new Map<string, { channelName: string; grossAmount: number; bookings: number }>();
    propertyBookings.forEach((booking) => {
      if (!grouped.has(booking.channelId)) {
        grouped.set(booking.channelId, { channelName: booking.channelName, grossAmount: 0, bookings: 0 });
      }
      const item = grouped.get(booking.channelId)!;
      item.grossAmount += booking.grossAmount;
      item.bookings += 1;
    });
    return Array.from(grouped.values()).sort((a, b) => b.grossAmount - a.grossAmount);
  }, [propertyBookings]);

  const propertyKpis = React.useMemo(() => {
    if (!selectedProperty) return null;
    const desktopMobileDiffCount = priceMappingRows.filter((row) => row.deltaPercent != null && Math.abs(row.deltaPercent) > 0).length;
    return {
      grossRevenue: selectedProperty.grossRevenue,
      netRevenue: selectedProperty.netRevenue,
      otaCommission: selectedProperty.otaCommission,
      roomNightsSold: selectedProperty.roomNightsSold,
      activeAlerts: propertyAlerts.length,
      desktopMobileDiffCount,
    };
  }, [selectedProperty, propertyAlerts, priceMappingRows]);

  const updateCalendarCell = (
    snapshotId: string,
    field: keyof EditableAvailabilityCell,
    value: string
  ) => {
    setCalendarState((prev) => ({
      ...prev,
      [snapshotId]: {
        ...prev[snapshotId],
        [field]: field === 'inventoryCount' || field === 'price' ? Number(value) : value,
      },
    }));
  };

  if (!selectedProperty || !propertyKpis) {
    return (
      <DashboardLayout>
        <div className="p-6 text-sm text-muted-foreground">No property available.</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Property-first workspace"
          title="Overview"
          description="Keep overview focused on revenue, live availability control, and OTA price mapping. Every block below is scoped to a selected property."
          meta={
            <>
              <PageMetaItem label="Portfolio GBV" value={formatVND(overviewKPIs.grossBookingValue, true)} />
              <PageMetaItem label="Selected property" value={selectedProperty.name} />
              <PageMetaItem label="Active alerts" value={propertyKpis.activeAlerts} tone={propertyKpis.activeAlerts > 0 ? 'critical' : 'default'} />
              <PageMetaItem label="Parity gaps" value={propertyKpis.desktopMobileDiffCount} tone={propertyKpis.desktopMobileDiffCount > 0 ? 'warning' : 'default'} />
            </>
          }
          actions={
            <div className="flex items-center gap-2">
              <select
                value={selectedPropertyId}
                onChange={(event) => setSelectedPropertyId(event.target.value)}
                className="h-9 rounded-md border border-border bg-background px-3 text-[12px] text-foreground outline-none"
              >
                {activeProperties.map((property) => (
                  <option key={property.id} value={property.id}>
                    {property.name}
                  </option>
                ))}
              </select>
              <Link href={`/properties/${selectedProperty.id}`}>
                <Button variant="outline" size="sm" className="h-9 gap-1.5 text-[11px]">
                  <Building2 className="h-3.5 w-3.5" />
                  Property detail
                </Button>
              </Link>
            </div>
          }
        />

        <section className="space-y-4 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-success/10">
              <TrendingUp className="h-4 w-4 text-success" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-foreground">Revenue Performance</h2>
              <p className="text-[11px] text-muted-foreground">Keep the top strip simple and property-led.</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Banknote className="h-4 w-4" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Gross Revenue</span>
              </div>
              <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">{formatVND(propertyKpis.grossRevenue, true)}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">{selectedProperty.currency} equivalent</p>
            </div>
            <div className="rounded-xl border border-success/20 bg-success/5 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-success">
                <TrendingUp className="h-4 w-4" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Net Revenue</span>
              </div>
              <p className="mt-3 text-3xl font-bold tabular-nums text-success">{formatVND(propertyKpis.netRevenue, true)}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">After OTA costs</p>
            </div>
            <div className="rounded-xl border border-warning/20 bg-warning/5 p-5 shadow-sm">
              <div className="flex items-center gap-2 text-warning">
                <Percent className="h-4 w-4" />
                <span className="text-[10px] font-medium uppercase tracking-wide">OTA Commission</span>
              </div>
              <p className="mt-3 text-3xl font-bold tabular-nums text-warning">{formatVND(propertyKpis.otaCommission, true)}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Commission leakage check</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <BedDouble className="h-4 w-4" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Room Nights</span>
              </div>
              <p className="mt-3 text-3xl font-bold tabular-nums text-foreground">{propertyKpis.roomNightsSold}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">Sold on this property</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="flex items-center gap-2 text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-[10px] font-medium uppercase tracking-wide">Active Alerts</span>
              </div>
              <p className={cn(
                'mt-3 text-3xl font-bold tabular-nums',
                propertyKpis.activeAlerts > 0 ? 'text-critical' : 'text-foreground'
              )}>
                {propertyKpis.activeAlerts}
              </p>
              <p className="mt-1 text-[10px] text-muted-foreground">Property-scoped only</p>
            </div>
          </div>
        </section>

        <section className="space-y-4 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-muted">
              <Banknote className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-foreground">Revenue Breakdown & Activity</h2>
              <p className="text-[11px] text-muted-foreground">Keep only the revenue blocks that matter and tie them back to rooms/channels.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 xl:grid-cols-12">
            <div className="xl:col-span-5 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-[13px] font-semibold text-foreground">Revenue by Room Type</span>
                <span className="text-[11px] text-muted-foreground">{selectedProperty.rooms.length} configured rooms</span>
              </div>
              <div>
                {revenueByRoom.length === 0 ? (
                  <div className="px-5 py-10 text-center text-[11px] text-muted-foreground">No booking activity yet.</div>
                ) : (
                  revenueByRoom.map((room) => {
                    const maxGross = revenueByRoom[0]?.grossAmount || 1;
                    const width = (room.grossAmount / maxGross) * 100;
                    return (
                      <div key={room.roomType} className="border-b border-border/50 px-5 py-3 last:border-0">
                        <div className="flex items-center justify-between gap-3">
                          <div className="min-w-0">
                            <p className="truncate text-[12px] font-medium text-foreground">{room.roomType}</p>
                            <p className="text-[10px] text-muted-foreground">{room.bookings} booking(s) · {room.roomNights} room nights</p>
                          </div>
                          <p className="text-[12px] font-bold tabular-nums text-foreground">{formatVND(room.grossAmount, true)}</p>
                        </div>
                        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                          <div className="h-full rounded-full bg-info" style={{ width: `${width}%` }} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            <div className="xl:col-span-3 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-[13px] font-semibold text-foreground">Channel Contribution</span>
                <Link href="/bookings" className="flex items-center gap-0.5 text-[11px] text-muted-foreground hover:text-foreground">
                  Bookings
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="p-5 space-y-3">
                {channelRevenue.map((channel) => (
                  <div key={channel.channelName} className="rounded-lg border border-border/60 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] font-medium text-foreground">{channel.channelName}</span>
                      <span className="text-[12px] font-bold tabular-nums text-foreground">{formatVND(channel.grossAmount, true)}</span>
                    </div>
                    <p className="mt-1 text-[10px] text-muted-foreground">{channel.bookings} booking(s)</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="xl:col-span-4 rounded-xl border border-border bg-card shadow-sm">
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <span className="text-[13px] font-semibold text-foreground">Recent Activity</span>
                <span className="text-[11px] text-muted-foreground">Property only</span>
              </div>
              <div>
                {propertyBookings.slice(0, 5).map((booking) => (
                  <div key={booking.id} className="flex items-center gap-3 border-b border-border/50 px-5 py-3 last:border-0">
                    <StatusDot
                      status={booking.verificationStatus === 'parsed' || booking.verificationStatus === 'verified-by-screenshot' ? 'healthy' : booking.verificationStatus === 'link-only' || booking.verificationStatus === 'needs-admin-review' ? 'warning' : 'critical'}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[12px] font-medium text-foreground">{booking.channelName}</span>
                        <span className="text-[10px] text-muted-foreground">·</span>
                        <span className="text-[10px] text-muted-foreground">{booking.roomType || 'Unknown room'}</span>
                      </div>
                      <p className="truncate text-[10px] text-muted-foreground">{booking.bookingRef} · {formatDistanceToNow(new Date(booking.eventTime), { addSuffix: true })}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-bold tabular-nums text-foreground">{formatVND(booking.grossAmount, true)}</p>
                      <p className="text-[9px] text-muted-foreground">{booking.eventType}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="space-y-4 px-5">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-info/10">
              <CalendarRange className="h-4 w-4 text-info" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-foreground">Availability Calendar</h2>
              <p className="text-[11px] text-muted-foreground">Editable inventory/status/restriction inputs by property → room → OTA channel.</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <div className="flex items-center gap-2">
                <CalendarCheck className="h-4 w-4 text-info" />
                <span className="text-[13px] font-semibold text-foreground">{selectedProperty.name}</span>
                <StatusBadge status={selectedProperty.healthStatus} size="xs" />
              </div>
              <span className="text-[11px] text-muted-foreground">{calendarDates.length} live dates</span>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-[1280px] w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/25">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Room / Channel</th>
                    {calendarDates.map((date) => (
                      <th key={date} className="min-w-[148px] border-l border-border/50 px-2 py-3 text-left">
                        <div className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">{format(new Date(date), 'MMM d')}</div>
                        <div className="text-[10px] text-muted-foreground">{format(new Date(date), 'EEE')}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {groupedCalendarRows.map((row) => (
                    <tr key={row.key} className="border-b border-border/50 align-top last:border-0">
                      <td className="px-4 py-3">
                        <div className="space-y-1">
                          <p className="text-[12px] font-semibold text-foreground">{row.roomType}</p>
                          <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium', channelTone[row.channelId] ?? 'bg-muted text-muted-foreground')}>
                            {row.channelName}
                          </span>
                        </div>
                      </td>
                      {row.snapshots.map((snapshot) => {
                        const state = calendarState[snapshot.id];
                        return (
                          <td key={snapshot.id} className="border-l border-border/50 px-2 py-3">
                            <div className="space-y-2 rounded-lg border border-border/60 bg-background p-2.5">
                              <div>
                                <label className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Inventory</label>
                                <input
                                  type="number"
                                  value={state?.inventoryCount ?? 0}
                                  onChange={(event) => updateCalendarCell(snapshot.id, 'inventoryCount', event.target.value)}
                                  className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Rate</label>
                                <input
                                  type="number"
                                  value={state?.price ?? 0}
                                  onChange={(event) => updateCalendarCell(snapshot.id, 'price', event.target.value)}
                                  className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground outline-none"
                                />
                              </div>
                              <div>
                                <label className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Status</label>
                                <select
                                  value={state?.availabilityStatus ?? 'open'}
                                  onChange={(event) => updateCalendarCell(snapshot.id, 'availabilityStatus', event.target.value)}
                                  className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground outline-none"
                                >
                                  <option value="open">Open</option>
                                  <option value="low-inventory">Low inventory</option>
                                  <option value="closed">Closed</option>
                                  <option value="sold-out">Sold out</option>
                                  <option value="restricted">Restricted</option>
                                  <option value="unknown">Unknown</option>
                                </select>
                              </div>
                              <div>
                                <label className="text-[9px] font-medium uppercase tracking-wide text-muted-foreground">Restriction</label>
                                <select
                                  value={state?.restrictionType ?? 'none'}
                                  onChange={(event) => updateCalendarCell(snapshot.id, 'restrictionType', event.target.value)}
                                  className="mt-1 h-8 w-full rounded border border-border bg-background px-2 text-[11px] text-foreground outline-none"
                                >
                                  <option value="none">None</option>
                                  <option value="min-los">Min LOS</option>
                                  <option value="max-los">Max LOS</option>
                                  <option value="cta">CTA</option>
                                  <option value="ctd">CTD</option>
                                  <option value="advance-booking">Advance booking</option>
                                  <option value="closed-to-arrival">Closed to arrival</option>
                                  <option value="closed-to-departure">Closed to departure</option>
                                </select>
                              </div>
                            </div>
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="space-y-4 px-5 pb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-md bg-warning/10">
              <ArrowLeftRight className="h-4 w-4 text-warning" />
            </div>
            <div>
              <h2 className="text-[13px] font-semibold text-foreground">Price Mapping</h2>
              <p className="text-[11px] text-muted-foreground">Show desktop price, mobile price, and variance clearly per OTA channel. Logic stays property-scoped.</p>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="text-[13px] font-semibold text-foreground">OTA Display Parity</span>
              <span className="text-[11px] text-muted-foreground">{priceMappingRows.length} comparison row(s)</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px]">
                <thead>
                  <tr className="border-b border-border bg-muted/25">
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Room</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">OTA Channel</th>
                    <th className="px-4 py-3 text-left text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Stay Date</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Desktop</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Mobile</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Reference</th>
                    <th className="px-4 py-3 text-right text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Delta %</th>
                  </tr>
                </thead>
                <tbody>
                  {priceMappingRows.map((row) => (
                    <tr key={`${row.roomType}-${row.channelId}-${row.stayDate}`} className="border-b border-border/50 last:border-0 hover:bg-muted/20">
                      <td className="px-4 py-3 text-[12px] font-medium text-foreground">{row.roomType}</td>
                      <td className="px-4 py-3">
                        <span className={cn('inline-flex rounded-full px-2 py-0.5 text-[10px] font-medium', channelTone[row.channelId] ?? 'bg-muted text-muted-foreground')}>
                          {row.channelName}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-[11px] text-muted-foreground">{format(new Date(row.stayDate), 'MMM d, yyyy')}</td>
                      <td className="px-4 py-3 text-right text-[12px] font-medium tabular-nums text-foreground">
                        <span className="inline-flex items-center gap-1"><Monitor className="h-3.5 w-3.5 text-muted-foreground" />{row.desktop != null ? formatVND(row.desktop) : '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-[12px] font-medium tabular-nums text-foreground">
                        <span className="inline-flex items-center gap-1"><Smartphone className="h-3.5 w-3.5 text-muted-foreground" />{row.mobile != null ? formatVND(row.mobile) : '—'}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-[12px] tabular-nums text-muted-foreground">{formatVND(row.referencePrice)}</td>
                      <td className="px-4 py-3 text-right">
                        {row.deltaPercent == null ? (
                          <span className="text-[11px] text-muted-foreground">—</span>
                        ) : (
                          <span className={cn(
                            'text-[12px] font-semibold tabular-nums',
                            Math.abs(row.deltaPercent) >= 10 ? 'text-critical' : Math.abs(row.deltaPercent) >= 5 ? 'text-warning' : 'text-success'
                          )}>
                            {row.deltaPercent > 0 ? '+' : ''}{row.deltaPercent.toFixed(1)}%
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between border-t border-border bg-muted/15 px-5 py-3 text-[11px] text-muted-foreground">
              <div className="flex items-center gap-2">
                <Clock3 className="h-3.5 w-3.5" />
                <span>Desktop/mobile parity rows are grouped by property + room + channel + stay date.</span>
              </div>
              <Link href="/price-monitor" className="flex items-center gap-1 text-foreground hover:underline">
                Open full Price Monitor
                <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
