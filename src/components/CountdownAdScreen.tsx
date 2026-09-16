import AdsterraBanner from './AdsterraBanner';

interface CountdownAdScreenProps {
  countdown: number;
  query: string;
  searchMode: 'number' | 'cnic';
}

export function CountdownAdScreen({
  countdown,
  query,
  searchMode,
}: CountdownAdScreenProps) {
  return (
    <div
      data-testid="countdown-ad-card"
      className="pksim-rise-in relative w-full overflow-hidden rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-[0_16px_40px_hsl(157_35%_19%_/_0.07)] text-center flex flex-col items-center justify-center"
    >
      {/* Simple Countdown Display */}
      <div className="flex flex-col items-center justify-center mb-2">
        <div className="relative flex h-20 w-20 items-center justify-center rounded-full border-4 border-[hsl(var(--primary)_/_0.2)] bg-[hsl(var(--secondary)_/_0.4)]">
          <span
            data-testid="countdown-timer-value"
            className="pksim-display text-3xl sm:text-4xl font-bold font-mono text-[hsl(var(--primary))]"
          >
            {countdown}
          </span>
          <span className="absolute -bottom-2.5 rounded-full bg-[hsl(var(--primary))] px-2.5 py-0.5 text-[10px] font-bold text-[hsl(var(--primary-foreground))] shadow-xs">
            sec
          </span>
        </div>

        <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.6)] px-3.5 py-1 text-xs font-semibold text-[hsl(var(--foreground))]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--accent))]" />
          <span>Searching {searchMode === 'cnic' ? 'CNIC' : 'Number'}:</span>
          <span className="font-mono text-[hsl(var(--primary))] font-bold">{query}</span>
        </div>
      </div>

      {/* Adsterra 300x250 Banner directly with countdown */}
      <AdsterraBanner />
    </div>
  );
}

export default CountdownAdScreen;
