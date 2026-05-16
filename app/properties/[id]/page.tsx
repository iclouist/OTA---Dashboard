import { notFound } from 'next/navigation';
import Link from 'next/link';
import { DashboardLayout } from '@/components/dashboard/layout';
import { StatusBadge, StatusDot } from '@/components/dashboard/status-badge';
import { AlertList } from '@/components/dashboard/alert-row';
import { EvidenceCard } from '@/components/dashboard/evidence-card';
import {
  getPropertyById,
  getAlertsByProperty,
  getEvidenceByProperty,
  getPriceRecordsByProperty,
  getAvailabilityByProperty,
  getMappingsByProperty,
  channels,
} from '@/lib/mock-data';
import { formatDistanceToNow, format } from 'date-fns';
import { ArrowLeft, ExternalLink, MapPin, Radio } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface PropertyDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function PropertyDetailPage({ params }: PropertyDetailPageProps) {
  const { id } = await params;
  const property = getPropertyById(id);

  if (!property) {
    notFound();
  }

  const propertyAlerts = getAlertsByProperty(id);
  const propertyEvidence = getEvidenceByProperty(id);
  const priceRecords = getPriceRecordsByProperty(id);
  const availabilityRecords = getAvailabilityByProperty(id);
  const mappings = getMappingsByProperty(id);

  const propertyChannels = channels.filter((c) =>
    property.activeChannels.includes(c.id)
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <Link href="/properties">
              <Button variant="ghost" size="icon" className="mt-1">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-semibold text-foreground">
                  {property.name}
                </h1>
                <StatusBadge status={property.healthStatus} size="md" />
              </div>
              <div className="mt-1 flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-3.5 w-3.5" />
                <span>
                  {property.city}, {property.country}
                </span>
                <span className="text-border">·</span>
                <span>
                  Last sync {formatDistanceToNow(new Date(property.lastSync), { addSuffix: true })}
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <ExternalLink className="mr-2 h-3.5 w-3.5" />
              View on OTA
            </Button>
          </div>
        </div>

        {/* Channel Status Cards */}
        <div>
          <h2 className="mb-3 text-sm font-medium text-foreground">Channel Status</h2>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
            {propertyChannels.map((channel) => (
              <div
                key={channel.id}
                className="rounded-lg border border-border bg-card p-4"
              >
                <div className="flex items-center gap-2">
                  <StatusDot status={channel.status} />
                  <span className="text-sm font-medium text-foreground">
                    {channel.name}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Success rate</span>
                  <span className="font-medium text-foreground">
                    {channel.successRate.toFixed(1)}%
                  </span>
                </div>
                <div className="mt-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Issues</span>
                  <span
                    className={
                      channel.activeIssues === 0
                        ? 'text-success'
                        : 'font-medium text-critical'
                    }
                  >
                    {channel.activeIssues}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Room & Rate Summary */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium text-foreground">Room Types</h2>
            </div>
            <div className="divide-y divide-border">
              {property.roomTypes.map((room, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-foreground">{room}</span>
                  <Radio className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium text-foreground">Rate Plans</h2>
            </div>
            <div className="divide-y divide-border">
              {property.ratePlans.map((plan, i) => (
                <div key={i} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-foreground">{plan}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Price Comparison */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-foreground">
              Recent Price Comparison
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Channel
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Room Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Stay Date
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                    Display Price
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                    Reference
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                    Delta
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {priceRecords.slice(0, 5).map((record) => (
                  <tr key={record.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 text-sm text-foreground">
                      {record.channelName}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {record.roomType}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(record.stayDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-foreground">
                      {record.currency} {record.displayPrice.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {record.currency} {record.referencePrice.toLocaleString()}
                    </td>
                    <td
                      className={`px-4 py-3 text-right text-sm font-medium ${
                        record.deltaPercent === 0
                          ? 'text-muted-foreground'
                          : Math.abs(record.deltaPercent) > 10
                          ? 'text-critical'
                          : 'text-warning'
                      }`}
                    >
                      {record.deltaPercent > 0 ? '+' : ''}
                      {record.deltaPercent.toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={record.parityStatus} size="sm" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Availability Summary */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-foreground">
              Availability Summary
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Channel
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Room Type
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                    Stay Date
                  </th>
                  <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">
                    Status
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground">
                    Captured
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {availabilityRecords.slice(0, 5).map((record) => (
                  <tr key={record.id} className="hover:bg-accent/30">
                    <td className="px-4 py-3 text-sm text-foreground">
                      {record.channelName}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {record.roomType}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">
                      {format(new Date(record.stayDate), 'MMM d, yyyy')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <StatusBadge status={record.status} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-muted-foreground">
                      {formatDistanceToNow(new Date(record.capturedAt), { addSuffix: true })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Alerts */}
        <div className="rounded-lg border border-border bg-card">
          <div className="border-b border-border px-4 py-3">
            <h2 className="text-sm font-medium text-foreground">Recent Alerts</h2>
          </div>
          <AlertList
            alerts={propertyAlerts}
            maxItems={5}
            compact
            onAlertClick={() => {}}
          />
        </div>

        {/* Recent Evidence */}
        {propertyEvidence.length > 0 && (
          <div>
            <h2 className="mb-3 text-sm font-medium text-foreground">
              Recent Evidence
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
              {propertyEvidence.slice(0, 4).map((evidence) => (
                <EvidenceCard key={evidence.id} evidence={evidence} />
              ))}
            </div>
          </div>
        )}

        {/* Mappings */}
        {mappings.length > 0 && (
          <div className="rounded-lg border border-border bg-card">
            <div className="border-b border-border px-4 py-3">
              <h2 className="text-sm font-medium text-foreground">
                Channel Mappings
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      Channel
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      OTA Property
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      Room Type
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground">
                      OTA Room
                    </th>
                    <th className="px-4 py-2 text-center text-xs font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {mappings.map((mapping) => (
                    <tr key={mapping.id} className="hover:bg-accent/30">
                      <td className="px-4 py-3 text-sm text-foreground">
                        {mapping.channelName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {mapping.otaPropertyName}
                      </td>
                      <td className="px-4 py-3 text-sm text-foreground">
                        {mapping.roomTypeName}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {mapping.otaRoomName}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={mapping.status} size="sm" />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
