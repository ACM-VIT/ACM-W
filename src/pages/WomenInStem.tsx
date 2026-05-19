import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Globe3D from "../assets/globe_3d";
import type { Globe3DHandle } from "../assets/globe_3d";
import india from "../assets/IN.png";
import poland from "../assets/PL.png";
import uk from "../assets/GB.png";
import kalpana from "../assets/kaplana.png";
import marie from "../assets/curie.png";
import ada from "../assets/ada.png";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ─── */

const GLOBE_SIZE = 420;

const scientists = [
  {
    name: "Kalpana Chawla",
    country: india,
    photo: kalpana,
    focus: { lng: 78.9, lat: 21.1 },
    title: "Astronaut — India",
    text: `Kalpana Chawla was the first woman of Indian origin in space. She served as a mission specialist and primary robotic arm operator on Space Shuttle Columbia. Her journey inspired millions of women to pursue science, aerospace and engineering.`,
    countryWidth: 340,
    photoRotation: -5,
  },
  {
    name: "Marie Curie",
    country: poland,
    photo: marie,
    focus: { lng: 19.1, lat: 52.1 },
    title: "Physicist — Poland",
    text: `Marie Curie pioneered research on radioactivity and became the first woman to win a Nobel Prize. She remains the only person to win Nobel Prizes in two scientific fields — Physics and Chemistry.`,
    countryWidth: 300,
    photoRotation: -3,
  },
  {
    name: "Ada Lovelace",
    country: uk,
    photo: ada,
    focus: { lng: -3.4, lat: 55.4 },
    title: "Mathematician — United Kingdom",
    text: `Ada Lovelace is widely regarded as the world's first computer programmer. Her notes on Charles Babbage's Analytical Engine introduced the idea that machines could go beyond calculations and manipulate symbols.`,
    countryWidth: 260,
    photoRotation: -6,
  },
];

/* ─── Component ─── */

