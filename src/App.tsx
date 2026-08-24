import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import {
  AlertCircle,
  ArrowUpRight,
  Check,
  Copy,
  RotateCcw,
  Search,
  ShieldCheck,
  Moon,
  Sun,
} from 'lucide-react';

type LookupState = 'idle' | 'loading' | 'success' | 'empty' | 'error';
type JsonRecord = Record<string, unknown>;

const ENDPOINT = 'https://sim-db-api.faizankhichi.me/';
const BACKUP_ENDPOINT = 'https://sim-data.ftgmhacks.workers.dev/';
const CHANNEL_STORAGE_KEY = 'pksim-whatsapp-channel';
const ADMIN_USERNAME = 'hworldplayz';
const ADMIN_PASSWORD = 'hworldplayz512';

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

function LogoMark() {
  return (
    <div className="relative flex h-10 w-10 items-center justify-center rounded-[13px] bg-[hsl(var(--primary))] shadow-[0_8px_18px_hsl(157_66%_24%_/_0.2)]" aria-hidden="true">
      <div className="absolute h-5 w-5 rounded-full border-[2.5px] border-[hsl(var(--accent))]" />
      <div className="absolute h-4 w-4 translate-x-[5px] rounded-full bg-[hsl(var(--primary))]" />
      <div className="absolute bottom-[9px] left-[11px] h-[3px] w-[3px] rounded-full bg-[hsl(var(--accent))]" />
    </div>
  );
}

