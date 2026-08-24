import { useState, useEffect, useMemo, type FormEvent } from 'react';
import { Link } from 'wouter';
import {
  Activity,
  AlertCircle,
  ArrowLeft,
  BarChart3,
  Check,
  Clock,
  Code2,
  Copy,
  Download,
  ExternalLink,
  Eye,
  Layers,
  Lock,
  LogOut,
  MapPin,
  MessageSquare,
  Monitor,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Smartphone,
  Tablet,
  Trash2,
  Tv,
  User,
  Users,
  Zap,
} from 'lucide-react';
import LinkShareLogo from '@/components/LinkShareLogo';
import {
  AD_TEMPLATES,
  getAdsConfig,
  resetAdsConfig,
  saveAdsConfig,
  type AdsConfig,
  type AdSlotConfig,
} from '@/config/ads';
import {
  getWhatsAppChannel,
  saveWhatsAppChannel,
} from '@/config/settings';
import {
  clearAllSearchLogs,
  deleteSearchLog,
  fetchSearchLogs,
  getLocalSearchLogs,
  ANALYTICS_UPDATED_EVENT,
  type SearchLogEntry,
} from '@/config/firebase';

const ADMIN_USERNAME = 'hworldplayz';
const ADMIN_PASSWORD = 'hworldplayz512';
const AUTH_KEY = 'pksim_admin_auth';

