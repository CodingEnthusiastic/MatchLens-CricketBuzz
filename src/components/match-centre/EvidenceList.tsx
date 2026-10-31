import { BarChart3, BookOpen, CircleDot, Layers } from 'lucide-react';
import type { EvidenceItem } from '../../types/match';

const KIND_ICON = {
  ball: CircleDot,
  over: Layers,
  statistic: BarChart3,
  rule: BookOpen,
} as const;

export function EvidenceList({ items }: { items: EvidenceItem[] }) {
  if (items.length === 0) {
    return <p className="text-xs text-muted-foreground">No individual records were needed for this answer.</p>;
  }

  return (
    <ul className="space-y-2">
      {items.map((item, index) => {
        const Icon = KIND_ICON[item.kind];
        return (
          <li key={`${item.title}-${index}`} className="flex gap-3 rounded-md border border-border bg-background/60 px-3 py-2.5">
            <Icon className="mt-0.5 h-4 w-4 shrink-0 text-sky" aria-hidden="true" />
            <div className="min-w-0">
              <p className="text-sm font-medium text-foreground">
                {item.title}
                {item.over_range && (
                  <span className="ml-2 text-xs font-normal tabular text-muted-foreground">{item.over_range}</span>
                )}
              </p>
              <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">{item.detail}</p>
              {item.ball_index !== undefined && (
                <p className="mt-1 text-[11px] tabular text-muted-foreground">Replay position {item.ball_index}</p>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
