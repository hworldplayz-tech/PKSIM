import { useEffect, useState } from 'react';
import { Database, Lock, Radio, ShieldCheck, Sparkles } from 'lucide-react';

interface SearchingAnimationProps {
  query: string;
  searchMode: 'number' | 'cnic';
}

const STEPS = [
  {
    title: 'Connecting to telecom gateways',
    subtitle: 'Establishing secure link to primary & backup nodes...',
    icon: Database,
  },
  {
    title: 'Scanning network registries',
    subtitle: 'Searching across telecom subscriber databases...',
    icon: Radio,
  },
  {
    title: 'Decrypting record records',
    subtitle: 'Extracting CNIC, owner details, and network routing...',
    icon: Lock,
  },
  {
    title: 'Compiling results',
    subtitle: 'Verifying data integrity and preparing output...',
    icon: Sparkles,
  },
];

export function SearchingAnimation({ query, searchMode }: SearchingAnimationProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [progress, setProgress] = useState(5);

  useEffect(() => {
    // 3000ms duration broken into dynamic stages
    const startTime = Date.now();
    const duration = 3000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(Math.round((elapsed / duration) * 100), 98);
      setProgress(pct);

      if (elapsed < 750) {
        setCurrentStep(0);
      } else if (elapsed < 1600) {
        setCurrentStep(1);
      } else if (elapsed < 2400) {
        setCurrentStep(2);
      } else {
        setCurrentStep(3);
      }

      if (elapsed >= duration) {
        clearInterval(interval);
      }
    }, 40);

    return () => clearInterval(interval);
  }, []);

  return (
    <div
      data-testid="searching-animation"
      className="pksim-rise-in relative w-full overflow-hidden rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-[0_20px_50px_hsl(157_35%_19%_/_0.08)]"
    >
      {/* Scanning Laser Line */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent opacity-80 animate-[scan_2s_ease-in-out_infinite]" />

      <div className="flex flex-col items-center text-center">
        {/* Animated Radar Pulse Circle */}
        <div className="relative mb-5 flex h-20 w-20 items-center justify-center">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[hsl(var(--primary))] opacity-25" />
          <span className="absolute inline-flex h-16 w-16 animate-pulse rounded-full bg-[hsl(var(--primary)_/_0.2)]" />
          <div className="relative flex h-14 w-14 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-[0_6px_20px_hsl(157_66%_24%_/_0.3)]">
            <Radio className="h-7 w-7 animate-spin" style={{ animationDuration: '3.5s' }} />
          </div>
        </div>

        {/* Query Info Badge */}
        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.6)] px-4 py-1.5 text-xs font-semibold text-[hsl(var(--foreground))]">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[hsl(var(--accent))]" />
          <span>Scanning {searchMode === 'cnic' ? 'CNIC' : 'Number'}:</span>
          <span className="font-mono text-[hsl(var(--primary))] font-bold">{query}</span>
        </div>

        <h3 className="pksim-display text-xl font-bold tracking-[-0.03em] text-[hsl(var(--foreground))] sm:text-2xl">
          Searching Database Records...
        </h3>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Please wait while we query live telecom and identity endpoints.
        </p>

        {/* Progress Bar with Percentage */}
        <div className="mt-6 w-full max-w-[460px]">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold">
            <span className="text-[hsl(var(--muted-foreground))]">Query Progress</span>
            <span className="font-mono font-bold text-[hsl(var(--primary))]">{progress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-[hsl(var(--muted))]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--primary))] to-[hsl(var(--accent))] transition-all duration-100 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps Visual List */}
        <div className="mt-7 w-full max-w-[460px] space-y-2.5 text-left">
          {STEPS.map((step, idx) => {
            const Icon = step.icon;
            const isCompleted = currentStep > idx;
            const isCurrent = currentStep === idx;

            return (
              <div
                key={step.title}
                className={`flex items-center gap-3.5 rounded-xl border px-3.5 py-2.5 transition-all duration-300 ${
                  isCurrent
                    ? 'border-[hsl(var(--primary))] bg-[hsl(var(--secondary)_/_0.6)] shadow-sm'
                    : isCompleted
                    ? 'border-transparent bg-[hsl(var(--muted)_/_0.3)] opacity-85'
                    : 'border-transparent opacity-40'
                }`}
              >
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                    isCompleted
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                      : isCurrent
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] animate-pulse'
                      : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                  }`}
                >
                  {isCompleted ? <ShieldCheck className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-bold leading-tight ${
                      isCurrent
                        ? 'text-[hsl(var(--primary))]'
                        : 'text-[hsl(var(--foreground))]'
                    }`}
                  >
                    {step.title}
                  </p>
                  <p className="truncate text-[11px] text-[hsl(var(--muted-foreground))]">
                    {step.subtitle}
                  </p>
                </div>
                {isCurrent && (
                  <span className="h-1.5 w-1.5 shrink-0 animate-ping rounded-full bg-[hsl(var(--primary))]" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default SearchingAnimation;
