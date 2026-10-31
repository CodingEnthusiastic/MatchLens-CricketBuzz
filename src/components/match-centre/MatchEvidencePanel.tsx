import type { ReactNode } from 'react';
import { ChevronDown, Database, FileSearch } from 'lucide-react';
import type { ChatResponse, Match, MatchState } from '../../types/match';
import { isDemoMode } from '../../services/api';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';

function relevantOvers(response: ChatResponse | null): string[] {
  if (!response) return [];
  const ranges = response.evidence.flatMap((item) => (item.over_range ? [item.over_range] : []));
  return [...new Set(ranges)];
}

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[120px_minmax(0,1fr)] gap-3 border-b border-border py-2.5 last:border-b-0">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 text-sm text-foreground">{children}</dd>
    </div>
  );
}

export function MatchEvidencePanel({
  match,
  state,
  response,
}: {
  match: Match;
  state: MatchState;
  response: ChatResponse | null;
}) {
  const overs = relevantOvers(response);
  const sourceLabel = response ? (response.source === 'demo' ? 'Demo fixture' : 'Backend API') : isDemoMode ? 'Demo fixture' : 'Backend API';

  return (
    <Collapsible defaultOpen>
      <section className="rounded-lg border border-border bg-surface">
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-3 border-b border-border px-5 py-4 text-left transition-colors hover:bg-surface-2/50 sm:px-6">
          <span className="flex min-w-0 items-center gap-3">
            <FileSearch className="h-4 w-4 shrink-0 text-sky" aria-hidden="true" />
            <span className="min-w-0">
              <span className="block text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Transparency</span>
              <span className="block text-lg font-semibold text-foreground">Match Evidence</span>
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
        </CollapsibleTrigger>

        <CollapsibleContent>
          <div className="px-5 py-2 sm:px-6">
            <dl>
              <Row label="Data source">
                <span className="inline-flex items-center gap-2">
                  <Database className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
                  {sourceLabel}
                </span>
              </Row>
              <Row label="Match">
                <span className="tabular">
                  {match.match_id} ({match.teams[0].code} v {match.teams[1].code})
                </span>
              </Row>
              <Row label="Relevant overs">
                {overs.length > 0 ? (
                  <span className="tabular">{overs.join(', ')}</span>
                ) : (
                  <span className="text-muted-foreground">Ask a question to see the overs it relies on.</span>
                )}
              </Row>
              <Row label="Statistics used">
                {response && response.computed_facts.length > 0 ? (
                  <ul className="space-y-1">
                    {response.computed_facts.map((fact) => (
                      <li key={fact.label} className="flex justify-between gap-3 tabular">
                        <span className="text-muted-foreground">{fact.label}</span>
                        <span>{fact.value}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">No calculations for the latest answer.</span>
                )}
              </Row>
              <Row label="Rule references">
                {response && response.citations.length > 0 ? (
                  <ul className="space-y-1">
                    {response.citations.map((citation) => (
                      <li key={citation.title}>{citation.title}</li>
                    ))}
                  </ul>
                ) : (
                  <span className="text-muted-foreground">None supplied. Demo answers do not cite external rules.</span>
                )}
              </Row>
              <Row label="Last ball processed">
                <span className="tabular">
                  {response ? response.last_processed_ball_index : state.ball_index} of {state.total_deliveries}
                </span>
              </Row>
            </dl>
          </div>
        </CollapsibleContent>
      </section>
    </Collapsible>
  );
}
