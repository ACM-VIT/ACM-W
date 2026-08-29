import { useRef, useEffect, useState, type FormEvent } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { cooldownRemainingMs } from '../lib/rateLimit';
import './EnvelopeFooter.css';

// Assets from src/assets/footer/
import envelopeBacksideImg from '../assets/footer/envelopeBackside.png';
import envelopeInteriorImg from '../assets/footer/envelopeInterior.png';
import brownCardImg from '../assets/footer/brownCard.png';
import envelopePocketImg from '../assets/footer/envelopePocket.png';

// Two-part flap assets (both are upright triangles pointing UP)
import insideFlapImg from '../assets/footer/insideFlap.png';
import outsideFlapImg from '../assets/footer/outsideFlap.png';

// Social media icons & heart
import heartImg from '../assets/footer/heart.png';
import githubIcon from '../assets/footer/github.png';
import facebookIcon from '../assets/footer/facebook.png';
import instaIcon from '../assets/footer/insta.png';
import twitterIcon from '../assets/footer/twitter.png';
import linkedInIcon from '../assets/footer/linkedIn.png';
import ytIcon from '../assets/footer/yt.png';

// Feather cursor — recolored at runtime for the envelope hover
import featherCursorImg from '../assets/feather-cursor.png';


gsap.registerPlugin(ScrollTrigger);

