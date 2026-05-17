'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { FilterBar, FilterConfig, ToolbarSeparator } from '@/components/dashboard/filter-bar';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { AddPriceCaptureModal } from '@/components/dashboard/modals';
import { priceCaptures, properties, mappingRecords, getMappingsByProperty } from '@/lib/mock-data';
import type { PriceCapture } from '@/lib/types';
import { format, formatDistanceToNow } from 'date-fns';
import { cn, formatVND } from '@/lib/utils';
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
  ChevronDown,
  Layers,
  ArrowLeftRight,
  ImageIcon,
  Mail,
  MousePointer,
  Edit3,
  Banknote,
  ShieldCheck,
  HelpCircle,
  ChevronRight,
  Percent,
  Scale,
  Info,
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

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

type ViewMode = 'row' | 'cluster';
type CompareMode = 'all' | 'desktop-mobile' | 'channel-compare';

interface CaptureCluster {
  key: string;
  propertyId: string;
  propertyName: string;
  roomType: string;
  stayDate: string;
  captures: PriceCapture[];
  bestPrice: number;
  worstPrice: number;
  largestDelta: number;
  currency: string;
  hasStaleEvidence: boolean;
  hasMissingEvidence: boolean;
  hasUncertainCompare: boolean;
  hasMappingGap: boolean;
  criticalCount: number;
}

