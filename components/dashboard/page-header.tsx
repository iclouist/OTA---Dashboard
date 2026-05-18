import * as React from 'react';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  meta?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  meta,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('border-b border-border bg-background px-5 py-4', className)}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 space-y-1">
          {eyebrow && (
            <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {eyebrow}
            </p>
          )}
          <div className="space-y-1">
            <h1 className="text-[18px] font-semibold tracking-tight text-foreground">{title}</h1>
            {description && (
              <p className="max-w-3xl text-[12px] text-muted-foreground">{description}</p>
            )}
          </div>
          {meta && <div className="flex flex-wrap items-center gap-3 pt-1">{meta}</div>}
        </div>
        {actions && <div className="flex shrink-0 items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

interface PageMetaItemProps {
  label: string;
  value: React.ReactNode;
  tone?: 'default' | 'success' | 'warning' | 'critical';
}

export function PageMetaItem({ label, value, tone = 'default' }: PageMetaItemProps) {
  return (
    <div className="flex items-center gap-1.5 text-[11px]">
      <span className="text-muted-foreground">{label}</span>
      <span
        className={cn(
          'font-medium tabular-nums',
          tone === 'default' && 'text-foreground',
          tone === 'success' && 'text-success',
          tone === 'warning' && 'text-warning',
          tone === 'critical' && 'text-critical'
        )}
      >
        {value}
      </span>
    </div>
  );
}
