// Client-side submission throttle for the contact form.
//
// This is a courtesy guard, not a security control: it lives in the browser,
// so anyone determined can clear localStorage or edit the bundle around it.
// Its job is to stop honest double-clicks, impatient resubmits and casual
// spam from burning the EmailJS monthly quota.
//
// The authoritative limit is the account-level one in the EmailJS dashboard
// (Account -> Security -> rate limiting), which cannot be bypassed from here.

const STORAGE_KEY = 'acmw:contact-submissions';

const WINDOW_MS = 10 * 60 * 1000; // rolling window
const MAX_IN_WINDOW = 3; // sends allowed per window
const COOLDOWN_MS = 30 * 1000; // minimum gap between two sends

function readStamps(): number[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((value): value is number => typeof value === 'number');
  } catch {
    // Private mode, disabled storage, or corrupt JSON — fail open.
    return [];
  }
}

function writeStamps(stamps: number[]): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stamps));
  } catch {
    // Storage unavailable; the throttle just won't survive this page.
  }
}

/**
 * Milliseconds the user must wait before submitting again — 0 when a send is
 * allowed right now. Covers both the short gap between sends and the cap on
 * sends per rolling window.
 */
export function cooldownRemainingMs(): number {
  const now = Date.now();
  const recent = readStamps().filter((stamp) => now - stamp < WINDOW_MS);
  if (recent.length === 0) return 0;

  const sinceLast = now - Math.max(...recent);
  const gapRemaining = sinceLast < COOLDOWN_MS ? COOLDOWN_MS - sinceLast : 0;

  if (recent.length >= MAX_IN_WINDOW) {
    // Blocked until the oldest send falls out of the window.
    const windowRemaining = WINDOW_MS - (now - Math.min(...recent));
    return Math.max(gapRemaining, windowRemaining);
  }

  return gapRemaining;
}

/** Records a send attempt against the throttle. */
export function recordSubmission(): void {
  const now = Date.now();
  const recent = readStamps().filter((stamp) => now - stamp < WINDOW_MS);
  writeStamps([...recent, now]);
}
