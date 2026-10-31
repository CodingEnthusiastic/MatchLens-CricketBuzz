import { AlertTriangle, Loader2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '../ui/button';

export function LoadingState({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2.5 py-6 text-sm text-muted-foreground" role="status">
      <Loader2 className="h-4 w-4 animate-spin text-sky" aria-hidden="true" />
      {label}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div
      role="alert"
      className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-wicket/30 bg-wicket/10 px-4 py-3 text-sm"
    >
      <span className="flex items-start gap-2 text-foreground">
        <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-wicket" aria-hidden="true" />
        {message}
      </span>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="border-wicket/40 text-foreground hover:bg-wicket/10">
          Try again
        </Button>
      )}
    </div>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{children}</p>;
}
