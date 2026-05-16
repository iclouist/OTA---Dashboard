import { cn } from '@/lib/utils';
import type { HealthStatus, AlertSeverity, AlertStatus, AvailabilityStatus, ParityStatus } from '@/lib/types';

interface StatusBadgeProps {
  status: HealthStatus | AlertSeverity | AlertStatus | AvailabilityStatus | ParityStatus | string;
  size?: 'sm' | 'md';
  className?: string;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  // Health status
  healthy: { label: 'Healthy', className: 'bg-success/15 text-success border-success/20' },
  warning: { label: 'Warning', className: 'bg-warning/15 text-warning border-warning/20' },
  critical: { label: 'Critical', className: 'bg-critical/15 text-critical border-critical/20' },
  unknown: { label: 'Unknown', className: 'bg-muted text-muted-foreground border-border' },

  // Alert severity
  low: { label: 'Low', className: 'bg-info/15 text-info border-info/20' },
  medium: { label: 'Medium', className: 'bg-warning/15 text-warning border-warning/20' },
  high: { label: 'High', className: 'bg-critical/15 text-critical border-critical/20' },

  // Alert status
  active: { label: 'Active', className: 'bg-critical/15 text-critical border-critical/20' },
  acknowledged: { label: 'Acknowledged', className: 'bg-warning/15 text-warning border-warning/20' },
  resolved: { label: 'Resolved', className: 'bg-success/15 text-success border-success/20' },

  // Availability status
  available: { label: 'Available', className: 'bg-success/15 text-success border-success/20' },
  sold_out: { label: 'Sold Out', className: 'bg-critical/15 text-critical border-critical/20' },
  stale: { label: 'Stale', className: 'bg-warning/15 text-warning border-warning/20' },
  mismatch: { label: 'Mismatch', className: 'bg-critical/15 text-critical border-critical/20' },

  // Parity status
  match: { label: 'Match', className: 'bg-success/15 text-success border-success/20' },

  // Mapping status
  pending: { label: 'Pending', className: 'bg-warning/15 text-warning border-warning/20' },
  inactive: { label: 'Inactive', className: 'bg-muted text-muted-foreground border-border' },

  // Evidence status
  verified: { label: 'Verified', className: 'bg-success/15 text-success border-success/20' },
  flagged: { label: 'Flagged', className: 'bg-critical/15 text-critical border-critical/20' },

  // Generic
  success: { label: 'Success', className: 'bg-success/15 text-success border-success/20' },
  failed: { label: 'Failed', className: 'bg-critical/15 text-critical border-critical/20' },
};

export function StatusBadge({ status, size = 'sm', className }: StatusBadgeProps) {
  const config = statusConfig[status] || { label: status, className: 'bg-muted text-muted-foreground border-border' };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-md border font-medium',
        size === 'sm' && 'px-1.5 py-0.5 text-[10px]',
        size === 'md' && 'px-2 py-1 text-xs',
        config.className,
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

export function StatusDot({ status, className }: StatusDotProps) {
  return (
    <span
      className={cn(
        'inline-block h-2 w-2 rounded-full',
        dotColors[status] || 'bg-muted-foreground',
        className
      )}
    />
  );
}
