import { cn } from '@/lib/utils';
import { StatusBadge } from './status-badge';
import type { Alert } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Camera, ChevronRight } from 'lucide-react';

interface AlertRowProps {
  alert: Alert;
  onClick?: () => void;
  compact?: boolean;
  className?: string;
}

export function AlertRow({ alert, onClick, compact = false, className }: AlertRowProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 border-b border-border px-4 py-3 transition-colors last:border-0',
        onClick && 'cursor-pointer hover:bg-accent/50',
        className
      )}
      onClick={onClick}
    >
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-md',
          alert.severity === 'critical' && 'bg-critical/15 text-critical',
          alert.severity === 'high' && 'bg-critical/15 text-critical',
          alert.severity === 'medium' && 'bg-warning/15 text-warning',
          alert.severity === 'low' && 'bg-info/15 text-info'
        )}
      >
        <AlertTriangle className="h-4 w-4" />
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">
            {alert.title}
          </p>
          {alert.hasEvidence && (
            <Camera className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
          )}
        </div>
        {!compact && (
          <p className="mt-0.5 truncate text-xs text-muted-foreground">
            {alert.propertyName}
            {alert.channelName && ` · ${alert.channelName}`}
            {alert.roomType && ` · ${alert.roomType}`}
          </p>
        )}
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <StatusBadge status={alert.severity} size="sm" />
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(new Date(alert.lastSeen), { addSuffix: true })}
        </span>
        {onClick && <ChevronRight className="h-4 w-4 text-muted-foreground" />}
      </div>
    </div>
  );
}

interface AlertListProps {
  alerts: Alert[];
  onAlertClick?: (alert: Alert) => void;
  compact?: boolean;
  maxItems?: number;
  className?: string;
}

export function AlertList({
  alerts,
  onAlertClick,
  compact = false,
  maxItems,
  className,
}: AlertListProps) {
  const displayAlerts = maxItems ? alerts.slice(0, maxItems) : alerts;

  if (displayAlerts.length === 0) {
    return (
      <div className={cn('py-8 text-center text-sm text-muted-foreground', className)}>
        No alerts to display
      </div>
    );
  }

  return (
    <div className={cn('divide-y divide-border', className)}>
      {displayAlerts.map((alert) => (
        <AlertRow
          key={alert.id}
          alert={alert}
          onClick={onAlertClick ? () => onAlertClick(alert) : undefined}
          compact={compact}
        />
      ))}
    </div>
  );
}
