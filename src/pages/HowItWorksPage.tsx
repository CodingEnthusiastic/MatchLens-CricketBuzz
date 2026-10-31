import { Brain, Database, GitBranch, MessageSquare, Search, Sparkles } from 'lucide-react';
import { cn } from '../lib/utils';

interface Step {
  id: number;
  icon: React.ComponentType<{ className?: string }>;
  iconColor: string;
  iconBg: string;
  label: string;
  title: string;
  description: string;
  detail: string;
}

const STEPS: Step[] = [
  {
    id: 1,
    icon: MessageSquare,
    iconColor: 'text-lime',
    iconBg: 'bg-lime/10 border-lime/30',
    label: 'Step 1 · Query',
    title: 'Fine-tuned query understanding',
    description: 'A fan asks a natural language question about the match, such as "Why has the run rate dropped?" or "Who is controlling this partnership?"',
    detail:
      'MatchLens uses a fine-tuned intent classifier to identify what kind of question is being asked — scoring rate, player performance, required run rate, umpiring decision, or general match context — before choosing how to answer it.',
  },
  {
    id: 2,
    icon: Database,
    iconColor: 'text-sky',
    iconBg: 'bg-sky/10 border-sky/30',
    label: 'Step 2 · Retrieval',
    title: 'Cricket knowledge retrieval',
    description: 'Relevant cricket rules, match facts and statistical records are retrieved from a structured knowledge base.',
    detail:
      'A vector database (Qdrant) holds indexed cricket knowledge — rules, common scoring scenarios, historical patterns and statistical benchmarks. The retriever finds the most relevant records for the current question and match context.',
  },
  {
    id: 3,
    icon: Search,
    iconColor: 'text-amber',
    iconBg: 'bg-amber/10 border-amber/30',
    label: 'Step 3 · Statistics',
    title: 'Match statistics computation',
    description: 'Ball-by-ball match data is processed to compute live statistics — run rates, partnerships, scoring trends and comparisons.',
    detail:
      'Every figure shown by MatchLens is computed directly from the delivery-level match data. Run rate, required run rate, partnership runs and boundaries are all calculated from the raw ball events rather than taken from a third-party feed.',
  },
  {
    id: 4,
    icon: GitBranch,
    iconColor: 'text-wicket',
    iconBg: 'bg-wicket/10 border-wicket/30',
    label: 'Step 4 · Orchestration',
    title: 'LangGraph orchestration',
    description: 'A multi-step agent graph coordinates retrieval, computation and generation across the different question types.',
    detail:
      'LangGraph provides the agentic backbone of MatchLens. Each question type routes through a different graph path: some questions go straight to statistics computation, others retrieve cricket rules first, and complex questions combine both before generation.',
  },
  {
    id: 5,
    icon: Brain,
    iconColor: 'text-lime',
    iconBg: 'bg-lime/10 border-lime/30',
    label: 'Step 5 · Generation',
    title: 'Gemini-powered explanations',
    description: 'Gemini synthesises the computed facts and retrieved knowledge into a clear, contextual answer for the fan.',
    detail:
      'Google Gemini generates the final answer using a structured prompt that includes the verified statistics, retrieved knowledge and match context. The generation step never invents facts — all claims in the answer are grounded in the retrieved and computed evidence that MatchLens surfaces in the Evidence panel.',
  },
  {
    id: 6,
    icon: Sparkles,
    iconColor: 'text-sky',
    iconBg: 'bg-sky/10 border-sky/30',
    label: 'Step 6 · Transparency',
    title: 'Evidence-backed answers',
    description: 'Every answer links back to the specific deliveries, overs and statistical calculations that support it.',
    detail:
      'The Match Evidence panel shows fans exactly which deliveries, overs and statistics were used to construct an answer. Cricket rule references are cited where applicable. This is a deliberate design decision: fans should be able to verify what MatchLens tells them, and the system should never feel like a black box.',
  },
];

interface PrincipleProps {
  title: string;
  description: string;
}

const PRINCIPLES: PrincipleProps[] = [
  {
    title: 'No hallucinated facts',
    description:
      'Every number in a MatchLens answer is computed from the ball-by-ball match data. The system does not guess or interpolate figures.',
  },
  {
    title: 'Context-aware answers',
    description:
      'Questions are answered relative to the current replay position. Ask about the required run rate at over 12, and the answer reflects that exact point in the match.',
  },
  {
    title: 'Transparent sourcing',
    description:
      'The Evidence panel links each answer back to the specific deliveries, overs and statistics used to compute it. Nothing is hidden.',
  },
  {
    title: 'Fan-first language',
    description:
      'Technical cricket and data concepts are explained in clear, editorial language. MatchLens respects the fan rather than overwhelming them with jargon.',
  },
];

