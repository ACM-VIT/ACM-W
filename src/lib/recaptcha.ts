// Invisible reCAPTCHA v2 for the contact form.
//
// Why invisible and not the "I'm not a robot" checkbox: the form sits on the
// brown card inside the envelope, which lives in a `transform-style: preserve-3d`
// subtree that GSAP scales and rotates on scroll. An inline reCAPTCHA iframe
// would inherit that transform (rendering it skewed and mis-scaled), and its
// challenge popup — which is position:fixed — would resolve against the
// transformed ancestor instead of the viewport and land off-screen.
//
// The badge/challenge container is therefore appended straight to <body>,
// outside the 3D subtree, so Google's own fixed positioning behaves normally.

const SCRIPT_ID = 'grecaptcha-script';
const SCRIPT_SRC = 'https://www.google.com/recaptcha/api.js?render=explicit';

// Google's challenge can sit open indefinitely; give up rather than leave the
// submit button spinning forever.
const EXECUTE_TIMEOUT_MS = 90_000;

interface GrecaptchaRenderParams {
  sitekey: string;
  size: 'invisible';
  badge: 'bottomright' | 'bottomleft' | 'inline';
  callback: (token: string) => void;
  'error-callback': () => void;
  'expired-callback': () => void;
}

interface Grecaptcha {
  ready(callback: () => void): void;
  render(container: HTMLElement, params: GrecaptchaRenderParams): number;
  execute(widgetId: number): void;
  reset(widgetId: number): void;
}

declare global {
  interface Window {
    grecaptcha?: Grecaptcha;
  }
}

// Resolver for the in-flight execute() call. Only one can be outstanding at a
// time — the submit button is disabled while a send is running.
let settle: ((token: string | null, error?: Error) => void) | null = null;

let scriptPromise: Promise<void> | null = null;
let widgetPromise: Promise<number> | null = null;

function loadScript(): Promise<void> {
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(SCRIPT_ID);
    if (existing) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Let a later submit retry the load (flaky network, blocked once).
      scriptPromise = null;
      script.remove();
      reject(new Error('Failed to load reCAPTCHA'));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

function getWidget(siteKey: string): Promise<number> {
  if (widgetPromise) return widgetPromise;

  widgetPromise = loadScript()
    .then(
      () =>
        new Promise<number>((resolve, reject) => {
          const grecaptcha = window.grecaptcha;
          if (!grecaptcha) {
            reject(new Error('reCAPTCHA loaded but window.grecaptcha is missing'));
            return;
          }

          grecaptcha.ready(() => {
            // Anchored to <body>, deliberately outside the envelope's 3D subtree.
            const container = document.createElement('div');
            container.className = 'grecaptcha-anchor';
            document.body.appendChild(container);

            resolve(
              grecaptcha.render(container, {
                sitekey: siteKey,
                size: 'invisible',
                badge: 'bottomright',
                callback: (token) => settle?.(token),
                'error-callback': () => settle?.(null, new Error('reCAPTCHA check failed')),
                'expired-callback': () => settle?.(null, new Error('reCAPTCHA expired')),
              })
            );
          });
        })
    )
    .catch((err: unknown) => {
      // Don't cache the failure — the next submit gets a clean attempt.
      widgetPromise = null;
      throw err;
    });

  return widgetPromise;
}

/**
 * Runs the invisible reCAPTCHA challenge and resolves with the token to pass
 * to EmailJS as `g-recaptcha-response`. Rejects if the check fails, expires,
 * the script can't load, or the user leaves the challenge open too long.
 */
export async function executeRecaptcha(siteKey: string): Promise<string> {
  const widgetId = await getWidget(siteKey);
  const grecaptcha = window.grecaptcha!;

  return new Promise<string>((resolve, reject) => {
    const timer = setTimeout(() => {
      settle = null;
      reject(new Error('reCAPTCHA timed out'));
    }, EXECUTE_TIMEOUT_MS);

    settle = (token, error) => {
      clearTimeout(timer);
      settle = null;
      if (error || !token) {
        reject(error ?? new Error('reCAPTCHA returned no token'));
        return;
      }
      resolve(token);
    };

    // Tokens are single-use; clear the previous one before asking for another.
    grecaptcha.reset(widgetId);
    grecaptcha.execute(widgetId);
  });
}
