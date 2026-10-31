import type { ReactNode } from 'react';
import { cn } from '../../lib/utils';

export function SectionCard({
  title,
  eyebrow,
  action,
  children,
  className,
}: {
  title: string;
  eyebrow?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn('rounded-lg border border-border bg-surface', className)}>
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-5 py-4 sm:px-6">
        <div className="min-w-0">
          {eyebrow && (
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{eyebrow}</p>
          )}
          <h2 className="mt-0.5 text-lg font-semibold text-foreground">{title}</h2>
        </div>
        {action}
      </header>
      <div className="px-5 py-5 sm:px-6">{children}</div>
    </section>
  );
}