function StateBadge({ state, count }: { state: LookupState; count?: number }) {
  if (state === 'loading') {
    return (
      <span className="inline-flex items-center gap-2 rounded-full bg-[hsl(var(--secondary))] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--secondary-foreground))]">
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[hsl(var(--accent))]" />
        Searching
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
        <p className="mt-1.5 max-w-[360px] text-sm leading-6 text-[hsl(var(--muted-foreground))]">Contact us on WhatsApp for the latest 2026 records.</p>
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
      <h3 className="pksim-display text-lg font-semibold tracking-[-0.02em] text-[hsl(var(--foreground))]">Awaiting a number</h3>
      <p className="mt-1.5 text-sm text-[hsl(var(--muted-foreground))]">Enter a Pakistani mobile number to begin.</p>
    </div>
  );
}

function LoadingDesk() {
  return (
    <div data-testid="state-loading" className="space-y-3">
      <div className="rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6">
        <div className="pksim-skeleton mb-3 h-3 w-16 rounded-full" />
        <div className="pksim-skeleton mb-7 h-6 w-40 rounded-lg" />
        <div className="grid grid-cols-2 gap-5">
          <div><div className="pksim-skeleton mb-2 h-2.5 w-20 rounded-full" /><div className="pksim-skeleton h-4 w-28 rounded" /></div>
          <div><div className="pksim-skeleton mb-2 h-2.5 w-20 rounded-full" /><div className="pksim-skeleton h-4 w-32 rounded" /></div>
        </div>
      </div>
      <div className="pksim-skeleton h-20 rounded-[22px]" />
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
  const [whatsappLink, setWhatsappLink] = useState(() => localStorage.getItem(CHANNEL_STORAGE_KEY) ?? '');
  const records = useMemo(() => recordsFromPayload(payload), [payload]);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('pksim-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  const performLookup = async (event?: FormEvent) => {
    event?.preventDefault();
    const query = phone.trim();
    if (!query) {
      setError(`Enter a ${searchMode === 'cnic' ? '13-digit CNIC' : 'phone number'} to search.`);
      setState('error');
      return;
    }
    if (searchMode === 'cnic' && !/^\d{13}$/.test(query)) {
      setError('CNIC must be exactly 13 digits.');
      setState('error');
      return;
    }
    setState('loading');
    setError('');
    setPayload(null);
    setSearchedPhone(query);
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
          if (!result) throw new Error('Both lookup services are unavailable.');
        }
      }
      const nextRecords = recordsFromPayload(result);
      setPayload(result);
      setState(nextRecords.length > 0 ? 'success' : 'empty');
    } catch (lookupError) {
      setState('error');
      setError(lookupError instanceof Error && lookupError.message.includes('Request returned')
        ? lookupError.message
        : 'Check your connection and try again.');
    }
  };

  const resetLookup = () => {
    setPhone('');
    setSearchedPhone('');
    setPayload(null);
    setError('');
    setState('idle');
  };

  const changeSearchMode = (mode: 'number' | 'cnic') => {
    setSearchMode(mode);
    setPhone('');
    setError('');
    setState('idle');
    setPayload(null);
    setSearchedPhone('');
  };

  let results: ReactNode;
  if (state === 'loading') {
    results = <LoadingDesk />;
  } else if (state === 'success') {
    results = (
      <div data-testid="results-list" className="space-y-3">
        {records.map((record, index) => <RecordCard key={`${index}-${Object.keys(record).join('-')}`} record={record} index={index} />)}
      </div>
    );
  } else {
    results = <EmptyDesk state={state} message={error} onRetry={state === 'error' ? () => void performLookup() : undefined} whatsappLink={whatsappLink} />;
  }

  return (
    <main className="pksim-shell">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[980px] flex-col px-5 sm:px-8">
        <header className="pksim-fade-in flex h-[74px] items-center justify-between border-b border-[hsl(var(--border))]">
          <button type="button" data-testid="button-reset-logo" onClick={resetLookup} className="group flex items-center gap-3 rounded-xl text-left focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.3)]">
            <LogoMark />
            <span className="pksim-display text-[19px] font-bold tracking-[-0.05em] text-[hsl(var(--primary))]">PKSIM</span>
          </button>
          <div className="flex items-center gap-1">
            <button type="button" data-testid="button-theme-toggle" onClick={() => setDarkMode((current) => !current)} aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'} className="rounded-xl px-3 py-2 text-lg text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.25)]">
              {darkMode ? <Sun size={17} /> : <Moon size={17} />}
            </button>
            {state !== 'idle' && (
              <button type="button" data-testid="button-search-again" onClick={resetLookup} className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--primary))] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.25)]">
                <RotateCcw size={15} />
                <span className="hidden sm:inline">Search again</span>
              </button>
            )}
          </div>
        </header>

        <div className="flex flex-1 flex-col items-center py-14 sm:py-20">
          <section className="pksim-rise-in pksim-delay-1 w-full max-w-[610px] text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[hsl(145_54%_84%)] bg-[hsl(145_60%_97%)] px-3 py-1.5 text-xs font-semibold text-[hsl(var(--primary))]">
              <span className="pksim-blink h-1.5 w-1.5 rounded-full bg-[hsl(var(--primary))]" />
              SIM data 2026
            </div>
            <h1 data-testid="text-page-title" className="pksim-display text-[clamp(2.7rem,7vw,4.5rem)] font-semibold leading-[0.98] tracking-[-0.075em] text-[hsl(var(--foreground))]">
              SIM data, <span className="text-[hsl(var(--primary))]">simply.</span>
            </h1>
            <p className="mx-auto mt-5 max-w-[470px] text-[15px] leading-7 text-[hsl(var(--muted-foreground))]">
              Enter a number to view its record.
            </p>
            <div className="mx-auto mt-8 flex w-fit rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1">
              <button type="button" data-testid="tab-search-number" onClick={() => changeSearchMode('number')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${searchMode === 'number' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]'}`}>Search by number</button>
              <button type="button" data-testid="tab-search-cnic" onClick={() => changeSearchMode('cnic')} className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${searchMode === 'cnic' ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]' : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))]'}`}>Search by CNIC</button>
            </div>
            <form onSubmit={performLookup} className="mx-auto mt-3 max-w-[610px] rounded-[18px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-2 shadow-[0_14px_34px_hsl(157_35%_19%_/_0.07)]">
              <div className="flex items-center gap-2">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                  <Search size={19} strokeWidth={2.2} />
                </div>
                <input
                  id="phone-number"
                  type="tel"
                  inputMode="tel"
                  autoComplete="tel"
                  data-testid="input-phone-number"
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                  placeholder={searchMode === 'number' ? 'Enter any number e.g. 03001234567' : 'Enter 13-digit CNIC'}
                  className="min-w-0 flex-1 bg-transparent px-2 text-[15px] text-left font-medium tracking-[0.01em] text-[hsl(var(--foreground))] outline-none placeholder:text-[hsl(var(--muted-foreground)_/_0.65)]"
                  aria-label="Phone number"
                />
                <button type="submit" data-testid="button-submit-lookup" disabled={state === 'loading'} className="flex h-12 shrink-0 items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5 hover:bg-[hsl(157_66%_19%)] disabled:cursor-wait disabled:opacity-70 focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.3)]">
                  {state === 'loading' ? 'Searching' : 'Search'}
                  <ArrowUpRight size={17} />
                </button>
              </div>
              {state === 'error' && error && (
                <p data-testid="text-inline-error" className="mt-2 flex items-center gap-1.5 px-2 text-left text-sm font-medium text-[hsl(var(--destructive))]">
                  <AlertCircle size={15} /> {error}
                </p>
              )}
            </form>
          </section>

          <section className="pksim-rise-in pksim-delay-2 mt-12 w-full max-w-[760px] min-w-0" aria-live="polite">
            {(state !== 'idle' || searchedPhone) && (
              <div className="mb-3 flex items-center justify-between px-1">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.17em] text-[hsl(var(--muted-foreground))]">Result</p>
                  {searchedPhone && <p data-testid="text-searched-phone" className="mt-1 text-sm font-medium text-[hsl(var(--foreground))]">{searchedPhone}</p>}
                </div>
                <StateBadge state={state} count={records.length} />
              </div>
            )}
            {state === 'empty' && <EmptyDesk state={state} message={error} whatsappLink={whatsappLink} />}
            {state !== 'empty' && results}
          </section>
        </div>
      </div>
    </main>
  );
}

function AdminPanel() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loggedIn, setLoggedIn] = useState(false);
  const [channelLink, setChannelLink] = useState(() => localStorage.getItem(CHANNEL_STORAGE_KEY) ?? '');
  const [saved, setSaved] = useState(false);
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const login = (event: FormEvent) => {
    event.preventDefault();
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      setLoggedIn(true);
      setLoginError('');
    } else {
      setLoginError('Invalid username or password.');
    }
  };

  const saveSettings = (event: FormEvent) => {
    event.preventDefault();
    localStorage.setItem(CHANNEL_STORAGE_KEY, channelLink.trim());
    setChannelLink(channelLink.trim());
    setSaved(true);
    window.setTimeout(() => setSaved(false), 1800);
  };

  return (
    <main className="min-h-[100dvh] bg-white text-[hsl(var(--foreground))]">
      <div className="mx-auto flex min-h-[100dvh] w-full max-w-[760px] flex-col px-5 sm:px-8">
        <header className="flex h-[74px] items-center border-b border-[hsl(var(--border))]">
          <a href="/" className="flex items-center gap-3">
            <LogoMark />
            <span className="pksim-display text-[19px] font-bold tracking-[-0.05em] text-[hsl(var(--primary))]">PKSIM</span>
          </a>
        </header>
        <div className="flex flex-1 items-center justify-center py-12">
          {!loggedIn ? (
            <form onSubmit={login} className="w-full max-w-[390px] rounded-[22px] border border-[hsl(var(--border))] bg-white p-7 shadow-[0_14px_34px_hsl(157_35%_19%_/_0.07)]">
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-[hsl(var(--muted-foreground))]">Admin</p>
              <h1 className="pksim-display mt-3 text-3xl font-semibold tracking-[-0.05em]">Sign in</h1>
              <div className="mt-7 space-y-4">
                <label className="block text-sm font-semibold">
                  Username
                  <input value={username} onChange={(event) => setUsername(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[hsl(var(--border))] px-3 outline-none focus:border-[hsl(var(--primary))]" autoComplete="username" />
                </label>
                <label className="block text-sm font-semibold">
                  Password
                  <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-11 w-full rounded-xl border border-[hsl(var(--border))] px-3 outline-none focus:border-[hsl(var(--primary))]" autoComplete="current-password" />
                </label>
              </div>
              {loginError && <p className="mt-3 text-sm font-medium text-[hsl(var(--destructive))]">{loginError}</p>}
              <button type="submit" className="mt-6 h-11 w-full rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-white transition-transform hover:-translate-y-0.5">Sign in</button>
            </form>
          ) : (
            <form onSubmit={saveSettings} className="w-full max-w-[520px] rounded-[22px] border border-[hsl(var(--border))] bg-white p-7 shadow-[0_14px_34px_hsl(157_35%_19%_/_0.07)]">
              <p className="text-xs font-bold uppercase tracking-[0.17em] text-[hsl(var(--muted-foreground))]">Settings</p>
              <h1 className="pksim-display mt-3 text-3xl font-semibold tracking-[-0.05em]">WhatsApp channel</h1>
              <p className="mt-2 text-sm leading-6 text-[hsl(var(--muted-foreground))]">Add the channel link shown when a lookup has no result.</p>
              <label className="mt-7 block text-sm font-semibold">
                Channel link
                <input type="url" value={channelLink} onChange={(event) => setChannelLink(event.target.value)} placeholder="https://chat.whatsapp.com/..." className="mt-2 h-11 w-full rounded-xl border border-[hsl(var(--border))] px-3 outline-none focus:border-[hsl(var(--primary))]" />
              </label>
              <button type="submit" className="mt-6 h-11 rounded-xl bg-[hsl(var(--primary))] px-5 text-sm font-bold text-white transition-transform hover:-translate-y-0.5">{saved ? 'Saved' : 'Save settings'}</button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}

function App() {
  return window.location.pathname.replace(/\/+$/, '') === '/admin' ? <AdminPanel /> : <Home />;
}

export default App;