export interface AdSlotConfig {
  id: string;
  name: string;
  description: string;
  recommendedSize: string;
  enabled: boolean;
  code: string;
}

export interface AdsConfig {
  headerBanner: AdSlotConfig;
  searchBanner: AdSlotConfig;
  resultsBanner: AdSlotConfig;
  footerBanner: AdSlotConfig;
  popunder: AdSlotConfig;
  socialBar: AdSlotConfig;
  customHeadScript: AdSlotConfig;
}

export const ADS_STORAGE_KEY = 'pksim-ads-config';
export const ADS_UPDATED_EVENT = 'pksim-ads-updated';

export const DEFAULT_ADS_CONFIG: AdsConfig = {
  headerBanner: {
    id: 'headerBanner',
    name: 'Top Header Banner',
    description: 'Displays at the top of the page below the header navigation (Ideal for 728x90, 468x60 or responsive banners).',
    recommendedSize: '728x90 / Responsive',
    enabled: false,
    code: '',
  },
  searchBanner: {
    id: 'searchBanner',
    name: 'Under-Search Banner / 720p',
    description: 'Displays directly underneath the search bar box (Ideal for 728x90, 468x60, or Native Banners).',
    recommendedSize: '728x90 / 468x60 / Native',
    enabled: false,
    code: '',
  },
  resultsBanner: {
    id: 'resultsBanner',
    name: 'Results Area Banner',
    description: 'Displays directly above and within the lookup results card container (Ideal for 300x250, 728x90 or Native ads).',
    recommendedSize: '300x250 / 728x90',
    enabled: false,
    code: '',
  },
  footerBanner: {
    id: 'footerBanner',
    name: 'Bottom Footer Banner',
    description: 'Displays above the legal disclaimer and footer area.',
    recommendedSize: '728x90 / Responsive',
    enabled: false,
    code: '',
  },
  popunder: {
    id: 'popunder',
    name: 'Adsterra / Popunder Script',
    description: 'Invisible background script that triggers a popunder ad on user interaction/click.',
    recommendedSize: 'Script Code only',
    enabled: false,
    code: '',
  },
  socialBar: {
    id: 'socialBar',
    name: 'Adsterra Social Bar / Floating Ad',
    description: 'Floating notification/in-page push ad bar script (Adsterra Social Bar).',
    recommendedSize: 'Script Code only',
    enabled: false,
    code: '',
  },
  customHeadScript: {
    id: 'customHeadScript',
    name: 'Global Custom Head / Ad Scripts',
    description: 'Custom tracking tags, meta verification, or third-party ad network header scripts.',
    recommendedSize: 'Script / HTML Code',
    enabled: false,
    code: '',
  },
};

export const AD_TEMPLATES = {
  adsterraBanner728: `<script type="text/javascript">
  atOptions = {
    'key' : 'YOUR_ADSTERRA_KEY_HERE',
    'format' : 'iframe',
    'height' : 90,
    'width' : 728,
    'params' : {}
  };
</script>
<script type="text/javascript" src="//www.topcreativeformat.com/YOUR_ADSTERRA_KEY_HERE/invoke.js"></script>`,

  adsterraBanner300: `<script type="text/javascript">
  atOptions = {
    'key' : 'YOUR_ADSTERRA_KEY_HERE',
    'format' : 'iframe',
    'height' : 250,
    'width' : 300,
    'params' : {}
  };
</script>
<script type="text/javascript" src="//www.topcreativeformat.com/YOUR_ADSTERRA_KEY_HERE/invoke.js"></script>`,

  adsterraPopunder: `<script type='text/javascript' src='//pl12345678.profitablegatecpm.com/ab/cd/ef/abcdef0123456789.js'></script>`,

  adsterraSocialBar: `<script type='text/javascript' src='//pl87654321.profitablegatecpm.com/12/34/56/1234567890abcdef.js'></script>`,

  sampleHtmlBanner: `<div style="padding: 14px; background: #f0fdf4; border: 1px dashed #22c55e; border-radius: 12px; text-align: center; color: #15803d; font-weight: 600;">
  🚀 Place your Adsterra or Sponsor Banner Here!
</div>`,
};

export function getAdsConfig(): AdsConfig {
  try {
    const raw = localStorage.getItem(ADS_STORAGE_KEY);
    if (!raw) return DEFAULT_ADS_CONFIG;
    const parsed = JSON.parse(raw) as Partial<AdsConfig>;
    return {
      headerBanner: { ...DEFAULT_ADS_CONFIG.headerBanner, ...(parsed.headerBanner || {}) },
      searchBanner: { ...DEFAULT_ADS_CONFIG.searchBanner, ...(parsed.searchBanner || {}) },
      resultsBanner: { ...DEFAULT_ADS_CONFIG.resultsBanner, ...(parsed.resultsBanner || {}) },
      footerBanner: { ...DEFAULT_ADS_CONFIG.footerBanner, ...(parsed.footerBanner || {}) },
      popunder: { ...DEFAULT_ADS_CONFIG.popunder, ...(parsed.popunder || {}) },
      socialBar: { ...DEFAULT_ADS_CONFIG.socialBar, ...(parsed.socialBar || {}) },
      customHeadScript: { ...DEFAULT_ADS_CONFIG.customHeadScript, ...(parsed.customHeadScript || {}) },
    };
  } catch {
    return DEFAULT_ADS_CONFIG;
  }
}

export function saveAdsConfig(config: AdsConfig): void {
  try {
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new CustomEvent(ADS_UPDATED_EVENT, { detail: config }));
  } catch (error) {
    console.error('Failed to save ads config:', error);
  }
}

export function resetAdsConfig(): AdsConfig {
  try {
    localStorage.setItem(ADS_STORAGE_KEY, JSON.stringify(DEFAULT_ADS_CONFIG));
    window.dispatchEvent(new CustomEvent(ADS_UPDATED_EVENT, { detail: DEFAULT_ADS_CONFIG }));
  } catch (error) {
    console.error('Failed to reset ads config:', error);
  }
  return DEFAULT_ADS_CONFIG;
}
