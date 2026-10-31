import { ChevronDown, ExternalLink, TriangleAlert } from 'lucide-react';
import { Badge } from '../ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { MarkdownText } from '../common/MarkdownText';
import { ErrorState } from '../common/StateMessages';
import { cn } from '../../lib/utils';
import type { ChatResponse } from '../../types/match';
import type { ChatMessage } from '../../hooks/useCompanion';
import { EvidenceList } from './EvidenceList';

const CONFIDENCE_LABEL: Record<NonNullable<ChatResponse['confidence']>, string> = {
  high: 'Computed directly',
  medium: 'Partly inferred',
  low: 'Limited data',
};

function AnswerFacts({ response }: { response: ChatResponse }) {
  if (response.computed_facts.length === 0) return null;
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 rounded-md border border-border bg-background/60 p-3 sm:grid-cols-3">
      {response.computed_facts.map((fact) => (
        <div key={fact.label}>
          <dt className="text-[11px] uppercase tracking-wider text-muted-foreground">{fact.label}</dt>
          <dd className="mt-0.5 text-sm font-semibold tabular text-foreground">{fact.value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Citations({ response }: { response: ChatResponse }) {
  if (response.citations.length === 0) return null;
  return (
    <div className="space-y-2">
      <h5 className="text-[11px] uppercase tracking-wider text-muted-foreground">Cricket rule references</h5>
      <ul className="space-y-2">
        {response.citations.map((citation) => (
          <li key={citation.title} className="rounded-md border border-border bg-background/60 px-3 py-2.5">
            <p className="flex items-center gap-2 text-sm font-medium text-foreground">
              {citation.title}
              {citation.url && (
                <a href={citation.url} target="_blank" rel="noreferrer" className="text-sky hover:underline" aria-label={`Open ${citation.title}`}>
                  <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
                </a>
              )}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">{citation.source}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{citation.excerpt}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ChatAnswer({ message, onRetry }: { message: ChatMessage; onRetry: (question: string) => void }) {
  if (message.error) {
    return (
      <ErrorState
        message={`MatchLens could not answer that question. ${message.error}`}
        onRetry={message.question ? () => onRetry(message.question as string) : undefined}
      />
    );
  }

  const response = message.response;
  if (!response) return null;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        {response.confidence && (
          <Badge
            variant="outline"
            className={cn('border-border text-[11px] font-medium', response.confidence === 'low' ? 'text-amber' : 'text-muted-foreground')}
          >
            {CONFIDENCE_LABEL[response.confidence]}
          </Badge>
        )}
        <span className="text-[11px] text-muted-foreground">Up to replay position {response.last_processed_ball_index}</span>
      </div>

      <MarkdownText text={response.answer} />
      <AnswerFacts response={response} />

      {response.warnings.length > 0 && (
        <ul className="space-y-1.5">
          {response.warnings.map((warning) => (
            <li key={warning} className="flex items-start gap-2 text-xs text-amber">
              <TriangleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {warning}
            </li>
          ))}
        </ul>
      )}

      <Collapsible>
        <CollapsibleTrigger className="group flex w-full items-center justify-between rounded-md border border-border px-3 py-2 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground">
          Evidence behind this answer ({response.evidence.length})
          <ChevronDown className="h-3.5 w-3.5 transition-transform group-data-[state=open]:rotate-180" aria-hidden="true" />
        </CollapsibleTrigger>
        <CollapsibleContent className="space-y-4 pt-3">
          <EvidenceList items={response.evidence} />
          <Citations response={response} />
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
