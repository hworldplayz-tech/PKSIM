import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Route, Switch, Link } from 'wouter';
import {
  AlertCircle,
  AlertTriangle,
  ArrowUpRight,
  Check,
  Copy,
  ExternalLink,
  Moon,
  RotateCcw,
  Search,
  ShieldCheck,
  Sun,
} from 'lucide-react';
import LinkShareLogo from '@/components/LinkShareLogo';
import AdSlot from '@/components/AdSlot';
import AdsterraBanner from '@/components/AdsterraBanner';
import CountdownAdScreen from '@/components/CountdownAdScreen';
import GlobalAdScripts from '@/components/GlobalAdScripts';
import SearchingAnimation from '@/components/SearchingAnimation';
import AdminPanel from '@/components/AdminPanel';
import NotFound from '@/pages/not-found';
import FollowUsPopup from '@/components/FollowUsPopup';
import FollowSection from '@/components/FollowSection';
import ShareFloatingButton from '@/components/ShareFloatingButton';
import { getWhatsAppChannel, SETTINGS_UPDATED_EVENT } from '@/config/settings';
import { initFirebaseAnalyticsScript, logSearchAnalytics } from '@/config/firebase';

type LookupState = 'idle' | 'countdown' | 'loading' | 'success' | 'empty' | 'error';
type JsonRecord = Record<string, unknown>;

const ADSTERRA_DIRECT_LINK = 'https://verticallysaturate.com/s2kb34qrk?key=6d6ee76249c1e8f55a4799c82580bc5e';
const ENDPOINT = 'https://sim-db-api.faizankhichi.me/';
const BACKUP_ENDPOINT = 'https://sim-data.ftgmhacks.workers.dev/';

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function displayKey(key: string) {
  const friendlyKeys: Record<string, string> = {
    nbr: 'Number',
    nam: 'Name',
    cni: 'CNIC',
    adr: 'Address',
  };
  if (friendlyKeys[key.toLowerCase()]) return friendlyKeys[key.toLowerCase()];
  return key
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/[_-]+/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'string') {
    return value
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/&amp;/g, '&');
  }
  if (typeof value === 'number' || typeof value === 'boolean') return String(value);
  if (Array.isArray(value)) return value.map(displayValue).join(', ');
  try {
    return JSON.stringify(value, null, 2);
  } catch {
    return String(value);
  }
}

const HIDDEN_KEYS = new Set([
  'ok',
  'cache',
  'cached',
  'contactdeveloper',
  'searchtype',
  'recordscount',
  'datasource',
  'inputquery',
  'queriednumber',
  'query',
]);

function cleanRecord(record: JsonRecord): JsonRecord {
  return Object.fromEntries(
    Object.entries(record).filter(([key]) => {
      const normalized = key.toLowerCase().replace(/[^a-z]/g, '');
      return !HIDDEN_KEYS.has(normalized);
    }),
  );
}

function recordsFromPayload(payload: unknown): JsonRecord[] {
  if (Array.isArray(payload)) {
    return payload
      .filter((item) => item !== null && item !== undefined)
      .map((item) => (isRecord(item) ? cleanRecord(item) : { value: item }))
      .filter((item) => Object.keys(item).length > 0);
  }
  if (isRecord(payload)) {
    const status = typeof payload.ok === 'boolean' ? payload.ok : undefined;
    const message = typeof payload.msg === 'string' ? payload.msg.toLowerCase() : '';
    if (status === false || message === 'not_found' || message === 'no_record') {
      return [];
    }
    if ('data' in payload && (Array.isArray(payload.data) || isRecord(payload.data))) {
      return recordsFromPayload(payload.data);
    }
    if ('records' in payload && (Array.isArray(payload.records) || isRecord(payload.records))) {
      return recordsFromPayload(payload.records);
    }
    if ('result' in payload && (Array.isArray(payload.result) || isRecord(payload.result))) {
      return recordsFromPayload(payload.result);
    }
    const record = cleanRecord(payload);
    return Object.keys(record).length > 0 ? [record] : [];
  }
  return payload === null || payload === undefined ? [] : [{ value: payload }];
}

