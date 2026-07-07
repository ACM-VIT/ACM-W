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

export default function EnvelopeMenu() {
  const containerRef = useRef<HTMLDivElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      // Create the GSAP timeline
      tl.current = gsap.timeline({ paused: true })
        // 1. Shift the entire envelope group DOWN when hovering so cards make way on top
        .to('.menu-group', { yPercent: 83, duration: 0.15, ease: 'power2.out' }, 0)
        // 2. Crossfade the envelope
        .to('.closed-env', { opacity: 0, duration: 0.05 }, 0)
        .to('.open-env', { opacity: 1, duration: 0.05 }, 0)
        // 3. Cards rise straight up out of pocket
        .fromTo('.nav-card', 
          { x: 0, y: 0, scale: 0.3, opacity: 0 },
          { y: "-46%", opacity: 1, scale: 0.6, duration: 0.15, stagger: 0.015, ease: 'power3.out' },
          0.02
        )
        // 4. Smooth, lightning fast fan out into the final circle
        .to('.nav-card', {
          duration: 0.25,
          x: (i) => cards[i].x,
          y: (i) => cards[i].y,
          scale: 1,
          stagger: 0.02,
          ease: 'power4.out' // Using power4 instead of back for a smoother, less bouncy snap
        }, 0.1);
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
            {cards.map((card) => (
              <a
                key={card.id}
                href={card.link}
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

                    target.scrollIntoView({ behavior: 'smooth' });

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
                className="nav-card absolute flex h-[133.33%] w-[150%] flex-col items-center justify-center z-0 origin-center transition-transform hover:!scale-110"
              >
                <img src={card.img} alt={card.alt} className="h-[78%] w-[73%] object-contain mix-blend-multiply drop-shadow-sm" />
              </a>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}