export default function EnvelopeFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);

  // Contact form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  type FormStatus = 'idle' | 'loading' | 'success' | 'error' | 'throttled';
  const [status, setStatus] = useState<FormStatus>('idle');
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    phone: '',
  });

  const validateEmail = (value: string) => {
    const trimmed = value.trim();
    if (!trimmed) return 'Email is required.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    return emailRegex.test(trimmed) ? '' : 'Enter a valid email address, including a domain like .com.';
  };

  const validatePhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (!digits) return 'Phone number is required.';
    const phoneRegex = /^(?:\+?\d{10}|\+?\d{11,15})$/;
    return phoneRegex.test(digits) ? '' : 'Enter a valid phone number with 10 digits or international format.';
  };

  // Seconds left on the throttle, surfaced on the submit button.
  const [retryIn, setRetryIn] = useState(0);

  // Tick the throttle down and release the button when it expires.
  useEffect(() => {
    if (status !== 'throttled') return;

    const tick = () => {
      const remaining = cooldownRemainingMs();
      if (remaining <= 0) {
        setRetryIn(0);
        setStatus('idle');
        return;
      }
      setRetryIn(Math.ceil(remaining / 1000));
    };

    const id = setInterval(tick, 500);
    return () => clearInterval(id);
  }, [status]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'loading') return;

    // Throttle first — a blocked submit shouldn't spend a reCAPTCHA check.
    const wait = cooldownRemainingMs();
    if (wait > 0) {
      setRetryIn(Math.ceil(wait / 1000));
      setStatus('throttled');
      return;
    }

    const emailError = validateEmail(formData.email);
    const phoneError = validatePhone(formData.phone);
    const nextErrors = {
      email: emailError,
      phone: phoneError,
    };

    setFieldErrors(nextErrors);

    if (emailError || phoneError) {
      setStatus('error');
      return;
    }

    setStatus('loading');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email.trim(),
          phone: formData.phone.replace(/\D/g, ''),
          message: formData.message,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}`);
      }

      setStatus('success');
    } catch (err: unknown) {
      console.error('Form submission error:', err);
      if (err instanceof Error) {
        console.error('Error message:', err.message);
      }
      setStatus('error');
    }

  };

  const handleChange = (field: string, value: string) => {
    const nextValue = field === 'phone' ? value.replace(/\D/g, '') : value;
    setFormData((prev) => ({ ...prev, [field]: nextValue }));

    if (field === 'email') {
      setFieldErrors((prev) => ({ ...prev, email: validateEmail(nextValue) }));
    }

    if (field === 'phone') {
      setFieldErrors((prev) => ({ ...prev, phone: validatePhone(nextValue) }));
    }

    if (status === 'error') {
      setStatus('idle');
    }
  };
  const envelopeWrapperRef = useRef<HTMLDivElement>(null);
  const envelopeShellRef = useRef<HTMLDivElement>(null);

  // Front-face layer refs
  const envelopeInteriorRef = useRef<HTMLDivElement>(null);
  const brownCardRef = useRef<HTMLDivElement>(null);
  const envelopePocketRef = useRef<HTMLDivElement>(null);

  // Two-part flap refs
  const insideFlapRef = useRef<HTMLDivElement>(null);
  const outsideFlapRef = useRef<HTMLDivElement>(null);

  // ---- Light cursor on envelope hover ----
  // The site-wide cursor is a dark feather PNG. When hovering over the
  // envelope asset itself (not the section background), we swap to a
  // #FFF9E9 recolored version. Built at runtime from the same source
  // PNG using canvas — zero extra assets needed.
  useEffect(() => {
    let style: HTMLStyleElement | null = null;
    let cancelled = false;

    const img = new Image();
    img.src = featherCursorImg;
    img.onload = () => {
      // Guard: if the component unmounted (or HMR replaced it) while
      // the image was loading, bail out so we don't leak a stale
      // <style> into document.head.
      if (cancelled) return;

      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d')!;

      // Draw the original dark feather
      ctx.drawImage(img, 0, 0);

      // Recolor: 'source-in' replaces RGB of existing pixels
      // while preserving their original alpha channel.
      ctx.globalCompositeOperation = 'source-in';
      ctx.fillStyle = '#FFF9E9';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const dataUrl = canvas.toDataURL('image/png');

      // Inject a scoped style — targets only the envelope wrapper
      // and its children. The cursor reverts automatically when
      // the mouse leaves because parent elements keep the dark cursor.
      style = document.createElement('style');
      style.textContent = `
        .envelope-wrapper,
        .envelope-wrapper * {
          cursor: url("${dataUrl}") 4 4, auto !important;
        }
      `;
      document.head.appendChild(style);
    };

    return () => {
      cancelled = true;
      if (style?.parentNode) style.parentNode.removeChild(style);
    };
  }, []);

  // Build the scroll-driven timeline on mount. The envelope's in-flow image
  // (.envelope-interior) and the contact card reserve their aspect-ratio in
  // CSS, so the wrapper has its true height before any image has loaded and
  // ScrollTrigger measures the right thing straight away — no deferred init,
  // no mid-scroll ScrollTrigger.refresh() reflowing the page.
  useEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    const envelopeWrapper = envelopeWrapperRef.current;
    const envelopeInterior = envelopeInteriorRef.current;
    const brownCard = brownCardRef.current;
    const envelopePocket = envelopePocketRef.current;
    const insideFlap = insideFlapRef.current;
    const outsideFlap = outsideFlapRef.current;

    if (
      !section || !pinContainer || !envelopeWrapper ||
      !envelopeInterior || !brownCard || !envelopePocket ||
      !insideFlap || !outsideFlap || !envelopeShellRef.current
    ) return;

    const envelopeShell = envelopeShellRef.current;

    const ctx = gsap.context(() => {
      // ---- Responsive value scaling ----
      // The animation was designed for a 600px-wide envelope. On mobile
      // the wrapper is ~300px, so all pixel-based GSAP values must scale
      // proportionally. We compute a ratio once at init time.
      const wrapperWidth = envelopeWrapper.getBoundingClientRect().width || 600;
      const r = wrapperWidth / 600; // 1.0 on desktop, ~0.5 on mobile

      // ---- Initial state setup ----

      // Brown card: starts enlarged (scale 1.4) so the user can
      // comfortably fill the form. Shrinks to 1 as the first scroll step.
      gsap.set(brownCard, {
        y: 0,
        scale: 1.4,
        rotateX: 0,
        rotateZ: 0,
        x: 10 * r,
        z: 1.05,
      });

      // ---- Envelope shell: hidden off-screen below ----
      // The shell wraps interior, pocket, and flap. All layers are
      // pre-positioned at their final resting transforms inside the
      // shell. The shell itself handles visibility — when it slides
      // up, everything appears together as one cohesive unit.
      gsap.set(envelopeShell, { y: '100%', visibility: 'hidden' });

      // Envelope layers: pre-positioned at resting layout.
      // No individual opacity:0 needed — the shell hides them.
      gsap.set(envelopeInterior, {
        scale: 0.80,
        y: 40 * r,
        z: 1,
      });
      gsap.set(envelopePocket, {
        scale: 1.6,
        z: 1.2,
      });

      // Inside flap: pre-positioned at resting state.
      // Hinge is at bottom center (CSS: transform-origin: bottom center).
      gsap.set(insideFlap, { transformOrigin: '50% 100%' });
      gsap.set(insideFlap, {
        rotateX: 0,
        y: -185 * r,
        scale: 0.80,
        z: 1,
      });

      // Outside flap: set pivot at base, then match insideFlap's
      // position so the handoff is seamless. Must have IDENTICAL
      // y, scale, z as insideFlap at the moment of the swap.
      // Keeps its own opacity: 0 — only revealed during flap relay.
      gsap.set(outsideFlap, { transformOrigin: '50% 100%' });
      gsap.set(outsideFlap, {
        opacity: 0,
        rotateX: -90,
        y: -185 * r,
        scale: 0.80,
        z: 1.2,
      });

      // Wrapper: no rotation yet
      gsap.set(envelopeWrapper, { rotateY: 0 });

      // ---- Master ScrollTrigger timeline ----
      // The container is `position: sticky` (see .scroll-section__pin-container)
      // so it stays on screen natively for the 600vh of the section; this
      // trigger only scrubs the timeline against that scroll range.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 0.8,
        },
      });

      // ======================================================
      // Step 0: SHRINK — Card scales from 1.4 → 1 (0 → 1.5)
      // Gives the user a large form to fill, then shrinks
      // to envelope-size before the rest of the sequence.
      // ======================================================
      tl.to(
        brownCard,
        {
          scale: 1,
          duration: 1.5,
          ease: 'power2.out',
        },
        0
      );

      // ======================================================
      // Step 1 & 2: Zoom in on the brown card (1.5 → 3.5)
      // ======================================================
      tl.to(
        brownCard,
        {
          scale: 1.1,
          duration: 2,
          ease: 'power2.inOut',

        },
        1.5
      );

      // ======================================================
      // Step 3: First tilt — card tilts backward in 3D (3.5 → 5)
      // ======================================================
      tl.to(
        brownCard,
        {
          // rotateX: 15,
          rotateZ: +5,
          duration: 1.5,
          ease: 'power2.inOut',
          z: 1.1,
          x: -1 * r,
        },
        3.5
      );

      // ======================================================
      // Step 4: Envelope appears — SYNCHRONIZED SLIDE-IN (5 → 6.5)
      // The envelope shell slides up from off-screen as a single
      // cohesive unit. All layers (interior, pocket, flap) are
      // pre-positioned inside — no staggered individual tweens.
      // The brown card is NOT inside the shell, so it is unaffected.
      //
      // NOTE: We use visibility (not opacity) to hide the shell.
      // opacity < 1 breaks preserve-3d, flattening all children
      // to z=0 and destroying the card's z-sandwich layering.
      // ======================================================
      tl.set(envelopeShell, { visibility: 'visible' }, 5);
      tl.to(
        envelopeShell,
        {
          y: 0,
          duration: 1.5,
          ease: 'power2.out',
        },
        5
      );

      // ======================================================
      // Step 5B: Slide & Straighten — card drops into the pocket
      // (keeping exact existing brownCard animation)
      // ======================================================
      tl.to(
        brownCard,
        {
          rotation: 0,
          rotateX: 0,
          scale: 1,
          duration: 2,
          ease: 'power2.inOut',
          x: -5 * r,
          y: '25%',

          z: 1.1,
        },
        7.5
      );

      // ======================================================
      // Step 6: Close the flap — TWO-PART RELAY (10 → 13)
      //
      // Both flaps are upright triangles with transform-origin
      // at bottom center. They rotate around their base edge.
      //
      // Step A: insideFlap folds toward user from upright (0°) to flat (-90°)
      // Step B: outsideFlap takes over from flat (-90°) to closed (-180°)
      // ======================================================

      // Promote flap container to the front before the close starts
      const flapContainer = insideFlap.parentElement!;
      tl.set(flapContainer, { zIndex: 5, z: 15 }, 10);

      // Step A: Inside flap folds toward user from 0° → -90° (10 → 11)
      tl.to(
        insideFlap,
        {
          rotateX: -90,
          duration: 1.0,
          ease: 'power2.inOut',
          scale: 0.80,

        },
        10
      );

      // Overlapping handoff — both flaps are near edge-on here,
      // so briefly showing both is invisible. This eliminates
      // the single-frame glitch of an instant swap.
      tl.set(outsideFlap, { opacity: 1 }, 10.8);   // show outsideFlap early
      tl.set(insideFlap, { opacity: 0 }, 11.1);     // hide insideFlap late

      // Step B: Outside flap continues from -90° → -180° (11 → 12)
      tl.to(
        outsideFlap,
        {
          rotateX: -180,
          duration: 1.0,
          ease: 'power2.inOut',
          scale: 0.80,
          y: -190 * r,
          z: 1.2,

        },
        11
      );

      // ======================================================
      // Step 8: Flip the entire envelope 180° (13.5 → 16.5)
      // Reveals the backside with social links.
      // Before flipping, collapse all layers to z:0 so they
      // appear as one flat piece when viewed from the side.
      // ======================================================

      // Collapse depth stack to sub-pixel increments before the flip.
      // Must preserve correct ordering (interior < card < pocket < flap)
      // but gaps are too small to see when viewed edge-on during rotateY.
      tl.set(envelopeInterior, { z: -0.3 }, 13.3);
      tl.set(brownCard, { z: 0 }, 13.3);
      tl.set(envelopePocket, { z: 0.3 }, 13.3);
      tl.set(flapContainer, { z: 0.5 }, 13.3);
      tl.set(outsideFlap, { z: 0.6 }, 13.3);

      tl.to(
        envelopeWrapper,
        {
          rotateY: 180,
          duration: 3,
          ease: 'power2.inOut',
        },
        13.5
      );
    }, section);

    return () => {
      ctx.revert();
    };
  }, []);

  return (
    <section ref={sectionRef} className="scroll-section" id="contact">
      <div ref={pinContainerRef} className="scroll-section__pin-container">
        <div className="scene">
          <div ref={envelopeWrapperRef} className="envelope-wrapper">

            {/* ========== FRONT FACE ========== */}
            <div className="front-face">

              {/* Z-3: Brown contact card — lives directly in front-face,
                  NOT inside the envelope-shell, so its animations
                  (shrink, zoom, tilt) are completely independent. */}
              <div ref={brownCardRef} className="brown-card">
                <img src={brownCardImg} alt="Contact card" className="brown-card__bg" draggable={false} />
                <form className="brown-card__form" onSubmit={handleSubmit}>
                  <h2 className="brown-card__heading">CONTACT US</h2>

                  <div className="brown-card__field">
                    <div className="brown-card__field-row">
                      <label className="brown-card__label" htmlFor="contact-name">Name:</label>
                      <input
                        id="contact-name"
                        className="brown-card__input"
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="brown-card__field">
                    <div className="brown-card__field-row">
                      <label className="brown-card__label" htmlFor="contact-email">E-mail:</label>
                      <input
                        id="contact-email"
                        className="brown-card__input"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleChange('email', e.target.value)}
                        required
                      />
                    </div>
                    {fieldErrors.email && (
                      <p className="brown-card__field-error">{fieldErrors.email}</p>
                    )}
                  </div>

                  <div className="brown-card__field">
                    <div className="brown-card__field-row">
                      <label className="brown-card__label" htmlFor="contact-phone">Phone:</label>
                      <input
                        id="contact-phone"
                        className="brown-card__input"
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9+]*"
                        value={formData.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                      />
                    </div>
                    {fieldErrors.phone && (
                      <p className="brown-card__field-error">{fieldErrors.phone}</p>
                    )}
                  </div>

                  <div className="brown-card__field">
                    <label className="brown-card__label" htmlFor="contact-message">Message:</label>
                    <textarea
                      id="contact-message"
                      className="brown-card__input brown-card__textarea"
                      value={formData.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      rows={2}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className={`brown-card__submit brown-card__submit--${status}`}
                    disabled={status === 'loading' || status === 'throttled'}
                  >
                    {status === 'loading' && 'Sending…'}
                    {status === 'success' && 'thank you'}
                    {status === 'error' && 'Try again'}
                    {status === 'throttled' && `Wait ${retryIn}s`}
                    {status === 'idle' && 'Submit'}
                  </button>
                </form>
              </div>

              {/* Envelope shell — wraps all visual envelope layers.
                  Animated as a single unit via translateY for the
                  synchronized slide-in. Brown card is NOT inside. */}
              <div ref={envelopeShellRef} className="envelope-shell">

                {/* Z-2: Tan interior back wall */}
                <div ref={envelopeInteriorRef} className="envelope-interior">
                  <img src={envelopeInteriorImg} alt="Envelope interior" draggable={false} />
                </div>

                {/* Z-4: Front red pocket */}
                <div ref={envelopePocketRef} className="envelope-pocket">
                  <img src={envelopePocketImg} alt="Envelope pocket" draggable={false} />
                </div>

                {/* Z-5: Two-part flap — both sit in same 3D space,
                    stacked on top of each other. insideFlap shows first,
                    outsideFlap takes over at the 90° handoff. */}
                <div className="flap-container">
                  <div ref={insideFlapRef} className="inside-flap">
                    <img src={insideFlapImg} alt="Envelope flap inside" draggable={false} />
                  </div>
                  <div ref={outsideFlapRef} className="outside-flap">
                    <img src={outsideFlapImg} alt="Envelope flap outside" draggable={false} />
                  </div>
                </div>

              </div>

            </div>

            {/* ========== BACK FACE ========== */}
            <div className="envelope-backside">
              <img
                src={envelopeBacksideImg}
                alt="Envelope backside"
                className="back-face__img"
                draggable={false}
              />

              {/* Content overlay — sits on top of the backside image */}
              <div className="back-face__content">
                <div className="back-face__text-block">
                  <div className="back-face__text-row">
                    <span className="back-face__text">Made with</span>
                    <img
                      src={heartImg}
                      alt="heart"
                      className="back-face__heart"
                      draggable={false}
                    />
                    <span className="back-face__text">by</span>
                  </div>
                  <span className="back-face__text back-face__text--org">ACM-W VIT</span>
                </div>

                <div className="back-face__social-row">
                  <a href="https://github.com/ACM-VIT" target="_blank" rel="noopener noreferrer">
                    <img src={githubIcon} alt="GitHub" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="https://www.facebook.com/acmvitvellore/" target="_blank" rel="noopener noreferrer">
                    <img src={facebookIcon} alt="Facebook" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="https://www.instagram.com/acmwvit/" target="_blank" rel="noopener noreferrer">
                    <img src={instaIcon} alt="Instagram" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img src={twitterIcon} alt="Twitter / X" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="https://www.linkedin.com/company/acmw-vit/?originalSubdomain=in" target="_blank" rel="noopener noreferrer">
                    <img src={linkedInIcon} alt="LinkedIn" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img src={ytIcon} alt="YouTube" className="back-face__social-icon" draggable={false} />
                  </a>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