function hasSuccessfulRecords(payload: unknown) {
  return recordsFromPayload(payload).length > 0;
}

function preferredValue(record: JsonRecord, keys: string[]) {
  const entry = Object.entries(record).find(([key, value]) => {
    const normalized = key.toLowerCase().replace(/[^a-z]/g, '');
    return keys.includes(normalized) && value !== null && value !== undefined && value !== '';
  });
  return entry ? displayValue(entry[1]) : null;
}

function StateBadge({ state, count, countdown }: { state: LookupState; count?: number; countdown?: number }) {
  if (state === 'countdown' || state === 'loading') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--secondary-foreground))]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--accent))]" />
        {state === 'countdown' ? `Countdown (${countdown ?? 10}s)` : 'Searching Live DB'}
      </span>
    );
  }
  if (state === 'success') {
    return (
      <span data-testid="status-record-found" className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(145_48%_92%)] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary))]">
        <Check size={13} strokeWidth={2.5} />
        {count === 1 ? 'Record found' : `${count} records found`}
      </span>
    );
  }
  if (state === 'empty') {
    return (
      <span data-testid="status-no-record" className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(43_80%_91%)] px-3 py-1.5 text-xs font-semibold text-[hsl(33_47%_31%)]">
        No record
      </span>
    );
  }
  if (state === 'error') {
    return (
      <span data-testid="status-lookup-error" className="inline-flex items-center gap-1.5 rounded-full bg-[hsl(2_70%_95%)] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--destructive))]">
        <AlertCircle size={13} />
        Lookup failed
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--muted))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--muted-foreground))]">
      Ready
    </span>
  );
}

function RecordCard({ record, index }: { record: JsonRecord; index: number }) {
  const [copied, setCopied] = useState(false);
  const fields = useMemo(() => Object.entries(record), [record]);
  const name = preferredValue(record, ['name', 'nam', 'fullname', 'owner', 'subscriber']);
  const phone = preferredValue(record, ['phone', 'nbr', 'number', 'phonenumber', 'mobile', 'msisdn']);
  const identity = preferredValue(record, ['cnic', 'cni', 'nic', 'identity', 'cnicnumber']);

  const copyRecord = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(record, null, 2));
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  return (
    <article
      data-testid={`card-record-${index}`}
      className="pksim-rise-in overflow-hidden rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-[0_18px_46px_hsl(157_35%_19%_/_0.07)]"
      style={{ animationDelay: `${index * 70}ms` }}
    >
      <div className="flex items-start justify-between gap-5 border-b border-[hsl(var(--border))] px-5 py-5 sm:px-7">
        <div className="min-w-0">
          <p className="mb-1 text-[11px] font-bold uppercase tracking-[0.16em] text-[hsl(var(--muted-foreground))]">
            {fields.length} fields
          </p>
          <h3 data-testid={`text-record-name-${index}`} className="pksim-display truncate text-xl font-semibold tracking-[-0.03em] text-[hsl(var(--foreground))]">
            {name || phone || `Record ${index + 1}`}
          </h3>
          {name && phone && (
            <p data-testid={`text-record-phone-${index}`} className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">{phone}</p>
          )}
        </div>
        <button
          type="button"
          data-testid={`button-copy-record-${index}`}
          onClick={copyRecord}
          className="group inline-flex shrink-0 items-center gap-2 rounded-xl border border-[hsl(var(--border))] px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.25)]"
          aria-label="Copy record"
        >
          {copied ? <Check size={14} /> : <Copy size={14} />}
          <span className="hidden sm:inline">{copied ? 'Copied' : 'Copy'}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 divide-y divide-[hsl(var(--border))] px-5 sm:grid-cols-2 sm:divide-x sm:divide-y-0 sm:px-0">
        {fields.map(([key, value]) => (
          <div
            key={key}
            data-testid={`field-${index}-${key}`}
            className="min-w-0 px-0 py-4 sm:px-7 even:sm:border-t even:sm:border-[hsl(var(--border))]"
          >
            <dt className="mb-1.5 text-[11px] font-bold uppercase tracking-[0.13em] text-[hsl(var(--muted-foreground))]">{displayKey(key)}</dt>
            <dd className={`break-words text-sm leading-6 text-[hsl(var(--foreground))] ${key.toLowerCase().includes('address') ? 'whitespace-pre-wrap' : ''}`}>
              {identity && key.toLowerCase().includes('cnic') ? identity : displayValue(value)}
            </dd>
          </div>
        ))}
      </div>
    </article>
  );
}

