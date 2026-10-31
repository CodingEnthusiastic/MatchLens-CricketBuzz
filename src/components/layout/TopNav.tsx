import { NavLink, Link } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DemoReplayBadge } from '../common/DemoReplayBadge';
import { MatchLensLogo } from './MatchLensLogo';

const NAV_LINKS = [
  { to: '/', label: 'Match Centre', end: true },
  { to: '/stories', label: 'Match Stories', end: false },
  { to: '/how-it-works', label: 'How It Works', end: false },
];

export function TopNav() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" aria-label="MatchLens home" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <MatchLensLogo />
        </Link>

        <nav aria-label="Primary" className="order-3 flex w-full items-center gap-1 overflow-x-auto md:order-none md:w-auto">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={({ isActive }) =>
                cn(
                  'whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-surface-2 text-lime'
                    : 'text-muted-foreground hover:bg-surface hover:text-foreground'
                )
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <DemoReplayBadge />
          <button
            type="button"
            aria-label="Profile"
            className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            <UserRound className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </header>
  );
}
