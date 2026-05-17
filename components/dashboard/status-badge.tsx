import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
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

  // Verification status
  parsed: { label: 'Parsed', color: 'text-success', bg: 'bg-success/10' },
  'link-only': { label: 'Link Only', color: 'text-warning', bg: 'bg-warning/10' },
  'needs-admin-review': { label: 'Needs Review', color: 'text-warning', bg: 'bg-warning/10' },
  'verified-by-screenshot': { label: 'Screenshot Verified', color: 'text-success', bg: 'bg-success/10' },
  stale: { label: 'Stale', color: 'text-warning', bg: 'bg-warning/10' },
  pending: { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10' },

  // Evidence status
  verified: { label: 'Verified', color: 'text-success', bg: 'bg-success/10' },
  flagged: { label: 'Flagged', color: 'text-critical', bg: 'bg-critical/10' },

  // Source confidence
  'pending-verification': { label: 'Pending', color: 'text-warning', bg: 'bg-warning/10' },

  // Mapping status
  complete: { label: 'Complete', color: 'text-success', bg: 'bg-success/10' },
  partial: { label: 'Partial', color: 'text-warning', bg: 'bg-warning/10' },
  unmapped: { label: 'Unmapped', color: 'text-critical', bg: 'bg-critical/10' },
  'needs-verification': { label: 'Needs Verify', color: 'text-warning', bg: 'bg-warning/10' },

  // Onboarding status
  draft: { label: 'Draft', color: 'text-muted-foreground', bg: 'bg-muted' },
  'mapping-needed': { label: 'Mapping Needed', color: 'text-warning', bg: 'bg-warning/10' },
  'email-live': { label: 'Email Live', color: 'text-info', bg: 'bg-info/10' },
  'price-monitor-live': { label: 'Monitor Live', color: 'text-success', bg: 'bg-success/10' },
  'verification-pending': { label: 'Verify Pending', color: 'text-warning', bg: 'bg-warning/10' },

  // Data freshness
  fresh: { label: 'Fresh', color: 'text-success', bg: 'bg-success/10' },
  missing: { label: 'Missing', color: 'text-critical', bg: 'bg-critical/10' },

  // Device type
  desktop: { label: 'Desktop', color: 'text-foreground', bg: 'bg-muted' },
  mobile: { label: 'Mobile', color: 'text-foreground', bg: 'bg-muted' },

  // Compare quality
  strict: { label: 'Strict', color: 'text-success', bg: 'bg-success/10' },
  normalized: { label: 'Normalized', color: 'text-info', bg: 'bg-info/10' },
  uncertain: { label: 'Uncertain', color: 'text-warning', bg: 'bg-warning/10' },

  // Source types
  'email-parsed': { label: 'Email Parsed', color: 'text-success', bg: 'bg-success/10' },
  'admin-link-signal': { label: 'Admin Link', color: 'text-warning', bg: 'bg-warning/10' },
  'screenshot-captured': { label: 'Screenshot', color: 'text-info', bg: 'bg-info/10' },
  'internal-reference': { label: 'Internal Ref', color: 'text-foreground', bg: 'bg-muted' },
  'manual-entry': { label: 'Manual', color: 'text-muted-foreground', bg: 'bg-muted' },

  // Evidence availability
  available: { label: 'Available', color: 'text-success', bg: 'bg-success/10' },

  // Generic
  none: { label: 'None', color: 'text-muted-foreground', bg: 'bg-muted' },
  success: { label: 'Success', color: 'text-success', bg: 'bg-success/10' },
  failed: { label: 'Failed', color: 'text-critical', bg: 'bg-critical/10' },
  inactive: { label: 'Inactive', color: 'text-muted-foreground', bg: 'bg-muted' },
  match: { label: 'Match', color: 'text-success', bg: 'bg-success/10' },
  mismatch: { label: 'Mismatch', color: 'text-critical', bg: 'bg-critical/10' },
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
  status: string;
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
  active: 'bg-success',
  draft: 'bg-muted-foreground',
  stale: 'bg-warning',
  missing: 'bg-critical',
  fresh: 'bg-success',
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
  severity: string;
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