function EmptyDesk({ state, message, onRetry, whatsappLink }: { state: LookupState; message?: string; onRetry?: () => void; whatsappLink: string }) {
  if (state === 'error') {
    return (
      <div data-testid="state-error" className="flex min-h-[240px] flex-col items-center justify-center rounded-[22px] border border-[hsl(2_70%_88%)] bg-[hsl(2_70%_97%)] px-6 text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(2_70%_91%)] text-[hsl(var(--destructive))]">
          <AlertCircle size={21} />
        </div>
        <h3 className="pksim-display text-lg font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]">Couldn&apos;t complete lookup</h3>
        <p data-testid="text-error-message" className="mt-1.5 max-w-[300px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">{message}</p>
        {onRetry && (
          <button
            type="button"
            data-testid="button-retry"
            onClick={onRetry}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.3)]"
          >
            <RotateCcw size={15} />
            Try again
          </button>
        )}
      </div>
    );
  }
  if (state === 'empty') {
    return (
      <div data-testid="state-empty-result" className="flex min-h-[240px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.52)] px-6 text-center">
        <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(43_80%_87%)] text-[hsl(33_47%_31%)]">
          <Search size={19} />
        </div>
        <h3 className="pksim-display text-lg font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]">No record found</h3>
        <p className="mt-1.5 max-w-[360px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">Contact us on WhatsApp for the latest 2026 fresh SIM database records.</p>
        {whatsappLink && (
          <a href={whatsappLink} target="_blank" rel="noreferrer" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2.5 text-sm font-semibold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.3)]">
            Contact on WhatsApp
            <ArrowUpRight size={15} />
          </a>
        )}
      </div>
    );
  }
  return (
    <div data-testid="state-empty-initial" className="flex min-h-[240px] flex-col items-center justify-center rounded-[22px] border border-dashed border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.52)] px-6 text-center">
      <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
        <ShieldCheck size={20} />
      </div>
      <h3 className="pksim-display text-lg font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]">Awaiting input</h3>
      <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">Enter a Pakistani mobile number or 13-digit CNIC to begin.</p>
    </div>
  );
}

