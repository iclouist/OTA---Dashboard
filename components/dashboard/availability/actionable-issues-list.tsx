'use client';

import Link from 'next/link';
import {
  AlertCircle,
  AlertTriangle,
  Clock,
  Eye,
  ExternalLink,
  RefreshCw,
  Settings,
  CheckCircle2,
  SearchX,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/dashboard/status-badge';
import { cn, formatSyncAge } from '@/lib/utils';
import type { SellabilityIssue } from '@/lib/types';

interface ActionableIssuesListProps {
  issues: SellabilityIssue[];
  maxItems?: number;
  title?: string;
  emptyTitle?: string;
}

function getIssueAction(issue: SellabilityIssue): { label: string; icon: React.ReactNode; href?: string } {
  switch (issue.issueType) {
    case 'channel-closed':
      return { label: 'View Property', icon: <Eye className="h-3 w-3" />, href: `/properties/${issue.propertyId}` };
    case 'sync-stale':
      return { label: 'Refresh Sync', icon: <RefreshCw className="h-3 w-3" /> };
    case 'restriction-blocking':
      return { label: 'Review Restrictions', icon: <Settings className="h-3 w-3" />, href: `/properties/${issue.propertyId}` };
    case 'mapping-incomplete':
      return { label: 'Inspect Mapping', icon: <Settings className="h-3 w-3" />, href: `/properties/${issue.propertyId}` };
    case 'property-not-sellable':
      return { label: 'View Property', icon: <Eye className="h-3 w-3" />, href: `/properties/${issue.propertyId}` };
    case 'channel-mismatch':
      return { label: 'Open Channel', icon: <ExternalLink className="h-3 w-3" /> };
    default:
      return { label: 'View Property', icon: <Eye className="h-3 w-3" />, href: `/properties/${issue.propertyId}` };
  }
}

export function ActionableIssuesList({
  issues,
  maxItems = 10,
  title = 'Sellability Issues',
  emptyTitle = 'No sellability issues detected',
}: ActionableIssuesListProps) {
  const sortedIssues = [...issues]
    .filter(i => i.status === 'active' || i.status === 'acknowledged')
    .sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
      return severityOrder[a.severity] - severityOrder[b.severity];
    })
    .slice(0, maxItems);

  const criticalCount = issues.filter(i => i.severity === 'critical' && i.status === 'active').length;
  const highCount = issues.filter(i => i.severity === 'high' && i.status === 'active').length;
  const activeCount = issues.filter(i => i.status === 'active').length;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle className={cn(
            "h-4 w-4",
            criticalCount > 0 ? "text-critical" : highCount > 0 ? "text-warning" : "text-muted-foreground"
          )} />
          <span className="text-[13px] font-semibold text-foreground">{title}</span>
          {activeCount > 0 && (
            <span className={cn(
              "rounded-full px-2 py-0.5 text-[10px] font-semibold",
              criticalCount > 0 ? "bg-critical/15 text-critical" : "bg-warning/15 text-warning"
            )}>
              {activeCount} active
            </span>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
        {sortedIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 px-6 py-12 text-center">
            {issues.length === 0 ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-success" />
                <span className="text-[11px] font-medium text-success">{emptyTitle}</span>
                <p className="max-w-md text-[10px] text-muted-foreground">
                  The current saved view is clear. Move to another view if you want to review lower-priority availability work.
                </p>
              </>
            ) : (
              <>
                <SearchX className="h-5 w-5 text-muted-foreground/70" />
                <span className="text-[11px] font-medium text-foreground">No issues match the active filters</span>
                <p className="max-w-md text-[10px] text-muted-foreground">
                  Try clearing search, severity, or status filters to bring more issues back into the queue.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="divide-y divide-border/30">
            {sortedIssues.map((issue) => {
              const action = getIssueAction(issue);
              
              return (
                <div 
                  key={issue.id} 
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 transition-colors hover:bg-muted/20",
                    issue.severity === 'critical' && "bg-critical/[0.03]"
                  )}
                >
                  {/* Severity indicator */}
                  <div className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
                    issue.severity === 'critical' && "bg-critical/20",
                    issue.severity === 'high' && "bg-warning/20",
                    issue.severity === 'medium' && "bg-info/20",
                    issue.severity === 'low' && "bg-muted"
                  )}>
                    <AlertTriangle className={cn(
                      "h-3 w-3",
                      issue.severity === 'critical' && "text-critical",
                      issue.severity === 'high' && "text-warning",
                      issue.severity === 'medium' && "text-info",
                      issue.severity === 'low' && "text-muted-foreground"
                    )} />
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-foreground line-clamp-1">{issue.title}</span>
                      <StatusBadge status={issue.severity} size="xs" />
                      {issue.status === 'acknowledged' && (
                        <span className="rounded-full bg-info/15 px-1.5 py-0.5 text-[8px] font-medium text-info">
                          Ack
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="font-medium text-foreground/80">{issue.propertyName}</span>
                      {issue.channelName && (
                        <>
                          <span className="text-muted-foreground/50">·</span>
                          <span>{issue.channelName}</span>
                        </>
                      )}
                      {issue.roomType && (
                        <>
                          <span className="text-muted-foreground/50">·</span>
                          <span>{issue.roomType}</span>
                        </>
                      )}
                      {issue.dateRange && (
                        <>
                          <span className="text-muted-foreground/50">·</span>
                          <span>{issue.dateRange}</span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[9px] text-muted-foreground">
                      <Clock className="h-2.5 w-2.5" />
                      <span>{formatSyncAge(issue.lastSeen)} ago</span>
                    </div>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {action.href ? (
                      <Link href={action.href}>
                        <Button variant="outline" size="sm" className="h-6 gap-1 px-2 text-[9px]">
                          {action.icon}
                          {action.label}
                        </Button>
                      </Link>
                    ) : (
                      <Button variant="outline" size="sm" className="h-6 gap-1 px-2 text-[9px]">
                        {action.icon}
                        {action.label}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
