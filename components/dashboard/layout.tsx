'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  Radio,
  DollarSign,
  CalendarCheck,
  AlertTriangle,
  Camera,
  Link2,
  Settings,
  ChevronLeft,
  Bell,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Channels', href: '/channels', icon: Radio },
  { name: 'Price Monitor', href: '/price-monitor', icon: DollarSign },
  { name: 'Availability', href: '/availability', icon: CalendarCheck },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
  { name: 'Evidence', href: '/evidence', icon: Camera },
  { name: 'Mappings', href: '/mappings', icon: Link2 },
  { name: 'Settings', href: '/settings', icon: Settings },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-border bg-sidebar transition-all duration-200',
          collapsed ? 'w-16' : 'w-56'
        )}
      >
        {/* Logo */}
        <div className="flex h-14 items-center border-b border-sidebar-border px-4">
          {!collapsed && (
            <span className="text-sm font-semibold text-sidebar-foreground">
              OTA Operations
            </span>
          )}
          {collapsed && (
            <span className="text-sm font-bold text-sidebar-foreground">OTA</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-2">
          {navigation.map((item) => {
            const isActive = pathname === item.href || 
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-sidebar-border p-2">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-center text-sidebar-foreground/70 hover:text-sidebar-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 transition-transform',
                collapsed && 'rotate-180'
              )}
            />
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-14 items-center justify-between border-b border-border bg-card px-6">
          <div className="flex items-center gap-4">
            <h1 className="text-sm font-medium text-foreground">
              {navigation.find((n) => n.href === pathname || (n.href !== '/' && pathname.startsWith(n.href)))?.name || 'Dashboard'}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-4 w-4" />
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-critical text-[10px] font-medium text-critical-foreground">
                9
              </span>
            </Button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-medium">
              OP
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
