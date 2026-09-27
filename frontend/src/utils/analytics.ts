/**
 * BhoomiStack Analytics (Item 19)
 * Lightweight analytics integration that:
 * - Respects cookie consent preferences (DPDPA compliant)
 * - Supports Google Analytics 4 via gtag.js (loaded only if user consented)
 * - Falls back to console logging in development
 */

const CONSENT_KEY = 'bhoomi_cookie_consent';
const GA_MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID || '';

/** Returns true if the user has consented to analytics cookies */
function hasAnalyticsConsent(): boolean {
  try {
    const raw = localStorage.getItem(CONSENT_KEY);
    if (!raw) return false;
    const consent = JSON.parse(raw);
    return consent.analytics === true;
  } catch {
    return false;
  }
}

/** Injects the GA4 gtag script only if not already loaded */
function injectGA(): void {
  if (!GA_MEASUREMENT_ID) return;
  if (document.getElementById('ga-script')) return; // already loaded

  const script = document.createElement('script');
  script.id = 'ga-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);

  // @ts-ignore
  window.dataLayer = window.dataLayer || [];
  // @ts-ignore
  function gtag(...args: unknown[]) { window.dataLayer.push(args); }
  // @ts-ignore
  window.gtag = gtag;
  // @ts-ignore
  gtag('js', new Date());
  // @ts-ignore
  gtag('config', GA_MEASUREMENT_ID, {
    anonymize_ip: true,         // DPDPA compliance
    cookie_flags: 'SameSite=Lax;Secure',
  });
}

/** Initialize analytics — call once at app startup */
export function initAnalytics(): void {
  if (!hasAnalyticsConsent()) return;
  injectGA();
}

/** Track a page view (call on route changes) */
export function trackPageView(path: string, title?: string): void {
  if (!hasAnalyticsConsent()) return;

  if (import.meta.env.DEV) {
    console.debug('[Analytics] Page view:', path, title);
    return;
  }

  // @ts-ignore
  if (typeof window.gtag === 'function' && GA_MEASUREMENT_ID) {
    // @ts-ignore
    window.gtag('config', GA_MEASUREMENT_ID, {
      page_path: path,
      page_title: title,
    });
  }
}

/** Track a custom event */
export function trackEvent(
  eventName: string,
  params?: Record<string, string | number | boolean>
): void {
  if (!hasAnalyticsConsent()) return;

  if (import.meta.env.DEV) {
    console.debug('[Analytics] Event:', eventName, params);
    return;
  }

  // @ts-ignore
  if (typeof window.gtag === 'function') {
    // @ts-ignore
    window.gtag('event', eventName, params);
  }
}
