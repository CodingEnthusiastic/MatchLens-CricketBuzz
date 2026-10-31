import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Send } from 'lucide-react';
import type { MatchState } from '../../types/match';
import type { ChatMessage } from '../../hooks/useCompanion';
import { LoadingState } from '../common/StateMessages';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { ChatAnswer } from './ChatAnswer';

const SUGGESTED_QUESTIONS = [
  'Why has the scoring rate dropped?',
  'What happened in the last three overs?',
  'Who is controlling this partnership?',
  'Explain the current required run rate.',
  'What does this umpiring decision mean?',
];

const MAX_QUESTION_LENGTH = 300;

export function AskMatchLens({
  state,
  messages,
  pending,
  onSend,
}: {
  state: MatchState;
  messages: ChatMessage[];
  pending: boolean;
  onSend: (question: string) => void;
}) {
  const [draft, setDraft] = useState('');
  const logRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const log = logRef.current;
    if (log) log.scrollTo({ top: log.scrollHeight, behavior: 'smooth' });
  }, [messages.length, pending]);

  const submit = (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || pending) return;
    onSend(trimmed);
    setDraft('');
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    submit(draft);
  };

  return (
    <section className="flex flex-col rounded-lg border border-border bg-surface">
      <header className="flex flex-col gap-1 border-b border-border px-5 py-4 sm:px-6">
        <p className="text-xs font-medium uppercase tracking-wider text-sky">Companion</p>
        <h2 className="text-xl font-semibold text-foreground">Ask MatchLens</h2>
        <p className="text-sm text-muted-foreground">Your match. Your questions. Contextual answers.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Answers use the replay up to over {state.overs}, delivery {state.ball_index}.
        </p>
      </header>

      <div className="border-b border-border px-5 py-3 sm:px-6">
        <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {SUGGESTED_QUESTIONS.map((question) => (
            <button
              key={question}
              type="button"
              disabled={pending}
              onClick={() => submit(question)}
              className="shrink-0 rounded-full border border-border bg-background px-3 py-1.5 text-xs text-foreground transition-colors hover:border-sky/60 hover:text-sky disabled:cursor-not-allowed disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      </div>

      <div ref={logRef} className="flex min-h-[260px] max-h-[460px] flex-col gap-5 overflow-y-auto px-5 py-5 sm:px-6" aria-live="polite">
        {messages.length === 0 && !pending && (
          <p className="my-auto text-center text-sm text-muted-foreground">
            Pick a suggested question or type your own. Answers cite the deliveries they were calculated from.
          </p>
        )}

        {messages.map((message) =>
          message.role === 'user' ? (
            <div key={message.id} className="ml-auto max-w-[85%] rounded-lg rounded-br-sm bg-surface-2 px-4 py-2.5 text-sm text-foreground">
              {message.text}
            </div>
          ) : (
            <div key={message.id} className="max-w-full rounded-lg rounded-bl-sm border border-border bg-background/60 px-4 py-4">
              <ChatAnswer message={message} onRetry={submit} />
            </div>
          )
        )}

        {pending && <LoadingState label="Checking the replay data" />}
      </div>

      <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-border px-5 py-4 sm:px-6">
        <label htmlFor="ask-matchlens" className="sr-only">
          Ask a question about this match
        </label>
        <Input
          id="ask-matchlens"
          value={draft}
          maxLength={MAX_QUESTION_LENGTH}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Ask about the match so far"
          disabled={pending}
          autoComplete="off"
        />
        <Button type="submit" size="icon" disabled={pending || draft.trim().length === 0} aria-label="Send question">
          <Send className="h-4 w-4" aria-hidden="true" />
        </Button>
      </form>
    </section>
  );
}
