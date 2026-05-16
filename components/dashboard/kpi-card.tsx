import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface KPICardProps {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  status?: 'default' | 'success' | 'warning' | 'critical';
  className?: string;
}

export function KPICard({
  title,
  value,
  icon: Icon,
  trend,
  status = 'default',
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-border bg-card px-3 py-2.5',
        className
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </span>
        {Icon && (
          <Icon
            className={cn(
              'h-3.5 w-3.5',
              status === 'success' && 'text-success',
              status === 'warning' && 'text-warning',
              status === 'critical' && 'text-critical',
              status === 'default' && 'text-muted-foreground'
            )}
          />
        )}
      </div>
      <div className="mt-1 flex items-baseline gap-2">
        <span
          className={cn(
            'text-xl font-semibold tabular-nums tracking-tight',
            status === 'success' && 'text-success',
            status === 'warning' && 'text-warning',
            status === 'critical' && 'text-critical',
            status === 'default' && 'text-foreground'
          )}
        >
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'text-[11px] font-medium',
              trend.value >= 0 ? 'text-success' : 'text-critical'
            )}
          >
            {trend.value >= 0 ? '+' : ''}
            {trend.value}%
          </span>
        )}
      </div>
      {trend && (
        <span className="text-[10px] text-muted-foreground">{trend.label}</span>
      )}
    </div>
  );
}

// Inline KPI for toolbars
interface InlineKPIProps {
  label: string;
  value: string | number;
  status?: 'default' | 'success' | 'warning' | 'critical';
}

export function InlineKPI({ label, value, status = 'default' }: InlineKPIProps) {
  return (
    <div className="flex items-center gap-1.5 text-[12px]">
      <span className="text-muted-foreground">{label}:</span>
      <span
        className={cn(
          'font-medium tabular-nums',
          status === 'success' && 'text-success',
          status === 'warning' && 'text-warning',
          status === 'critical' && 'text-critical',
          status === 'default' && 'text-foreground'
        )}
      >
        {value}
      </span>
    </div>
  );
}
