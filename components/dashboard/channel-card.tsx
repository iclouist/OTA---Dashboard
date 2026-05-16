import { cn } from '@/lib/utils';
import { StatusDot } from './status-badge';
import type { Channel } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface ChannelCardProps {
  channel: Channel;
  onClick?: () => void;
  className?: string;
}

export function ChannelCard({ channel, onClick, className }: ChannelCardProps) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card p-4 transition-colors',
        onClick && 'cursor-pointer hover:bg-accent/50',
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          <StatusDot status={channel.status} />
          <h3 className="text-sm font-medium text-foreground">{channel.name}</h3>
        </div>
        <span className="text-xs text-muted-foreground">
          {channel.propertiesTracked} properties
        </span>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-muted-foreground">Success Rate</p>
          <p
            className={cn(
              'text-lg font-semibold',
              channel.successRate >= 95 && 'text-success',
              channel.successRate >= 85 && channel.successRate < 95 && 'text-warning',
              channel.successRate < 85 && 'text-critical'
            )}
          >
            {channel.successRate.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Active Issues</p>
          <p
            className={cn(
              'text-lg font-semibold',
              channel.activeIssues === 0 && 'text-success',
              channel.activeIssues > 0 && channel.activeIssues <= 2 && 'text-warning',
              channel.activeIssues > 2 && 'text-critical'
            )}
          >
            {channel.activeIssues}
          </p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-border pt-3">
        <span className="text-xs text-muted-foreground">Last scrape</span>
        <span className="text-xs text-foreground">
          {formatDistanceToNow(new Date(channel.lastScrape), { addSuffix: true })}
        </span>
      </div>
    </div>
  );
}
