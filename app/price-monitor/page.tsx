'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { FilterBar, FilterConfig, ToolbarSeparator } from '@/components/dashboard/filter-bar';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { InlineKPI } from '@/components/dashboard/kpi-card';
import { AddPriceCaptureModal } from '@/components/dashboard/modals';
import { priceCaptures, properties, mappingRecords, getMappingsByProperty } from '@/lib/mock-data';
import type { PriceCapture } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Download,
  RefreshCw,
  Plus,
  Link2,
  FileText,
  Monitor,
  Smartphone,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  ExternalLink,
  ChevronDown,
  Layers,
  ArrowLeftRight,
  ImageIcon,
  Mail,
  MousePointer,
  Edit3,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';

const filterConfig: FilterConfig[] = [
  { id: 'search', label: 'Search', type: 'search', placeholder: 'Search property, room, channel...' },
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
    id: 'alertStatus',
    label: 'Alert',
    type: 'select',
    options: [
      { value: 'critical', label: 'Critical' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
      { value: 'none', label: 'No Alert' },
    ],
  },
  {
    id: 'evidenceStatus',
    label: 'Evidence',
    type: 'select',
    options: [
      { value: 'available', label: 'Available' },
      { value: 'missing', label: 'Missing' },
      { value: 'stale', label: 'Stale' },
    ],
  },
  {
    id: 'sourceConfidence',
    label: 'Confidence',
    type: 'select',
    options: [
      { value: 'high', label: 'High' },
      { value: 'medium', label: 'Medium' },
      { value: 'low', label: 'Low' },
      { value: 'pending-verification', label: 'Pending' },
    ],
  },
];

type CompareMode = 'all' | 'desktop-mobile' | 'channel-compare';

