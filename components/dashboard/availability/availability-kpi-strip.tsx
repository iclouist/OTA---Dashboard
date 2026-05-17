'use client';

import {
  Building2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Ban,
  Clock,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AvailabilityKPIs } from '@/lib/types';

interface AvailabilityKPIStripProps {
  kpis: AvailabilityKPIs;
  onSyncAll?: () => void;
}

export function AvailabilityKPIStrip({ kpis, onSyncAll }: AvailabilityKPIStripProps) {
  // Determine which KPIs need attention
  const hasRiskIssues = kpis.propertiesAtRisk > 0;
  const hasClosedDates = kpis.closedDates > 0;
  const hasNotSellable = kpis.channelsWithSellabilityIssues > 0;
  const hasStaleSyncs = kpis.staleSyncs > 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg",
            hasRiskIssues || hasNotSellable ? "bg-warning/10 ring-1 ring-warning/20" : "bg-success/10 ring-1 ring-success/20"
          )}>
            {hasRiskIssues || hasNotSellable ? (
              <AlertTriangle className="h-4 w-4 text-warning" />
            ) : (
              <CheckCircle2 className="h-4 w-4 text-success" />
            )}
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">Availability Status</h2>
            <p className="text-[11px] text-muted-foreground">Multi-channel inventory and sellability health</p>
          </div>
        </div>
        <Button variant="outline" size="sm" className="gap-2 h-8" onClick={onSyncAll}>
          <RefreshCw className="h-3.5 w-3.5" />
          Sync All
        </Button>
      </div>

      {/* KPI Cards - with visual hierarchy */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {/* Properties Open - Quiet/Success state */}
        <div className="rounded-lg border border-success/30 bg-success/5 p-4">
          <div className="flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-success" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-success">Open</span>
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums text-success">{kpis.propertiesOpen}</p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Active properties</p>
        </div>

        {/* At Risk - Emphasized when > 0 */}
        <div className={cn(
          "rounded-lg border p-4 transition-all",
          hasRiskIssues 
            ? "border-critical/40 bg-critical/8 ring-1 ring-critical/10" 
            : "border-border bg-card"
        )}>
          <div className="flex items-center gap-1.5">
            <AlertTriangle className={cn("h-3.5 w-3.5", hasRiskIssues ? "text-critical" : "text-muted-foreground")} />
            <span className={cn("text-[10px] font-medium uppercase tracking-wider", hasRiskIssues ? "text-critical" : "text-muted-foreground")}>
              At Risk
            </span>
          </div>
          <p className={cn("mt-2 text-3xl font-bold tabular-nums", hasRiskIssues ? "text-critical" : "text-muted-foreground")}>
            {kpis.propertiesAtRisk}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Channels with issues</p>
        </div>

        {/* Closed Dates - Emphasized when > 0 */}
        <div className={cn(
          "rounded-lg border p-4 transition-all",
          hasClosedDates 
            ? "border-warning/40 bg-warning/8 ring-1 ring-warning/10" 
            : "border-border bg-card"
        )}>
          <div className="flex items-center gap-1.5">
            <XCircle className={cn("h-3.5 w-3.5", hasClosedDates ? "text-warning" : "text-muted-foreground")} />
            <span className={cn("text-[10px] font-medium uppercase tracking-wider", hasClosedDates ? "text-warning" : "text-muted-foreground")}>
              Closed
            </span>
          </div>
          <p className={cn("mt-2 text-3xl font-bold tabular-nums", hasClosedDates ? "text-warning" : "text-muted-foreground")}>
            {kpis.closedDates}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Dates across channels</p>
        </div>

        {/* Low Inventory - Info state */}
        <div className={cn(
          "rounded-lg border p-4",
          kpis.lowInventoryRooms > 0 ? "border-info/30 bg-info/5" : "border-border bg-card"
        )}>
          <div className="flex items-center gap-1.5">
            <MinusCircle className={cn("h-3.5 w-3.5", kpis.lowInventoryRooms > 0 ? "text-info" : "text-muted-foreground")} />
            <span className={cn("text-[10px] font-medium uppercase tracking-wider", kpis.lowInventoryRooms > 0 ? "text-info" : "text-muted-foreground")}>
              Low Stock
            </span>
          </div>
          <p className={cn("mt-2 text-3xl font-bold tabular-nums", kpis.lowInventoryRooms > 0 ? "text-info" : "text-muted-foreground")}>
            {kpis.lowInventoryRooms}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Room-date combos</p>
        </div>

        {/* Not Sellable - Critical emphasis */}
        <div className={cn(
          "rounded-lg border p-4 transition-all",
          hasNotSellable 
            ? "border-critical/40 bg-critical/8 ring-1 ring-critical/10" 
            : "border-border bg-card"
        )}>
          <div className="flex items-center gap-1.5">
            <Ban className={cn("h-3.5 w-3.5", hasNotSellable ? "text-critical" : "text-muted-foreground")} />
            <span className={cn("text-[10px] font-medium uppercase tracking-wider", hasNotSellable ? "text-critical" : "text-muted-foreground")}>
              Blocked
            </span>
          </div>
          <p className={cn("mt-2 text-3xl font-bold tabular-nums", hasNotSellable ? "text-critical" : "text-muted-foreground")}>
            {kpis.channelsWithSellabilityIssues}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Not sellable</p>
        </div>

        {/* Stale Syncs - Warning emphasis */}
        <div className={cn(
          "rounded-lg border p-4 transition-all",
          hasStaleSyncs 
            ? "border-warning/40 bg-warning/8 ring-1 ring-warning/10" 
            : "border-border bg-card"
        )}>
          <div className="flex items-center gap-1.5">
            <Clock className={cn("h-3.5 w-3.5", hasStaleSyncs ? "text-warning" : "text-muted-foreground")} />
            <span className={cn("text-[10px] font-medium uppercase tracking-wider", hasStaleSyncs ? "text-warning" : "text-muted-foreground")}>
              Stale
            </span>
          </div>
          <p className={cn("mt-2 text-3xl font-bold tabular-nums", hasStaleSyncs ? "text-warning" : "text-muted-foreground")}>
            {kpis.staleSyncs}
          </p>
          <p className="mt-0.5 text-[10px] text-muted-foreground">Need refresh</p>
        </div>
      </div>
    </div>
  );
}
