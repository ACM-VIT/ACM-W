import { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// Import all SVG assets
import closedEnv from './assets/closed.svg';
import openEnv from './assets/open.svg';
import contributorsImg from './assets/contributors.svg';
import aboutAcmwImg from './assets/aboutacmw.svg';
import aboutAcmImg from './assets/abtacm.svg';
import blogsImg from './assets/blogs.svg';
import womenInStemImg from './assets/womeninstem.svg';
import teamImg from './assets/team.svg';

const cards = [
  { id: 1, img: contributorsImg, alt: 'Contributors stamp', link: '#contributors', x: "0%", y: "-117%" },
  { id: 2, img: aboutAcmwImg, alt: 'About ACM-W stamp', link: '#about', x: "84%", y: "-55%" },
  { id: 3, img: aboutAcmImg, alt: 'About ACM stamp', link: '#about-acm', x: "84%", y: "70%" },
  { id: 4, img: blogsImg, alt: 'Blogs stamp', link: '#blogs', x: "0%", y: "133%" },
  { id: 5, img: womenInStemImg, alt: 'Women in STEM stamp', link: '#title-card-section', x: "-84%", y: "70%" },
  { id: 6, img: teamImg, alt: 'Team stamp', link: '#team', x: "-84%", y: "-55%" },
];

// Timing for a single stamp's journey out of the envelope (seconds).
const PULL = 0.12; // slides up out of the pocket
const LIFT = 0.08; // keeps climbing the line while the next one is pulled
const THROW = 0.26; // flung from the top of the line to its final spot
const GAP = 0.06; // delay between successive pull-outs — small enough that the
//                   stamps read as one continuous strip being drawn out

// Which way a stamp flicks as it leaves the line, based on where it's headed.
const tiltFor = (card: (typeof cards)[number], i: number) => {
  const x = parseFloat(card.x);
  if (x > 0) return 13;
  if (x < 0) return -13;
  return i === 0 ? -7 : 7; // straight up / straight down: just a nudge
};

export default function EnvelopeMenu() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Resting state: stacked inside the pocket, hidden behind the envelope front.
      gsap.set('.nav-card', { x: 0, y: '18%', scale: 0.28, rotate: 0, opacity: 0 });

      const timeline = gsap.timeline({ paused: true })
        // 1. Shift the entire envelope group DOWN when hovering so cards make way on top
        .to('.menu-group', { yPercent: 83, duration: 0.15, ease: 'power2.out' }, 0)
        // 2. Crossfade the envelope
        .to('.closed-env', { opacity: 0, duration: 0.05 }, 0)
        .to('.open-env', { opacity: 1, duration: 0.05 }, 0);

      // 3. Each stamp is drawn out of the slot on its own offset, so at any given
      //    moment they're strung out along the same vertical path — one line, one
      //    by one — rather than all blooming outward at once.
      cards.forEach((card, i) => {
        const el = `.nav-card-${card.id}`;
        const out = 0.05 + i * GAP; // this stamp starts leaving the slot
        const fling = out + PULL + LIFT; // ...and reaches the top of the line here
        const tilt = tiltFor(card, i);

        timeline
          // Snap visible rather than fade: it should look like it clears the paper,
          // not materialise. Short enough to hide any gap in the envelope artwork.
          .to(el, { opacity: 1, duration: 0.04, ease: 'none' }, out)
          .to(el, { y: '-38%', scale: 0.5, duration: PULL, ease: 'power2.out' }, out)
          // Coast up the line, tilting into the direction it's about to be thrown.
          .to(el, {
            y: '-80%',
            x: i % 2 ? '5%' : '-5%',
            scale: 0.62,
            rotate: tilt,
            duration: LIFT,
            ease: 'none',
          }, out + PULL)
          // The throw. x and y run on different eases so the stamp travels an arc
          // instead of a straight diagonal, and the tilt settles out as it lands.
          .to(el, { x: card.x, duration: THROW, ease: 'power2.out' }, fling)
          .to(el, { y: card.y, duration: THROW, ease: 'power1.inOut' }, fling)
          .to(el, { scale: 1, duration: THROW, ease: 'power2.out' }, fling)
          .to(el, { rotate: 0, duration: THROW * 1.15, ease: 'power3.out' }, fling);
      });

      tl.current = timeline;
    }, containerRef);

    return () => ctx.revert();
  }, []);

  useLayoutEffect(() => {
    if (isHovered) {
      tl.current?.play();
    } else {
      tl.current?.reverse();
    }
  }, [isHovered]);

  return (
    <div className="flex items-center justify-center overflow-visible">
      {/* We give it a generous relative wrapper so the hover hit-box covers the cards too */}
      <div
        ref={containerRef}
        className="relative aspect-square w-[clamp(9rem,18vw,12rem)]"
        onPointerEnter={(e) => {
          if (e.pointerType !== 'touch') {
            setIsHovered(true);
          }
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== 'touch') {
            setIsHovered(false);
          }
        }}
        onFocus={() => setIsHovered(true)}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setIsHovered(false);
          }
        }}
      >
        {/* h-full is load-bearing: menu-group and the cards are sized in
            percentages, which collapse to 0 against an auto-height parent */}
        <div className="absolute top-0 left-0 h-full w-full flex justify-center">
          <div className="menu-group relative flex h-1/4 w-1/3 items-center justify-center z-50">
            <button
              type="button"
              aria-expanded={isHovered}
              aria-label={isHovered ? 'Close envelope menu' : 'Open envelope menu'}
              className="absolute inset-0 z-40 flex items-center justify-center cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              onClick={() => setIsHovered((prev) => !prev)}
            >
              {/* The Closed Envelope */}
              <div className="closed-env absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
                <img src={closedEnv} alt="" className="w-[120%] h-[120%] object-contain drop-shadow-md" />
              </div>

              {/* The Open Envelope */}
              <div className="open-env absolute inset-0 z-10 opacity-0 pointer-events-none flex items-center justify-center">
                <img src={openEnv} alt="" className="w-[120%] h-[120%] object-contain drop-shadow-md" />
              </div>
            </button>

            {/* The Cards/Stamps */}
            {cards.map((card, i) => (
              <a
                key={card.id}
                href={card.link}
                // First stamp out leads the line, so it has to sit on top of the
                // ones still behind it. Stays under the envelope art (z-10/z-30).
                style={{ zIndex: cards.length - i }}
                onClick={(e) => {
                  const target = document.querySelector(card.link);
                  if (target) {
                    e.preventDefault();

                    // For women-in-stem: pre-show the globe BEFORE scrolling so
                    // Three.js renders frames during the animation instead of
                    // only appearing after landing (which caused the load delay).
                    if (card.link === '#women-in-stem') {
                      const globeEl = document.querySelector('.globe-fixed-container') as HTMLElement | null;
                      if (globeEl) {
                        globeEl.style.visibility = 'visible';
                        globeEl.style.pointerEvents = 'none';
                      }
                    }

                    // TitleCard reveals via a ScrollTrigger onEnter that only
                    // fires once the scroll crosses PAST its pin start; landing
                    // exactly on the start leaves its content at opacity 0 (a
                    // blank screen). Land a hair past it so the reveal plays.
                    const pastPinStart = card.link === '#title-card-section' ? 24 : 0;
                    const top =
                      target.getBoundingClientRect().top + window.scrollY + pastPinStart;
                    window.scrollTo({ top, behavior: 'smooth' });

                    // After the smooth scroll settles, force ScrollTrigger to
                    // re-evaluate all scroll-position callbacks (e.g. globe hide/show).
                    const refreshAfterScroll = () => {
                      ScrollTrigger.refresh();

                      // ScrollTrigger's onRefresh uses end:"max" so it reports
                      // isActive=true for any scroll position past women-in-stem,
                      // which would wrongly show the globe on Team/Contributors.
                      // Override it immediately after refresh (synchronous, so this
                      // runs after all onRefresh callbacks have fired).
                      const globeEl = document.querySelector('.globe-fixed-container') as HTMLElement | null;
                      if (globeEl && card.link !== '#women-in-stem') {
                        globeEl.style.visibility = 'hidden';
                        globeEl.style.pointerEvents = 'none';
                      }
                    };

                    if ('onscrollend' in window) {
                      // Modern browsers: wait for scroll to fully stop
                      window.addEventListener('scrollend', refreshAfterScroll, { once: true });
                    } else {
                      // Fallback: give the smooth scroll ~600ms to land
                      setTimeout(refreshAfterScroll, 600);
                    }
                  }
                }}
                // No transition-* here: GSAP writes `transform` every frame, and a
                // CSS transition on it damps the whole animation into a lag. The
                // hover scale lives on the img instead, which GSAP never touches.
                className={`nav-card nav-card-${card.id} group absolute flex h-[133.33%] w-[150%] flex-col items-center justify-center origin-center`}
              >
                <img src={card.img} alt={card.alt} className="h-[78%] w-[73%] object-contain mix-blend-multiply drop-shadow-sm transition-transform duration-150 group-hover:scale-110" />
              </a>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
