'use client';

import { AlertTriangle, ArrowRight, RefreshCw, Calendar } from 'lucide-react';
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
  onOpenMatrix 
}: AvailabilityHeroProps) {
  const totalUrgent = criticalIssues.length + highIssues.length;
  
  if (totalUrgent === 0) {
    return null;
  }

  // Get top 3 issues for preview
  const topIssues = [...criticalIssues, ...highIssues].slice(0, 3);

  return (
    <div className="relative overflow-hidden rounded-xl border border-critical/40 bg-gradient-to-r from-critical/8 via-critical/4 to-transparent">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-critical/5 via-transparent to-transparent" />
      
      <div className="relative flex items-start justify-between gap-6 p-5">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-critical/15 ring-1 ring-critical/20">
            <AlertTriangle className="h-6 w-6 text-critical" />
          </div>
          
          {/* Content */}
          <div className="space-y-3">
            <div>
              <h2 className="text-[15px] font-semibold text-foreground">
                {totalUrgent} availability issue{totalUrgent !== 1 ? 's' : ''} blocking sellability
              </h2>
              <p className="mt-0.5 text-[12px] text-muted-foreground">
                Channels closed, stale syncs, or restrictions preventing bookings
              </p>
            </div>
            
            {/* Issue previews */}
            <div className="flex flex-wrap gap-2">
              {topIssues.map((issue, idx) => (
                <div 
                  key={issue.id}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px]",
                    issue.severity === 'critical' 
                      ? "bg-critical/10 text-critical ring-1 ring-critical/20" 
                      : "bg-warning/10 text-warning ring-1 ring-warning/20"
                  )}
                >
                  <span className="font-medium">{issue.propertyName.split(' ').slice(0, 2).join(' ')}</span>
                  <span className="opacity-60">·</span>
                  <span className="truncate max-w-[180px]">{issue.title}</span>
                </div>
              ))}
              {totalUrgent > 3 && (
                <div className="flex items-center gap-1 rounded-md bg-muted/50 px-2.5 py-1.5 text-[11px] text-muted-foreground">
                  +{totalUrgent - 3} more
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Actions */}
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
            className="gap-2 border-border/60"
            onClick={onOpenMatrix}
          >
            <Calendar className="h-3.5 w-3.5" />
            Open Matrix
          </Button>
        </div>
      </div>
    </div>
  );
}