function Home() {
  const [phone, setPhone] = useState('');
  const [searchedPhone, setSearchedPhone] = useState('');
  const [payload, setPayload] = useState<unknown>(null);
  const [state, setState] = useState<LookupState>('idle');
  const [error, setError] = useState('');
  const [searchMode, setSearchMode] = useState<'number' | 'cnic'>('number');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('pksim-theme') === 'dark');
  const [whatsappLink, setWhatsappLink] = useState(() => getWhatsAppChannel());
  const [countdown, setCountdown] = useState(10);
  const pendingLookupRef = useRef<{ result: unknown; error: string | null; isDone: boolean }>({
    result: null,
    error: null,
    isDone: false,
  });

  const records = useMemo(() => recordsFromPayload(payload), [payload]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('pksim-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const handleUpdate = () => {
      setWhatsappLink(getWhatsAppChannel());
    };
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const performLookup = async (event?: FormEvent) => {
    event?.preventDefault();
    const query = phone.trim();
    if (!query) {
      setError(`Enter a ${searchMode === 'cnic' ? '13-digit CNIC' : 'phone number'} to search.`);
      setState('error');
      return;
    }
    if (searchMode === 'cnic' && !/^\d{13}$/.test(query)) {
      setError('CNIC must be exactly 13 digits without dashes.');
      setState('error');
      return;
    }

    // 1. User follows smart/direct link of Adsterra to another page
    try {
      window.open(ADSTERRA_DIRECT_LINK, '_blank', 'noopener,noreferrer');
    } catch (err) {
      console.error('Direct link opening failed:', err);
    }

    // 2. Start 10-second countdown state
    setState('countdown');
    setCountdown(10);
    setError('');
    setPayload(null);
    setSearchedPhone(query);
    pendingLookupRef.current = { result: null, error: null, isDone: false };

    // Parallel background database lookup
    (async () => {
      try {
        const request = async (base: string, parameter: string) => {
          const response = await fetch(`${base}?${parameter}=${encodeURIComponent(query)}`, {
            method: 'GET',
            headers: { Accept: 'application/json' },
          });
          if (!response.ok) throw new Error(`Request returned ${response.status}.`);
          return response.json() as Promise<unknown>;
        };

        let result: unknown = null;
        try {
          result = await request(ENDPOINT, 'search');
        } catch {
          result = null;
        }
        if (!hasSuccessfulRecords(result)) {
          try {
            result = await request(BACKUP_ENDPOINT, 'number');
          } catch {
            if (!result) throw new Error('Both database lookup services are unavailable.');
          }
        }
        pendingLookupRef.current = { result, error: null, isDone: true };
      } catch (lookupError) {
        pendingLookupRef.current = {
          result: null,
          error: lookupError instanceof Error && lookupError.message.includes('Request returned')
            ? lookupError.message
            : 'Check your internet connection and try again.',
          isDone: true,
        };
      }
    })();
  };

  // Countdown ticks only when tab is visible so when user comes back from the ad tab,
  // they see the 10 sec countdown
  useEffect(() => {
    if (state !== 'countdown') return;

    const timer = setInterval(() => {
      if (!document.hidden) {
        setCountdown((current) => {
          if (current <= 1) {
            clearInterval(timer);
            return 0;
          }
          return current - 1;
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [state]);

  // When countdown completes, finalize and display results
  useEffect(() => {
    if (state !== 'countdown' || countdown > 0) return;

    const finalize = () => {
      const { result, error: lookupErr } = pendingLookupRef.current;
      if (lookupErr) {
        setState('error');
        setError(lookupErr);
        void logSearchAnalytics({
          query: searchedPhone,
          searchMode,
          status: 'error',
          recordsCount: 0,
        });
      } else {
        const nextRecords = recordsFromPayload(result);
        setPayload(result);
        const isSuccess = nextRecords.length > 0;
        setState(isSuccess ? 'success' : 'empty');
        void logSearchAnalytics({
          query: searchedPhone,
          searchMode,
          status: isSuccess ? 'found' : 'no_record',
          recordsCount: nextRecords.length,
        });
      }
    };

    if (pendingLookupRef.current.isDone) {
      finalize();
    } else {
      const waitInterval = setInterval(() => {
        if (pendingLookupRef.current.isDone) {
          clearInterval(waitInterval);
          finalize();
        }
      }, 200);
      return () => clearInterval(waitInterval);
    }
  }, [countdown, state, searchedPhone, searchMode]);

  const resetLookup = () => {
    setPhone('');
    setSearchedPhone('');
    setPayload(null);
    setError('');
    setCountdown(10);
    setState('idle');
  };

  const changeSearchMode = (mode: 'number' | 'cnic') => {
    setSearchMode(mode);
    setPhone('');
    setError('');
    setCountdown(10);
    setState('idle');
    setPayload(null);
    setSearchedPhone('');
  };

  let results: ReactNode;
  if (state === 'countdown' || state === 'loading') {
    results = (
      <CountdownAdScreen
        countdown={countdown}
        query={searchedPhone || phone}
        searchMode={searchMode}
      />
    );
  } else if (state === 'success') {
    results = (
      <div data-testid="results-list" className="space-y-4">
        {/* Direct Adsterra 300x250 Banner above results */}
        <AdsterraBanner />

        {records.map((record, index) => (
          <RecordCard key={`${index}-${Object.keys(record).join('-')}`} record={record} index={index} />
        ))}
      </div>
    );
  } else {
    results = <EmptyDesk state={state} message={error} onRetry={state === 'error' ? () => void performLookup() : undefined} whatsappLink={whatsappLink} />;
  }

  return (
    <main className="pksim-shell">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[980px] flex-col justify-between px-4 sm:px-8">
        <div>
          {/* Header */}
          <header className="pksim-fade-in flex h-[64px] sm:h-[74px] items-center justify-between border-b border-[hsl(var(--border))]">
            <Link href="/" onClick={resetLookup} className="group flex items-center gap-2.5 sm:gap-3 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.3)]">
              <LinkShareLogo size={34} className="sm:hidden" />
              <LinkShareLogo size={38} className="hidden sm:block" />
              <div>
                <span className="pksim-display text-[18px] sm:text-[19px] font-bold tracking-[-0.05em] text-[hsl(var(--primary))]">
                  PKSIM
                </span>
                <span className="ml-2 hidden sm:inline-block rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--secondary-foreground))]">
                  by LinkShare
                </span>
              </div>
            </Link>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                data-testid="button-theme-toggle"
                onClick={() => setDarkMode((current) => !current)}
                aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="rounded-xl p-2 sm:px-3 sm:py-2 text-base sm:text-lg text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.25)]"
              >
                {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              </button>

              {state !== 'idle' && (
                <button
                  type="button"
                  data-testid="button-search-again"
                  onClick={resetLookup}
                  className="inline-flex items-center gap-1.5 rounded-xl px-2.5 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.25)]"
                >
                  <RotateCcw size={14} />
                  <span className="hidden sm:inline">Search again</span>
                </button>
              )}
            </div>
          </header>

          {/* Main Hero / Search Area */}
          <div className="flex flex-col items-center py-6 sm:py-14">
            <section className="pksim-rise-in pksim-delay-1 w-full max-w-[610px] text-center">
              <div className="mb-3 sm:mb-5 inline-flex items-center gap-1.5 sm:gap-2 rounded-full border border-[hsl(145_54%_84%)] bg-[hsl(145_60%_97%)] px-3 py-1 sm:px-3.5 sm:py-1.5 text-[11px] sm:text-xs font-semibold text-[hsl(var(--primary))]">
                <span className="pksim-blink h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
                Live SIM & CNIC Data 2026
              </div>

              {/* Requirement #4: Heading "SIM data, LinkShare" */}
              <h1 data-testid="text-page-title" className="pksim-display text-[clamp(1.9rem,6.5vw,3.8rem)] font-semibold leading-[1.04] tracking-[-0.06em] text-[hsl(var(--foreground))]">
                SIM data, <span className="text-[hsl(var(--primary))]">LinkShare</span>
              </h1>

              <p className="mx-auto mt-2 sm:mt-4 max-w-[460px] text-xs sm:text-[15px] leading-5 sm:leading-7 text-[hsl(var(--muted-foreground))]">
                Enter any Pakistani phone number or CNIC to lookup live records instantly.
              </p>

              {/* Responsive Tabs */}
              <div className="mx-auto mt-4 sm:mt-7 flex w-full max-w-[310px] sm:w-fit rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1 shadow-sm">
                <button
                  type="button"
                  data-testid="tab-search-number"
                  onClick={() => changeSearchMode('number')}
                  className={`flex-1 sm:flex-initial rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap text-center ${
                    searchMode === 'number'
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]'
                  }`}
                >
                  Search by Number
                </button>
                <button
                  type="button"
                  data-testid="tab-search-cnic"
                  onClick={() => changeSearchMode('cnic')}
                  className={`flex-1 sm:flex-initial rounded-lg px-2.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap text-center ${
                    searchMode === 'cnic'
                      ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                      : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]'
                  }`}
                >
                  Search by CNIC
                </button>
              </div>

              {/* Responsive Compact Search Form */}
              <form onSubmit={performLookup} className="mx-auto mt-2.5 sm:mt-3 max-w-[610px] rounded-[18px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5 sm:p-2 shadow-[0_14px_34px_hsl(157_35%_19%_/_0.07)]">
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <div className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                    <Search size={16} className="sm:hidden" strokeWidth={2.2} />
                    <Search size={19} className="hidden sm:block" strokeWidth={2.2} />
                  </div>
                  <input
                    id="phone-number"
                    type="tel"
                    inputMode="tel"
                    autoComplete="tel"
                    data-testid="input-phone-number"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    placeholder={searchMode === 'number' ? 'Enter number e.g. 03001234567' : 'Enter 13-digit CNIC'}
                    className="min-w-0 flex-1 bg-transparent px-1.5 sm:px-2 text-xs sm:text-[15px] text-left font-medium tracking-[0.01em] text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)_/_0.6)] placeholder:text-xs sm:placeholder:text-[14px]"
                    aria-label="Phone number or CNIC"
                  />
                  <button
                    type="submit"
                    data-testid="button-submit-lookup"
                    disabled={state === 'loading' || state === 'countdown'}
                    className="flex h-10 sm:h-12 shrink-0 items-center gap-1 sm:gap-2 rounded-xl bg-[hsl(var(--primary))] px-3.5 sm:px-5 text-xs sm:text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5 hover:bg-[hsl(157_66%_19%)] disabled:cursor-wait disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.3)]"
                  >
                    <span>{state === 'loading' || state === 'countdown' ? 'Searching' : 'Search'}</span>
                    <ArrowUpRight size={14} className="sm:hidden" />
                    <ArrowUpRight size={17} className="hidden sm:block" />
                  </button>
                </div>
                {state === 'error' && error && (
                  <p data-testid="text-inline-error" className="mt-2 flex items-center gap-1.5 px-2 text-left text-xs sm:text-sm font-medium text-[hsl(var(--destructive))]">
                    <AlertCircle size={14} /> {error}
                  </p>
                )}
              </form>
            </section>

            {/* Results / Scanner Container */}
            <section className="pksim-rise-in pksim-delay-2 mt-8 w-full max-w-[760px] min-w-0" aria-live="polite">
              {(state !== 'idle' || searchedPhone) && (
                <div className="mb-3 flex items-center justify-between px-1">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.17em] text-[hsl(var(--muted-foreground))]">Result</p>
                    {searchedPhone && <p data-testid="text-searched-phone" className="mt-1 text-sm font-medium text-[hsl(var(--foreground))]">{searchedPhone}</p>}
                  </div>
                  <StateBadge state={state} count={records.length} countdown={countdown} />
                </div>
              )}
              {state === 'empty' && <EmptyDesk state={state} message={error} whatsappLink={whatsappLink} />}
              {state !== 'empty' && results}
            </section>
          </div>
        </div>

        {/* Bottom Section: Follow Us Container, Footer Ad, Disclaimer, and Footer */}
        <div className="pb-8">
          {/* Requirement #1: Follow Us / Join WhatsApp Community Section above footer */}
          <FollowSection />

          {/* Requirement #5: Note above footer */}
          <div className="mt-6 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)_/_0.7)] p-4 text-xs leading-5 text-[hsl(var(--muted-foreground))]">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
              <div>
                <p className="font-bold text-[hsl(var(--foreground))]">Public Database & Legal Notice:</p>
                <p className="mt-0.5">
                  This SIM database information is publicly available across open internet directories. We are not hosting or storing any kind of private or personal data on our servers. For any legal concerns, copyright inquiries, or removal requests, please contact the respective third-party provider or hosting sources.
                </p>
              </div>
            </div>
          </div>

          {/* Requirement #6: Footer with PKSIM - Powered by LinkShare link */}
          <footer className="mt-6 flex flex-col items-center justify-between gap-3 border-t border-[hsl(var(--border))] pt-6 text-xs text-[hsl(var(--muted-foreground))] sm:flex-row">
            <p>
              PKSIM — Powered by{' '}
              <a
                href="https://linksshare.online/"
                target="_blank"
                rel="noreferrer"
                className="font-bold text-[hsl(var(--primary))] underline hover:opacity-80"
              >
                LinkShare
              </a>
            </p>

            <div className="flex items-center gap-4">
              <Link href="/" className="hover:text-[hsl(var(--foreground))]">
                Home
              </Link>
              <a
                href="https://linksshare.online/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-[hsl(var(--primary))]"
              >
                <span>linksshare.online</span>
                <ExternalLink size={11} />
              </a>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}

function App() {
  useEffect(() => {
    initFirebaseAnalyticsScript();
  }, []);

  return (
    <>
      <GlobalAdScripts />
      <FollowUsPopup />
      <ShareFloatingButton />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/admin" component={AdminPanel} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

export default App;