export default function PriceMonitorPage() {
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [selectedCapture, setSelectedCapture] = React.useState<PriceCapture | null>(null);
  const [showAddCapture, setShowAddCapture] = React.useState(false);
  const [compareMode, setCompareMode] = React.useState<CompareMode>('all');

  const filteredRecords = React.useMemo(() => {
    let records = priceCaptures.filter((record) => {
      if (filters.search) {
        const search = filters.search.toLowerCase();
        if (
          !record.propertyName.toLowerCase().includes(search) &&
          !record.roomType.toLowerCase().includes(search) &&
          !record.channelName.toLowerCase().includes(search)
        ) {
          return false;
        }
      }
      if (filters.property && filters.property !== 'all') {
        if (record.propertyId !== filters.property) return false;
      }
      if (filters.channel && filters.channel !== 'all') {
        if (record.channelId !== filters.channel) return false;
      }
      if (filters.alertStatus && filters.alertStatus !== 'all') {
        if (record.alertStatus !== filters.alertStatus) return false;
      }
      if (filters.evidenceStatus && filters.evidenceStatus !== 'all') {
        if (record.evidenceStatus !== filters.evidenceStatus) return false;
      }
      if (filters.sourceConfidence && filters.sourceConfidence !== 'all') {
        if (record.sourceConfidence !== filters.sourceConfidence) return false;
      }
      return true;
    });

    // Apply compare mode filtering
    if (compareMode === 'desktop-mobile') {
      // Group by property + room + stay date, show pairs
      const groups = new Map<string, PriceCapture[]>();
      records.forEach((r) => {
        const key = `${r.propertyId}-${r.roomType}-${r.stayDate}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(r);
      });
      // Only show groups that have both desktop and mobile
      records = Array.from(groups.values())
        .filter((g) => g.some((r) => r.deviceType === 'desktop') && g.some((r) => r.deviceType === 'mobile'))
        .flat();
    } else if (compareMode === 'channel-compare') {
      // Group by property + room + stay date, show multi-channel
      const groups = new Map<string, PriceCapture[]>();
      records.forEach((r) => {
        const key = `${r.propertyId}-${r.roomType}-${r.stayDate}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(r);
      });
      // Only show groups with multiple channels
      const channels = new Set<string>();
      records = Array.from(groups.values())
        .filter((g) => {
          channels.clear();
          g.forEach((r) => channels.add(r.channelId));
          return channels.size > 1;
        })
        .flat();
    }

    return records;
  }, [filters, compareMode]);

  const stats = React.useMemo(() => {
    const total = filteredRecords.length;
    const noAlert = filteredRecords.filter((r) => r.alertStatus === 'none').length;
    const issues = total - noAlert;
    const critical = filteredRecords.filter((r) => r.alertStatus === 'critical').length;
    const highConfidence = filteredRecords.filter((r) => r.sourceConfidence === 'high').length;
    const missingEvidence = filteredRecords.filter((r) => r.evidenceStatus === 'missing').length;
    const staleEvidence = filteredRecords.filter((r) => r.evidenceStatus === 'stale').length;
    return { total, noAlert, issues, critical, highConfidence, missingEvidence, staleEvidence };
  }, [filteredRecords]);

  // Find related captures for the drawer (same property, room, stay date, different device/channel)
  const relatedCaptures = React.useMemo(() => {
    if (!selectedCapture) return [];
    return priceCaptures.filter(
      (pc) =>
        pc.id !== selectedCapture.id &&
        pc.propertyId === selectedCapture.propertyId &&
        pc.roomType === selectedCapture.roomType &&
        pc.stayDate === selectedCapture.stayDate
    );
  }, [selectedCapture]);

  // Get mapping info for selected capture
  const selectedMapping = React.useMemo(() => {
    if (!selectedCapture) return null;
    const propertyMappings = getMappingsByProperty(selectedCapture.propertyId);
    return propertyMappings.find(
      (m) =>
        m.channelId === selectedCapture.channelId &&
        m.roomType === selectedCapture.roomType
    );
  }, [selectedCapture]);

  // Get row styling based on alert status, evidence, etc.
  const getRowClassName = (pc: PriceCapture) => {
    const base = 'cursor-pointer border-b transition-colors';
    
    if (pc.alertStatus === 'critical') {
      return cn(base, 'border-critical/20 bg-critical/5 hover:bg-critical/10');
    }
    if (pc.alertStatus === 'medium') {
      return cn(base, 'border-warning/20 bg-warning/5 hover:bg-warning/10');
    }
    if (pc.evidenceStatus === 'missing') {
      return cn(base, 'border-border/40 bg-muted/30 hover:bg-muted/50');
    }
    if (pc.evidenceStatus === 'stale') {
      return cn(base, 'border-border/40 bg-muted/20 hover:bg-muted/40');
    }
    return cn(base, 'border-border/40 hover:bg-muted/30');
  };

  // Source type icon
  const getSourceIcon = (sourceType: string) => {
    switch (sourceType) {
      case 'screenshot-captured':
        return <ImageIcon className="h-3 w-3" />;
      case 'email-parsed':
        return <Mail className="h-3 w-3" />;
      case 'admin-link-signal':
        return <MousePointer className="h-3 w-3" />;
      case 'manual-entry':
        return <Edit3 className="h-3 w-3" />;
      default:
        return <Eye className="h-3 w-3" />;
    }
  };

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        {/* Enhanced Toolbar */}
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
          onClear={() => setFilters({})}
        >
          {/* KPI Summary */}
          <div className="flex items-center gap-4 mr-2">
            <InlineKPI label="Total" value={stats.total} />
            <InlineKPI label="Clean" value={stats.noAlert} status="success" />
            <InlineKPI label="Issues" value={stats.issues} status={stats.issues > 0 ? 'warning' : 'default'} />
            <InlineKPI label="Critical" value={stats.critical} status={stats.critical > 0 ? 'critical' : 'default'} />
          </div>

          <ToolbarSeparator />

          {/* Compare Mode Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
                <Layers className="h-3.5 w-3.5" />
                {compareMode === 'all' && 'All Captures'}
                {compareMode === 'desktop-mobile' && 'Desktop vs Mobile'}
                {compareMode === 'channel-compare' && 'Channel Compare'}
                <ChevronDown className="h-3 w-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel className="text-[10px] text-muted-foreground">Compare Mode</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setCompareMode('all')} className="text-[11px]">
                <Eye className="h-3.5 w-3.5 mr-2" />
                All Captures
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCompareMode('desktop-mobile')} className="text-[11px]">
                <div className="flex items-center gap-1 mr-2">
                  <Monitor className="h-3 w-3" />
                  <ArrowLeftRight className="h-2.5 w-2.5" />
                  <Smartphone className="h-3 w-3" />
                </div>
                Desktop vs Mobile
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setCompareMode('channel-compare')} className="text-[11px]">
                <ArrowLeftRight className="h-3.5 w-3.5 mr-2" />
                Channel Compare
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <ToolbarSeparator />

          {/* Actions */}
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <RefreshCw className="h-3.5 w-3.5" />
            Refresh
          </Button>
          <Button variant="ghost" size="sm" className="h-7 gap-1.5 px-2 text-[11px]">
            <Download className="h-3.5 w-3.5" />
            Export
          </Button>
          <Button size="sm" className="h-7 gap-1.5 px-2 text-[11px]" onClick={() => setShowAddCapture(true)}>
            <Plus className="h-3.5 w-3.5" />
            Add Capture
          </Button>
        </FilterBar>

        {/* Data Quality Warnings */}
        {(stats.missingEvidence > 0 || stats.staleEvidence > 0) && (
          <div className="flex items-center gap-4 border-b border-border bg-muted/30 px-4 py-2">
            {stats.missingEvidence > 0 && (
              <div className="flex items-center gap-2 text-[11px]">
                <XCircle className="h-3.5 w-3.5 text-critical" />
                <span className="text-muted-foreground">Missing evidence:</span>
                <span className="font-medium text-critical">{stats.missingEvidence}</span>
              </div>
            )}
            {stats.staleEvidence > 0 && (
              <div className="flex items-center gap-2 text-[11px]">
                <Clock className="h-3.5 w-3.5 text-warning" />
                <span className="text-muted-foreground">Stale evidence:</span>
                <span className="font-medium text-warning">{stats.staleEvidence}</span>
              </div>
            )}
            <div className="flex-1" />
            <span className="text-[10px] text-muted-foreground">
              High confidence: {stats.highConfidence}/{stats.total}
            </span>
          </div>
        )}

        {/* Table */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-[1400px]">
            <table className="w-full">
              <thead className="sticky top-0 z-10">
                <tr className="border-b border-border bg-muted/70 backdrop-blur-sm">
                  <th className="w-8 px-2 py-2.5 text-left" />
                  <th className="px-3 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Property</th>
                  <th className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Channel</th>
                  <th className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Device</th>
                  <th className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Room</th>
                  <th className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rate</th>
                  <th className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cancel</th>
                  <th className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stay</th>
                  <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Display</th>
                  <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ref</th>
                  <th className="px-2 py-2.5 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Delta</th>
                  <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Mapping</th>
                  <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Evidence</th>
                  <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Source</th>
                  <th className="px-2 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Conf</th>
                  <th className="px-2 py-2.5 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Captured</th>
                  <th className="px-3 py-2.5 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Alert</th>
                </tr>
              </thead>
              <tbody>
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={17} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <Eye className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-[12px] text-muted-foreground">No price captures found</p>
                        <p className="text-[11px] text-muted-foreground/70">Try adjusting your filters or compare mode</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map((pc) => {
                    // Check mapping status for this capture
                    const mapping = mappingRecords.find(
                      (m) => m.propertyId === pc.propertyId && m.channelId === pc.channelId && m.roomType === pc.roomType
                    );
                    const mappingStatus = mapping?.status || 'unmapped';

                    return (
                      <tr
                        key={pc.id}
                        className={getRowClassName(pc)}
                        onClick={() => setSelectedCapture(pc)}
                      >
                        {/* Alert indicator */}
                        <td className="w-8 px-2 py-2">
                          {pc.alertStatus === 'critical' && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-critical/20">
                              <AlertTriangle className="h-3 w-3 text-critical" />
                            </div>
                          )}
                          {pc.alertStatus === 'medium' && (
                            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-warning/20">
                              <AlertTriangle className="h-3 w-3 text-warning" />
                            </div>
                          )}
                          {pc.alertStatus === 'low' && (
                            <StatusDot status="info" />
                          )}
                        </td>

                        <td className="px-3 py-2">
                          <p className="text-[11px] font-medium text-foreground">{pc.propertyName.split(' ').slice(0, 3).join(' ')}</p>
                        </td>
                        <td className="px-2 py-2 text-[11px] text-foreground">{pc.channelName}</td>
                        <td className="px-2 py-2">
                          <div className={cn(
                            "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-medium",
                            pc.deviceType === 'desktop' ? "bg-info/10 text-info" : "bg-success/10 text-success"
                          )}>
                            {pc.deviceType === 'desktop' ? <Monitor className="h-2.5 w-2.5" /> : <Smartphone className="h-2.5 w-2.5" />}
                            {pc.deviceType}
                          </div>
                        </td>
                        <td className="px-2 py-2 text-[11px] text-muted-foreground max-w-[120px] truncate">{pc.roomType}</td>
                        <td className="px-2 py-2 text-[10px] text-muted-foreground">{pc.ratePlan}</td>
                        <td className="px-2 py-2"><StatusBadge status={pc.cancellationPolicy} size="xs" /></td>
                        <td className="px-2 py-2 text-[11px] tabular-nums text-muted-foreground">{format(new Date(pc.stayDate), 'MMM d')}</td>
                        
                        {/* Display Price - emphasized */}
                        <td className="px-2 py-2 text-right">
                          <span className="text-[12px] font-semibold tabular-nums text-foreground">
                            {pc.currency} {pc.displayPrice.toLocaleString()}
                          </span>
                        </td>
                        
                        {/* Reference Price */}
                        <td className="px-2 py-2 text-right text-[11px] tabular-nums text-muted-foreground">
                          {pc.currency} {pc.referencePrice.toLocaleString()}
                        </td>
                        
                        {/* Delta - color coded */}
                        <td className="px-2 py-2 text-right">
                          <span className={cn(
                            'text-[11px] font-semibold tabular-nums',
                            pc.deltaPercent === 0 ? 'text-muted-foreground' : 
                            Math.abs(pc.deltaPercent) > 15 ? 'text-critical' : 
                            Math.abs(pc.deltaPercent) > 5 ? 'text-warning' : 'text-success'
                          )}>
                            {pc.deltaPercent > 0 ? '+' : ''}{pc.deltaPercent.toFixed(1)}%
                          </span>
                        </td>

                        {/* Mapping Status */}
                        <td className="px-2 py-2 text-center">
                          <StatusBadge status={mappingStatus} size="xs" />
                        </td>

                        {/* Evidence Status - with visual emphasis for missing/stale */}
                        <td className="px-2 py-2 text-center">
                          {pc.evidenceStatus === 'available' ? (
                            <div className="inline-flex items-center gap-1 rounded bg-success/10 px-1.5 py-0.5 text-[10px] font-medium text-success">
                              <CheckCircle2 className="h-2.5 w-2.5" />
                              <span>OK</span>
                            </div>
                          ) : pc.evidenceStatus === 'missing' ? (
                            <div className="inline-flex items-center gap-1 rounded bg-critical/10 px-1.5 py-0.5 text-[10px] font-medium text-critical">
                              <XCircle className="h-2.5 w-2.5" />
                              <span>Missing</span>
                            </div>
                          ) : (
                            <div className="inline-flex items-center gap-1 rounded bg-warning/10 px-1.5 py-0.5 text-[10px] font-medium text-warning">
                              <Clock className="h-2.5 w-2.5" />
                              <span>Stale</span>
                            </div>
                          )}
                        </td>

                        {/* Source Type with icon */}
                        <td className="px-2 py-2 text-center">
                          <div className={cn(
                            "inline-flex items-center justify-center gap-1 rounded px-1.5 py-0.5 text-[10px]",
                            pc.sourceType === 'screenshot-captured' ? "bg-success/10 text-success" :
                            pc.sourceType === 'email-parsed' ? "bg-info/10 text-info" :
                            pc.sourceType === 'admin-link-signal' ? "bg-warning/10 text-warning" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {getSourceIcon(pc.sourceType)}
                          </div>
                        </td>

                        {/* Source Confidence */}
                        <td className="px-2 py-2 text-center">
                          <div className={cn(
                            "inline-flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold",
                            pc.sourceConfidence === 'high' ? "bg-success/20 text-success" :
                            pc.sourceConfidence === 'medium' ? "bg-info/20 text-info" :
                            pc.sourceConfidence === 'low' ? "bg-warning/20 text-warning" :
                            "bg-muted text-muted-foreground"
                          )}>
                            {pc.sourceConfidence === 'high' ? 'H' : pc.sourceConfidence === 'medium' ? 'M' : pc.sourceConfidence === 'low' ? 'L' : '?'}
                          </div>
                        </td>

                        {/* Captured Time */}
                        <td className="px-2 py-2 text-[10px] tabular-nums text-muted-foreground">
                          {formatDistanceToNow(new Date(pc.lastCapturedAt), { addSuffix: false })}
                        </td>

                        {/* Alert Badge */}
                        <td className="px-3 py-2 text-center">
                          {pc.alertStatus !== 'none' ? (
                            <StatusBadge status={pc.alertStatus} size="xs" />
                          ) : (
                            <span className="text-[10px] text-muted-foreground">—</span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Enhanced Detail Drawer */}
      <Sheet open={!!selectedCapture} onOpenChange={() => setSelectedCapture(null)}>
        <SheetContent className="w-[520px] border-l border-border bg-card p-0 overflow-y-auto">
          {selectedCapture && (
            <>
              {/* Header */}
              <SheetHeader className="sticky top-0 z-10 border-b border-border bg-card px-5 py-4">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-[14px] font-semibold text-foreground">
                      {selectedCapture.propertyName}
                    </SheetTitle>
                    <p className="mt-1 flex items-center gap-2 text-[12px] text-muted-foreground">
                      <span>{selectedCapture.channelName}</span>
                      <span>·</span>
                      <span className="capitalize">{selectedCapture.deviceType}</span>
                      <span>·</span>
                      <span>{selectedCapture.roomType}</span>
                    </p>
                  </div>
                  {selectedCapture.alertStatus !== 'none' && (
                    <StatusBadge status={selectedCapture.alertStatus} size="sm" />
                  )}
                </div>
              </SheetHeader>

              <div className="flex flex-col">
                {/* Price Comparison Section */}
                <section className="border-b border-border p-5">
                  <h3 className="mb-4 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Price Comparison
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border bg-muted/30 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground">Display Price</p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-foreground">
                        {selectedCapture.currency} {selectedCapture.displayPrice.toLocaleString()}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">OTA selling price</p>
                    </div>
                    <div className="rounded-lg border border-border bg-muted/20 p-3">
                      <p className="text-[10px] font-medium text-muted-foreground">Reference Price</p>
                      <p className="mt-1 text-xl font-bold tabular-nums text-muted-foreground">
                        {selectedCapture.currency} {selectedCapture.referencePrice.toLocaleString()}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">Internal rate</p>
                    </div>
                    <div className={cn(
                      "rounded-lg border p-3",
                      selectedCapture.deltaPercent === 0 ? "border-border bg-muted/20" :
                      Math.abs(selectedCapture.deltaPercent) > 15 ? "border-critical/30 bg-critical/10" :
                      Math.abs(selectedCapture.deltaPercent) > 5 ? "border-warning/30 bg-warning/10" :
                      "border-success/30 bg-success/10"
                    )}>
                      <p className="text-[10px] font-medium text-muted-foreground">Delta</p>
                      <p className={cn(
                        'mt-1 text-xl font-bold tabular-nums',
                        selectedCapture.deltaPercent === 0 ? 'text-muted-foreground' : 
                        Math.abs(selectedCapture.deltaPercent) > 15 ? 'text-critical' : 
                        Math.abs(selectedCapture.deltaPercent) > 5 ? 'text-warning' : 'text-success'
                      )}>
                        {selectedCapture.deltaPercent > 0 ? '+' : ''}{selectedCapture.deltaPercent.toFixed(1)}%
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {selectedCapture.delta > 0 ? '+' : ''}{selectedCapture.currency} {selectedCapture.delta.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Related Captures (Desktop vs Mobile / Channel Compare) */}
                {relatedCaptures.length > 0 && (
                  <section className="border-b border-border p-5">
                    <div className="mb-3 flex items-center gap-2">
                      <ArrowLeftRight className="h-3.5 w-3.5 text-info" />
                      <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                        Compare: Same Room & Date
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {relatedCaptures.map((rc) => (
                        <div
                          key={rc.id}
                          className={cn(
                            "flex items-center justify-between rounded-lg border px-3 py-2.5 cursor-pointer transition-colors",
                            rc.alertStatus === 'critical' ? "border-critical/30 bg-critical/5 hover:bg-critical/10" :
                            rc.alertStatus === 'medium' ? "border-warning/30 bg-warning/5 hover:bg-warning/10" :
                            "border-border bg-muted/20 hover:bg-muted/40"
                          )}
                          onClick={() => setSelectedCapture(rc)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium",
                              rc.deviceType === 'desktop' ? "bg-info/10 text-info" : "bg-success/10 text-success"
                            )}>
                              {rc.deviceType === 'desktop' ? <Monitor className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                              {rc.deviceType}
                            </div>
                            <div>
                              <p className="text-[11px] font-medium text-foreground">{rc.channelName}</p>
                              <p className="text-[10px] text-muted-foreground">{rc.ratePlan}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[12px] font-semibold tabular-nums text-foreground">
                              {rc.currency} {rc.displayPrice.toLocaleString()}
                            </p>
                            <p className={cn(
                              'text-[10px] font-medium tabular-nums',
                              rc.deltaPercent === 0 ? 'text-muted-foreground' : 
                              Math.abs(rc.deltaPercent) > 15 ? 'text-critical' : 
                              Math.abs(rc.deltaPercent) > 5 ? 'text-warning' : 'text-success'
                            )}>
                              {rc.deltaPercent > 0 ? '+' : ''}{rc.deltaPercent.toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </section>
                )}

                {/* Capture Details */}
                <section className="border-b border-border p-5">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Capture Details
                  </h3>
                  <div className="grid grid-cols-2 gap-x-6 gap-y-2">
                    {[
                      ['Stay Date', format(new Date(selectedCapture.stayDate), 'MMM d, yyyy')],
                      ['Rate Plan', selectedCapture.ratePlan],
                      ['Cancellation', selectedCapture.cancellationPolicy],
                      ['Device', selectedCapture.deviceType],
                      ['Compare Quality', selectedCapture.compareQuality],
                      ['Last Captured', format(new Date(selectedCapture.lastCapturedAt), 'MMM d, HH:mm')],
                    ].map(([label, value]) => (
                      <div key={label} className="flex items-center justify-between py-1">
                        <span className="text-[11px] text-muted-foreground">{label}</span>
                        <span className="text-[11px] font-medium text-foreground">{value}</span>
                      </div>
                    ))}
                  </div>
                </section>

                {/* Source Trust & Evidence */}
                <section className="border-b border-border p-5">
                  <h3 className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Source Trust & Evidence
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Source Type */}
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                      <div className="flex items-center gap-2">
                        {getSourceIcon(selectedCapture.sourceType)}
                        <span className="text-[11px] text-muted-foreground">Source Type</span>
                      </div>
                      <StatusBadge status={selectedCapture.sourceType} size="xs" />
                    </div>

                    {/* Source Confidence */}
                    <div className="flex items-center justify-between rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                      <span className="text-[11px] text-muted-foreground">Source Confidence</span>
                      <div className={cn(
                        "flex items-center gap-1.5 rounded px-2 py-1 text-[10px] font-medium",
                        selectedCapture.sourceConfidence === 'high' ? "bg-success/10 text-success" :
                        selectedCapture.sourceConfidence === 'medium' ? "bg-info/10 text-info" :
                        selectedCapture.sourceConfidence === 'low' ? "bg-warning/10 text-warning" :
                        "bg-muted text-muted-foreground"
                      )}>
                        {selectedCapture.sourceConfidence === 'high' && <CheckCircle2 className="h-3 w-3" />}
                        {selectedCapture.sourceConfidence === 'medium' && <Eye className="h-3 w-3" />}
                        {selectedCapture.sourceConfidence === 'low' && <AlertTriangle className="h-3 w-3" />}
                        {selectedCapture.sourceConfidence}
                      </div>
                    </div>

                    {/* Evidence Status */}
                    <div className={cn(
                      "flex items-center justify-between rounded-lg border px-3 py-2.5",
                      selectedCapture.evidenceStatus === 'available' ? "border-success/30 bg-success/5" :
                      selectedCapture.evidenceStatus === 'missing' ? "border-critical/30 bg-critical/5" :
                      "border-warning/30 bg-warning/5"
                    )}>
                      <span className="text-[11px] text-muted-foreground">Evidence</span>
                      <div className={cn(
                        "flex items-center gap-1.5 text-[10px] font-medium",
                        selectedCapture.evidenceStatus === 'available' ? "text-success" :
                        selectedCapture.evidenceStatus === 'missing' ? "text-critical" :
                        "text-warning"
                      )}>
                        {selectedCapture.evidenceStatus === 'available' && <CheckCircle2 className="h-3 w-3" />}
                        {selectedCapture.evidenceStatus === 'missing' && <XCircle className="h-3 w-3" />}
                        {selectedCapture.evidenceStatus === 'stale' && <Clock className="h-3 w-3" />}
                        {selectedCapture.evidenceStatus}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Mapping Info */}
                <section className="border-b border-border p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Link2 className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Room & Rate Mapping
                    </h3>
                  </div>
                  
                  {selectedMapping ? (
                    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">OTA Room Name</span>
                        <span className="text-[11px] font-medium text-foreground">{selectedMapping.otaRoomName || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">OTA Rate Plan</span>
                        <span className="text-[11px] text-foreground">{selectedMapping.otaRatePlanName || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Mapping Status</span>
                        <StatusBadge status={selectedMapping.status} size="xs" />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Last Verified</span>
                        <span className="text-[10px] text-muted-foreground">
                          {formatDistanceToNow(new Date(selectedMapping.lastVerified), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-warning/30 bg-warning/5 p-3">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="h-4 w-4 text-warning" />
                        <p className="text-[11px] font-medium text-warning">No mapping found</p>
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        This room/channel combination is not mapped. Price comparison may be unreliable.
                      </p>
                    </div>
                  )}
                </section>

                {/* Commission & Promotion Notes */}
                <section className="p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <h3 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                      Notes & Assumptions
                    </h3>
                  </div>
                  
                  <div className="space-y-3">
                    {selectedCapture.commissionAssumption && (
                      <div className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                        <p className="text-[10px] text-muted-foreground">Commission Assumption</p>
                        <p className="text-[12px] font-medium text-foreground">{selectedCapture.commissionAssumption}%</p>
                      </div>
                    )}
                    
                    {selectedCapture.promotionStackingNote && (
                      <div className="rounded-lg border border-warning/30 bg-warning/5 px-3 py-2.5">
                        <p className="text-[10px] text-warning font-medium">Promotion Stacking Note</p>
                        <p className="mt-1 text-[11px] text-foreground">{selectedCapture.promotionStackingNote}</p>
                      </div>
                    )}

                    {!selectedCapture.commissionAssumption && !selectedCapture.promotionStackingNote && (
                      <p className="text-[11px] text-muted-foreground">No additional notes for this capture.</p>
                    )}
                  </div>
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Add Capture Modal */}
      <AddPriceCaptureModal open={showAddCapture} onOpenChange={setShowAddCapture} />
    </DashboardLayout>
  );
}