export default function WomenInStem() {
  const globeRef = useRef<Globe3DHandle>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Short delay to ensure the Three.js objects exist
    // (Globe3D's useEffect fires before this parent effect, but
    // the imperative-handle getters read from a ref that's set
    // synchronously inside the child effect, so a microtask is enough.)
    const timer = setTimeout(() => {
      const globe = globeRef.current;
      if (!globe?.group || !globe?.camera) return;

      const group = globe.group;
      const camera = globe.camera;
      const globeEl = globeContainerRef.current!;

      /* ─── Hero exit trigger ─── */
      ScrollTrigger.create({
        trigger: heroRef.current,
        start: "70% top",
        onLeave: () => {
          globe.setAutoRotate(false);
          globe.setDragEnabled(false);
          globeEl.style.pointerEvents = "none";
        },
        onEnterBack: () => {
          globe.setAutoRotate(true);
          globe.setDragEnabled(true);
          globeEl.style.pointerEvents = "auto";
        },
      });

      /* ─── Scientist scroll sections ─── */
      const sections = gsap.utils.toArray<HTMLElement>(".scientist-section");

      sections.forEach((section, i) => {
        const sci = scientists[i];
        const isLast = i === sections.length - 1;

        // Convert lng/lat → Three.js Euler angles
        const targetRotY =
          Math.PI / 2 - ((sci.focus.lng + 180) * Math.PI) / 180;
        const targetRotX = ((-sci.focus.lat * Math.PI) / 180) * 0.5;

        // Grab DOM elements inside this section
        const countryImg = section.querySelector(
          ".country-img",
        ) as HTMLElement;
        const photoFrame = section.querySelector(
          ".photo-frame",
        ) as HTMLElement;
        const textEl = section.querySelector(
          ".scientist-text",
        ) as HTMLElement;

        // Set initial GSAP state (elements start invisible & centered)
        gsap.set(countryImg, {
          xPercent: -50,
          yPercent: -50,
          opacity: 0,
          scale: 0.35,
        });
        gsap.set(photoFrame, {
          xPercent: -50,
          yPercent: -50,
          opacity: 0,
          y: 30,
          rotation: sci.photoRotation,
        });
        gsap.set(textEl, {
          yPercent: -50,
          opacity: 0,
          x: 50,
        });

        /* ─── Build scroll-driven timeline ─── */
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: "top top",
            end: isLast ? "+=250%" : "+=300%",
            scrub: 1,
            pin: true,
            anticipatePin: 1,
          },
        });

        // Phase 1 ▸ Rotate globe to face the country + zoom camera in
        tl.to(
          group.rotation,
          { y: targetRotY, x: targetRotX, duration: 2.5, ease: "power2.inOut" },
          0,
        );
        tl.to(
          camera.position,
          { z: 1.2, duration: 2.5, ease: "power2.in" },
          0,
        );

        // Phase 2 ▸ Fade globe out + country silhouette appears (centered)
        tl.to(globeEl, { opacity: 0, duration: 1.8 }, 2);
        tl.to(
          countryImg,
          { opacity: 0.3, scale: 1, duration: 1.8 },
          2.4,
        );

        // Phase 3 ▸ Country slides left + opacity up, photo frame appears
        tl.to(
          countryImg,
          { x: "-22vw", opacity: 0.85, duration: 2 },
          4.2,
        );
        tl.to(
          photoFrame,
          { opacity: 1, x: "-20vw", y: 0, duration: 1.6 },
          4.8,
        );

        // Phase 4 ▸ Text fades in from the right
        tl.to(
          textEl,
          { opacity: 1, x: 0, duration: 1.4 },
          6,
        );

        if (!isLast) {
          // Phase 5 ▸ Hold visible
          // (gap between 7.4 and 8 provides a pause)

          // Phase 6 ▸ Fade out content + reset globe for next scientist
          tl.to(
            [countryImg, photoFrame, textEl],
            { opacity: 0, duration: 1.2 },
            8,
          );
          tl.to(globeEl, { opacity: 1, duration: 1 }, 9);
          tl.to(camera.position, { z: 2.6, duration: 1.2 }, 9);
        }
      });
    }, 80);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  /* ─── Render ─── */

  return (
    <div className="bg-[#fff9e9] text-[#580A0A] overflow-x-hidden">
      {/* ── Fixed globe behind everything ── */}
      <div ref={globeContainerRef} className="globe-fixed-container">
        <Globe3D
          ref={globeRef}
          size={GLOBE_SIZE}
          lineColor="#5d0f14"
          sphereColor="#fff9e9"
          rotationSpeed={0.002}
          enableDrag={true}
        />
      </div>

      {/* ── Hero section ── */}
      <section
        ref={heroRef}
        className="relative z-10 h-screen w-full flex flex-col items-center"
        style={{ paddingTop: "120px" }}
      >
        <div className="absolute top-8 left-8 w-8 h-8 bg-[#5d0f14]" />
        <h1
          className="text-[22px] tracking-[6px]"
          style={{ fontFamily: "Georgia, serif", color: "#580A0A" }}
        >
          WOMEN IN STEM
        </h1>
      </section>

      {/* ── Scientist sections ── */}
      {scientists.map((sci) => (
        <section
          key={sci.name}
          className="scientist-section relative z-10 h-screen w-full overflow-hidden"
        >
          {/* Top-left icon */}
          <div className="absolute top-8 left-8 w-8 h-8 bg-[#5d0f14] z-50" />

          {/* Country silhouette (starts centered, slides left) */}
          <img
            className="country-img absolute top-1/2 left-1/2 pointer-events-none opacity-0"
            src={sci.country}
            alt=""
            style={{ width: sci.countryWidth }}
          />

          {/* Scientist photo in vintage frame (starts centered, slides left) */}
          <div
            className="photo-frame absolute top-1/2 left-1/2 pointer-events-none opacity-0"
          >
            <img src={sci.photo} alt={sci.name} />
          </div>

          {/* Text content (right side) */}
          <div
            className="scientist-text absolute top-1/2 opacity-0"
            style={{ left: "56%", width: "36%", maxWidth: 440 }}
          >
            <h2 className="scientist-name">{sci.name}</h2>
            <p className="scientist-subtitle">{sci.title}</p>
            <p className="scientist-desc">{sci.text}</p>
          </div>
        </section>
      ))}
    </div>
  );
}
