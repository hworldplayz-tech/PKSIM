import { useState, useEffect, type FormEvent } from 'react';
import { Link } from 'wouter';
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Code2,
  Copy,
  ExternalLink,
  Eye,
  Globe,
  Layers,
  Lock,
  LogOut,
  MessageSquare,
  Radio,
  RefreshCw,
  Save,
  ShieldCheck,
  Tv,
  User,
  Zap,
} from 'lucide-react';
import LinkShareLogo from '@/components/LinkShareLogo';
import {
  AD_TEMPLATES,
  DEFAULT_ADS_CONFIG,
  getAdsConfig,
  resetAdsConfig,
  saveAdsConfig,
  type AdsConfig,
  type AdSlotConfig,
} from '@/config/ads';
import {
  DEFAULT_WHATSAPP_CHANNEL,
  getWhatsAppChannel,
  saveWhatsAppChannel,
} from '@/config/settings';

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

  // Admin tabs: 'ads' | 'whatsapp' | 'preview'
  const [activeTab, setActiveTab] = useState<'ads' | 'whatsapp' | 'preview'>('ads');

  // Ads state
  const [adsConfig, setAdsConfig] = useState<AdsConfig>(() => getAdsConfig());
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [previewSlot, setPreviewSlot] = useState<string | null>(null);

  // WhatsApp state
  const [whatsappLink, setWhatsappLink] = useState(() => getWhatsAppChannel());
  const [whatsappSaved, setWhatsappSaved] = useState(false);

  useEffect(() => {
    // Reload ads config on mount
    setAdsConfig(getAdsConfig());
    setWhatsappLink(getWhatsAppChannel());
  }, []);

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
                    PKSIM Management & Ads Control
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
        <div className="mx-auto flex h-[70px] w-full max-w-[1100px] items-center justify-between px-5 sm:px-8">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <LinkShareLogo size={36} />
              <div>
                <span className="pksim-display text-lg font-bold tracking-[-0.04em] text-[hsl(var(--primary))]">
                  PKSIM Admin
                </span>
                <span className="hidden sm:inline-block ml-2 rounded-md bg-[hsl(var(--secondary))] px-2 py-0.5 text-[10px] font-bold text-[hsl(var(--secondary-foreground))]">
                  v2.0
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

      <div className="mx-auto w-full max-w-[1100px] px-5 py-8 sm:px-8">
        {/* Navigation Tabs & Status */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-1.5">
            <button
              type="button"
              onClick={() => setActiveTab('ads')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
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

            <button
              type="button"
              onClick={() => setActiveTab('whatsapp')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'whatsapp'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              <MessageSquare size={15} />
              <span>WhatsApp Channel</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-bold transition-all ${
                activeTab === 'preview'
                  ? 'bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-sm'
                  : 'text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--secondary))] hover:text-[hsl(var(--foreground))]'
              }`}
            >
              <Layers size={15} />
              <span>Placement Guide</span>
            </button>
          </div>

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

        {/* TAB 1: ADS MANAGEMENT */}
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

        {/* TAB 2: WHATSAPP SETTINGS */}
        {activeTab === 'whatsapp' && (
          <div className="mx-auto max-w-[620px] rounded-[24px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-8 shadow-[0_12px_36px_hsl(157_35%_19%_/_0.06)]">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[hsl(145_50%_90%)] text-[hsl(var(--primary))]">
                <MessageSquare size={22} />
              </div>
              <div>
                <h2 className="pksim-display text-xl font-bold">WhatsApp Channel Link</h2>
                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                  Manage the WhatsApp support or channel URL displayed when users search with no records found.
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

        {/* TAB 3: PLACEMENT GUIDE */}
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
