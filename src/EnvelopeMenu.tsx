import { useRef, useLayoutEffect, useState } from 'react';
import gsap from 'gsap';

// Import all SVG assets
import closedEnv from './assets/closed.svg';
import openEnv from './assets/open.svg';
import contributorsImg from './assets/contributors.svg';
import aboutAcmwImg from './assets/aboutacmw.svg';
import aboutAcmwImg from './assets/aboutacmw.svg';
import aboutAcmImg from './assets/abtacm.svg';
import blogsImg from './assets/blogs.svg';
import womenInStemImg from './assets/womeninstem.svg';
import teamImg from './assets/team.svg';

const cards = [
  { id: 1, img: contributorsImg, link: '#contributors', x: 0, y: -75 },
  { id: 2, img: aboutAcmwImg, link: '#about-acmw', x: 80, y: -35 },
  { id: 3, img: aboutAcmImg, link: '#about-acm', x: 80, y: 45 },
  { id: 4, img: blogsImg, link: '#blogs', x: 0, y: 85 },
  { id: 5, img: womenInStemImg, link: '#women-in-stem', x: -80, y: 45 },
  { id: 6, img: teamImg, link: '#team', x: -80, y: -35 },
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
        .to('.menu-group', { y: 40, duration: 0.15, ease: 'power2.out' }, 0)
        // 2. Crossfade the envelope
        .to('.closed-env', { opacity: 0, duration: 0.05 }, 0)
        .to('.open-env', { opacity: 1, duration: 0.05 }, 0)
        // 3. Cards rise straight up out of pocket
        .fromTo('.nav-card', 
          { x: 0, y: 0, scale: 0.3, opacity: 0 },
          { y: -30, opacity: 1, scale: 0.6, duration: 0.15, stagger: 0.015, ease: 'power3.out' },
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
        className="relative w-48 h-48 cursor-pointer"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="absolute top-0 left-0 w-full flex justify-center">
          <div className="menu-group relative w-16 h-12 flex items-center justify-center z-50">
            
            {/* The Closed Envelope */}
            <div className="closed-env absolute inset-0 z-30 pointer-events-none flex items-center justify-center">
              <img src={closedEnv} alt="Closed Envelope" className="w-[120%] h-[120%] object-contain drop-shadow-md" />
            </div>
            
            {/* The Open Envelope */}
            <div className="open-env absolute inset-0 z-10 opacity-0 pointer-events-none flex items-center justify-center">
              <img src={openEnv} alt="Open Envelope" className="w-[120%] h-[120%] object-contain drop-shadow-md" />
            </div>
            
            {/* The Cards/Stamps */}
            {cards.map((card) => (
              <a 
                key={card.id}
                href={card.link}
                onClick={(e) => {
                  const target = document.querySelector(card.link);
                  if (target) {
                    e.preventDefault();
                    target.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="nav-card absolute w-24 h-16 flex flex-col items-center justify-center z-0 origin-center transition-transform hover:!scale-110"
              >
                 <img src={card.img} alt="Menu Stamp" className="w-[70px] h-[50px] object-fit mix-blend-multiply drop-shadow-sm" />
              </a>
            ))}

          </div>
        </div>
      </div>
    </div>
  );
}