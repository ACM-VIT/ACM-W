import { useRef, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
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


gsap.registerPlugin(ScrollTrigger);

export default function EnvelopeFooter() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);
  const envelopeWrapperRef = useRef<HTMLDivElement>(null);

  // Front-face layer refs
  const envelopeInteriorRef = useRef<HTMLDivElement>(null);
  const brownCardRef = useRef<HTMLDivElement>(null);
  const envelopePocketRef = useRef<HTMLDivElement>(null);

  // Two-part flap refs
  const insideFlapRef = useRef<HTMLDivElement>(null);
  const outsideFlapRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
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
      !insideFlap || !outsideFlap
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
        x: 10,
      });

      // Envelope layers: hidden initially
      gsap.set(envelopeInterior, { opacity: 0 });
      gsap.set(envelopePocket, { opacity: 0 });

      // Inside flap: visible at upright position (rotateX: 0), but hidden
      // initially — will fade in with the envelope layers.
      // Hinge is at bottom center (CSS: transform-origin: bottom center).
      gsap.set(insideFlap, { transformOrigin: '50% 100%' });
      gsap.set(insideFlap, { opacity: 0, rotateX: 0 });

      // Outside flap: set pivot at base, then match insideFlap's
      // position so the handoff is seamless. Must have IDENTICAL
      // y, scale, z as insideFlap at the moment of the swap.
      gsap.set(outsideFlap, { transformOrigin: '50% 100%' });
      gsap.set(outsideFlap, {
        opacity: 0,
        rotateX: -90,
        y: -185,
        scale: 0.80,
        z: 1.2,
      });

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
          // rotateX: 15,
          rotateZ: +5,
          duration: 1.5,
          ease: 'power2.inOut',
          z: 1.1,
          x: -1,
        },
        2
      );

      // ======================================================
      // Step 4: Envelope appears — fade in layers (3.5 → 5)
      // Interior fades in first, then pocket, then inside flap
      // ======================================================
      tl.to(
        envelopeInterior,
        {
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          scale: 0.80,
          y: 40,
          z: 1,
        },
        3.5
      );

      tl.to(
        envelopePocket,
        {
          opacity: 1,
          duration: 1.2,
          ease: 'power2.out',
          scale: 1.6,
          z: 1.2,
        },
        3.7
      );

      // Inside flap fades in at the same time as envelope layers
      tl.to(
        insideFlap,
        {
          opacity: 1,
          duration: 0.8,
          ease: 'power2.out',
          y: -185,
          scale: 0.80,
          z: 1,

        },
        3.5
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
          x: -5,
          y: '25%',

          z: 1.1,
        },
        6
      );

      // ======================================================
      // Step 6: Close the flap — TWO-PART RELAY (8.5 → 11.5)
      //
      // Both flaps are upright triangles with transform-origin
      // at bottom center. They rotate around their base edge.
      //
      // Step A: insideFlap folds toward user from upright (0°) to flat (-90°)
      // Step B: outsideFlap takes over from flat (-90°) to closed (-180°)
      // ======================================================

      // Promote flap container to the front before the close starts
      const flapContainer = insideFlap.parentElement!;
      tl.set(flapContainer, { zIndex: 5, z: 15 }, 8.5);

      // Step A: Inside flap folds toward user from 0° → -90° (8.5 → 9.5)
      tl.to(
        insideFlap,
        {
          rotateX: -90,
          duration: 1.0,
          ease: 'power2.inOut',
          scale: 0.80,
        },
        8.5
      );

      // Overlapping handoff — both flaps are near edge-on here,
      // so briefly showing both is invisible. This eliminates
      // the single-frame glitch of an instant swap.
      tl.set(outsideFlap, { opacity: 1 }, 9.3);   // show outsideFlap early
      tl.set(insideFlap, { opacity: 0 }, 9.6);     // hide insideFlap late

      // Step B: Outside flap continues from -90° → -180° (9.5 → 10.5)
      tl.to(
        outsideFlap,
        {
          rotateX: -180,
          duration: 1.0,
          ease: 'power2.inOut',
          scale: 0.80,
          y: -190,
          z: 1.2,
          
        },
        9.5
      );

      // ======================================================
      // Step 8: Flip the entire envelope 180° (12 → 15)
      // Reveals the backside with social links.
      // Before flipping, collapse all layers to z:0 so they
      // appear as one flat piece when viewed from the side.
      // ======================================================

      // Collapse depth stack to sub-pixel increments before the flip.
      // Must preserve correct ordering (interior < card < pocket < flap)
      // but gaps are too small to see when viewed edge-on during rotateY.
      tl.set(envelopeInterior, { z: -0.3 }, 11.8);
      tl.set(brownCard, { z: 0 }, 11.8);
      tl.set(envelopePocket, { z: 0.3 }, 11.8);
      tl.set(flapContainer, { z: 0.5 }, 11.8);
      tl.set(outsideFlap, { z: 0.6 }, 11.8);

      tl.to(
        envelopeWrapper,
        {
          rotateY: 180,
          duration: 3,
          ease: 'power2.inOut',
        },
        12
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
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img src={githubIcon} alt="GitHub" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img src={facebookIcon} alt="Facebook" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img src={instaIcon} alt="Instagram" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
                    <img src={twitterIcon} alt="Twitter / X" className="back-face__social-icon" draggable={false} />
                  </a>
                  <a href="#" target="_blank" rel="noopener noreferrer">
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
