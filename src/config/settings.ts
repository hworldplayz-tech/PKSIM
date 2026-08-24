export const DEFAULT_WHATSAPP_CHANNEL = 'https://whatsapp.com/channel/0029VamSzhm9MF8wWp06TG2f';
export const CHANNEL_STORAGE_KEY = 'pksim-whatsapp-channel';
export const SETTINGS_UPDATED_EVENT = 'pksim-settings-updated';

export function getWhatsAppChannel(): string {
  try {
    const saved = localStorage.getItem(CHANNEL_STORAGE_KEY);
    if (saved && saved.trim()) return saved.trim();
  } catch {
    // fallback
  }
  return DEFAULT_WHATSAPP_CHANNEL;
}

export function saveWhatsAppChannel(url: string): void {
  try {
    const trimmed = url.trim() || DEFAULT_WHATSAPP_CHANNEL;
    localStorage.setItem(CHANNEL_STORAGE_KEY, trimmed);
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT, { detail: { whatsappChannel: trimmed } }));
  } catch (error) {
    console.error('Failed to save WhatsApp channel setting:', error);
  }
}
