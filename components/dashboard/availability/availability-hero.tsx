'use client';

import { AlertTriangle, ArrowRight, CalendarX, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { SellabilityIssue } from '@/lib/types';

interface AvailabilityHeroProps {
  criticalIssues: SellabilityIssue[];
  highIssues: SellabilityIssue[];
  onReviewIssues?: () => void;
  onOpenMatrix?: () => void;
}

export function AvailabilityHero({
  criticalIssues,
  highIssues,
  onReviewIssues,
  onOpenMatrix,
}: AvailabilityHeroProps) {
  const totalUrgent = criticalIssues.length + highIssues.length;
  
  if (totalUrgent === 0) {
    return null;
  }

  // Get top issue examples
  const topIssues = [...criticalIssues, ...highIssues].slice(0, 3);
  
  // Categorize issues
  const issueTypes = {
    channelClosed: topIssues.filter(i => i.issueType === 'channel-closed').length,
    staleSync: topIssues.filter(i => i.issueType === 'sync-stale').length,
    restrictionBlocking: topIssues.filter(i => i.issueType === 'restriction-blocking').length,
    notSellable: topIssues.filter(i => i.issueType === 'property-not-sellable' || i.issueType === 'mapping-incomplete').length,
  };

  return (
    <div className="relative overflow-hidden rounded-lg border border-critical/40 bg-gradient-to-r from-critical/15 via-critical/8 to-critical/5 shadow-sm">
      {/* Subtle pattern overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.03),transparent_50%)]" />
      
      <div className="relative p-5">
        <div className="flex items-start justify-between gap-6">
          {/* Left: Alert info */}
          <div className="flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-critical/20 ring-1 ring-critical/30">
              <AlertTriangle className="h-5 w-5 text-critical" />
            </div>
            <div className="space-y-2">
              <div>
                <h2 className="text-[15px] font-semibold text-foreground">
                  {totalUrgent} availability issue{totalUrgent !== 1 ? 's' : ''} require attention
                </h2>
                <p className="mt-0.5 text-[12px] text-muted-foreground">
                  {criticalIssues.length > 0 && (
                    <span className="text-critical font-medium">{criticalIssues.length} critical</span>
                  )}
                  {criticalIssues.length > 0 && highIssues.length > 0 && ' · '}
                  {highIssues.length > 0 && (
                    <span className="text-warning font-medium">{highIssues.length} high priority</span>
                  )}
                </p>
              </div>
              
              {/* Issue type breakdown */}
              <div className="flex flex-wrap gap-2">
                {issueTypes.channelClosed > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-critical/10 px-2 py-1 text-[10px] font-medium text-critical ring-1 ring-inset ring-critical/20">
                    <CalendarX className="h-3 w-3" />
                    {issueTypes.channelClosed} channel closed
                  </span>
                )}
                {issueTypes.staleSync > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-warning/10 px-2 py-1 text-[10px] font-medium text-warning ring-1 ring-inset ring-warning/20">
                    <RefreshCw className="h-3 w-3" />
                    {issueTypes.staleSync} stale sync
                  </span>
                )}
                {issueTypes.restrictionBlocking > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-info/10 px-2 py-1 text-[10px] font-medium text-info ring-1 ring-inset ring-info/20">
                    {issueTypes.restrictionBlocking} restriction blocking
                  </span>
                )}
                {issueTypes.notSellable > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded-md bg-muted px-2 py-1 text-[10px] font-medium text-muted-foreground ring-1 ring-inset ring-border">
                    {issueTypes.notSellable} not sellable
                  </span>
                )}
              </div>

              {/* Top issue examples */}
              <div className="mt-1 space-y-1">
                {topIssues.slice(0, 2).map((issue) => (
                  <p key={issue.id} className="text-[11px] text-muted-foreground">
                    <span className="text-foreground/80">{issue.propertyName}</span>
                    {issue.channelName && (
                      <span className="text-muted-foreground"> · {issue.channelName}</span>
                    )}
                    <span className="text-muted-foreground"> — {issue.title}</span>
                  </p>
                ))}
                {topIssues.length > 2 && (
                  <p className="text-[10px] text-muted-foreground">
                    +{totalUrgent - 2} more issues
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex shrink-0 flex-col gap-2">
            <Button 
              size="sm" 
              className="gap-2 bg-critical text-critical-foreground hover:bg-critical/90"
              onClick={onReviewIssues}
            >
              Review Issues
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 border-critical/30 text-critical hover:bg-critical/10"
              onClick={onOpenMatrix}
            >
              Open Matrix
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
