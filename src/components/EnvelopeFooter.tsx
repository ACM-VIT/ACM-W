import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './EnvelopeFooter.css';

// Assets from src/assets/footer/
import envelopeBacksideImg from '../assets/footer/envelopeBackside.png';
import envelopeInteriorImg from '../assets/footer/envelopeInterior.png';
import brownCardImg from '../assets/footer/brownCard.png';
import envelopePocketImg from '../assets/footer/envelopePocket.png';
import flapOnlyImg from '../assets/footer/flapOnly.png';

// Social icons
import heartIcon from '../assets/footer/heart.png';
import githubIcon from '../assets/footer/github.png';
import facebookIcon from '../assets/footer/facebook.png';
import instaIcon from '../assets/footer/insta.png';
import twitterIcon from '../assets/footer/twitter.png';
import linkedInIcon from '../assets/footer/linkedIn.png';
import ytIcon from '../assets/footer/yt.png';

gsap.registerPlugin(ScrollTrigger);

export default function EnvelopeFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const envelopeWrapperRef = useRef<HTMLDivElement>(null);

  // Front-face layer refs (z-index order: 2→5)
  const envelopeInteriorRef = useRef<HTMLDivElement>(null);
  const brownCardRef = useRef<HTMLDivElement>(null);
  const envelopePocketRef = useRef<HTMLDivElement>(null);
  const flapOnlyRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const section = sectionRef.current;
    const pinContainer = pinContainerRef.current;
    const envelopeWrapper = envelopeWrapperRef.current;
    const envelopeInterior = envelopeInteriorRef.current;
    const brownCard = brownCardRef.current;
    const envelopePocket = envelopePocketRef.current;
    const flapOnly = flapOnlyRef.current;

    if (
      !section || !pinContainer || !envelopeWrapper ||
      !envelopeInterior || !brownCard || !envelopePocket || !flapOnly
    ) return;

    const ctx = gsap.context(() => {
      // ---- Initial state setup ----

      // Brown card: centered horizontally (CSS handles translateX(-50%)),
      // positioned at vertical center. GSAP will control y for sliding.
      gsap.set(brownCard, {
        y: 0,
        scale: 1,
        rotateX: 0,
        rotateZ: 0,
      });

      // Envelope layers: hidden initially
      gsap.set(envelopeInterior, { opacity: 0 });
      gsap.set(envelopePocket, { opacity: 0 });

      // Flap: hidden, hinged open (rotated back 180°)
      gsap.set(flapOnly, { opacity: 0, rotateX: -180 });

      // Wrapper: no rotation yet
      gsap.set(envelopeWrapper, { rotateY: 0 });

      // ---- Master ScrollTrigger timeline ----
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1.5,
          pin: pinContainer,
          pinSpacing: false,
          anticipatePin: 1,
        },
      });

      // ======================================================
      // Step 1 & 2: Zoom in on the brown card (0 → 2)
      // ======================================================
      tl.to(
        brownCard,
        {
          scale: 1.1,
          duration: 2,
          ease: 'power2.inOut',
        },
        0
      );

      // ======================================================
      // Step 3: First tilt — card tilts backward in 3D (2 → 3.5)
      // ======================================================
      tl.to(
        brownCard,
        {
          rotateX: 15,
          rotateZ: -2,
          duration: 1.5,
          ease: 'power2.inOut',
        },
        2
      );

      // ======================================================
      // Step 4: Envelope appears — fade in layers (3.5 → 5)
      // Interior fades in first, then pocket, then flap
      // ======================================================
      tl.to(
        envelopeInterior,
        {
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
        },
        3.5
      );

      tl.to(
        envelopePocket,
        {
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
        },
        3.7
      );

      tl.to(
        flapOnly,
        {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
        },
        4.0
      );

      // ======================================================
      // Step 5A: The Tilt — card tilts counter-clockwise as if
      // held diagonally before being dropped in (5 → 6)
      // ======================================================
      tl.to(
        brownCard,
        {
          rotation: -12,
          rotateX: 15,
          scale: 0.95,
          duration: 1,
          ease: 'power2.inOut',
        },
        5
      );

      // ======================================================
      // Step 5B: Slide & Straighten — card drops into the pocket
      // while simultaneously rotating back to 0. Both y and
      // rotation animate together for a natural "slot in" feel.
      // ======================================================
      tl.to(
        brownCard,
        {
          y: '65%',
          rotation: 0,
          rotateX: 0,
          scale: 0.75,
          duration: 2,
          ease: 'power2.inOut',
        },
        6
      );

      // ======================================================
      // Step 6: Close the top flap (8.5 → 10)
      // CSS translateZ(15px) keeps the flap above the pocket.
      // Do NOT animate z here — let CSS handle the depth.
      // ======================================================
      tl.to(
        flapOnly,
        {
          rotateX: 0,
          duration: 1.5,
          ease: 'power2.inOut',
        },
        8.5
      );

      // ======================================================
      // Step 8: Flip the entire envelope 180° (10 → 13)
      // Reveals the backside with social links.
      // ======================================================
      tl.to(
        envelopeWrapper,
        {
          rotateY: 180,
          duration: 3,
          ease: 'power2.inOut',
        },
        10
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="scroll-section" id="contact">
      <div ref={pinContainerRef} className="scroll-section__pin-container">
        <div className="scene">
          <div ref={envelopeWrapperRef} className="envelope-wrapper">

            {/* ========== FRONT FACE ========== */}
            <div className="front-face">

              {/* Z-2: Tan interior back wall */}
              <div ref={envelopeInteriorRef} className="envelope-interior">
                <img src={envelopeInteriorImg} alt="Envelope interior" draggable={false} />
              </div>

              {/* Z-3: Brown contact card */}
              <div ref={brownCardRef} className="brown-card">
                <img src={brownCardImg} alt="Contact card" draggable={false} />
              </div>

              {/* Z-4: Front red pocket */}
              <div ref={envelopePocketRef} className="envelope-pocket">
                <img src={envelopePocketImg} alt="Envelope pocket" draggable={false} />
              </div>

              {/* Z-5: Top flap (cropped height) */}
              <div ref={flapOnlyRef} className="flap-only">
                <img src={flapOnlyImg} alt="Envelope flap" draggable={false} />
              </div>

            </div>

            {/* ========== BACK FACE ========== */}
            <div className="envelope-backside">
              <div className="back-face__content">
                <p className="back-face__text">
                  Made with{' '}
                  <img
                    src={heartIcon}
                    alt="love"
                    className="back-face__heart"
                  />{' '}
                  by
                  <br />
                  ACM-W VIT
                </p>
                <div className="back-face__socials">
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                    <img src={githubIcon} alt="GitHub" />
                  </a>
                  <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook">
                    <img src={facebookIcon} alt="Facebook" />
                  </a>
                  <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                    <img src={instaIcon} alt="Instagram" />
                  </a>
                  <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" aria-label="Twitter">
                    <img src={twitterIcon} alt="Twitter" />
                  </a>
                  <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                    <img src={linkedInIcon} alt="LinkedIn" />
                  </a>
                  <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
                    <img src={ytIcon} alt="YouTube" />
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