function StepCard({ step, isLast }: { step: Step; isLast: boolean }) {
  const Icon = step.icon;
  return (
    <div className="relative flex gap-5">
      {/* Connector line */}
      {!isLast && (
        <div
          className="absolute left-[1.625rem] top-[3.25rem] w-px bg-border"
          style={{ height: 'calc(100% - 0.5rem)' }}
          aria-hidden="true"
        />
      )}
      {/* Icon badge */}
      <div className={cn('relative z-10 flex h-[3.25rem] w-[3.25rem] shrink-0 items-center justify-center rounded-full border', step.iconBg)}>
        <Icon className={cn('h-5 w-5', step.iconColor)} aria-hidden="true" />
      </div>
      {/* Content */}
      <div className="min-w-0 flex-1 pb-10">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{step.label}</p>
        <h3 className="mt-1 text-lg font-semibold text-foreground">{step.title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-foreground/90">{step.description}</p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.detail}</p>
      </div>
    </div>
  );
}

function PrincipleItem({ title, description }: PrincipleProps) {
  return (
    <div className="rounded-lg border border-border bg-surface p-5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>
    </div>
  );
}

function ArchitectureDiagram() {
  const nodes = [
    { label: 'Fan question', color: 'border-lime/40 bg-lime/10 text-lime' },
    { label: 'Intent classifier', color: 'border-sky/40 bg-sky/10 text-sky' },
    { label: 'Qdrant retrieval', color: 'border-amber/40 bg-amber/10 text-amber' },
    { label: 'Statistics engine', color: 'border-amber/40 bg-amber/10 text-amber' },
    { label: 'LangGraph agent', color: 'border-wicket/40 bg-wicket/10 text-wicket' },
    { label: 'Gemini generation', color: 'border-lime/40 bg-lime/10 text-lime' },
    { label: 'Evidence + answer', color: 'border-sky/40 bg-sky/10 text-sky' },
  ];

  return (
    <div className="overflow-x-auto">
      <div className="flex min-w-[520px] items-center justify-center gap-1 py-2">
        {nodes.map((node, index) => (
          <div key={node.label} className="flex items-center">
            <div className={cn('rounded-md border px-3 py-2 text-center text-xs font-medium', node.color)}>
              {node.label}
            </div>
            {index < nodes.length - 1 && (
              <div className="flex items-center px-1">
                <div className="h-px w-4 bg-border" aria-hidden="true" />
                <svg className="h-3 w-3 text-border" viewBox="0 0 12 12" fill="currentColor" aria-hidden="true">
                  <path d="M6 0 L12 6 L6 12 L4.5 10.5 L9 6 L4.5 1.5Z" />
                </svg>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export function HowItWorksPage() {
  return (
    <div className="space-y-12">
      {/* Page header */}
      <div className="max-w-2xl">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Technical overview</p>
        <h1 className="mt-1 text-2xl font-semibold text-foreground">How MatchLens works</h1>
        <p className="mt-3 text-base leading-relaxed text-muted-foreground">
          MatchLens combines live match data with a retrieval-augmented generation pipeline to give fans contextual,
          evidence-backed answers about what is happening in a cricket match — without requiring them to be a statistician.
        </p>
      </div>

      {/* Architecture diagram */}
      <section aria-label="Architecture diagram" className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Pipeline overview</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">From question to answer</h2>
        <div className="mt-5 overflow-x-auto">
          <ArchitectureDiagram />
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Each stage is performed by a dedicated component in the MatchLens backend. The LangGraph agent orchestrates the flow based on the detected intent.
        </p>
      </section>

      {/* Step-by-step walkthrough */}
      <section aria-label="Step-by-step explanation" className="rounded-lg border border-border bg-surface p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Pipeline detail</p>
        <h2 className="mt-1 mb-8 text-lg font-semibold text-foreground">The six steps</h2>
        <div>
          {STEPS.map((step, index) => (
            <StepCard key={step.id} step={step} isLast={index === STEPS.length - 1} />
          ))}
        </div>
      </section>

      {/* Design principles */}
      <section aria-label="Design principles">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Guiding principles</p>
        <h2 className="mt-1 mb-6 text-lg font-semibold text-foreground">What MatchLens stands for</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {PRINCIPLES.map(principle => (
            <PrincipleItem key={principle.title} {...principle} />
          ))}
        </div>
      </section>

      {/* Demo notice */}
      <section aria-label="Demo notice" className="rounded-lg border border-amber/30 bg-amber/10 p-5 sm:p-6">
        <p className="text-[11px] font-medium uppercase tracking-wider text-amber">Demo mode</p>
        <h2 className="mt-1 text-lg font-semibold text-foreground">This version uses demonstration fixtures</h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          All match data in this version of MatchLens is a carefully constructed demonstration fixture. No live cricket feed is connected, and all teams, players and venues are fictional.
          The AI companion in demo mode answers questions using the fixture data and does not call any external model.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          When a real FastAPI backend is configured via <code className="rounded bg-surface-2 px-1.5 py-0.5 text-xs font-mono text-foreground">VITE_API_BASE_URL</code>, the application will use the actual retrieval-augmented pipeline instead.
        </p>
      </section>

      {/* Stack summary */}
      <section aria-label="Technology stack">
        <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Technology</p>
        <h2 className="mt-1 mb-6 text-lg font-semibold text-foreground">Built with</h2>
        <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { term: 'Frontend', definition: 'React · TypeScript · Vite · Tailwind CSS · shadcn/ui · Recharts' },
            { term: 'AI generation', definition: 'Google Gemini via the Gemini API' },
            { term: 'Orchestration', definition: 'LangGraph agent graph with typed state' },
            { term: 'Retrieval', definition: 'Qdrant vector database with dense embeddings' },
            { term: 'Backend', definition: 'FastAPI (Python) with async endpoints' },
            { term: 'Data', definition: 'Ball-by-ball delivery data with derived statistics' },
          ].map(item => (
            <div key={item.term} className="rounded-md border border-border bg-surface p-4">
              <dt className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{item.term}</dt>
              <dd className="mt-1 text-sm text-foreground">{item.definition}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