export function AdminPanel() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem(AUTH_KEY) === 'true';
  });

  // Login form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin tabs: 'analytics' | 'ads' | 'whatsapp' | 'preview'
  const [activeTab, setActiveTab] = useState<'analytics' | 'ads' | 'whatsapp' | 'preview'>('analytics');

  // Ads state
  const [adsConfig, setAdsConfig] = useState<AdsConfig>(() => getAdsConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewSlot, setPreviewSlot] = useState<string | null>(null);

  // WhatsApp state
  const [whatsappLink, setWhatsappLink] = useState(() => getWhatsAppChannel());
  const [whatsappSaved, setWhatsappSaved] = useState(false);

  // Analytics state
  const [logs, setLogs] = useState<SearchLogEntry[]>(() => getLocalSearchLogs());
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [logSearchQuery, setLogSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'found' | 'no_record' | 'error'>('all');
  const [deviceFilter, setDeviceFilter] = useState<'all' | 'Mobile' | 'Desktop' | 'Tablet'>('all');
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  const loadLogs = async () => {
    setLoadingLogs(true);
    try {
      const data = await fetchSearchLogs();
      setLogs(data);
    } catch (err) {
      console.warn('Failed to load logs:', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      setAdsConfig(getAdsConfig());
      setWhatsappLink(getWhatsAppChannel());
      loadLogs();

      const handleAnalyticsUpdate = () => {
        setLogs(getLocalSearchLogs());
      };

      window.addEventListener(ANALYTICS_UPDATED_EVENT, handleAnalyticsUpdate);
      return () => {
        window.removeEventListener(ANALYTICS_UPDATED_EVENT, handleAnalyticsUpdate);
      };
    }
  }, [isAuthenticated]);

  const handleLogin = (e: FormEvent) => {
    e.preventDefault();
    if (username.trim() === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      sessionStorage.setItem(AUTH_KEY, 'true');
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('Invalid administrator username or password.');
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem(AUTH_KEY);
    setIsAuthenticated(false);
    setUsername('');
    setPassword('');
  };

  const updateSlotField = (slotKey: keyof AdsConfig, field: keyof AdSlotConfig, value: unknown) => {
    setAdsConfig((prev) => ({
      ...prev,
      [slotKey]: {
        ...prev[slotKey],
        [field]: value,
      },
    }));
  };

  const handleSaveAds = () => {
    saveAdsConfig(adsConfig);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 2500);
  };

  const handleResetAds = () => {
    if (window.confirm('Are you sure you want to reset all ad slots to default?')) {
      const reset = resetAdsConfig();
      setAdsConfig(reset);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
    }
  };

  const handleSaveWhatsapp = (e: FormEvent) => {
    e.preventDefault();
    saveWhatsAppChannel(whatsappLink);
    setWhatsappSaved(true);
    setTimeout(() => setWhatsappSaved(false), 2500);
  };

  const insertTemplate = (slotKey: keyof AdsConfig, templateCode: string) => {
    updateSlotField(slotKey, 'code', templateCode);
    updateSlotField(slotKey, 'enabled', true);
  };

  const copyConfigAsJson = async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(adsConfig, null, 2));
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      setCopiedCode(false);
    }
  };

  const copyText = async (text: string, identifier: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedItem(identifier);
      setTimeout(() => setCopiedItem(null), 1800);
    } catch {}
  };

  const handleDeleteLog = async (id: string) => {
    setLogs((prev) => prev.filter((l) => l.id !== id));
    await deleteSearchLog(id);
  };

  const handleClearAllLogs = async () => {
    if (window.confirm('Are you sure you want to clear all recorded search logs?')) {
      await clearAllSearchLogs();
      setLogs([]);
    }
  };

  // Export Analytics to CSV
  const exportLogsToCsv = () => {
    if (logs.length === 0) {
      alert('No logs to export.');
      return;
    }

    const headers = ['ID', 'Date & Time', 'Query', 'Search Mode', 'Status', 'Records Found', 'IP Address', 'City', 'Region', 'Country', 'ISP', 'Device', 'OS', 'Browser'];
    const rows = logs.map((l) => [
      l.id,
      new Date(l.createdAt).toLocaleString(),
      `"${l.query}"`,
      l.searchMode,
      l.status,
      l.recordsCount,
      l.ip,
      `"${l.city}"`,
      `"${l.region}"`,
      `"${l.country}"`,
      `"${l.isp || ''}"`,
      l.deviceType,
      l.os,
      l.browser,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `pksim_search_analytics_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Analytics Metrics
  const filteredLogs = useMemo(() => {
    return logs.filter((l) => {
      const matchesSearch =
        !logSearchQuery ||
        l.query.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        l.ip.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        l.city.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        l.browser.toLowerCase().includes(logSearchQuery.toLowerCase()) ||
        l.os.toLowerCase().includes(logSearchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || l.status === statusFilter;
      const matchesDevice = deviceFilter === 'all' || l.deviceType === deviceFilter;

      return matchesSearch && matchesStatus && matchesDevice;
    });
  }, [logs, logSearchQuery, statusFilter, deviceFilter]);

  const totalSearches = logs.length;
  const uniqueIps = useMemo(() => new Set(logs.map((l) => l.ip)).size, [logs]);
  const foundSearches = useMemo(() => logs.filter((l) => l.status === 'found').length, [logs]);
  const successRate = totalSearches > 0 ? Math.round((foundSearches / totalSearches) * 100) : 0;
  const mobileCount = useMemo(() => logs.filter((l) => l.deviceType === 'Mobile').length, [logs]);
  const mobileShare = totalSearches > 0 ? Math.round((mobileCount / totalSearches) * 100) : 0;

  const topCities = useMemo(() => {
    const counts: Record<string, number> = {};
    logs.forEach((l) => {
      const city = l.city && l.city !== 'Unknown City' ? l.city : 'Pakistan';
      counts[city] = (counts[city] || 0) + 1;
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4);
  }, [logs]);

  // If not logged in, render Login screen
  if (!isAuthenticated) {
    return (
      <main className="pksim-shell min-h-[100dvh] flex flex-col justify-between bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
        <header className="mx-auto flex h-[74px] w-full max-w-[980px] items-center justify-between border-b border-[hsl(var(--border))] px-5 sm:px-8">
          <Link href="/" className="flex items-center gap-3">
            <LinkShareLogo size={38} />
            <span className="pksim-display text-[19px] font-bold tracking-[-0.05em] text-[hsl(var(--primary))]">
              PKSIM
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3.5 py-2 text-xs font-semibold text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
          >
            <ArrowLeft size={14} />
            <span>Back to Home</span>
          </Link>
        </header>

        <div className="flex flex-1 items-center justify-center px-5 py-12">
          <form
            onSubmit={handleLogin}
            className="pksim-rise-in w-full max-w-[420px] rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-8 shadow-[0_16px_40px_hsl(157_35%_19%_/_0.08)]"
          >
            <div className="mb-6 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                  <Lock size={20} />
                </div>
                <div>
                  <h1 className="pksim-display text-2xl font-bold tracking-[-0.03em] text-[hsl(var(--foreground))]">
                    Admin Portal
                  </h1>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    PKSIM Management, Analytics & Ads Control
                  </p>
                </div>
              </div>
              <span className="rounded-full bg-[hsl(145_50%_92%)] px-2.5 py-1 text-[11px] font-bold text-[hsl(var(--primary))]">
                Secure
              </span>
            </div>

            {loginError && (
              <div className="mb-5 flex items-center gap-2 rounded-xl border border-[hsl(2_70%_88%)] bg-[hsl(2_70%_97%)] p-3 text-xs font-medium text-[hsl(var(--destructive))]">
                <AlertCircle size={16} className="shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Username
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter admin username"
                    autoComplete="username"
                    required
                    className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3.5 text-sm font-medium text-[hsl(var(--foreground))] outline-none transition-colors focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.2)]"
                  />
                  <User size={16} className="absolute right-3.5 text-[hsl(var(--muted-foreground))]" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  Password
                </label>
                <div className="relative mt-1.5 flex items-center">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    autoComplete="current-password"
                    required
                    className="h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3.5 text-sm font-medium text-[hsl(var(--foreground))] outline-none transition-colors focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.2)]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-md transition-transform hover:-translate-y-0.5 hover:bg-[hsl(157_66%_19%)] focus:outline-none focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.3)]"
            >
              <ShieldCheck size={16} />
              Sign in to Dashboard
            </button>
          </form>
        </div>

        <footer className="mx-auto flex h-[60px] w-full max-w-[980px] items-center justify-center border-t border-[hsl(var(--border))] px-5 text-xs text-[hsl(var(--muted-foreground))]">
          PKSIM &copy; {new Date().getFullYear()} — Powered by LinkShare
        </footer>
      </main>
    );
  }

  // Admin Dashboard
  const adSlotsList = Object.keys(adsConfig) as Array<keyof AdsConfig>;
  const activeAdsCount = adSlotsList.filter((k) => adsConfig[k].enabled && adsConfig[k].code.trim()).length;

  return (
    <main className="min-h-[100dvh] bg-[hsl(var(--background))] text-[hsl(var(--foreground))]">
      {/* Admin Topbar */}
      <header className="sticky top-0 z-30 border-b border-[hsl(var(--border))] bg-[hsl(var(--card)_/_0.95)] backdrop-blur-md">
        <div className="mx-auto flex h-[70px] w-full max-w-[1200px] items-center justify-between px-4 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <LinkShareLogo size={36} />
              <div>
                <span className="pksim-display text-lg font-bold tracking-[-0.04em] text-[hsl(var(--primary))]">
                  PKSIM Admin
                </span>
                <span className="hidden sm:inline-block ml-2 rounded-md bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--secondary-foreground))]">
                  Firebase Connected
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
            >
              <ExternalLink size={13} />
              <span>View Site</span>
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(2_70%_88%)] bg-[hsl(2_70%_97%)] px-3 py-2 text-xs font-semibold text-[hsl(var(--destructive))] transition-colors hover:bg-[hsl(2_70%_92%)]"
            >
              <LogOut size={13} />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto w-full max-w-[1200px] px-4 py-6 sm:px-8">
        {/* Navigation Tabs & Actions */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-1.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5">
            {/* Tab 1: Analytics */}
            <button
              type="button"
              onClick={() => setActiveTab('analytics')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'analytics'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              <BarChart3 size={15} />
              <span>Users & Analytics</span>
              <span className="ml-1 rounded-full bg-black/20 px-1.5 py-0.5 text-[10px]">
                {totalSearches}
              </span>
            </button>

            {/* Tab 2: Ads Management */}
            <button
              type="button"
              onClick={() => setActiveTab('ads')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'ads'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              <Tv size={15} />
              <span>Ads Management</span>
              <span className="ml-1 rounded-full bg-black/20 px-1.5 py-0.5 text-[10px]">
                {activeAdsCount} Active
              </span>
            </button>

            {/* Tab 3: WhatsApp Channel */}
            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              <MessageSquare size={15} />
              <span>WhatsApp Channel</span>
            </button>

            {/* Tab 4: Placement Guide */}
            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-bold transition-all ${
                activeTab === 'preview'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              <Layers size={15} />
              <span>Placement Guide</span>
            </button>
          </div>

          {/* Quick Tab Actions */}
          {activeTab === 'analytics' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={exportLogsToCsv}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                title="Download CSV Analytics Report"
              >
                <Download size={13} />
                <span>Export CSV</span>
              </button>

              <button
                type="button"
                onClick={loadLogs}
                disabled={loadingLogs}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] shadow-sm transition-transform hover:-translate-y-0.5"
              >
                <RefreshCw size={13} className={loadingLogs ? 'animate-spin' : ''} />
                <span>{loadingLogs ? 'Syncing...' : 'Refresh'}</span>
              </button>

              <button
                type="button"
                onClick={handleClearAllLogs}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(2_70%_88%)] bg-[hsl(2_70%_97%)] px-3 py-2 text-xs font-semibold text-[hsl(var(--destructive))] hover:bg-[hsl(2_70%_92%)]"
                title="Clear all stored logs"
              >
                <Trash2 size={13} />
              </button>
            </div>
          )}

          {activeTab === 'ads' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={copyConfigAsJson}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
                title="Copy all ad slot settings as JSON"
              >
                {copiedCode ? <Check size={14} className="text-[hsl(var(--primary))]" /> : <Copy size={14} />}
                <span>{copiedCode ? 'Copied JSON' : 'Export JSON'}</span>
              </button>

              <button
                type="button"
                onClick={handleResetAds}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:border-[hsl(var(--destructive))] hover:text-[hsl(var(--destructive))]"
              >
                <RefreshCw size={13} />
                <span>Reset</span>
              </button>

              <button
                type="button"
                onClick={handleSaveAds}
                className="inline-flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-4 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] shadow-md transition-transform hover:-translate-y-0.5"
              >
                {saveSuccess ? <Check size={15} /> : <Save size={15} />}
                <span>{saveSuccess ? 'Changes Saved!' : 'Save All Ads'}</span>
              </button>
            </div>
          )}
        </div>

        {/* TAB 1: USERS & ANALYTICS */}
        {activeTab === 'analytics' && (
          <div className="space-y-6">
            {/* Metric KPI Cards */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Total Searches */}
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
                  <span className="text-xs font-bold uppercase tracking-wider">Total Lookups</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                    <Activity size={16} />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl">
                  {totalSearches}
                </p>
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">All recorded queries</span>
              </div>

              {/* Unique Visitors */}
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
                  <span className="text-xs font-bold uppercase tracking-wider">Unique IPs</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <Users size={16} />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl">
                  {uniqueIps}
                </p>
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">Distinct visitors</span>
              </div>

              {/* Mobile Share */}
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
                  <span className="text-xs font-bold uppercase tracking-wider">Mobile Users</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <Smartphone size={16} />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl">
                  {mobileShare}%
                </p>
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{mobileCount} mobile devices</span>
              </div>

              {/* Success Rate */}
              <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-5 shadow-sm">
                <div className="flex items-center justify-between text-[hsl(var(--muted-foreground))]">
                  <span className="text-xs font-bold uppercase tracking-wider">Found Rate</span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <ShieldCheck size={16} />
                  </div>
                </div>
                <p className="mt-2 text-2xl font-bold tracking-tight text-[hsl(var(--foreground))] sm:text-3xl">
                  {successRate}%
                </p>
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">{foundSearches} found records</span>
              </div>
            </div>

            {/* Top Locations summary */}
            {topCities.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)_/_0.6)] p-3 text-xs">
                <span className="font-bold text-[hsl(var(--muted-foreground))] flex items-center gap-1.5">
                  <MapPin size={14} className="text-[hsl(var(--primary))]" /> Top Locations:
                </span>
                {topCities.map(([city, count]) => (
                  <span
                    key={city}
                    className="inline-flex items-center gap-1 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-2.5 py-1 text-xs font-medium"
                  >
                    <span>🇵🇰 {city}</span>
                    <span className="rounded-full bg-[hsl(var(--secondary))] px-1.5 py-0.2 text-[10px] font-bold text-[hsl(var(--primary))]">
                      {count}
                    </span>
                  </span>
                ))}
              </div>
            )}

            {/* Search & Filter Bar */}
            <div className="flex flex-col gap-3 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3.5 sm:flex-row sm:items-center sm:justify-between">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
                <input
                  type="text"
                  value={logSearchQuery}
                  onChange={(e) => setLogSearchQuery(e.target.value)}
                  placeholder="Filter by phone, CNIC, IP, city, browser or OS..."
                  className="h-10 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent pl-9 pr-3 text-xs font-medium text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]"
                />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="h-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]"
                >
                  <option value="all">All Statuses</option>
                  <option value="found">✅ Records Found</option>
                  <option value="no_record">⚠️ No Record</option>
                  <option value="error">❌ Failed / Error</option>
                </select>

                <select
                  value={deviceFilter}
                  onChange={(e) => setDeviceFilter(e.target.value as any)}
                  className="h-10 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 text-xs font-semibold text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]"
                >
                  <option value="all">All Devices</option>
                  <option value="Mobile">📱 Mobile</option>
                  <option value="Desktop">💻 Desktop</option>
                  <option value="Tablet">📟 Tablet</option>
                </select>
              </div>
            </div>

            {/* Logs Table / Cards */}
            <div className="overflow-hidden rounded-[22px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-sm">
              <div className="flex items-center justify-between border-b border-[hsl(var(--border))] px-5 py-4">
                <div className="flex items-center gap-2">
                  <h3 className="pksim-display text-base font-bold">Real-time Search Queries & Visitor Log</h3>
                  <span className="rounded-full bg-[hsl(var(--secondary))] px-2 py-0.5 text-[11px] font-bold text-[hsl(var(--primary))]">
                    {filteredLogs.length} entries
                  </span>
                </div>
                <span className="text-[11px] text-[hsl(var(--muted-foreground))]">
                  Firebase Firestore Live Sync
                </span>
              </div>

              {filteredLogs.length === 0 ? (
                <div className="flex min-h-[220px] flex-col items-center justify-center p-8 text-center text-xs text-[hsl(var(--muted-foreground))]">
                  <Activity size={24} className="mb-2 opacity-40 text-[hsl(var(--primary))]" />
                  <p className="font-semibold text-[hsl(var(--foreground))]">No search queries recorded yet</p>
                  <p className="mt-1 max-w-[320px]">
                    When users search for a phone number or CNIC on PKSIM, their query, IP, device, and location will appear here in real-time.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.4)] text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                      <tr>
                        <th className="px-4 py-3">Query / Input</th>
                        <th className="px-4 py-3">IP Address</th>
                        <th className="px-4 py-3">Location</th>
                        <th className="px-4 py-3">Device & Browser</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Date & Time</th>
                        <th className="px-4 py-3 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[hsl(var(--border))]">
                      {filteredLogs.map((log) => {
                        const isNumber = log.searchMode === 'number';
                        const timeString = new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const dateString = new Date(log.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });

                        return (
                          <tr key={log.id} className="transition-colors hover:bg-[hsl(var(--muted)_/_0.2)]">
                            {/* Query */}
                            <td className="px-4 py-3 font-medium">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-sm font-bold text-[hsl(var(--primary))]">
                                  {log.query}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => copyText(log.query, `q_${log.id}`)}
                                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                                  title="Copy query"
                                >
                                  {copiedItem === `q_${log.id}` ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                                </button>
                                <span className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold ${
                                  isNumber
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400'
                                    : 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400'
                                }`}>
                                  {isNumber ? 'Phone' : 'CNIC'}
                                </span>
                              </div>
                            </td>

                            {/* IP */}
                            <td className="px-4 py-3 font-mono text-[11px]">
                              <div className="flex items-center gap-1.5">
                                <span>{log.ip}</span>
                                <button
                                  type="button"
                                  onClick={() => copyText(log.ip, `ip_${log.id}`)}
                                  className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                                  title="Copy IP"
                                >
                                  {copiedItem === `ip_${log.id}` ? <Check size={11} className="text-emerald-500" /> : <Copy size={11} />}
                                </button>
                              </div>
                              {log.isp && <p className="truncate max-w-[140px] text-[10px] text-[hsl(var(--muted-foreground))]">{log.isp}</p>}
                            </td>

                            {/* Location */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1 font-medium">
                                <span>🇵🇰</span>
                                <span>{log.city || 'Pakistan'}</span>
                              </div>
                              {log.region && <p className="text-[10px] text-[hsl(var(--muted-foreground))]">{log.region}, {log.country}</p>}
                            </td>

                            {/* Device & Browser */}
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-1.5 font-medium">
                                {log.deviceType === 'Mobile' ? (
                                  <Smartphone size={13} className="text-emerald-500" />
                                ) : log.deviceType === 'Tablet' ? (
                                  <Tablet size={13} className="text-amber-500" />
                                ) : (
                                  <Monitor size={13} className="text-blue-500" />
                                )}
                                <span>{log.os} • {log.browser}</span>
                              </div>
                            </td>

                            {/* Status */}
                            <td className="px-4 py-3">
                              {log.status === 'found' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-[hsl(145_50%_92%)] px-2.5 py-0.5 text-[11px] font-bold text-[hsl(var(--primary))]">
                                  <Check size={11} strokeWidth={3} /> Found ({log.recordsCount})
                                </span>
                              ) : log.status === 'no_record' ? (
                                <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2.5 py-0.5 text-[11px] font-bold text-amber-700 dark:text-amber-300">
                                  No Record
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 rounded-full bg-red-500/15 px-2.5 py-0.5 text-[11px] font-bold text-red-600 dark:text-red-400">
                                  Failed
                                </span>
                              )}
                            </td>

                            {/* Date & Time */}
                            <td className="px-4 py-3 text-[11px] text-[hsl(var(--muted-foreground))]">
                              <div className="flex items-center gap-1">
                                <Clock size={11} />
                                <span>{timeString}</span>
                              </div>
                              <p className="text-[10px]">{dateString}</p>
                            </td>

                            {/* Delete Action */}
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() => handleDeleteLog(log.id)}
                                className="rounded-lg p-1 text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(2_70%_95%)] hover:text-[hsl(var(--destructive))]"
                                title="Delete entry"
                              >
                                <Trash2 size={13} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ADS MANAGEMENT */}
        {activeTab === 'ads' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[hsl(145_45%_80%)] bg-[hsl(145_60%_96%)] p-4 text-[hsl(var(--primary))] dark:border-[hsl(var(--border))] dark:bg-[hsl(var(--card))] dark:text-[hsl(var(--foreground))]">
              <div className="flex items-start gap-3">
                <Zap size={20} className="shrink-0 mt-0.5 text-[hsl(var(--primary))]" />
                <div className="text-xs leading-5">
                  <p className="font-bold">Adsterra, Google AdSense & Direct Network Integration</p>
                  <p className="opacity-90">
                    Paste your ad network scripts, 720p/728x90 banner tags, popunder codes, or social bar scripts below. All ad codes are executed dynamically and stored directly in your app.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
              {adSlotsList.map((slotKey) => {
                const slot = adsConfig[slotKey];
                const isPreviewing = previewSlot === slotKey;

                return (
                  <div
                    key={slotKey}
                    className={`rounded-[22px] border transition-all ${
                      slot.enabled
                        ? 'border-[hsl(var(--primary)_/_0.4)] bg-[hsl(var(--card))] shadow-[0_10px_30px_hsl(157_35%_19%_/_0.06)]'
                        : 'border-[hsl(var(--border))] bg-[hsl(var(--card)_/_0.6)] opacity-85'
                    }`}
                  >
                    {/* Card Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[hsl(var(--border))] px-5 py-4 sm:px-6">
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-9 w-9 items-center justify-center rounded-xl font-mono text-xs font-bold ${
                            slot.enabled
                              ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]'
                              : 'bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]'
                          }`}
                        >
                          <Code2 size={16} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="pksim-display text-base font-bold text-[hsl(var(--foreground))]">
                              {slot.name}
                            </h3>
                            <span className="rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.6)] px-2 py-0.5 text-[10px] font-semibold text-[hsl(var(--muted-foreground))]">
                              {slot.recommendedSize}
                            </span>
                          </div>
                          <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            {slot.description}
                          </p>
                        </div>
                      </div>

                      {/* Toggle & Preview buttons */}
                      <div className="flex items-center gap-3">
                        <button
                          type="button"
                          onClick={() => setPreviewSlot(isPreviewing ? null : slotKey)}
                          className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition-colors ${
                            isPreviewing
                              ? 'border-[hsl(var(--primary))] bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]'
                              : 'border-[hsl(var(--border))] bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))] hover:border-[hsl(var(--primary))]'
                          }`}
                        >
                          <Eye size={13} />
                          <span>{isPreviewing ? 'Hide Preview' : 'Preview'}</span>
                        </button>

                        <label className="relative inline-flex cursor-pointer items-center">
                          <input
                            type="checkbox"
                            checked={slot.enabled}
                            onChange={(e) => updateSlotField(slotKey, 'enabled', e.target.checked)}
                            className="peer sr-only"
                          />
                          <div className="peer h-6 w-11 rounded-full bg-[hsl(var(--muted))] after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-[hsl(var(--primary))] peer-checked:after:translate-x-full peer-focus:outline-none" />
                          <span className="ml-2 text-xs font-bold">
                            {slot.enabled ? 'Enabled' : 'Disabled'}
                          </span>
                        </label>
                      </div>
                    </div>

                    {/* Card Body */}
                    <div className="p-5 sm:p-6 space-y-4">
                      {/* Code Textarea */}
                      <div>
                        <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                          <label className="text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                            Ad Script / HTML Code Snippet
                          </label>

                          {/* Quick Template Inserters */}
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            <span className="text-[hsl(var(--muted-foreground))]">Quick Template:</span>
                            {slotKey.includes('popunder') ? (
                              <button
                                type="button"
                                onClick={() => insertTemplate(slotKey, AD_TEMPLATES.adsterraPopunder)}
                                className="rounded-lg bg-[hsl(var(--secondary))] px-2 py-1 font-semibold text-[hsl(var(--primary))] hover:opacity-80"
                              >
                                + Adsterra Popunder
                              </button>
                            ) : slotKey.includes('socialBar') ? (
                              <button
                                type="button"
                                onClick={() => insertTemplate(slotKey, AD_TEMPLATES.adsterraSocialBar)}
                                className="rounded-lg bg-[hsl(var(--secondary))] px-2 py-1 font-semibold text-[hsl(var(--primary))] hover:opacity-80"
                              >
                                + Adsterra Social Bar
                              </button>
                            ) : (
                              <>
                                <button
                                  type="button"
                                  onClick={() => insertTemplate(slotKey, AD_TEMPLATES.adsterraBanner728)}
                                  className="rounded-lg bg-[hsl(var(--secondary))] px-2 py-1 font-semibold text-[hsl(var(--primary))] hover:opacity-80"
                                >
                                  + 728x90 Banner
                                </button>
                                <button
                                  type="button"
                                  onClick={() => insertTemplate(slotKey, AD_TEMPLATES.adsterraBanner300)}
                                  className="rounded-lg bg-[hsl(var(--secondary))] px-2 py-1 font-semibold text-[hsl(var(--primary))] hover:opacity-80"
                                >
                                  + 300x250 Banner
                                </button>
                                <button
                                  type="button"
                                  onClick={() => insertTemplate(slotKey, AD_TEMPLATES.sampleHtmlBanner)}
                                  className="rounded-lg bg-[hsl(var(--secondary))] px-2 py-1 font-semibold text-[hsl(var(--primary))] hover:opacity-80"
                                >
                                  + Test HTML
                                </button>
                              </>
                            )}
                          </div>
                        </div>

                        <textarea
                          rows={4}
                          value={slot.code}
                          onChange={(e) => updateSlotField(slotKey, 'code', e.target.value)}
                          placeholder={`Paste your ad code here (e.g. <script src="..."></script> or <iframe ...>)`}
                          className="w-full rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.3)] p-3 font-mono text-xs text-[hsl(var(--foreground))] outline-none transition-colors focus:border-[hsl(var(--primary))] focus:bg-[hsl(var(--card))]"
                        />
                      </div>

                      {/* Live Preview Box */}
                      {isPreviewing && (
                        <div className="rounded-xl border border-dashed border-[hsl(var(--primary)_/_0.5)] bg-[hsl(var(--card))] p-4">
                          <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--primary))]">
                            Live Preview ({slot.name})
                          </p>
                          {slot.code.trim() ? (
                            <div
                              className="overflow-x-auto text-center"
                              dangerouslySetInnerHTML={{ __html: slot.code }}
                            />
                          ) : (
                            <p className="text-xs italic text-[hsl(var(--muted-foreground))]">
                              No code entered for this slot yet.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Bottom Save Bar */}
            <div className="sticky bottom-4 z-20 flex items-center justify-between rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card)_/_0.95)] p-4 shadow-xl backdrop-blur-md">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5 text-[hsl(var(--primary))]" />
                <span className="text-xs font-semibold text-[hsl(var(--muted-foreground))]">
                  All ad placements update automatically across the site upon saving.
                </span>
              </div>
              <button
                type="button"
                onClick={handleSaveAds}
                className="flex items-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 py-2.5 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-md transition-transform hover:-translate-y-0.5"
              >
                {saveSuccess ? <Check size={16} /> : <Save size={16} />}
                <span>{saveSuccess ? 'Saved Successfully!' : 'Save All Settings'}</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: WHATSAPP SETTINGS */}
        {activeTab === 'whatsapp' && (
          <div className="mx-auto max-w-[620px] rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-[0_12px_36px_hsl(157_35%_19%_/_0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(145_50%_90%)] text-[hsl(var(--primary))]">
                <MessageSquare size={22} />
              </div>
              <div>
                <h2 className="pksim-display text-xl font-bold">WhatsApp Channel Link</h2>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Manage the WhatsApp support or channel URL displayed in popups, follow banners, and empty search results.
                </p>
              </div>
            </div>

            <form onSubmit={handleSaveWhatsapp} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                  WhatsApp Group / Channel URL
                </label>
                <input
                  type="url"
                  value={whatsappLink}
                  onChange={(e) => setWhatsappLink(e.target.value)}
                  placeholder="https://chat.whatsapp.com/..."
                  className="mt-1.5 h-11 w-full rounded-xl border border-[hsl(var(--border))] bg-transparent px-3.5 text-sm font-medium text-[hsl(var(--foreground))] outline-none transition-colors focus:border-[hsl(var(--primary))] focus:ring-2 focus:ring-[hsl(var(--ring)_/_0.2)]"
                />
              </div>

              {whatsappLink && (
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.4)] p-3 text-xs">
                  <span className="font-bold text-[hsl(var(--muted-foreground))]">Link Preview: </span>
                  <a
                    href={whatsappLink}
                    target="_blank"
                    rel="noreferrer"
                    className="font-mono text-[hsl(var(--primary))] underline"
                  >
                    {whatsappLink}
                  </a>
                </div>
              )}

              <button
                type="submit"
                className="flex h-11 items-center justify-center gap-2 rounded-xl bg-[hsl(var(--primary))] px-6 text-sm font-bold text-[hsl(var(--primary-foreground))] shadow-md transition-transform hover:-translate-y-0.5"
              >
                {whatsappSaved ? <Check size={16} /> : <Save size={16} />}
                <span>{whatsappSaved ? 'Saved!' : 'Save WhatsApp Link'}</span>
              </button>
            </form>
          </div>
        )}

        {/* TAB 4: PLACEMENT GUIDE */}
        {activeTab === 'preview' && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm">
              <h2 className="pksim-display text-xl font-bold">Ad Placements Architecture</h2>
              <p className="mt-1 text-xs text-[hsl(var(--muted-foreground))]">
                Visual map of all ad slots and script execution positions across the PKSIM site.
              </p>

              <div className="mt-6 space-y-3 font-mono text-xs">
                {/* Header Ad */}
                <div className="rounded-xl border border-dashed border-[hsl(var(--primary))] bg-[hsl(var(--secondary)_/_0.5)] p-3 text-center text-[hsl(var(--primary))] font-bold">
                  [1] Top Header Banner (728x90 / Responsive)
                </div>

                {/* Search box mock */}
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.5)] p-4 text-center">
                  🔍 Search Box (Phone / CNIC Input)
                </div>

                {/* Under Search Ad */}
                <div className="rounded-xl border border-dashed border-emerald-500 bg-emerald-50 p-3 text-center text-emerald-800 font-bold dark:bg-emerald-950 dark:text-emerald-300">
                  [2] Under-Search Banner / 720p Banner
                </div>

                {/* Results mock */}
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.5)] p-4 text-center">
                  📋 Search Results & Subscriber Record Cards
                </div>

                {/* In-Between Results Ad */}
                <div className="rounded-xl border border-dashed border-amber-500 bg-amber-50 p-3 text-center text-amber-800 font-bold dark:bg-amber-950 dark:text-amber-300">
                  [3] Results Area Banner (300x250 / 728x90)
                </div>

                {/* Follow Section mock */}
                <div className="rounded-xl border border-dashed border-emerald-600 bg-emerald-100 p-3 text-center font-bold text-emerald-900 dark:bg-emerald-900/50 dark:text-emerald-200">
                  💬 Follow Us Community / Join WhatsApp Section
                </div>

                {/* Footer Banner Ad */}
                <div className="rounded-xl border border-dashed border-indigo-500 bg-indigo-50 p-3 text-center text-indigo-800 font-bold dark:bg-indigo-950 dark:text-indigo-300">
                  [4] Bottom Footer Banner
                </div>

                {/* Disclaimer */}
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.4)] p-3 text-center text-[11px] text-[hsl(var(--muted-foreground))]">
                  ⚠️ Legal Disclaimer Box
                </div>

                {/* Footer */}
                <div className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 text-center font-bold">
                  PKSIM — Powered by LinkShare
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default AdminPanel;
