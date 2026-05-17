'use client';

import { 
  AlertCircle, 
  AlertTriangle, 
  Clock, 
  Eye, 
  ExternalLink, 
  CheckCircle2,
  RefreshCw,
  Link as LinkIcon,
  Ban,
} from 'lucide-react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/dashboard/status-badge';
import type { SellabilityIssue } from '@/lib/types';

interface ActionableIssuesListProps {
  issues: SellabilityIssue[];
  maxItems?: number;
}

const issueTypeIcons: Record<string, React.ReactNode> = {
  'channel-closed': <Ban className="h-3.5 w-3.5" />,
  'sync-stale': <RefreshCw className="h-3.5 w-3.5" />,
  'channel-mismatch': <AlertCircle className="h-3.5 w-3.5" />,
  'property-not-sellable': <AlertTriangle className="h-3.5 w-3.5" />,
  'restriction-blocking': <Ban className="h-3.5 w-3.5" />,
  'inventory-missing': <AlertCircle className="h-3.5 w-3.5" />,
  'room-sold-out': <Clock className="h-3.5 w-3.5" />,
};

const issueTypeActions: Record<string, { label: string; icon: React.ReactNode }> = {
  'channel-closed': { label: 'Open Channel', icon: <ExternalLink className="h-3 w-3" /> },
  'sync-stale': { label: 'Refresh Sync', icon: <RefreshCw className="h-3 w-3" /> },
  'channel-mismatch': { label: 'Review Status', icon: <Eye className="h-3 w-3" /> },
  'property-not-sellable': { label: 'Configure', icon: <LinkIcon className="h-3 w-3" /> },
  'restriction-blocking': { label: 'Review Rules', icon: <Eye className="h-3 w-3" /> },
  'inventory-missing': { label: 'Check Inventory', icon: <Eye className="h-3 w-3" /> },
  'room-sold-out': { label: 'View Details', icon: <Eye className="h-3 w-3" /> },
};

export function ActionableIssuesList({ issues, maxItems }: ActionableIssuesListProps) {
  const criticalIssues = issues.filter(i => i.severity === 'critical' && i.status === 'active');
  const highIssues = issues.filter(i => i.severity === 'high' && i.status === 'active');
  const activeIssues = issues.filter(i => i.status === 'active' || i.status === 'acknowledged');
  
  const sortedIssues = activeIssues.sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  const displayIssues = maxItems ? sortedIssues.slice(0, maxItems) : sortedIssues;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg ring-1",
            criticalIssues.length > 0 || highIssues.length > 0 
              ? "bg-critical/10 ring-critical/20" 
              : "bg-warning/10 ring-warning/20"
          )}>
            <AlertCircle className={cn(
              "h-4 w-4",
              criticalIssues.length > 0 || highIssues.length > 0 ? "text-critical" : "text-warning"
            )} />
          </div>
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">Sellability Issues</h2>
            <p className="text-[11px] text-muted-foreground">Prioritized exceptions requiring action</p>
          </div>
        </div>
        
        {activeIssues.length > 0 && (
          <div className="flex items-center gap-2">
            {criticalIssues.length > 0 && (
              <span className="rounded-full bg-critical/15 px-2.5 py-1 text-[10px] font-semibold text-critical ring-1 ring-critical/20">
                {criticalIssues.length} critical
              </span>
            )}
            {highIssues.length > 0 && (
              <span className="rounded-full bg-warning/15 px-2.5 py-1 text-[10px] font-semibold text-warning ring-1 ring-warning/20">
                {highIssues.length} high
              </span>
            )}
          </div>
        )}
      </div>

      {/* Issues List */}
      <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        {activeIssues.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-12">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
              <CheckCircle2 className="h-5 w-5 text-success" />
            </div>
            <span className="text-[12px] font-medium text-success">No sellability issues detected</span>
            <span className="text-[11px] text-muted-foreground">All channels are operational</span>
          </div>
        ) : (
          <div className="divide-y divide-border/50">
            {displayIssues.map((issue) => {
              const action = issueTypeActions[issue.issueType] || { label: 'View', icon: <Eye className="h-3 w-3" /> };
              
              return (
                <div 
                  key={issue.id} 
                  className={cn(
                    "flex items-start gap-4 px-5 py-4 transition-colors",
                    issue.severity === 'critical' && "bg-critical/5 hover:bg-critical/8",
                    issue.severity === 'high' && "hover:bg-warning/5",
                    issue.severity === 'medium' && "hover:bg-muted/30",
                    issue.severity === 'low' && "hover:bg-muted/20"
                  )}
                >
                  {/* Severity Icon */}
                  <div className={cn(
                    "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ring-1",
                    issue.severity === 'critical' && "bg-critical/15 ring-critical/30 text-critical",
                    issue.severity === 'high' && "bg-warning/15 ring-warning/30 text-warning",
                    issue.severity === 'medium' && "bg-info/15 ring-info/30 text-info",
                    issue.severity === 'low' && "bg-muted ring-border text-muted-foreground"
                  )}>
                    {issueTypeIcons[issue.issueType] || <AlertTriangle className="h-3.5 w-3.5" />}
                  </div>
                  
                  {/* Content */}
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[12px] font-semibold text-foreground">{issue.title}</span>
                      <StatusBadge status={issue.severity} size="xs" />
                      {issue.status === 'acknowledged' && (
                        <span className="rounded-full bg-info/10 px-1.5 py-0.5 text-[9px] font-medium text-info ring-1 ring-info/20">
                          Acknowledged
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-[10px] text-muted-foreground flex-wrap">
                      <span className="font-medium text-foreground">{issue.propertyName}</span>
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
                    
                    <p className="text-[11px] text-muted-foreground line-clamp-2">{issue.description}</p>
                    
                    <div className="flex items-center gap-1.5 pt-1">
                      <Clock className="h-3 w-3 text-muted-foreground/60" />
                      <span className="text-[10px] text-muted-foreground/60">
                        {formatDistanceToNow(new Date(issue.lastSeen), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                  
                  {/* Actions */}
                  <div className="flex shrink-0 flex-col gap-1.5">
                    <Link href={`/properties/${issue.propertyId}`}>
                      <Button variant="outline" size="sm" className="h-7 gap-1.5 text-[10px] w-full justify-start">
                        <Eye className="h-3 w-3" />
                        View Property
                      </Button>
                    </Link>
                    {issue.channelId && (
                      <Button variant="ghost" size="sm" className="h-7 gap-1.5 text-[10px] w-full justify-start">
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
    </div>
  );
}
