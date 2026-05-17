'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { FilterBar, FilterConfig, ToolbarSeparator } from '@/components/dashboard/filter-bar';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { KPICard } from '@/components/dashboard/kpi-card';
import { InlineKPI } from '@/components/dashboard/kpi-card';
import { bookingEvents, properties } from '@/lib/mock-data';
import type { BookingEvent } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn, formatVND } from '@/lib/utils';
import { Download, BedDouble, Banknote, Percent, TrendingUp, AlertTriangle, Receipt } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';

const filterConfig: FilterConfig[] = [
  { id: 'search', label: 'Search', type: 'search', placeholder: 'Search bookings...' },
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
    options: [
      { value: 'booking', label: 'Booking.com' },
      { value: 'agoda', label: 'Agoda' },
      { value: 'airbnb', label: 'Airbnb' },
    ],
  },
  {
    id: 'verification',
    label: 'Verification',
    type: 'select',
    options: [
      { value: 'parsed', label: 'Parsed' },
      { value: 'link-only', label: 'Link Only' },
      { value: 'needs-admin-review', label: 'Needs Review' },
      { value: 'verified-by-screenshot', label: 'Screenshot Verified' },
      { value: 'stale', label: 'Stale' },
    ],
  },
];

export default function BookingsPage() {
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [selectedBooking, setSelectedBooking] = React.useState<BookingEvent | null>(null);

  const filteredBookings = React.useMemo(() => {
    return bookingEvents.filter((booking) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !booking.propertyName.toLowerCase().includes(search) &&
          !booking.bookingRef.toLowerCase().includes(search) &&
          !booking.channelName.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (filters.property && filters.property !== 'all') {
        if (booking.propertyId !== filters.property) return false;
      }
      if (filters.channel && filters.channel !== 'all') {
        if (booking.channelId !== filters.channel) return false;
      }
      if (filters.verification && filters.verification !== 'all') {
        if (booking.verificationStatus !== filters.verification) return false;
      }
      return true;
    });
  }, [filters]);

  const stats = React.useMemo(() => {
    const total = filteredBookings.length;
    const totalNights = filteredBookings.reduce((s, b) => s + b.roomNights, 0);
    const totalGross = filteredBookings.reduce((s, b) => s + b.grossAmount, 0);
    const totalCommission = filteredBookings.reduce((s, b) => s + b.commissionAmount, 0);
    const totalNet = filteredBookings.reduce((s, b) => s + b.netAmount, 0);
    const pendingVerification = filteredBookings.filter(
      (b) => b.verificationStatus === 'needs-admin-review' || b.verificationStatus === 'link-only' || b.verificationStatus === 'pending'
    ).length;
    return { total, totalNights, totalGross, totalCommission, totalNet, pendingVerification };
  }, [filteredBookings]);

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        {/* KPI Row */}
        <div className="border-b border-border bg-background px-3 py-2">
          <div className="grid grid-cols-3 gap-2 md:grid-cols-6">
            <KPICard title="Events" value={stats.total} icon={Receipt} />
            <KPICard title="Room Nights" value={stats.totalNights} icon={BedDouble} />
            <KPICard title="Gross Value" value={formatVND(stats.totalGross, true)} icon={Banknote} />
            <KPICard title="Commission" value={formatVND(stats.totalCommission, true)} icon={Percent} status="warning" />
            <KPICard title="Net Revenue" value={formatVND(stats.totalNet, true)} icon={TrendingUp} status="success" />
            <KPICard title="Pending Verify" value={stats.pendingVerification} icon={AlertTriangle} status={stats.pendingVerification > 0 ? 'warning' : 'success'} />
          </div>
        </div>

        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
          onClear={() => setFilters({})}
        >
          <ToolbarSeparator />
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
        </FilterBar>

        {/* Bookings Table */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[1100px]">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-muted/50">
                  {['Time', 'Property', 'Channel', 'Ref', 'Source', 'Type', 'Check-in', 'Check-out', 'Nights', 'Gross', 'Comm', 'Net', 'Verification'].map((h) => (
                    <th key={h} className="px-2 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground first:pl-3 last:pr-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredBookings.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="py-12 text-center text-[12px] text-muted-foreground">
                      No booking events found
                    </td>
                  </tr>
                ) : (
                  filteredBookings.map((b) => (
                    <tr
                      key={b.id}
                      className="cursor-pointer border-b border-border/40 transition-colors hover:bg-muted/30"
                      onClick={() => setSelectedBooking(b)}
                    >
                      <td className="px-2 py-1.5 pl-3 text-[10px] tabular-nums text-muted-foreground">
                        {formatDistanceToNow(new Date(b.eventTime), { addSuffix: false })}
                      </td>
                      <td className="px-2 py-1.5 text-[11px] font-medium text-foreground">
                        {b.propertyName.split(' ').slice(0, 2).join(' ')}
                      </td>
                      <td className="px-2 py-1.5 text-[11px] text-muted-foreground">{b.channelName}</td>
                      <td className="px-2 py-1.5 text-[11px] font-mono text-muted-foreground">{b.bookingRef}</td>
                      <td className="px-2 py-1.5"><StatusBadge status={b.sourceType} size="xs" /></td>
                      <td className="px-2 py-1.5 text-[11px] capitalize text-muted-foreground">{b.eventType}</td>
                      <td className="px-2 py-1.5 text-[11px] tabular-nums text-muted-foreground">
                        {format(new Date(b.checkIn), 'MMM d')}
                      </td>
                      <td className="px-2 py-1.5 text-[11px] tabular-nums text-muted-foreground">
                        {format(new Date(b.checkOut), 'MMM d')}
                      </td>
                      <td className="px-2 py-1.5 text-[11px] font-medium tabular-nums text-foreground">{b.roomNights}</td>
                      <td className="px-2 py-1.5 text-[11px] font-medium tabular-nums text-foreground">
                        {formatVND(b.grossAmount)}
                      </td>
                      <td className="px-2 py-1.5 text-[11px] tabular-nums text-muted-foreground">
                        {b.commissionAmount > 0 ? formatVND(b.commissionAmount) : '-'}
                      </td>
                      <td className="px-2 py-1.5 text-[11px] font-medium tabular-nums text-success">
                        {b.netAmount > 0 ? formatVND(b.netAmount) : '-'}
                      </td>
                      <td className="px-2 py-1.5 pr-3">
                        <StatusBadge status={b.verificationStatus} size="xs" />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Booking Detail Drawer */}
      <Sheet open={!!selectedBooking} onOpenChange={() => setSelectedBooking(null)}>
        <SheetContent className="w-[400px] border-l border-border bg-card p-0 overflow-y-auto">
          <SheetHeader className="border-b border-border px-4 py-3">
            <SheetTitle className="text-[13px]">Booking Detail</SheetTitle>
          </SheetHeader>

          {selectedBooking && (
            <div className="flex flex-col">
              <div className="border-b border-border px-4 py-3">
                <p className="text-[13px] font-medium text-foreground">{selectedBooking.propertyName}</p>
                <p className="mt-0.5 text-[11px] text-muted-foreground">
                  {selectedBooking.channelName} · {selectedBooking.bookingRef}
                </p>
                <div className="mt-2 flex gap-1.5">
                  <StatusBadge status={selectedBooking.sourceType} size="sm" />
                  <StatusBadge status={selectedBooking.verificationStatus} size="sm" />
                  <StatusBadge status={selectedBooking.eventType} size="sm" />
                </div>
              </div>

              <div className="border-b border-border">
                {[
                  ['Event Time', format(new Date(selectedBooking.eventTime), 'MMM d, HH:mm')],
                  ['Check-in', format(new Date(selectedBooking.checkIn), 'MMM d, yyyy')],
                  ['Check-out', format(new Date(selectedBooking.checkOut), 'MMM d, yyyy')],
                  ['Room Nights', String(selectedBooking.roomNights)],
                  ['Room Type', selectedBooking.roomType || '-'],
                  ['Guest', selectedBooking.guestName || 'Not available'],
                ].map(([label, value]) => (
                  <div key={label} className="flex items-center justify-between border-b border-border/50 px-4 py-1.5 last:border-0">
                    <span className="text-[11px] text-muted-foreground">{label}</span>
                    <span className="text-[11px] font-medium text-foreground">{value}</span>
                  </div>
                ))}
              </div>

              {/* Revenue */}
              <div className="border-b border-border px-4 py-3">
                <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Revenue</h4>
                <div className="grid grid-cols-3 gap-2">
                  <div className="rounded bg-muted/30 p-2">
                    <p className="text-[9px] text-muted-foreground">Gross</p>
                    <p className="text-[13px] font-semibold tabular-nums text-foreground">
                      {formatVND(selectedBooking.grossAmount)}
                    </p>
                  </div>
                  <div className="rounded bg-muted/30 p-2">
                    <p className="text-[9px] text-muted-foreground">Commission</p>
                    <p className="text-[13px] font-semibold tabular-nums text-warning">
                      {selectedBooking.commissionAmount > 0 ? formatVND(selectedBooking.commissionAmount) : '-'}
                    </p>
                  </div>
                  <div className="rounded bg-muted/30 p-2">
                    <p className="text-[9px] text-muted-foreground">Net</p>
                    <p className="text-[13px] font-semibold tabular-nums text-success">
                      {selectedBooking.netAmount > 0 ? formatVND(selectedBooking.netAmount) : '-'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Source trust context */}
              <div className="px-4 py-3">
                <h4 className="mb-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Source Trust</h4>
                <div className="rounded bg-muted/20 p-2.5">
                  {selectedBooking.sourceType === 'email-parsed' && (
                    <p className="text-[11px] text-muted-foreground">
                      This booking was parsed from an <span className="text-success font-medium">email confirmation</span>.
                      Gross amount, commission, and net revenue are directly extracted from the email body.
                    </p>
                  )}
                  {selectedBooking.sourceType === 'admin-link-signal' && (
                    <p className="text-[11px] text-muted-foreground">
                      This booking came as a <span className="text-warning font-medium">notification with admin link</span>.
                      Full details (commission, net payout) may require logging into the OTA extranet to confirm.
                    </p>
                  )}
                  {selectedBooking.verificationStatus === 'stale' && (
                    <p className="mt-1 text-[11px] text-warning">
                      This booking data is stale and may no longer be accurate.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>
    </DashboardLayout>
  );
}
