import { CircleDot } from 'lucide-react';

export function MatchLensLogo() {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-md bg-lime text-background">
        <CircleDot className="h-5 w-5" strokeWidth={2.25} aria-hidden="true" />
      </span>
      <span className="text-sm font-semibold tracking-[0.18em] text-foreground">MATCHLENS</span>
    </div>
  );
}
