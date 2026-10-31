import { NavLink, Link, useLocation } from 'react-router-dom';
import { UserRound } from 'lucide-react';
import { cn } from '../../lib/utils';
import { DemoReplayBadge } from '../common/DemoReplayBadge';
import { MatchLensLogo } from './MatchLensLogo';

export function TopNav() {
  const location = useLocation();
  const isMatchCentreActive = location.pathname.startsWith('/match');

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" aria-label="MatchLens home" className="rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <MatchLensLogo />
        </Link>

        <nav aria-label="Primary" className="order-3 flex w-full items-center justify-between gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:order-none md:w-auto md:justify-start">
          <NavLink
            to="/matches"
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm text-center flex-1 md:flex-initial',
                isActive || location.pathname === '/'
                  ? 'bg-surface-2 text-lime'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground'
              )
            }
          >
            Matches
          </NavLink>

          <NavLink
            to="/match/1082591"
            className={cn(
              'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm text-center flex-1 md:flex-initial',
              isMatchCentreActive
                ? 'bg-surface-2 text-lime'
                : 'text-muted-foreground hover:bg-surface hover:text-foreground'
            )}
          >
            Match Centre
          </NavLink>

          <NavLink
            to="/stories"
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm text-center flex-1 md:flex-initial',
                isActive
                  ? 'bg-surface-2 text-lime'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground'
              )
            }
          >
            Stories
          </NavLink>

          <NavLink
            to="/how-it-works"
            className={({ isActive }) =>
              cn(
                'whitespace-nowrap rounded-md px-2.5 py-1 text-xs font-medium transition-colors sm:px-3 sm:py-1.5 sm:text-sm text-center flex-1 md:flex-initial',
                isActive
                  ? 'bg-surface-2 text-lime'
                  : 'text-muted-foreground hover:bg-surface hover:text-foreground'
              )
            }
          >
            How It Works
          </NavLink>
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
