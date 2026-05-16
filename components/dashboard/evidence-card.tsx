'use client';

import { cn } from '@/lib/utils';
import { StatusBadge } from './status-badge';
import type { Evidence } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ExternalLink, Image as ImageIcon } from 'lucide-react';

interface EvidenceCardProps {
  evidence: Evidence;
  onClick?: () => void;
  className?: string;
}

export function EvidenceCard({ evidence, onClick, className }: EvidenceCardProps) {
  return (
    <div
      className={cn(
        'group rounded-lg border border-border bg-card overflow-hidden transition-colors',
        onClick && 'cursor-pointer hover:border-muted-foreground/50',
        className
      )}
      onClick={onClick}
    >
      {/* Screenshot thumbnail placeholder */}
      <div className="relative aspect-video bg-muted">
        <div className="absolute inset-0 flex items-center justify-center">
          <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
        </div>
        <div className="absolute bottom-2 left-2">
          <StatusBadge status={evidence.status} size="sm" />
        </div>
      </div>

      <div className="p-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-foreground">
              {evidence.propertyName}
            </p>
            <p className="mt-0.5 truncate text-xs text-muted-foreground">
              {evidence.channelName}
              {evidence.roomType && ` · ${evidence.roomType}`}
            </p>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap gap-2">
          {Object.entries(evidence.extractedData).slice(0, 3).map(([key, value]) => (
            <span
              key={key}
              className="inline-flex items-center rounded bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground"
            >
              {key}: {value}
            </span>
          ))}
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-border pt-2">
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(evidence.capturedAt), { addSuffix: true })}
          </span>
          <ExternalLink className="h-3 w-3 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
        </div>
      </div>
    </div>
  );
}
