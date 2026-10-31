import type { ReactNode } from 'react';
import { TopNav } from './TopNav';

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground overflow-x-hidden">
      <TopNav />
      <main className="mx-auto w-full max-w-7xl flex-1 px-3 py-4 sm:px-6 sm:py-8 lg:px-8 overflow-x-hidden">{children}</main>
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:justify-between sm:px-6 lg:px-8">
          <span>MatchLens. All teams, players and venues in this demo are fictional.</span>
          <span>Replay data is a demonstration fixture and is not live match coverage.</span>
        </div>
      </footer>
    </div>
  );
}
