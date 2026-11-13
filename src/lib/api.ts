/**
 * Resolves API endpoints for both web/dev server and standalone native Android APK (Capacitor).
 * Inside a native Android APK, assets are served locally from https://localhost (no port) or capacitor://localhost,
 * so API calls are routed to the live backend server while preserving full offline fallback.
 */

const DEFAULT_REMOTE_API_BASE =
  "https://ais-pre-pw2i2xpjudxe5rj24gkpcp-61140896518.us-west1.run.app";

export function getApiBaseUrl(): string {
  const configured = (import.meta as any).env?.VITE_API_BASE_URL;
  if (configured) {
    return String(configured).replace(/\/+$/, "");
  }

  if (typeof window !== "undefined") {
    const win = window as any;
    const isCapacitorNative =
      Boolean(win.Capacitor?.isNativePlatform?.()) ||
      window.location.protocol === "capacitor:" ||
      window.location.protocol === "file:" ||
      (window.location.hostname === "localhost" && !window.location.port);

    if (isCapacitorNative) {
      return DEFAULT_REMOTE_API_BASE;
    }
  }

  return "";
}

export function apiUrl(path: string): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const base = getApiBaseUrl();
  return base ? `${base}${normalizedPath}` : normalizedPath;
}
