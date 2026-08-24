import { useEffect, useState } from 'react';
import { ExternalLink, Sparkles, Users } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { getWhatsAppChannel, SETTINGS_UPDATED_EVENT } from '@/config/settings';
import LinkShareLogo from '@/components/LinkShareLogo';

export function FollowSection() {
  const [channelUrl, setChannelUrl] = useState(() => getWhatsAppChannel());

  useEffect(() => {
    const handleUpdate = () => {
      setChannelUrl(getWhatsAppChannel());
    };
    window.addEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
    window.addEventListener('storage', handleUpdate);
    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  return (
    <section className="my-6 sm:my-8 w-full">
      <div className="relative overflow-hidden rounded-[20px] sm:rounded-[26px] border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-[hsl(var(--card))] to-emerald-500/5 p-4 sm:p-8 shadow-[0_16px_40px_rgba(16,185,129,0.08)]">
        {/* Glow decoration */}
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-[#25D366]/15 blur-3xl" />

        <div className="flex flex-col items-center justify-between gap-6 text-center md:flex-row md:text-left">
          {/* Left: Branding & Text */}
          <div className="flex flex-col items-center gap-4 sm:flex-row md:items-start">
            <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-[0_8px_20px_rgba(37,211,102,0.35)]">
              <FaWhatsapp className="h-8 w-8" />
              <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-white text-emerald-600 shadow">
                <Sparkles size={11} />
              </span>
            </div>

            <div>
              <div className="mb-1.5 flex flex-wrap items-center justify-center gap-2 md:justify-start">
                <span className="rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:text-emerald-300">
                  Follow Us
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[hsl(var(--muted-foreground))]">
                  <Users size={12} />
                  <span>Join 15,000+ Subscribers</span>
                </span>
              </div>

              <h3 className="pksim-display text-xl font-bold tracking-[-0.03em] text-[hsl(var(--foreground))] sm:text-2xl">
                Stay Updated with LinkShare
              </h3>
              <p className="mt-1 max-w-[480px] text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:text-sm">
                Join our official WhatsApp channel for 2026 database updates, instant verification tools, and direct support.
              </p>
            </div>
          </div>

          {/* Right: Join Button */}
          <div className="shrink-0">
            <a
              href={channelUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl bg-[#25D366] px-6 py-3 text-sm font-bold text-white shadow-md transition-transform hover:-translate-y-0.5 hover:bg-[#20bd5a] hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-[#25D366]/40"
            >
              <FaWhatsapp size={18} />
              <span>Join WhatsApp</span>
              <ExternalLink size={14} className="opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

export default FollowSection;
