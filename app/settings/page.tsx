'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { settings } from '@/lib/mock-data';
import {
  AlertTriangle,
  Clock,
  Percent,
  ShieldCheck,
  BookOpen,
  Webhook,
  Database,
  FileText,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/dashboard/status-badge';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure parity thresholds, commission assumptions, evidence rules, and integration placeholders
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Parity Thresholds */}
          <div className="rounded-md border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[13px] font-medium text-foreground">Parity Thresholds</h2>
            </div>
            <div className="space-y-3 p-4">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Warning Threshold (%)</label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={settings.parityThresholds.warningPercent} className="h-8 w-20 text-[12px]" disabled />
                  <span className="text-[10px] text-muted-foreground">Trigger warning when price differs by this percent</span>
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Critical Threshold (%)</label>
                <div className="flex items-center gap-2">
                  <Input type="number" value={settings.parityThresholds.criticalPercent} className="h-8 w-20 text-[12px]" disabled />
                  <span className="text-[10px] text-muted-foreground">Trigger critical alert at this threshold</span>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Retention */}
          <div className="rounded-md border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[13px] font-medium text-foreground">Evidence & Comparison</h2>
            </div>
            <div className="space-y-3 p-4">
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Evidence Retention (days)</label>
                <Input type="number" value={settings.evidenceRetentionDays} className="h-8 w-20 text-[12px]" disabled />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground">Default Comparison Window (days)</label>
                <Input type="number" value={settings.defaultComparisonWindowDays} className="h-8 w-20 text-[12px]" disabled />
              </div>
            </div>
          </div>

          {/* OTA Commission Assumptions */}
          <div className="rounded-md border border-border bg-card lg:col-span-2">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[13px] font-medium text-foreground">OTA Commission Assumptions</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Channel</th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Model</th>
                    <th className="px-4 py-2 text-right text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Default %</th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Payout</th>
                    <th className="px-4 py-2 text-left text-[10px] font-medium uppercase tracking-wide text-muted-foreground">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {settings.commissionAssumptions.map((ca) => (
                    <tr key={ca.channelId} className="hover:bg-muted/30">
                      <td className="px-4 py-2.5 text-[12px] font-medium text-foreground">{ca.channelName}</td>
                      <td className="px-4 py-2.5 text-[12px] capitalize text-muted-foreground">{ca.model}</td>
                      <td className="px-4 py-2.5 text-right text-[12px] font-medium tabular-nums text-foreground">{ca.defaultPercent}%</td>
                      <td className="px-4 py-2.5">
                        <StatusBadge status={ca.payoutModel} size="xs" />
                      </td>
                      <td className="max-w-[300px] px-4 py-2.5 text-[11px] text-muted-foreground">{ca.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Source Confidence Rules */}
          <div className="rounded-md border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <ShieldCheck className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[13px] font-medium text-foreground">Source Confidence Rules</h2>
            </div>
            <div className="p-4">
              <ul className="space-y-2">
                {settings.sourceConfidenceRules.map((rule, i) => (
                  <li key={i} className="flex gap-2 text-[11px] text-muted-foreground">
                    <span className="mt-0.5 h-1 w-1 shrink-0 rounded-full bg-muted-foreground" />
                    {rule}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cancellation Policy Definitions */}
          <div className="rounded-md border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <BookOpen className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[13px] font-medium text-foreground">Cancellation Policies</h2>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {settings.cancellationPolicies.map((policy) => (
                  <StatusBadge key={policy.id} status={policy.id} size="sm" />
                ))}
              </div>
            </div>
          </div>

          {/* Future Integration Placeholders */}
          <div className="rounded-md border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Webhook className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[13px] font-medium text-foreground">Integrations</h2>
            </div>
            <div className="space-y-3 p-4">
              {[
                { name: 'Make.com Email Ingestion', description: 'Auto-parse booking emails from OTAs', status: 'Planned' },
                { name: 'Browser Extraction', description: 'Authenticated admin scraping for booking details', status: 'Planned' },
                { name: 'Screenshot Verification', description: 'Automated screenshot capture pipeline', status: 'Planned' },
              ].map((item) => (
                <div key={item.name} className="flex items-center justify-between rounded border border-dashed border-border bg-muted/20 p-3">
                  <div>
                    <p className="text-[12px] font-medium text-foreground">{item.name}</p>
                    <p className="text-[10px] text-muted-foreground">{item.description}</p>
                  </div>
                  <span className="rounded bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">{item.status}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-md border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-[13px] font-medium text-foreground">Database</h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between rounded border border-dashed border-border bg-muted/20 p-3">
                <div>
                  <p className="text-[12px] font-medium text-foreground">Supabase</p>
                  <p className="text-[10px] text-muted-foreground">Connect to persist operational data</p>
                </div>
                <Button variant="outline" size="sm" className="h-7 text-[11px]" disabled>
                  Connect
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md border border-border bg-card px-4 py-2.5">
          <FileText className="h-3.5 w-3.5 text-muted-foreground" />
          <span className="text-[11px] text-muted-foreground">
            Settings are read-only in V1. Backend integration required for persistence.
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
