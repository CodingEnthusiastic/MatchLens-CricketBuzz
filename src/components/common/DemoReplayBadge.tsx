import { isDemoMode } from '../../services/api';
import { cn } from '../../lib/utils';

export function DemoReplayBadge({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-sm border border-amber/40 bg-amber/10 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-amber',
        className
      )}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber" aria-hidden="true" />
      {isDemoMode ? 'Demo replay' : 'Historical replay'}
    </span>
  );
}
