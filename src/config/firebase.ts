export const FIREBASE_CONFIG = {
  apiKey: "AIzaSyCdg8-138Xy2wWHeQP1ayktNeIMBHAF7W8",
  authDomain: "pksim-b0836.firebaseapp.com",
  projectId: "pksim-b0836",
  storageBucket: "pksim-b0836.firebasestorage.app",
  messagingSenderId: "51709873295",
  appId: "1:51709873295:web:ddfc24520c86ce793bf4fa",
  measurementId: "G-8T5KVL6WL1"
};

export const FIRESTORE_BASE_URL = `https://firestore.googleapis.com/v1/projects/${FIREBASE_CONFIG.projectId}/databases/(default)/documents`;
export const LOCAL_LOGS_STORAGE_KEY = 'pksim_analytics_search_logs';
export const ANALYTICS_UPDATED_EVENT = 'pksim-analytics-updated';

export interface SearchLogEntry {
  id: string;
  query: string;
  searchMode: 'number' | 'cnic';
  status: 'found' | 'no_record' | 'error';
  recordsCount: number;
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  isp?: string;
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  browser: string;
  os: string;
  userAgent: string;
  timestamp: string; // ISO string
  createdAt: number; // unix timestamp ms
}

// Client Device Detection
export function getDeviceInfo(): {
  deviceType: 'Mobile' | 'Tablet' | 'Desktop';
  browser: string;
  os: string;
  userAgent: string;
} {
  if (typeof window === 'undefined') {
    return { deviceType: 'Desktop', browser: 'Unknown', os: 'Unknown', userAgent: '' };
  }

  const ua = navigator.userAgent;

  // Device Type
  let deviceType: 'Mobile' | 'Tablet' | 'Desktop' = 'Desktop';
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    deviceType = 'Tablet';
  } else if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/i.test(ua)) {
    deviceType = 'Mobile';
  }

  // OS
  let os = 'Unknown OS';
  if (/Windows/i.test(ua)) os = 'Windows';
  else if (/Android/i.test(ua)) os = 'Android';
  else if (/iPhone|iPad|iPod/i.test(ua)) os = 'iOS';
  else if (/Mac OS/i.test(ua)) os = 'macOS';
  else if (/Linux/i.test(ua)) os = 'Linux';

  // Browser
  let browser = 'Unknown Browser';
  if (/Chrome/i.test(ua) && !/Edg|OPR|Opera/i.test(ua)) browser = 'Chrome';
  else if (/Safari/i.test(ua) && !/Chrome/i.test(ua)) browser = 'Safari';
  else if (/Firefox/i.test(ua)) browser = 'Firefox';
  else if (/Edg/i.test(ua)) browser = 'Edge';
  else if (/OPR|Opera/i.test(ua)) browser = 'Opera';
  else if (/SamsungBrowser/i.test(ua)) browser = 'Samsung Internet';

  return {
    deviceType,
    browser,
    os,
    userAgent: ua,
  };
}

// Client IP & Geolocation info
interface GeoInfo {
  ip: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  isp?: string;
}

let cachedGeoInfo: GeoInfo | null = null;

export async function getClientGeoInfo(): Promise<GeoInfo> {
  if (cachedGeoInfo) return cachedGeoInfo;

  try {
    const sessionCached = sessionStorage.getItem('pksim_client_geo');
    if (sessionCached) {
      cachedGeoInfo = JSON.parse(sessionCached);
      return cachedGeoInfo!;
    }
  } catch {
    // continue
  }

  try {
    // Primary Geo API
    const response = await fetch('https://ipapi.co/json/', {
      headers: { Accept: 'application/json' },
    });
    if (response.ok) {
      const data = await response.json();
      const geo: GeoInfo = {
        ip: data.ip || 'Unknown IP',
        city: data.city || 'Unknown City',
        region: data.region || 'Unknown Region',
        country: data.country_name || 'Pakistan',
        countryCode: data.country_code || 'PK',
        isp: data.org || '',
      };
      cachedGeoInfo = geo;
      try {
        sessionStorage.setItem('pksim_client_geo', JSON.stringify(geo));
      } catch {}
      return geo;
    }
  } catch {
    // Fallback Geo API
  }

  try {
    const fallbackResponse = await fetch('https://api.ipify.org?format=json');
    if (fallbackResponse.ok) {
      const fbData = await fallbackResponse.json();
      const geo: GeoInfo = {
        ip: fbData.ip || 'Unknown IP',
        city: 'Pakistan',
        region: '',
        country: 'Pakistan',
        countryCode: 'PK',
      };
      cachedGeoInfo = geo;
      return geo;
    }
  } catch {
    // fallback
  }

  return {
    ip: 'Unknown IP',
    city: 'Pakistan',
    region: '',
    country: 'Pakistan',
    countryCode: 'PK',
  };
}

