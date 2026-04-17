'use client';

import React, { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Globe,
  Search,
  Zap,
  Shield,
  AlertCircle,
  Settings,
  Menu,
  X,
  TrendingUp,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from '@/components/UserMenu';

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Websites', href: '/websites', icon: Globe },
  { label: 'Analytics', href: '/analytics', icon: TrendingUp },
  { label: 'SEO', href: '/seo', icon: Search },
  { label: 'Performance', href: '/performance', icon: Zap },
  { label: 'Security', href: '/security', icon: Shield },
  { label: 'Errors', href: '/errors', icon: AlertCircle },
  { label: 'Settings', href: '/settings', icon: Settings },
];

export function AppLayout({ children }: { children: ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const pathname = usePathname();

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 w-64 bg-card border-r border-border transition-transform ease-in-out duration-300',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
          'md:relative md:translate-x-0 md:w-64'
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-border">
            <Link href="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-brand-navy to-brand-tufts rounded-lg flex items-center justify-center text-white font-bold text-sm">
                WM
              </div>
              <span className="font-bold text-sm hidden sm:inline">
                WebSite Monitor
              </span>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 overflow-y-auto px-3 py-6">
            <ul className="space-y-2">
              {navItems.map(({ label, href, icon: Icon }) => {
                const isActive = pathname === href || pathname.startsWith(href + '/');
                return (
                  <li key={href}>
                    <Link
                      href={href}
                      onClick={() => setSidebarOpen(false)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2 rounded-lg transition-colors',
                        isActive
                          ? 'bg-primary text-primary-foreground'
                          : 'text-foreground hover:bg-accent'
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      <span className="text-sm font-medium">{label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* Footer */}
          <div className="p-6 border-t border-border text-xs text-muted-foreground">
            <p>WebSiteMonitoringMo!</p>
            <p>v1.0.0</p>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <header className="flex items-center justify-between h-16 px-6 border-b border-border bg-card">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>
          <h1 className="text-lg font-semibold font-heading">WebSite Monitoring System</h1>
          <UserMenu />
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-background">
          {children}
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
