'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Building2,
  DollarSign,
  Receipt,
  AlertTriangle,
  Settings,
  ChevronLeft,
  Bell,
  Command,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navigation = [
  { name: 'Overview', href: '/', icon: LayoutDashboard },
  { name: 'Properties', href: '/properties', icon: Building2 },
  { name: 'Price Monitor', href: '/price-monitor', icon: DollarSign },
  { name: 'Bookings', href: '/bookings', icon: Receipt },
  { name: 'Alerts', href: '/alerts', icon: AlertTriangle },
];

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = React.useState(false);

  const activeNavItem = navigation.find(
    (n) => n.href === pathname || (n.href !== '/' && pathname.startsWith(n.href))
  );

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'flex flex-col border-r border-sidebar-border bg-sidebar transition-all duration-150',
          collapsed ? 'w-12' : 'w-48'
        )}
      >
        {/* Logo */}
        <div className="flex h-11 items-center gap-2 border-b border-sidebar-border px-3">
          <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
            <Command className="h-3.5 w-3.5 text-background" />
          </div>
          {!collapsed && (
            <span className="text-[13px] font-semibold tracking-tight text-sidebar-foreground">
              OTA Console
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-0.5 px-2 py-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href ||
              (item.href !== '/' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-foreground'
                    : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
                )}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>

        {/* Bottom section */}
        <div className="border-t border-sidebar-border px-2 py-2">
          <Link
            href="/settings"
            className={cn(
              'flex items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium transition-colors',
              pathname === '/settings'
                ? 'bg-sidebar-accent text-sidebar-foreground'
                : 'text-muted-foreground hover:bg-sidebar-accent/60 hover:text-sidebar-foreground'
            )}
          >
            <Settings className="h-4 w-4 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </Link>
          <button
            className="mt-1 flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-sidebar-accent/60 hover:text-sidebar-foreground"
            onClick={() => setCollapsed(!collapsed)}
          >
            <ChevronLeft
              className={cn(
                'h-4 w-4 shrink-0 transition-transform',
                collapsed && 'rotate-180'
              )}
            />
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-11 items-center justify-between border-b border-border bg-background px-4">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-medium text-foreground">
              {activeNavItem?.name || (pathname === '/settings' ? 'Settings' : 'Dashboard')}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="sm" className="relative h-7 w-7 p-0">
              <Bell className="h-4 w-4 text-muted-foreground" />
              <span className="absolute -right-0.5 -top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-critical text-[9px] font-medium text-critical-foreground">
                {11}
              </span>
            </Button>
            <div className="ml-1 flex h-6 w-6 items-center justify-center rounded-full bg-muted text-[10px] font-medium text-muted-foreground">
              OP
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto bg-background p-4">
          {children}
        </main>
      </div>
    </div>
  );
}
