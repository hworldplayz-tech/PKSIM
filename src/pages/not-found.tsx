import { Link } from 'wouter';
import { ArrowLeft, Home, Search, ShieldAlert, Sparkles } from 'lucide-react';
import LinkShareLogo from '@/components/LinkShareLogo';

export default function NotFound() {
  return (
    <main className="pksim-shell min-h-[100dvh] flex flex-col justify-between bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Header */}
      <header className="mx-auto flex h-[74px] w-full max-w-[980px] items-center justify-between border-b border-[hsl(var(--border))] px-5 sm:px-8">
        <Link href="/" className="group flex items-center gap-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.3)]">
          <LinkShareLogo size={38} />
          <span className="pksim-display text-[19px] font-bold tracking-[-0.05em] text-[hsl(var(--primary))]">
            PKSIM
          </span>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--foreground))] transition-all hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
        >
          <Home size={14} />
          <span>Home</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="mx-auto flex w-full max-w-[680px] flex-1 flex-col items-center justify-center px-5 py-12 text-center sm:px-8">
        <div className="pksim-rise-in relative flex flex-col items-center">
          {/* Big Glowing 404 Badge */}
          <div className="relative mb-6">
            <div className="absolute -inset-4 rounded-full bg-[hsl(var(--primary)_/_0.15)] blur-2xl" />
            <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-xl">
              <ShieldAlert className="h-12 w-12 text-[hsl(var(--destructive))]" />
            </div>
            <div className="absolute -bottom-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-white shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
          </div>

          <span className="inline-flex items-center gap-2 rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--secondary))] px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-[hsl(var(--secondary-foreground))]">
            404 Error
          </span>

          <h1 className="pksim-display mt-4 text-4xl font-extrabold tracking-[-0.05em] sm:text-5xl">
            Page Not Found
          </h1>

          <p className="mt-3 max-w-[440px] text-sm leading-6 text-[hsl(var(--muted-foreground))] sm:text-base">
            Oops! The page you are looking for doesn&apos;t exist, has been removed, or the link may be broken.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-3 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-[hsl(157_66%_19%)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.3)]"
            >
              <ArrowLeft size={16} />
              Go Back Home
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-5 py-3 text-sm font-semibold text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
            >
              <Search size={15} />
              Search SIM / CNIC
            </Link>
          </div>

          {/* Helpful Navigation Card */}
          <div className="mt-10 w-full max-w-[420px] rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)_/_0.7)] p-4 text-left shadow-sm">
            <p className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
              Quick Links
            </p>
            <div className="mt-2.5 flex items-center justify-between text-xs font-medium">
              <Link href="/" className="text-[hsl(var(--primary))] hover:underline">
                SIM / CNIC Lookup
              </Link>
              <span className="text-[hsl(var(--muted-foreground))]">•</span>
              <a
                href="https://linksshare.online/"
                target="_blank"
                rel="noreferrer"
                className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] hover:underline"
              >
                LinkShare Official
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="mx-auto flex h-[70px] w-full max-w-[980px] items-center justify-center border-t border-[hsl(var(--border))] px-5 text-center text-xs text-[hsl(var(--muted-foreground))]">
        <p>
          PKSIM &copy; {new Date().getFullYear()} — Powered by{' '}
          <a
            href="https://linksshare.online/"
            target="_blank"
            rel="noreferrer"
            className="font-bold text-[hsl(var(--primary))] underline hover:opacity-80"
          >
            LinkShare
          </a>
        </p>
      </footer>
    </main>
  );
}
