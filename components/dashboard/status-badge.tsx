import { cn } from '@/lib/utils';
import type { HealthStatus, AlertSeverity, AlertStatus, AvailabilityStatus, ParityStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: HealthStatus | AlertSeverity | AlertStatus | AvailabilityStatus | ParityStatus | string;
  size?: 'xs' | 'sm' | 'md';
  variant?: 'default' | 'outline' | 'dot';
  className?: string;
}

const statusConfig: Record<string, { label: string; color: string; bg: string }> = {
  // Health status
  healthy: { label: 'Healthy', color: 'text-success', bg: 'bg-success/10' },
  warning: { label: 'Warning', color: 'text-warning', bg: 'bg-warning/10' },
  critical: { label: 'Critical', color: 'text-critical', bg: 'bg-critical/10' },
  unknown: { label: 'Unknown', color: 'text-muted-foreground', bg: 'bg-muted' },

  // Alert severity
  low: { label: 'Low', color: 'text-info', bg: 'bg-info/10' },
  medium: { label: 'Medium', color: 'text-warning', bg: 'bg-warning/10' },
  high: { label: 'High', color: 'text-critical', bg: 'bg-critical/10' },

  // Alert status
  active: { label: 'Active', color: 'text-critical', bg: 'bg-critical/10' },
  acknowledged: { label: 'Ack', color: 'text-warning', bg: 'bg-warning/10' },
  resolved: { label: 'Resolved', color: 'text-success', bg: 'bg-success/10' },

  // Availability status
  available: { label: 'Available', color: 'text-success', bg: 'bg-success/10' },
  sold_out: { label: 'Sold Out', color: 'text-critical', bg: 'bg-critical/10' },
  stale: { label: 'Stale', color: 'text-warning', bg: 'bg-warning/10' },
  mismatch: { label: 'Mismatch', color: 'text-critical', bg: 'bg-critical/10' },

  // Parity status
  match: { label: 'Match', color: 'text-success', bg: 'bg-success/10' },

  // Mapping status
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10' },
  inactive: { label: 'Inactive', color: 'text-muted-foreground', bg: 'bg-muted' },

  // Evidence status
  verified: { label: 'Verified', color: 'text-success', bg: 'bg-success/10' },
  flagged: { label: 'Flagged', color: 'text-critical', bg: 'bg-critical/10' },

  // Generic
  success: { label: 'Success', color: 'text-success', bg: 'bg-success/10' },
  failed: { label: 'Failed', color: 'text-critical', bg: 'bg-critical/10' },
};

export function StatusBadge({ status, size = 'sm', variant = 'default', className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, color: 'text-muted-foreground', bg: 'bg-muted' };

  if (variant === 'dot') {
    return (
      <span className={cn('inline-flex items-center gap-1.5', className)}>
        <span
          className={cn(
            'inline-block rounded-full',
            size === 'xs' && 'h-1.5 w-1.5',
            size === 'sm' && 'h-2 w-2',
            size === 'md' && 'h-2.5 w-2.5',
            config.color.replace('text-', 'bg-')
          )}
        />
        <span className={cn('text-foreground', size === 'xs' && 'text-[10px]', size === 'sm' && 'text-[11px]', size === 'md' && 'text-[12px]')}>
          {config.label}
        </span>
      </span>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center rounded font-medium',
        variant === 'default' && config.bg,
        variant === 'outline' && 'border border-current/20',
        size === 'xs' && 'px-1 py-0.5 text-[9px]',
        size === 'sm' && 'px-1.5 py-0.5 text-[10px]',
        size === 'md' && 'px-2 py-0.5 text-[11px]',
        config.color,
        className
      )}
    >
      {config.label}
    </span>
  );
}

// Dot indicator for inline status
interface StatusDotProps {
  status: HealthStatus | 'success' | 'failed' | 'pending';
  size?: 'sm' | 'md';
  className?: string;
}

const dotColors: Record<string, string> = {
  healthy: 'bg-success',
  success: 'bg-success',
  warning: 'bg-warning',
  pending: 'bg-warning',
  critical: 'bg-critical',
  failed: 'bg-critical',
  unknown: 'bg-muted-foreground',
};

export function StatusDot({ status, size = 'sm', className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block shrink-0 rounded-full',
        size === 'sm' && 'h-1.5 w-1.5',
        size === 'md' && 'h-2 w-2',
        dotColors[status] || 'bg-muted-foreground',
        className
      )}
    />
  );
}

// Severity indicator bar
interface SeverityBarProps {
  severity: AlertSeverity;
  className?: string;
}

export function SeverityBar({ severity, className }: SeverityBarProps) {
  return (
    <div
      className={cn(
        'h-full w-0.5 rounded-full',
        severity === 'critical' && 'bg-critical',
        severity === 'high' && 'bg-critical',
        severity === 'medium' && 'bg-warning',
        severity === 'low' && 'bg-info',
        className
      )}
    />
  );
}