export default function PriceMonitorPage() {
  const [filters, setFilters] = React.useState<Record<string, string>>({});
  const [selectedCapture, setSelectedCapture] = React.useState<PriceCapture | null>(null);
  const [showAddCapture, setShowAddCapture] = React.useState(false);
  const [viewMode, setViewMode] = React.useState<ViewMode>('cluster');
  const [compareMode, setCompareMode] = React.useState<CompareMode>('all');
  const [expandedClusters, setExpandedClusters] = React.useState<Set<string>>(new Set());

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
      const groups = new Map<string, PriceCapture[]>();
      records.forEach((r) => {
        const key = `${r.propertyId}-${r.roomType}-${r.stayDate}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(r);
      });
      records = Array.from(groups.values())
        .filter((g) => g.some((r) => r.deviceType === 'desktop') && g.some((r) => r.deviceType === 'mobile'))
        .flat();
    } else if (compareMode === 'channel-compare') {
      const groups = new Map<string, PriceCapture[]>();
      records.forEach((r) => {
        const key = `${r.propertyId}-${r.roomType}-${r.stayDate}`;
        if (!groups.has(key)) groups.set(key, []);
        groups.get(key)!.push(r);
      });
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

  // Group captures into clusters
  const clusters = React.useMemo(() => {
    const groups = new Map<string, PriceCapture[]>();
    filteredRecords.forEach((r) => {
      const key = `${r.propertyId}-${r.roomType}-${r.stayDate}`;
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    });

    const result: CaptureCluster[] = [];
    groups.forEach((captures, key) => {
      const prices = captures.map((c) => c.displayPrice);
      const deltas = captures.map((c) => Math.abs(c.deltaPercent));
      
      result.push({
        key,
        propertyId: captures[0].propertyId,
        propertyName: captures[0].propertyName,
        roomType: captures[0].roomType,
        stayDate: captures[0].stayDate,
        captures,
        bestPrice: Math.min(...prices),
        worstPrice: Math.max(...prices),
        largestDelta: Math.max(...deltas),
        currency: captures[0].currency,
        hasStaleEvidence: captures.some((c) => c.evidenceStatus === 'stale'),
        hasMissingEvidence: captures.some((c) => c.evidenceStatus === 'missing'),
        hasUncertainCompare: captures.some((c) => c.compareQuality === 'uncertain'),
        hasMappingGap: captures.some((c) => {
          const mapping = mappingRecords.find(
            (m) => m.propertyId === c.propertyId && m.channelId === c.channelId && m.roomType === c.roomType
          );
          return !mapping || mapping.status !== 'complete';
        }),
        criticalCount: captures.filter((c) => c.alertStatus === 'critical').length,
      });
    });

    // Sort by critical issues first, then by largest delta
    return result.sort((a, b) => {
      if (a.criticalCount !== b.criticalCount) return b.criticalCount - a.criticalCount;
      return b.largestDelta - a.largestDelta;
    });
  }, [filteredRecords]);

  const stats = React.useMemo(() => {
    const total = filteredRecords.length;
    const noAlert = filteredRecords.filter((r) => r.alertStatus === 'none').length;
    const critical = filteredRecords.filter((r) => r.alertStatus === 'critical').length;
    const highConfidence = filteredRecords.filter((r) => r.sourceConfidence === 'high').length;
    const missingEvidence = filteredRecords.filter((r) => r.evidenceStatus === 'missing').length;
    const staleEvidence = filteredRecords.filter((r) => r.evidenceStatus === 'stale').length;
    return { total, noAlert, critical, highConfidence, missingEvidence, staleEvidence, clusterCount: clusters.length };
  }, [filteredRecords, clusters]);

  // Find related captures for the drawer
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
    const base = 'cursor-pointer transition-colors';
    
    if (pc.alertStatus === 'critical') {
      return cn(base, 'border-l-2 border-l-critical bg-critical/[0.04] hover:bg-critical/[0.08]');
    }
    if (pc.alertStatus === 'medium') {
      return cn(base, 'border-l-2 border-l-warning bg-warning/[0.03] hover:bg-warning/[0.06]');
    }
    if (pc.alertStatus === 'low') {
      return cn(base, 'border-l-2 border-l-info/50 hover:bg-muted/30');
    }
    if (pc.evidenceStatus === 'missing') {
      return cn(base, 'border-l-2 border-l-muted bg-muted/20 hover:bg-muted/40 opacity-75');
    }
    if (pc.evidenceStatus === 'stale') {
      return cn(base, 'border-l-2 border-l-muted/50 bg-muted/10 hover:bg-muted/30 opacity-80');
    }
    return cn(base, 'border-l-2 border-l-transparent hover:bg-muted/30');
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

  const toggleCluster = (key: string) => {
    setExpandedClusters((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Likely mismatch reasons
  const getLikelyMismatchReasons = (pc: PriceCapture) => {
    const reasons = [];
    if (pc.deviceType === 'mobile') reasons.push('Mobile discount may be active');
    if (pc.promotionStackingNote) reasons.push(pc.promotionStackingNote);
    if (pc.compareQuality === 'uncertain') reasons.push('Mapping incomplete or uncertain');
    if (pc.evidenceStatus === 'stale') reasons.push('Evidence is stale (>48h old)');
    if (pc.channelId === 'airbnb') reasons.push('Service fee included in display price');
    if (pc.cancellationPolicy === 'non-refundable') reasons.push('Non-refundable rate may differ');
    return reasons;
  };

  return (
    <DashboardLayout>
      <div className="flex h-full flex-col">
        {/* Page Header */}
        <div className="border-b border-border bg-card/50 px-5 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-[16px] font-semibold text-foreground">Price Monitor</h1>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Compare OTA display prices against reference rates across channels and devices
              </p>
            </div>
            <div className="flex items-center gap-4">
              {/* Quick Stats */}
              <div className="flex items-center gap-6 border-r border-border pr-4">
                <div className="text-center">
                  <p className="text-[18px] font-bold tabular-nums text-foreground">{stats.clusterCount}</p>
                  <p className="text-[10px] text-muted-foreground">Clusters</p>
                </div>
                <div className="text-center">
                  <p className="text-[18px] font-bold tabular-nums text-success">{stats.noAlert}</p>
                  <p className="text-[10px] text-success">Clean</p>
                </div>
                <div className="text-center">
                  <p className={cn("text-[18px] font-bold tabular-nums", stats.critical > 0 ? "text-critical" : "text-muted-foreground")}>{stats.critical}</p>
                  <p className="text-[10px] text-critical">Critical</p>
                </div>
              </div>
              <Button size="sm" className="h-8 gap-1.5 px-3 text-[11px]" onClick={() => setShowAddCapture(true)}>
                <Plus className="h-3.5 w-3.5" />
                Add Capture
              </Button>
            </div>
          </div>
        </div>

        {/* Enhanced Toolbar */}
        <FilterBar
          filters={filterConfig}
          values={filters}
          onChange={(id, value) => setFilters((prev) => ({ ...prev, [id]: value }))}
          onClear={() => setFilters({})}
        >
          {/* View Mode Toggle */}
          <div className="flex items-center rounded-md border border-border bg-muted/30">
            <button
              onClick={() => setViewMode('cluster')}
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium transition-colors",
                viewMode === 'cluster' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Cluster
            </button>
            <button
              onClick={() => setViewMode('row')}
              className={cn(
                "px-2.5 py-1 text-[10px] font-medium transition-colors",
                viewMode === 'row' ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
              )}
            >
              Row
            </button>
          </div>

          {/* Compare Mode Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-7 gap-1.5 px-2.5 text-[11px]">
                <Layers className="h-3.5 w-3.5" />
                {compareMode === 'all' && 'All Captures'}
                {compareMode === 'desktop-mobile' && 'Desktop vs Mobile'}
                {compareMode === 'channel-compare' && 'Channel Compare'}
                <ChevronDown className="h-3 w-3 opacity-50" />
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
        </FilterBar>

        {/* Data Quality Warnings */}
        {(stats.missingEvidence > 0 || stats.staleEvidence > 0) && (
          <div className="flex items-center gap-6 border-b border-border bg-muted/20 px-5 py-2">
            {stats.missingEvidence > 0 && (
              <div className="flex items-center gap-2 text-[11px]">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-critical/15">
                  <XCircle className="h-3 w-3 text-critical" />
                </div>
                <span className="text-muted-foreground">Missing evidence:</span>
                <span className="font-bold text-critical">{stats.missingEvidence}</span>
              </div>
            )}
            {stats.staleEvidence > 0 && (
              <div className="flex items-center gap-2 text-[11px]">
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-warning/15">
                  <Clock className="h-3 w-3 text-warning" />
                </div>
                <span className="text-muted-foreground">Stale evidence:</span>
                <span className="font-bold text-warning">{stats.staleEvidence}</span>
              </div>
            )}
            <div className="flex-1" />
            <span className="text-[10px] text-muted-foreground">
              High confidence: <span className="font-semibold text-foreground">{stats.highConfidence}</span>/{stats.total}
            </span>
          </div>
        )}

        {/* Content Area */}
        <div className="flex-1 overflow-auto">
          {viewMode === 'cluster' ? (
            /* Cluster View */
            <div className="p-4 space-y-3">
              {clusters.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                      <Eye className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-[13px] font-medium text-muted-foreground">No price captures found</p>
                    <p className="text-[11px] text-muted-foreground/70">Try adjusting your filters or compare mode</p>
                  </div>
                </div>
              ) : (
                clusters.map((cluster) => (
                  <Collapsible
                    key={cluster.key}
                    open={expandedClusters.has(cluster.key)}
                    onOpenChange={() => toggleCluster(cluster.key)}
                  >
                    {/* Cluster Header */}
                    <div className={cn(
                      "rounded-lg border bg-card overflow-hidden",
                      cluster.criticalCount > 0 ? "border-critical/40" :
                      cluster.hasStaleEvidence || cluster.hasMissingEvidence ? "border-warning/40" :
                      "border-border"
                    )}>
                      <CollapsibleTrigger asChild>
                        <div className={cn(
                          "flex items-center gap-4 px-4 py-3 cursor-pointer transition-colors",
                          cluster.criticalCount > 0 ? "bg-critical/[0.03] hover:bg-critical/[0.06]" :
                          "hover:bg-muted/30"
                        )}>
                          <ChevronRight className={cn(
                            "h-4 w-4 text-muted-foreground transition-transform",
                            expandedClusters.has(cluster.key) && "rotate-90"
                          )} />
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="text-[12px] font-semibold text-foreground truncate">
                                {cluster.propertyName.split(' ').slice(0, 3).join(' ')}
                              </p>
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <p className="text-[11px] text-muted-foreground truncate">{cluster.roomType}</p>
                              <span className="text-[10px] text-muted-foreground">·</span>
                              <p className="text-[11px] tabular-nums text-muted-foreground">
                                {format(new Date(cluster.stayDate), 'MMM d')}
                              </p>
                            </div>
                            <div className="mt-1 flex items-center gap-3">
                              <span className="text-[10px] text-muted-foreground">
                                {cluster.captures.length} capture{cluster.captures.length > 1 ? 's' : ''}
                              </span>
                              {cluster.hasStaleEvidence && (
                                <span className="flex items-center gap-1 text-[9px] text-warning">
                                  <Clock className="h-2.5 w-2.5" />
                                  stale
                                </span>
                              )}
                              {cluster.hasMissingEvidence && (
                                <span className="flex items-center gap-1 text-[9px] text-critical">
                                  <XCircle className="h-2.5 w-2.5" />
                                  missing
                                </span>
                              )}
                              {cluster.hasUncertainCompare && (
                                <span className="flex items-center gap-1 text-[9px] text-muted-foreground">
                                  <HelpCircle className="h-2.5 w-2.5" />
                                  uncertain
                                </span>
                              )}
                              {cluster.hasMappingGap && (
                                <span className="flex items-center gap-1 text-[9px] text-warning">
                                  <Link2 className="h-2.5 w-2.5" />
                                  mapping gap
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Cluster Summary Stats */}
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">Best</p>
                              <p className="text-[12px] font-bold tabular-nums text-success">
                                {formatVND(cluster.bestPrice)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="text-[10px] text-muted-foreground">Worst</p>
                              <p className="text-[12px] font-bold tabular-nums text-foreground">
                                {formatVND(cluster.worstPrice)}
                              </p>
                            </div>
                            <div className="text-right min-w-[60px]">
                              <p className="text-[10px] text-muted-foreground">Max Delta</p>
                              <p className={cn(
                                "text-[12px] font-bold tabular-nums",
                                cluster.largestDelta > 15 ? "text-critical" :
                                cluster.largestDelta > 5 ? "text-warning" :
                                "text-success"
                              )}>
                                {cluster.largestDelta.toFixed(1)}%
                              </p>
                            </div>
                            {cluster.criticalCount > 0 && (
                              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-critical/20">
                                <AlertTriangle className="h-3.5 w-3.5 text-critical" />
                              </div>
                            )}
                          </div>
                        </div>
                      </CollapsibleTrigger>

                      {/* Cluster Content - Individual Captures */}
                      <CollapsibleContent>
                        <div className="border-t border-border/50 bg-muted/10">
                          {cluster.captures.map((pc) => {
                            const mapping = mappingRecords.find(
                              (m) => m.propertyId === pc.propertyId && m.channelId === pc.channelId && m.roomType === pc.roomType
                            );
                            const mappingStatus = mapping?.status || 'unmapped';

                            return (
                              <div
                                key={pc.id}
                                className={cn(
                                  "flex items-center gap-4 px-4 py-2.5 border-b border-border/30 last:border-0 cursor-pointer transition-colors",
                                  pc.alertStatus === 'critical' ? "bg-critical/[0.03] hover:bg-critical/[0.06]" :
                                  pc.alertStatus === 'medium' ? "bg-warning/[0.02] hover:bg-warning/[0.05]" :
                                  "hover:bg-muted/30"
                                )}
                                onClick={() => setSelectedCapture(pc)}
                              >
                                {/* Alert indicator */}
                                <div className="w-6">
                                  {pc.alertStatus === 'critical' && (
                                    <AlertTriangle className="h-4 w-4 text-critical" />
                                  )}
                                  {pc.alertStatus === 'medium' && (
                                    <AlertTriangle className="h-4 w-4 text-warning" />
                                  )}
                                </div>

                                {/* Channel & Device */}
                                <div className="flex items-center gap-2 min-w-[140px]">
                                  <div className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded text-[10px] font-bold",
                                    pc.channelName === 'Booking.com' ? "bg-blue-500/15 text-blue-600" :
                                    pc.channelName === 'Agoda' ? "bg-red-500/15 text-red-600" :
                                    pc.channelName === 'Airbnb' ? "bg-pink-500/15 text-pink-600" :
                                    "bg-muted text-muted-foreground"
                                  )}>
                                    {pc.channelName.charAt(0)}
                                  </div>
                                  <div>
                                    <p className="text-[11px] font-medium text-foreground">{pc.channelName}</p>
                                    <div className={cn(
                                      "inline-flex items-center gap-1 text-[9px]",
                                      pc.deviceType === 'desktop' ? "text-info" : "text-success"
                                    )}>
                                      {pc.deviceType === 'desktop' ? <Monitor className="h-2.5 w-2.5" /> : <Smartphone className="h-2.5 w-2.5" />}
                                      {pc.deviceType}
                                    </div>
                                  </div>
                                </div>

                                {/* Rate / Cancel */}
                                <div className="min-w-[100px]">
                                  <p className="text-[10px] text-muted-foreground">{pc.ratePlan}</p>
                                  <StatusBadge status={pc.cancellationPolicy} size="xs" />
                                </div>

                                {/* Prices */}
                                <div className="flex items-center gap-4 flex-1">
                                  <div className="text-right min-w-[90px]">
                                    <p className="text-[10px] text-muted-foreground">Display</p>
                                    <p className="text-[13px] font-bold tabular-nums text-foreground">
                                      {formatVND(pc.displayPrice)}
                                    </p>
                                  </div>
                                  <div className="text-right min-w-[80px]">
                                    <p className="text-[10px] text-muted-foreground">Ref</p>
                                    <p className="text-[11px] tabular-nums text-muted-foreground">
                                      {formatVND(pc.referencePrice)}
                                    </p>
                                  </div>
                                  <div className="text-right min-w-[60px]">
                                    <p className="text-[10px] text-muted-foreground">Delta</p>
                                    <p className={cn(
                                      "text-[12px] font-bold tabular-nums",
                                      pc.deltaPercent === 0 ? "text-muted-foreground" :
                                      Math.abs(pc.deltaPercent) > 15 ? "text-critical" :
                                      Math.abs(pc.deltaPercent) > 5 ? "text-warning" :
                                      "text-success"
                                    )}>
                                      {pc.deltaPercent > 0 ? '+' : ''}{pc.deltaPercent.toFixed(1)}%
                                    </p>
                                  </div>
                                </div>

                                {/* Quality Indicators */}
                                <div className="flex items-center gap-2">
                                  <StatusBadge status={mappingStatus} size="xs" />
                                  <StatusBadge status={pc.compareQuality} size="xs" />
                                  {pc.evidenceStatus === 'available' ? (
                                    <CheckCircle2 className="h-4 w-4 text-success" />
                                  ) : pc.evidenceStatus === 'stale' ? (
                                    <Clock className="h-4 w-4 text-warning" />
                                  ) : (
                                    <XCircle className="h-4 w-4 text-critical" />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </div>
                  </Collapsible>
                ))
              )}
            </div>
          ) : (
            /* Row View - Original Table */
            <div className="min-w-[1400px]">
              <table className="w-full border-collapse">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-muted/80 backdrop-blur-sm">
                    <th className="w-10 px-3 py-3 text-left" />
                    <th className="px-3 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Property</th>
                    <th className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Channel</th>
                    <th className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Device</th>
                    <th className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Room</th>
                    <th className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Rate</th>
                    <th className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Cancel</th>
                    <th className="px-2 py-3 text-left text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Stay</th>
                    <th className="px-2 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Display</th>
                    <th className="px-2 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Ref</th>
                    <th className="px-2 py-3 text-right text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Delta</th>
                    <th className="px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Quality</th>
                    <th className="px-2 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Evidence</th>
                    <th className="px-3 py-3 text-center text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Alert</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/30">
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={14} className="py-20 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                            <Eye className="h-6 w-6 text-muted-foreground/50" />
                          </div>
                          <p className="text-[13px] font-medium text-muted-foreground">No price captures found</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((pc) => (
                      <tr
                        key={pc.id}
                        className={getRowClassName(pc)}
                        onClick={() => setSelectedCapture(pc)}
                      >
                        <td className="w-10 px-3 py-2.5">
                          {pc.alertStatus === 'critical' && (
                            <AlertTriangle className="h-4 w-4 text-critical" />
                          )}
                          {pc.alertStatus === 'medium' && (
                            <AlertTriangle className="h-4 w-4 text-warning" />
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-[12px] font-medium text-foreground">
                          {pc.propertyName.split(' ').slice(0, 3).join(' ')}
                        </td>
                        <td className="px-2 py-2.5 text-[12px] text-foreground">{pc.channelName}</td>
                        <td className="px-2 py-2.5">
                          <div className={cn(
                            "inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-semibold",
                            pc.deviceType === 'desktop' ? "bg-info/10 text-info" : "bg-success/10 text-success"
                          )}>
                            {pc.deviceType === 'desktop' ? <Monitor className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                            {pc.deviceType}
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-[11px] text-muted-foreground">{pc.roomType}</td>
                        <td className="px-2 py-2.5 text-[10px] text-muted-foreground">{pc.ratePlan}</td>
                        <td className="px-2 py-2.5"><StatusBadge status={pc.cancellationPolicy} size="xs" /></td>
                        <td className="px-2 py-2.5 text-[11px] tabular-nums text-muted-foreground">
                          {format(new Date(pc.stayDate), 'MMM d')}
                        </td>
                        <td className="px-2 py-2.5 text-right text-[13px] font-bold tabular-nums text-foreground">
                          {formatVND(pc.displayPrice)}
                        </td>
                        <td className="px-2 py-2.5 text-right text-[11px] tabular-nums text-muted-foreground">
                          {formatVND(pc.referencePrice)}
                        </td>
                        <td className="px-2 py-2.5 text-right">
                          <span className={cn(
                            "text-[12px] font-bold tabular-nums",
                            pc.deltaPercent === 0 ? "text-muted-foreground" :
                            Math.abs(pc.deltaPercent) > 15 ? "text-critical" :
                            Math.abs(pc.deltaPercent) > 5 ? "text-warning" :
                            "text-success"
                          )}>
                            {pc.deltaPercent > 0 ? '+' : ''}{pc.deltaPercent.toFixed(1)}%
                          </span>
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          <StatusBadge status={pc.compareQuality} size="xs" />
                        </td>
                        <td className="px-2 py-2.5 text-center">
                          {pc.evidenceStatus === 'available' ? (
                            <CheckCircle2 className="mx-auto h-4 w-4 text-success" />
                          ) : pc.evidenceStatus === 'stale' ? (
                            <Clock className="mx-auto h-4 w-4 text-warning" />
                          ) : (
                            <XCircle className="mx-auto h-4 w-4 text-critical" />
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          {pc.alertStatus !== 'none' && <StatusBadge status={pc.alertStatus} size="xs" />}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Detail Drawer */}
      <Sheet open={!!selectedCapture} onOpenChange={() => setSelectedCapture(null)}>
        <SheetContent className="w-[600px] border-l border-border bg-card p-0 overflow-y-auto">
          {selectedCapture && (
            <>
              {/* Header */}
              <SheetHeader className="sticky top-0 z-10 border-b border-border bg-card px-6 py-5">
                <div className="flex items-start justify-between">
                  <div>
                    <SheetTitle className="text-[15px] font-semibold text-foreground">
                      {selectedCapture.propertyName}
                    </SheetTitle>
                    <p className="mt-1.5 flex items-center gap-2 text-[12px] text-muted-foreground">
                      <span className="font-medium">{selectedCapture.channelName}</span>
                      <span className="text-border">·</span>
                      <span className={cn(
                        "inline-flex items-center gap-1",
                        selectedCapture.deviceType === 'desktop' ? "text-info" : "text-success"
                      )}>
                        {selectedCapture.deviceType === 'desktop' ? <Monitor className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                        {selectedCapture.deviceType}
                      </span>
                      <span className="text-border">·</span>
                      <span>{selectedCapture.roomType}</span>
                    </p>
                  </div>
                  {selectedCapture.alertStatus !== 'none' && (
                    <StatusBadge status={selectedCapture.alertStatus} size="sm" />
                  )}
                </div>
              </SheetHeader>

              <div className="flex flex-col">
                {/* Price Comparison */}
                <section className="border-b border-border p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Banknote className="h-4 w-4" />
                    Price Comparison
                  </h3>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="rounded-xl border border-border bg-gradient-to-br from-muted/30 to-transparent p-4">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Display Price</p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-foreground">
                        {formatVND(selectedCapture.displayPrice)}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">OTA selling price</p>
                    </div>
                    <div className="rounded-xl border border-border bg-muted/10 p-4">
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Reference Price</p>
                      <p className="mt-2 text-2xl font-bold tabular-nums text-muted-foreground">
                        {formatVND(selectedCapture.referencePrice)}
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">Internal rate</p>
                    </div>
                    <div className={cn(
                      "rounded-xl border p-4",
                      selectedCapture.deltaPercent === 0 ? "border-border bg-muted/10" :
                      Math.abs(selectedCapture.deltaPercent) > 15 ? "border-critical/40 bg-critical/10" :
                      Math.abs(selectedCapture.deltaPercent) > 5 ? "border-warning/40 bg-warning/10" :
                      "border-success/40 bg-success/10"
                    )}>
                      <p className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Delta</p>
                      <p className={cn(
                        'mt-2 text-2xl font-bold tabular-nums',
                        selectedCapture.deltaPercent === 0 ? 'text-muted-foreground' : 
                        Math.abs(selectedCapture.deltaPercent) > 15 ? 'text-critical' : 
                        Math.abs(selectedCapture.deltaPercent) > 5 ? 'text-warning' : 'text-success'
                      )}>
                        {selectedCapture.deltaPercent > 0 ? '+' : ''}{selectedCapture.deltaPercent.toFixed(1)}%
                      </p>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        {selectedCapture.delta > 0 ? '+' : ''}{formatVND(Math.abs(selectedCapture.delta))}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Commercial Interpretation */}
                <section className="border-b border-border p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Percent className="h-4 w-4" />
                    Commercial Interpretation
                  </h3>
                  <div className="space-y-3">
                    {selectedCapture.commissionAssumption && (
                      <div className="flex items-center justify-between rounded-lg border border-border bg-muted/10 px-4 py-3">
                        <div>
                          <p className="text-[10px] text-muted-foreground">Commission Assumption</p>
                          <p className="text-[12px] font-medium text-foreground">{selectedCapture.commissionAssumption}%</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-muted-foreground">Est. Payout Impact</p>
                          <p className="text-[12px] font-medium text-foreground">
                            {formatVND(Math.round(selectedCapture.displayPrice * (1 - (selectedCapture.commissionAssumption || 15) / 100)))}
                          </p>
                        </div>
                      </div>
                    )}
                    {selectedCapture.promotionStackingNote && (
                      <div className="rounded-lg border border-info/30 bg-info/5 px-4 py-3">
                        <p className="text-[10px] font-medium uppercase text-info">Promotion Stacking</p>
                        <p className="mt-1 text-[11px] text-foreground">{selectedCapture.promotionStackingNote}</p>
                      </div>
                    )}
                    <div className="rounded-lg border border-border bg-muted/10 px-4 py-3">
                      <p className="text-[10px] text-muted-foreground">Cancellation Policy</p>
                      <div className="mt-1 flex items-center gap-2">
                        <StatusBadge status={selectedCapture.cancellationPolicy} size="sm" />
                        {selectedCapture.cancellationPolicy === 'non-refundable' && (
                          <span className="text-[10px] text-muted-foreground">(typically 10-20% lower than flexible)</span>
                        )}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Trust & Evidence */}
                <section className="border-b border-border p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <ShieldCheck className="h-4 w-4" />
                    Trust & Evidence
                  </h3>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="rounded-lg border border-border bg-muted/10 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {getSourceIcon(selectedCapture.sourceType)}
                            <span className="text-[11px] text-muted-foreground">Source Type</span>
                          </div>
                          <StatusBadge status={selectedCapture.sourceType} size="xs" />
                        </div>
                      </div>
                      <div className="rounded-lg border border-border bg-muted/10 px-4 py-3">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] text-muted-foreground">Confidence</span>
                          <div className={cn(
                            "rounded-md px-2 py-0.5 text-[10px] font-semibold",
                            selectedCapture.sourceConfidence === 'high' ? "bg-success/15 text-success" :
                            selectedCapture.sourceConfidence === 'medium' ? "bg-info/15 text-info" :
                            "bg-warning/15 text-warning"
                          )}>
                            {selectedCapture.sourceConfidence}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={cn(
                      "rounded-lg border px-4 py-3",
                      selectedCapture.evidenceStatus === 'available' ? "border-success/30 bg-success/5" :
                      selectedCapture.evidenceStatus === 'stale' ? "border-warning/30 bg-warning/5" :
                      "border-critical/30 bg-critical/5"
                    )}>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-medium text-foreground">Evidence Status</span>
                        <div className={cn(
                          "flex items-center gap-2 text-[11px] font-semibold",
                          selectedCapture.evidenceStatus === 'available' ? "text-success" :
                          selectedCapture.evidenceStatus === 'stale' ? "text-warning" :
                          "text-critical"
                        )}>
                          {selectedCapture.evidenceStatus === 'available' && <CheckCircle2 className="h-3.5 w-3.5" />}
                          {selectedCapture.evidenceStatus === 'stale' && <Clock className="h-3.5 w-3.5" />}
                          {selectedCapture.evidenceStatus === 'missing' && <XCircle className="h-3.5 w-3.5" />}
                          {selectedCapture.evidenceStatus}
                        </div>
                      </div>
                      <p className="mt-1 text-[10px] text-muted-foreground">
                        Captured {formatDistanceToNow(new Date(selectedCapture.lastCapturedAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                </section>

                {/* Why Mismatch Likely */}
                {selectedCapture.alertStatus !== 'none' && (
                  <section className="border-b border-border p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <HelpCircle className="h-4 w-4" />
                      Why Mismatch Likely
                    </h3>
                    <div className="space-y-2">
                      {getLikelyMismatchReasons(selectedCapture).map((reason, i) => (
                        <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-muted/10 px-3 py-2">
                          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-info" />
                          <p className="text-[11px] text-foreground">{reason}</p>
                        </div>
                      ))}
                      {getLikelyMismatchReasons(selectedCapture).length === 0 && (
                        <p className="text-[11px] text-muted-foreground">No specific mismatch reasons identified</p>
                      )}
                    </div>
                  </section>
                )}

                {/* Related Captures */}
                {relatedCaptures.length > 0 && (
                  <section className="border-b border-border p-6">
                    <h3 className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                      <ArrowLeftRight className="h-4 w-4" />
                      Compare: Same Room & Date
                    </h3>
                    <div className="space-y-2">
                      {relatedCaptures.map((rc) => (
                        <div
                          key={rc.id}
                          className={cn(
                            "flex items-center justify-between rounded-lg border px-4 py-3 cursor-pointer transition-colors",
                            rc.alertStatus === 'critical' ? "border-critical/30 bg-critical/5 hover:bg-critical/10" :
                            rc.alertStatus === 'medium' ? "border-warning/30 bg-warning/5 hover:bg-warning/10" :
                            "border-border bg-muted/10 hover:bg-muted/30"
                          )}
                          onClick={() => setSelectedCapture(rc)}
                        >
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              "flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold",
                              rc.deviceType === 'desktop' ? "bg-info/10 text-info" : "bg-success/10 text-success"
                            )}>
                              {rc.deviceType === 'desktop' ? <Monitor className="h-3 w-3" /> : <Smartphone className="h-3 w-3" />}
                              {rc.deviceType}
                            </div>
                            <div>
                              <p className="text-[11px] font-medium text-foreground">{rc.channelName}</p>
                              <p className="text-[9px] text-muted-foreground">{rc.ratePlan}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-[12px] font-bold tabular-nums text-foreground">
                              {formatVND(rc.displayPrice)}
                            </p>
                            <p className={cn(
                              'text-[10px] font-semibold tabular-nums',
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

                {/* Mapping Info */}
                <section className="p-6">
                  <h3 className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-wider text-muted-foreground">
                    <Link2 className="h-4 w-4" />
                    Room & Rate Mapping
                  </h3>
                  {selectedMapping ? (
                    <div className="rounded-lg border border-border bg-muted/10 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">OTA Room</span>
                        <span className="text-[11px] font-medium text-foreground">{selectedMapping.otaRoomName || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">OTA Rate Plan</span>
                        <span className="text-[11px] text-foreground">{selectedMapping.otaRatePlanName || '—'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] text-muted-foreground">Mapping Status</span>
                        <StatusBadge status={selectedMapping.status} size="sm" />
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-lg border border-warning/40 bg-warning/5 p-4">
                      <div className="flex items-center gap-3">
                        <AlertTriangle className="h-5 w-5 text-warning" />
                        <div>
                          <p className="text-[11px] font-semibold text-warning">No mapping found</p>
                          <p className="text-[10px] text-muted-foreground">
                            Price comparison may be unreliable without proper mapping.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </section>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <AddPriceCaptureModal open={showAddCapture} onOpenChange={setShowAddCapture} />
    </DashboardLayout>
  );
}