// Convert Firestore document fields to clean JS Object
function documentToLogEntry(doc: any): SearchLogEntry | null {
  try {
    const fields = doc.fields || {};
    const id = doc.name ? doc.name.split('/').pop() : Math.random().toString(36).substring(2);

    return {
      id,
      query: fields.query?.stringValue || '',
      searchMode: (fields.searchMode?.stringValue as any) || 'number',
      status: (fields.status?.stringValue as any) || 'found',
      recordsCount: parseInt(fields.recordsCount?.integerValue || fields.recordsCount?.doubleValue || '0', 10),
      ip: fields.ip?.stringValue || 'Unknown IP',
      city: fields.city?.stringValue || 'Unknown City',
      region: fields.region?.stringValue || '',
      country: fields.country?.stringValue || 'Pakistan',
      countryCode: fields.countryCode?.stringValue || 'PK',
      isp: fields.isp?.stringValue || '',
      deviceType: (fields.deviceType?.stringValue as any) || 'Desktop',
      browser: fields.browser?.stringValue || 'Chrome',
      os: fields.os?.stringValue || 'Unknown OS',
      userAgent: fields.userAgent?.stringValue || '',
      timestamp: fields.timestamp?.stringValue || new Date().toISOString(),
      createdAt: parseInt(fields.createdAt?.integerValue || fields.createdAt?.doubleValue || String(Date.now()), 10),
    };
  } catch (err) {
    console.warn('Error parsing Firestore log entry:', err);
    return null;
  }
}

// Convert JS Object to Firestore Fields Payload
function logEntryToFirestoreFields(entry: SearchLogEntry): any {
  return {
    fields: {
      query: { stringValue: entry.query },
      searchMode: { stringValue: entry.searchMode },
      status: { stringValue: entry.status },
      recordsCount: { integerValue: String(entry.recordsCount) },
      ip: { stringValue: entry.ip },
      city: { stringValue: entry.city },
      region: { stringValue: entry.region },
      country: { stringValue: entry.country },
      countryCode: { stringValue: entry.countryCode },
      isp: { stringValue: entry.isp || '' },
      deviceType: { stringValue: entry.deviceType },
      browser: { stringValue: entry.browser },
      os: { stringValue: entry.os },
      userAgent: { stringValue: entry.userAgent },
      timestamp: { stringValue: entry.timestamp },
      createdAt: { integerValue: String(entry.createdAt) },
    },
  };
}

