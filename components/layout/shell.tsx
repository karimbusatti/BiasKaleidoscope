'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/sandbox', label: 'Sandbox' },
  { href: '/fix', label: 'Fix Mode' },
  { href: '/hr', label: 'HR Mode' },
  { href: '/reports', label: 'Reports' },
  { href: '/labs', label: 'Labs' }
];

const secondaryNav = [
  { href: '/settings', label: 'Settings' },
  { href: '/api-keys', label: 'API Keys' },
  { href: '/billing', label: 'Billing' }
];

export function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen">
      <header className="border-b bg-white/70 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/dashboard" className="text-lg font-semibold text-brand">
            Bias Kaleidoscope
          </Link>
          <nav className="flex gap-3 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'rounded-full px-3 py-2 text-slate-600 transition hover:text-slate-900',
                  pathname?.startsWith(item.href) &&
                    'bg-brand-soft text-brand'
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <div className="text-xs text-slate-500">Audit grade fairness insights</div>
        </div>
      </header>
      <div className="mx-auto flex max-w-6xl gap-8 px-6 py-8">
        <aside className="hidden w-48 flex-shrink-0 lg:block">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Workspace
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100',
                    pathname?.startsWith(item.href) && 'bg-brand-soft text-brand'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-6 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Account
          </div>
          <ul className="mt-3 space-y-2 text-sm">
            {secondaryNav.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex items-center justify-between rounded-md px-3 py-2 text-slate-600 hover:bg-slate-100',
                    pathname?.startsWith(item.href) && 'bg-brand-soft text-brand'
                  )}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </aside>
        <main className="flex-1 space-y-6">{children}</main>
      </div>
    </div>
  );
}
