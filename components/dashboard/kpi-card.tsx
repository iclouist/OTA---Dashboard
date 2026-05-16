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
        'rounded-lg border border-border bg-card p-4',
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">{title}</p>
          <p
            className={cn(
              'text-2xl font-semibold tracking-tight',
              status === 'success' && 'text-success',
              status === 'warning' && 'text-warning',
              status === 'critical' && 'text-critical',
              status === 'default' && 'text-foreground'
            )}
          >
            {value}
          </p>
        </div>
        {Icon && (
          <div
            className={cn(
              'rounded-md p-2',
              status === 'success' && 'bg-success/10 text-success',
              status === 'warning' && 'bg-warning/10 text-warning',
              status === 'critical' && 'bg-critical/10 text-critical',
              status === 'default' && 'bg-muted text-muted-foreground'
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-2 flex items-center gap-1 text-xs">
          <span
            className={cn(
              trend.value >= 0 ? 'text-success' : 'text-critical'
            )}
          >
            {trend.value >= 0 ? '+' : ''}
            {trend.value}%
          </span>
          <span className="text-muted-foreground">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
