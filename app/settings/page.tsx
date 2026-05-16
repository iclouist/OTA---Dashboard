'use client';

import * as React from 'react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { settings } from '@/lib/mock-data';
import { StatusDot } from '@/components/dashboard/status-badge';
import { 
  Clock, 
  AlertTriangle, 
  Percent, 
  Image as ImageIcon,
  Database,
  Bell,
  Webhook,
  Key,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';

export default function SettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-lg font-semibold text-foreground">Settings</h1>
          <p className="text-sm text-muted-foreground">
            Configure scraping, alerts, and system preferences
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Scrape Profiles */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">
                Scrape Profiles
              </h2>
            </div>
            <div className="divide-y divide-border">
              {settings.scrapeProfiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <StatusDot status={profile.enabled ? 'healthy' : 'unknown'} />
                    <div>
                      <p className="text-sm font-medium text-foreground">
                        {profile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Every {profile.cadenceMinutes} minutes · {profile.channels.length} channels
                      </p>
                    </div>
                  </div>
                  <Switch checked={profile.enabled} disabled />
                </div>
              ))}
            </div>
            <div className="border-t border-border px-4 py-3">
              <Button variant="outline" size="sm" disabled>
                Add Profile
              </Button>
            </div>
          </div>

          {/* Alert Thresholds */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">
                Alert Thresholds
              </h2>
            </div>
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Parity Warning Threshold (%)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.alertThresholds.parityWarningPercent}
                    className="h-9 w-24"
                    disabled
                  />
                  <span className="text-xs text-muted-foreground">
                    Trigger warning when price differs by this percent
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Parity Critical Threshold (%)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.alertThresholds.parityCriticalPercent}
                    className="h-9 w-24"
                    disabled
                  />
                  <span className="text-xs text-muted-foreground">
                    Trigger critical alert when price differs by this percent
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Stale Data Threshold (hours)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.alertThresholds.staleDataHours}
                    className="h-9 w-24"
                    disabled
                  />
                  <span className="text-xs text-muted-foreground">
                    Alert when data is older than this many hours
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Parity Tolerance */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Percent className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">
                Parity Tolerance
              </h2>
            </div>
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Acceptable Variance (%)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.parityTolerance}
                    className="h-9 w-24"
                    disabled
                  />
                  <span className="text-xs text-muted-foreground">
                    Prices within this variance are considered matching
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Evidence Retention */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <ImageIcon className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">
                Evidence Retention
              </h2>
            </div>
            <div className="space-y-4 p-4">
              <div className="space-y-2">
                <label className="text-sm text-muted-foreground">
                  Retention Period (days)
                </label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    value={settings.evidenceRetentionDays}
                    className="h-9 w-24"
                    disabled
                  />
                  <span className="text-xs text-muted-foreground">
                    Screenshots older than this will be archived
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Future Integrations */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Database className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">
                Database Integration
              </h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Supabase
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Connect to store operational data
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Connect
                </Button>
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">
                Notifications
              </h2>
            </div>
            <div className="space-y-3 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Email Alerts</p>
                  <p className="text-xs text-muted-foreground">
                    Receive critical alerts via email
                  </p>
                </div>
                <Switch disabled />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-foreground">Slack Integration</p>
                  <p className="text-xs text-muted-foreground">
                    Post alerts to Slack channel
                  </p>
                </div>
                <Switch disabled />
              </div>
            </div>
          </div>

          {/* Webhooks */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Webhook className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">
                Webhooks
              </h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    No webhooks configured
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Receive real-time event notifications
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Add Webhook
                </Button>
              </div>
            </div>
          </div>

          {/* API Keys */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <Key className="h-4 w-4 text-muted-foreground" />
              <h2 className="text-sm font-medium text-foreground">
                API Keys
              </h2>
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between rounded-lg border border-dashed border-border bg-muted/30 p-4">
                <div>
                  <p className="text-sm font-medium text-foreground">
                    No API keys
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Generate keys for API access
                  </p>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Generate Key
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-3">
          <span className="text-xs text-muted-foreground">
            Settings are read-only in V1. Backend integration required for persistence.
          </span>
        </div>
      </div>
    </DashboardLayout>
  );
}
