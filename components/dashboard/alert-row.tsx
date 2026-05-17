'use client';

import { cn } from '@/lib/utils';
import { StatusBadge, SeverityBar } from './status-badge';
import type { Alert } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight } from 'lucide-react';

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
        'group flex items-stretch border-b border-border/50 transition-colors last:border-0',
        onClick && 'cursor-pointer hover:bg-muted/30',
        className
      )}
      onClick={onClick}
    >
      <div className="flex w-1 shrink-0 py-2">
        <SeverityBar severity={alert.severity} />
      </div>

      <div className={cn('flex flex-1 items-center gap-3 px-3', compact ? 'py-1.5' : 'py-2')}>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="truncate text-[12px] font-medium text-foreground">
              {alert.title}
            </span>
          </div>
          {!compact && (
            <div className="mt-0.5 flex items-center gap-1 text-[11px] text-muted-foreground">
              <span className="truncate">{alert.propertyName}</span>
              {alert.channelName && (
                <>
                  <span className="text-border">·</span>
                  <span>{alert.channelName}</span>
                </>
              )}
            </div>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <StatusBadge status={alert.severity} size="xs" />
          <span className="text-[10px] tabular-nums text-muted-foreground">
            {formatDistanceToNow(new Date(alert.lastSeen), { addSuffix: false })}
          </span>
          {onClick && (
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
          )}
        </div>
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
      <div className={cn('py-6 text-center text-[12px] text-muted-foreground', className)}>
        No alerts
      </div>
    );
  }

  return (
    <div className={className}>
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
