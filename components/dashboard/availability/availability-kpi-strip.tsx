'use client';

import {
  Building2,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Ban,
  Clock,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { AvailabilityKPIs } from '@/lib/types';

interface AvailabilityKPIStripProps {
  kpis: AvailabilityKPIs;
  onSyncAll?: () => void;
}

interface KPICardProps {
  icon: React.ReactNode;
  label: string;
  value: number;
  sublabel: string;
  isAlert?: boolean;
  alertLevel?: 'critical' | 'warning' | 'info';
  isQuiet?: boolean;
}

function KPICard({ icon, label, value, sublabel, isAlert, alertLevel, isQuiet }: KPICardProps) {
  const getBorderClass = () => {
    if (isQuiet || value === 0) return 'border-border/50 bg-card/50';
    if (isAlert && alertLevel === 'critical') return 'border-critical/40 bg-critical/5';
    if (isAlert && alertLevel === 'warning') return 'border-warning/40 bg-warning/5';
    return 'border-border bg-card';
  };

  const getValueClass = () => {
    if (isQuiet || value === 0) return 'text-muted-foreground';
    if (isAlert && alertLevel === 'critical') return 'text-critical';
    if (isAlert && alertLevel === 'warning') return 'text-warning';
    return 'text-foreground';
  };

  const getIconClass = () => {
    if (isQuiet || value === 0) return 'text-muted-foreground/50';
    if (isAlert && alertLevel === 'critical') return 'text-critical';
    if (isAlert && alertLevel === 'warning') return 'text-warning';
    return 'text-muted-foreground';
  };

  return (
    <div className={cn(
      "rounded-lg border p-3.5 transition-all",
      getBorderClass(),
      isAlert && value > 0 && "shadow-sm"
    )}>
      <div className={cn("flex items-center gap-1.5", getIconClass())}>
        {icon}
        <span className="text-[10px] font-medium uppercase tracking-wide">{label}</span>
      </div>
      <p className={cn(
        "mt-2 text-2xl font-bold tabular-nums leading-none",
        getValueClass()
      )}>
        {value}
      </p>
      <p className="mt-1 text-[10px] text-muted-foreground">{sublabel}</p>
    </div>
  );
}

export function AvailabilityKPIStrip({ kpis, onSyncAll }: AvailabilityKPIStripProps) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[13px] font-semibold text-foreground">Availability Overview</span>
          <span className="text-[11px] text-muted-foreground">Multi-channel inventory status</span>
        </div>
        <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[11px]" onClick={onSyncAll}>
          <RefreshCw className="h-3 w-3" />
          Sync All
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
        {/* Healthy - quieter */}
        <KPICard
          icon={<Building2 className="h-3.5 w-3.5" />}
          label="Properties Open"
          value={kpis.propertiesOpen}
          sublabel="Active & sellable"
          isQuiet
        />

        {/* Problem indicators - prominent when non-zero */}
        <KPICard
          icon={<AlertTriangle className="h-3.5 w-3.5" />}
          label="At Risk"
          value={kpis.propertiesAtRisk}
          sublabel="Channels with issues"
          isAlert
          alertLevel="critical"
        />

        <KPICard
          icon={<XCircle className="h-3.5 w-3.5" />}
          label="Closed Dates"
          value={kpis.closedDates}
          sublabel="Across all channels"
          isAlert
          alertLevel="warning"
        />

        <KPICard
          icon={<MinusCircle className="h-3.5 w-3.5" />}
          label="Low Inventory"
          value={kpis.lowInventoryRooms}
          sublabel="Room-date combos"
          isAlert
          alertLevel="warning"
        />

        <KPICard
          icon={<Ban className="h-3.5 w-3.5" />}
          label="Not Sellable"
          value={kpis.channelsWithSellabilityIssues}
          sublabel="Channels blocked"
          isAlert
          alertLevel="critical"
        />

        <KPICard
          icon={<Clock className="h-3.5 w-3.5" />}
          label="Stale Syncs"
          value={kpis.staleSyncs}
          sublabel="Need refresh"
          isAlert
          alertLevel="warning"
        />
      </div>
    </section>
  );
}
