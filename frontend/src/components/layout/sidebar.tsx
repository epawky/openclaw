'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  ListTodo,
  Package,
  Users,
  FlaskConical,
  MessageSquare,
  Settings,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { href: '/overview', label: 'Overview', icon: LayoutDashboard },
  { href: '/action-queue', label: 'Action Queue', icon: ListTodo },
  { href: '/inventory', label: 'Inventory', icon: Package },
  { href: '/customers', label: 'Customers', icon: Users },
  { href: '/simulations', label: 'Simulations', icon: FlaskConical },
  { href: '/ask', label: 'Ask the COO', icon: MessageSquare },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed = false, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) {
  const pathname = usePathname();

  const handleNavClick = () => {
    // Close mobile menu when navigating
    if (onMobileClose) {
      onMobileClose();
    }
  };

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen flex-col border-r transition-all duration-300',
          'bg-cartex-surface border-cartex',
          // Desktop: show based on collapsed state
          'hidden lg:flex',
          collapsed ? 'lg:w-16' : 'lg:w-64',
          // Mobile: show as drawer when mobileOpen
          mobileOpen && 'flex w-64'
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-cartex px-4">
          {(!collapsed || mobileOpen) && (
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-cartex-teal text-white font-semibold">
                W
              </div>
              <span className="text-lg font-semibold text-cartex">Whiskr</span>
            </div>
          )}
          {collapsed && !mobileOpen && (
            <div className="mx-auto flex h-8 w-8 items-center justify-center rounded-lg bg-cartex-teal text-white font-semibold text-xs">
              W
            </div>
          )}
          {/* Mobile close button */}
          {mobileOpen && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMobileClose}
              className="lg:hidden"
            >
              <X className="h-5 w-5" />
            </Button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto p-3">
          <ul className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={handleNavClick}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-[color-mix(in_srgb,var(--cartex-teal)_15%,transparent)] text-cartex-teal'
                        : 'text-cartex-muted hover:bg-[color-mix(in_srgb,var(--cartex-border)_50%,transparent)] hover:text-cartex',
                      collapsed && !mobileOpen && 'justify-center px-2'
                    )}
                    title={collapsed && !mobileOpen ? item.label : undefined}
                  >
                    <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-cartex-teal')} />
                    {(!collapsed || mobileOpen) && <span>{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Footer - only show collapse button on desktop */}
        <div className="border-t border-cartex p-3 hidden lg:block">
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggle}
            className={cn('w-full', collapsed ? 'justify-center' : 'justify-start')}
          >
            {collapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <>
                <ChevronLeft className="h-4 w-4 mr-2" />
                <span>Collapse</span>
              </>
            )}
          </Button>
        </div>
      </aside>
    </>
  );
}
