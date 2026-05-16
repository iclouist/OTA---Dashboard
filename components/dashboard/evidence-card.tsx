'use client';

import { cn } from '@/lib/utils';
import { StatusBadge } from './status-badge';
import type { Evidence } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink } from 'lucide-react';

interface EvidenceCardProps {
  evidence: Evidence;
  onClick?: () => void;
  className?: string;
}

export function EvidenceCard({ evidence, onClick, className }: EvidenceCardProps) {
  return (
    <div
      className={cn(
        'group overflow-hidden rounded-md border border-border bg-card transition-colors',
        onClick && 'cursor-pointer hover:border-muted-foreground/40',
        className
      )}
      onClick={onClick}
    >
      {/* Screenshot thumbnail */}
      <div className="relative aspect-[16/10] bg-muted/50">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="h-6 w-10 rounded bg-muted" />
        </div>
        <div className="absolute bottom-1.5 left-1.5">
          <StatusBadge status={evidence.status} size="xs" />
        </div>
        <ExternalLink className="absolute right-1.5 top-1.5 h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      </div>

      <div className="p-2">
        <p className="truncate text-[11px] font-medium text-foreground">
          {evidence.propertyName}
        </p>
        <p className="mt-0.5 truncate text-[10px] text-muted-foreground">
          {evidence.channelName}
          {evidence.roomType && ` · ${evidence.roomType}`}
        </p>

        <div className="mt-1.5 flex flex-wrap gap-1">
          {Object.entries(evidence.extractedData).slice(0, 2).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex rounded bg-muted px-1 py-0.5 text-[9px] text-muted-foreground"
            >
              {key}: {value}
            </span>
          ))}
        </div>

        <div className="mt-1.5 border-t border-border/50 pt-1.5">
          <span className="text-[9px] text-muted-foreground">
            {formatDistanceToNow(new Date(evidence.capturedAt), { addSuffix: true })}
          </span>
        </div>
      </div>
    </div>
  );
}

// Inline evidence row for tables
interface EvidenceRowProps {
  evidence: Evidence;
  onClick?: () => void;
  className?: string;
}

export function EvidenceRow({ evidence, onClick, className }: EvidenceRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 border-b border-border/50 px-3 py-2 transition-colors last:border-0',
        onClick && 'cursor-pointer hover:bg-muted/30',
        className
      )}
      onClick={onClick}
    >
      <div className="h-8 w-12 shrink-0 rounded bg-muted/50" />
      <div className="min-w-0 flex-1">
        <p className="truncate text-[11px] font-medium text-foreground">
          {evidence.propertyName}
        </p>
        <p className="text-[10px] text-muted-foreground">
          {evidence.channelName} · {formatDistanceToNow(new Date(evidence.capturedAt), { addSuffix: true })}
        </p>
      </div>
      <StatusBadge status={evidence.status} size="xs" />
    </div>
  );
}
