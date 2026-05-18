import * as React from 'react';
import { cn } from '@/lib/utils';

interface StateBannerProps {
  tone?: 'info' | 'success' | 'warning' | 'critical';
  title: string;
  description?: string;
  actions?: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function StateBanner({
  tone = 'info',
  title,
  description,
  actions,
  icon,
  className,
}: StateBannerProps) {
  return (
    <div
      className={cn(
        'rounded-lg border px-4 py-3',
        tone === 'info' && 'border-info/20 bg-info/5',
        tone === 'success' && 'border-success/20 bg-success/5',
        tone === 'warning' && 'border-warning/25 bg-warning/8',
        tone === 'critical' && 'border-critical/25 bg-critical/8',
        className
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 gap-3">
          {icon && <div className="mt-0.5 shrink-0">{icon}</div>}
          <div className="min-w-0">
            <p className="text-[12px] font-medium text-foreground">{title}</p>
            {description && <p className="mt-1 text-[11px] text-muted-foreground">{description}</p>}
          </div>
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}