// Log Search to Firebase Firestore and Google Analytics
export async function logSearchAnalytics(params: {
  query: string;
  searchMode: 'number' | 'cnic';
  status: 'found' | 'no_record' | 'error';
  recordsCount: number;
}): Promise<void> {
  try {
    const geo = await getClientGeoInfo();
    const device = getDeviceInfo();

    const entry: SearchLogEntry = {
      id: `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      query: params.query,
      searchMode: params.searchMode,
      status: params.status,
      recordsCount: params.recordsCount,
      ip: geo.ip,
      city: geo.city,
      region: geo.region,
      country: geo.country,
      countryCode: geo.countryCode,
      isp: geo.isp,
      deviceType: device.deviceType,
      browser: device.browser,
      os: device.os,
      userAgent: device.userAgent,
      timestamp: new Date().toISOString(),
      createdAt: Date.now(),
    };

    // 1. Save to Local Offline Cache
    try {
      const localLogs = getLocalSearchLogs();
      const updated = [entry, ...localLogs.slice(0, 199)];
      localStorage.setItem(LOCAL_LOGS_STORAGE_KEY, JSON.stringify(updated));
      window.dispatchEvent(new CustomEvent(ANALYTICS_UPDATED_EVENT, { detail: entry }));
    } catch {}

    // 2. Log to Google Analytics (gtag)
    try {
      if (typeof window !== 'undefined' && (window as any).gtag) {
        (window as any).gtag('event', 'sim_lookup_performed', {
          query_type: params.searchMode,
          lookup_status: params.status,
          records_count: params.recordsCount,
          device: device.deviceType,
          city: geo.city,
        });
      }
    } catch {}

    // 3. Post Document directly to Firebase Firestore
    try {
      const firestoreUrl = `${FIRESTORE_BASE_URL}/search_logs?documentId=${entry.id}`;
      const payload = logEntryToFirestoreFields(entry);

      await fetch(firestoreUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
    } catch (fsErr) {
      console.warn('[Firebase] Firestore remote write skipped:', fsErr);
    }
  } catch (err) {
    console.warn('[Analytics] Log write error:', err);
  }
}

// Fetch all Search Logs (from Firestore + Local cache)
export async function fetchSearchLogs(): Promise<SearchLogEntry[]> {
  const localLogs = getLocalSearchLogs();

  try {
    const firestoreUrl = `${FIRESTORE_BASE_URL}/search_logs?pageSize=200`;
    const res = await fetch(firestoreUrl, {
      method: 'GET',
      headers: { Accept: 'application/json' },
    });

    if (res.ok) {
      const data = await res.json();
      const documents: any[] = data.documents || [];
      const remoteLogs: SearchLogEntry[] = documents
        .map(documentToLogEntry)
        .filter((item): item is SearchLogEntry => item !== null);

      // Merge remote and local by unique id
      const map = new Map<string, SearchLogEntry>();
      remoteLogs.forEach((l) => map.set(l.id, l));
      localLogs.forEach((l) => {
        if (!map.has(l.id)) map.set(l.id, l);
      });

      const merged = Array.from(map.values()).sort((a, b) => b.createdAt - a.createdAt);
      try {
        localStorage.setItem(LOCAL_LOGS_STORAGE_KEY, JSON.stringify(merged.slice(0, 200)));
      } catch {}
      return merged;
    }
  } catch (e) {
    console.warn('[Firebase] Failed to fetch remote logs, using local cache:', e);
  }

  return localLogs.sort((a, b) => b.createdAt - a.createdAt);
}

// Get local search logs
export function getLocalSearchLogs(): SearchLogEntry[] {
  try {
    const raw = localStorage.getItem(LOCAL_LOGS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as SearchLogEntry[];
  } catch {
    return [];
  }
}

// Delete single log
export async function deleteSearchLog(id: string): Promise<void> {
  // Delete from local
  try {
    const logs = getLocalSearchLogs().filter((l) => l.id !== id);
    localStorage.setItem(LOCAL_LOGS_STORAGE_KEY, JSON.stringify(logs));
  } catch {}

  // Delete from Firestore
  try {
    const firestoreUrl = `${FIRESTORE_BASE_URL}/search_logs/${id}`;
    await fetch(firestoreUrl, { method: 'DELETE' });
  } catch {}
}

// Clear all logs
export async function clearAllSearchLogs(): Promise<void> {
  try {
    localStorage.removeItem(LOCAL_LOGS_STORAGE_KEY);
  } catch {}
}

// Initialize Google Analytics script
export function initFirebaseAnalyticsScript(): void {
  if (typeof window === 'undefined' || (window as any).__firebase_ga_initialized) return;
  (window as any).__firebase_ga_initialized = true;

  try {
    const script = document.createElement('script');
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${FIREBASE_CONFIG.measurementId}`;
    document.head.appendChild(script);

    const inline = document.createElement('script');
    inline.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${FIREBASE_CONFIG.measurementId}', {
        send_page_view: true
      });
    `;
    document.head.appendChild(inline);
  } catch (e) {
    console.warn('[Firebase Analytics] Script inject error:', e);
  }
}
