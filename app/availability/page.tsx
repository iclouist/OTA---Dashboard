import { DashboardLayout } from '@/components/dashboard/layout';
import {
  AvailabilityHero,
  AvailabilityKPIStrip,
  AvailabilityMatrix,
  ChannelSellabilityMatrix,
  ActionableIssuesList,
} from '@/components/dashboard/availability';
import {
  mockProperties,
  mockAvailabilitySnapshots,
  mockChannelAvailabilityStatus,
  mockSellabilityIssues,
  mockAvailabilityKPIs,
} from '@/lib/mock-data';

export default function AvailabilityPage() {
  // Filter issues by severity
  const criticalIssues = mockSellabilityIssues.filter(
    (i) => i.severity === 'critical' && i.status === 'active'
  );
  const highIssues = mockSellabilityIssues.filter(
    (i) => i.severity === 'high' && i.status === 'active'
  );

  return (
    <DashboardLayout>
      <div className="space-y-8 pb-8">
        {/* Hero Alert - Only show if there are urgent issues */}
        <AvailabilityHero 
          criticalIssues={criticalIssues} 
          highIssues={highIssues}
        />

        {/* KPI Strip */}
        <AvailabilityKPIStrip kpis={mockAvailabilityKPIs} />

        {/* Two-column layout for matrix views */}
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Availability Matrix */}
          <div className="xl:col-span-2">
            <AvailabilityMatrix 
              properties={mockProperties} 
              snapshots={mockAvailabilitySnapshots}
              days={14}
            />
          </div>
        </div>

        {/* Channel Sellability Matrix */}
        <ChannelSellabilityMatrix 
          properties={mockProperties}
          channelStatus={mockChannelAvailabilityStatus}
        />

        {/* Actionable Issues List */}
        <ActionableIssuesList issues={mockSellabilityIssues} />
      </div>
    </DashboardLayout>
  );
}
