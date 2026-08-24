import { useState } from 'react';
import {
  Check,
  Copy,
  Mail,
  Share2,
  Sparkles,
  X,
} from 'lucide-react';
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaReddit,
  FaTelegram,
  FaTwitter,
  FaWhatsapp,
} from 'react-icons/fa6';

export function ShareFloatingButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedToast, setCopiedToast] = useState('');

  const getShareUrl = () => {
    return typeof window !== 'undefined' ? window.location.origin : 'https://linksshare.online';
  };

  const shareUrl = getShareUrl();
  const shareTitle = 'PKSIM — Pakistani SIM & CNIC Database Record Lookup | Powered by LinkShare';
  const shareText = `Check out PKSIM: Fast Pakistani SIM and CNIC record lookup tool powered by LinkShare! Visit: ${shareUrl}`;

  const handleCopyLink = async (customMessage?: string) => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setCopiedToast(customMessage || 'Link copied to clipboard!');
      setTimeout(() => {
        setCopied(false);
        setCopiedToast('');
      }, 2500);
    } catch {
      setCopiedToast('Failed to copy link.');
      setTimeout(() => setCopiedToast(''), 2000);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // user cancelled or share failed
      }
    } else {
      handleCopyLink();
    }
  };

  const socialPlatforms = [
    {
      name: 'WhatsApp',
      icon: FaWhatsapp,
      color: 'bg-[#25D366] text-white hover:bg-[#20bd5a]',
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Facebook',
      icon: FaFacebook,
      color: 'bg-[#1877F2] text-white hover:bg-[#166fe5]',
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Twitter / X',
      icon: FaTwitter,
      color: 'bg-[#000000] text-white hover:bg-[#222222]',
      url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: 'Telegram',
      icon: FaTelegram,
      color: 'bg-[#229ED9] text-white hover:bg-[#1e8ec3]',
      url: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareTitle)}`,
    },
    {
      name: 'Gmail / Email',
      icon: Mail,
      color: 'bg-[#EA4335] text-white hover:bg-[#d93025]',
      url: `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(shareText)}`,
    },
    {
      name: 'Instagram',
      icon: FaInstagram,
      color: 'bg-gradient-to-tr from-[#FD1D1D] via-[#E1306C] to-[#833AB4] text-white hover:opacity-90',
      action: () => handleCopyLink('Link copied! Paste into Instagram stories, bio, or direct messages!'),
    },
    {
      name: 'LinkedIn',
      icon: FaLinkedin,
      color: 'bg-[#0A66C2] text-white hover:bg-[#095196]',
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
    },
    {
      name: 'Reddit',
      icon: FaReddit,
      color: 'bg-[#FF4500] text-white hover:bg-[#e03d00]',
      url: `https://reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(shareTitle)}`,
    },
  ];

  return (
    <>
      {/* Fixed Trigger Button on Left Center of Screen */}
      <div className="fixed left-0 top-1/2 z-40 -translate-y-1/2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Share this website"
          className="group relative flex items-center gap-2 rounded-r-2xl border-y border-r border-[hsl(var(--primary)_/_0.4)] bg-[hsl(var(--card))] py-3 pl-2.5 pr-3 shadow-[0_8px_25px_hsl(157_66%_24%_/_0.2)] backdrop-blur-md transition-all hover:translate-x-1 hover:bg-[hsl(var(--primary))] hover:text-white"
        >
          <div className="relative flex h-8 w-8 items-center justify-center rounded-xl bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-md group-hover:bg-white group-hover:text-[hsl(var(--primary))]">
            <Share2 size={16} />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-emerald-500" />
            </span>
          </div>

          <span className="hidden font-mono text-[11px] font-bold uppercase tracking-wider text-[hsl(var(--foreground))] group-hover:text-white sm:inline-block">
            Share
          </span>
        </button>
      </div>

      {/* Share Modal Dialog */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
        >
          <div className="pksim-rise-in relative w-full max-w-[480px] overflow-hidden rounded-[26px] border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 sm:p-7 shadow-[0_25px_60px_rgba(0,0,0,0.3)]">
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-[hsl(var(--border))]">
              <div className="flex items-center gap-2.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[hsl(var(--secondary))] text-[hsl(var(--primary))]">
                  <Share2 size={18} />
                </div>
                <div>
                  <h3 className="pksim-display text-xl font-bold tracking-[-0.03em] text-[hsl(var(--foreground))]">
                    Share This Site
                  </h3>
                  <p className="text-xs text-[hsl(var(--muted-foreground))]">
                    Share PKSIM with friends and community
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-[hsl(var(--muted)_/_0.6)] text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Toast Feedback */}
            {copiedToast && (
              <div className="mt-4 flex items-center gap-2 rounded-xl bg-[hsl(145_50%_92%)] p-2.5 text-xs font-semibold text-[hsl(var(--primary))] animate-in fade-in">
                <Check size={14} className="shrink-0" />
                <span>{copiedToast}</span>
              </div>
            )}

            {/* Social Share Grid */}
            <div className="mt-5 grid grid-cols-4 gap-3 sm:grid-cols-4">
              {socialPlatforms.map((platform) => {
                const Icon = platform.icon;
                if (platform.action) {
                  return (
                    <button
                      key={platform.name}
                      type="button"
                      onClick={platform.action}
                      className="group flex flex-col items-center gap-1.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 transition-transform hover:-translate-y-1 hover:shadow-md"
                    >
                      <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${platform.color}`}>
                        <Icon size={20} />
                      </div>
                      <span className="text-[11px] font-semibold text-[hsl(var(--foreground))]">
                        {platform.name}
                      </span>
                    </button>
                  );
                }

                return (
                  <a
                    key={platform.name}
                    href={platform.url}
                    target="_blank"
                    rel="noreferrer"
                    className="group flex flex-col items-center gap-1.5 rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-3 transition-transform hover:-translate-y-1 hover:shadow-md"
                  >
                    <div className={`flex h-11 w-11 items-center justify-center rounded-xl transition-transform group-hover:scale-105 ${platform.color}`}>
                      <Icon size={20} />
                    </div>
                    <span className="text-[11px] font-semibold text-[hsl(var(--foreground))]">
                      {platform.name}
                    </span>
                  </a>
                );
              })}
            </div>

            {/* Direct Copy Link Box */}
            <div className="mt-6">
              <label className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-[hsl(var(--muted-foreground))]">
                Direct Site Link
              </label>
              <div className="flex items-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--muted)_/_0.4)] p-1.5">
                <input
                  type="text"
                  readOnly
                  value={shareUrl}
                  className="min-w-0 flex-1 bg-transparent px-2.5 font-mono text-xs text-[hsl(var(--foreground))] outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleCopyLink()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[hsl(var(--primary))] px-3.5 py-2 text-xs font-bold text-[hsl(var(--primary-foreground))] transition-transform hover:-translate-y-0.5"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            </div>

            {/* Native device share button if supported */}
            {typeof navigator !== 'undefined' && 'share' in navigator && (
              <button
                type="button"
                onClick={handleNativeShare}
                className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-xs font-semibold text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--primary))] hover:text-[hsl(var(--primary))]"
              >
                <Sparkles size={14} />
                <span>More Share Options (Native)</span>
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}

export default ShareFloatingButton;
