'use client';

import { cn } from '@/lib/utils';
import { StatusDot } from './status-badge';
import { formatDistanceToNow } from 'date-fns';
import { ChevronRight } from 'lucide-react';

type ChannelCardModel = {
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  propertiesTracked: number;
  successRate: number;
  activeIssues: number;
  lastScrape: string;
};

interface ChannelCardProps {
  channel: ChannelCardModel;
  onClick?: () => void;
  className?: string;
}

export function ChannelCard({ channel, onClick, className }: ChannelCardProps) {
  return (
    <div
      className={cn(
        'rounded-md border border-border bg-card p-2.5 transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/30',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <StatusDot status={channel.status} />
          <span className="text-[12px] font-medium text-foreground">{channel.name}</span>
        </div>
        <span className="text-[10px] text-muted-foreground">
          {channel.propertiesTracked}
        </span>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div>
            <span className="text-[10px] text-muted-foreground">Rate</span>
            <p
              className={cn(
                'text-[13px] font-semibold tabular-nums',
                channel.successRate >= 95 && 'text-success',
                channel.successRate >= 85 && channel.successRate < 95 && 'text-warning',
                channel.successRate < 85 && 'text-critical'
              )}
            >
              {channel.successRate.toFixed(0)}%
            </p>
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground">Issues</span>
            <p
              className={cn(
                'text-[13px] font-semibold tabular-nums',
                channel.activeIssues === 0 && 'text-foreground',
                channel.activeIssues > 0 && channel.activeIssues <= 2 && 'text-warning',
                channel.activeIssues > 2 && 'text-critical'
              )}
            >
              {channel.activeIssues}
            </p>
          </div>
        </div>
        <span className="text-[9px] text-muted-foreground">
          {formatDistanceToNow(new Date(channel.lastScrape), { addSuffix: false })}
        </span>
      </div>
    </div>
  );
}

// Inline channel row for lists
interface ChannelRowProps {
  channel: ChannelCardModel;
  onClick?: () => void;
  className?: string;
}

export function ChannelRow({ channel, onClick, className }: ChannelRowProps) {
  return (
    <div
      className={cn(
        'group flex items-center gap-3 border-b border-border/50 px-3 py-2 transition-colors last:border-0',
        onClick && 'cursor-pointer hover:bg-muted/30',
        className
      )}
      onClick={onClick}
    >
      <StatusDot status={channel.status} />
      <span className="min-w-0 flex-1 truncate text-[12px] font-medium text-foreground">
        {channel.name}
      </span>
      <span className="text-[11px] tabular-nums text-muted-foreground">
        {channel.propertiesTracked} props
      </span>
      <span
        className={cn(
          'text-[11px] font-medium tabular-nums',
          channel.successRate >= 95 && 'text-success',
          channel.successRate < 95 && 'text-warning'
        )}
      >
        {channel.successRate.toFixed(0)}%
      </span>
      {onClick && (
        <ChevronRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      )}
    </div>
  );
}
