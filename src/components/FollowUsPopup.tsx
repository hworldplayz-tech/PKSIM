import { useEffect, useState } from 'react';
import { ExternalLink, MessageCircle, Sparkles, X } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa6';
import { getWhatsAppChannel, SETTINGS_UPDATED_EVENT } from '@/config/settings';
import LinkShareLogo from '@/components/LinkShareLogo';

const POPUP_DISMISS_KEY = 'pksim_follow_popup_dismissed';

export function FollowUsPopup() {
  const [isOpen, setIsOpen] = useState(false);
  const [channelUrl, setChannelUrl] = useState(() => getWhatsAppChannel());

  useEffect(() => {
    // Check if dismissed previously in this session
    const isDismissed = sessionStorage.getItem(POPUP_DISMISS_KEY);
    if (!isDismissed) {
      // Open after 3.5 seconds
      const timer = setTimeout(() => {
        setIsOpen(true);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, []);

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

  const handleClose = () => {
    setIsOpen(false);
    sessionStorage.setItem(POPUP_DISMISS_KEY, 'true');
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-300"
    >
      <div className="pksim-rise-in relative w-full max-w-[460px] overflow-hidden rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.3)] text-center">
        {/* Decorative background glows */}
        <div className="pointer-events-none absolute -top-12 -right-12 h-36 w-36 rounded-full bg-[#25D366]/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-12 -left-12 h-36 w-36 rounded-full bg-[hsl(var(--primary))]/20 blur-3xl" />

        {/* Close Button */}
        <button
          type="button"
          onClick={handleClose}
          aria-label="Close popup"
          className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--muted)_/_0.6)] text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
        >
          <X size={16} />
        </button>

        {/* Brand & WhatsApp Icon */}
        <div className="relative mx-auto mb-4 flex items-center justify-center">
          <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#25D366] text-white shadow-[0_10px_25px_rgba(37,211,102,0.35)]">
            <FaWhatsapp className="h-9 w-9" />
            <span className="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-emerald-600 shadow-md">
              <Sparkles size={13} />
            </span>
          </div>
        </div>

        {/* Badge */}
        <div className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
          Official Community
        </div>

        {/* Title & Description */}
        <h3 className="pksim-display text-2xl font-bold tracking-[-0.03em] text-[hsl(var(--foreground))]">
          Join Our WhatsApp Channel!
        </h3>

        <p className="mx-auto mt-2 max-w-[360px] text-xs leading-5 text-[hsl(var(--muted-foreground))] sm:text-sm">
          Get real-time alerts for the latest 2026 database updates, instant SIM owner verification tools & LinkShare news.
        </p>

        {/* Action Button */}
        <div className="mt-6 space-y-2.5">
          <a
            href={channelUrl}
            target="_blank"
            rel="noreferrer"
            onClick={handleClose}
            className="flex h-12 w-full items-center justify-center gap-2.5 rounded-xl bg-[#25D366] px-5 text-sm font-bold text-white shadow-lg transition-transform hover:-translate-y-0.5 hover:bg-[#20bd5a] focus:outline-none focus:ring-2 focus:ring-[#25D366]/40"
          >
            <FaWhatsapp size={18} />
            <span>Join WhatsApp Channel</span>
            <ExternalLink size={14} className="opacity-80" />
          </a>

          <button
            type="button"
            onClick={handleClose}
            className="h-10 w-full rounded-xl text-xs font-semibold text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted)_/_0.5)] hover:text-[hsl(var(--foreground))]"
          >
            Maybe later
          </button>
        </div>
      </div>
    </div>
  );
}

export default FollowUsPopup;
