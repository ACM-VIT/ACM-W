import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import Globe3D from "../assets/globe_3d";
import type { Globe3DHandle } from "../assets/globe_3d";
import india from "../assets/IN.png";
import poland from "../assets/PL.png";
import uk from "../assets/GB.png";
import austria from "../assets/AT.png";
import us from "../assets/US.png";
import kalpana from "../assets/kaplana.png";
import marie from "../assets/curie.png";
import ada from "../assets/ada.png";
import hedy from "../assets/hedy.png";
import margaret from "../assets/margaret.png";

gsap.registerPlugin(ScrollTrigger);

/* ─── Data ─── */

const GLOBE_SIZE = 600;

/**
 * Longitude/latitude to Three.js Euler rotation.
 * The globe is oriented so that (rotY = π/2) points the
 * prime-meridian (lng 0) toward the camera.
 *
 * rotX tilts the globe up/down to bring a latitude into view.
 * The 0.6 factor keeps high latitudes from flipping the globe
 * upside-down while still giving noticeable vertical travel.
 */
function lngLatToRot(lng: number, lat: number) {
  const rotY = -((lng * Math.PI) / 180);
  const rotX = ((lat * Math.PI) / 180) * 0.6;
  return { rotX, rotY };
}

type ScientistData = {
  name: string;
  country: string;
  photo: string;
  focus: { lng: number; lat: number };
  title: string;
  text: string;
  countryWidth: number;
  photoRotation: number;
  /** true when the photo PNG already has a vintage paper frame baked in */
  hasFrame: boolean;
};

const scientists: ScientistData[] = [
  {
    name: "Kalpana Chawla",
    country: india,
    photo: kalpana,
    focus: { lng: 79, lat: 22 },
    title: "Astronaut — India",
    text: `Kalpana Chawla was the first woman of Indian origin in space. She served as a mission specialist and primary robotic arm operator on Space Shuttle Columbia. Her journey inspired millions of women to pursue science, aerospace and engineering.`,
    countryWidth: 460,
    photoRotation: -5,
    hasFrame: false,
  },
  {
    name: "Marie Curie",
    country: poland,
    photo: marie,
    focus: { lng: 20, lat: 52 },
    title: "Physicist — Poland",
    text: `Marie Curie pioneered research on radioactivity and became the first woman to win a Nobel Prize. She remains the only person to win Nobel Prizes in two scientific fields — Physics and Chemistry.`,
    countryWidth: 420,
    photoRotation: -3,
    hasFrame: false,
  },
  {
    name: "Ada Lovelace",
    country: uk,
    photo: ada,
    focus: { lng: -2, lat: 54 },
    title: "Mathematician — United Kingdom",
    text: `Ada Lovelace is widely regarded as the world's first computer programmer. Her notes on Charles Babbage's Analytical Engine introduced the idea that machines could go beyond calculations and manipulate symbols.`,
    countryWidth: 360,
    photoRotation: -6,
    hasFrame: false,
  },
  {
    name: "Hedy Lamarr",
    country: austria,
    photo: hedy,
    focus: { lng: 14, lat: 47.5 },
    title: "Inventor — Austria",
    text: `Hedy Lamarr co-invented a frequency-hopping spread spectrum communication system during World War II that laid the groundwork for modern Wi-Fi, Bluetooth, and GPS technologies. Her dual legacy as a Hollywood icon and brilliant inventor defied every expectation placed upon her.`,
    countryWidth: 440,
    photoRotation: -4,
    hasFrame: true,
  },
  {
    name: "Margaret Hamilton",
    country: us,
    photo: margaret,
    focus: { lng: -98, lat: 39 },
    title: "Computer Scientist — United States",
    text: `Margaret Hamilton led the team that developed the on-board flight software for NASA's Apollo missions. Her rigorous approach to software engineering — a term she coined — was critical to the success of the Moon landing and has influenced the discipline ever since.`,
    countryWidth: 500,
    photoRotation: -4,
    hasFrame: true,
  },
];

/* ─── Component ─── */

export default function WomenInStem() {
  const globeRef = useRef<Globe3DHandle>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      const globe = globeRef.current;
      if (!globe?.group || !globe?.camera) return;

      const group = globe.group;
      const camera = globe.camera;
      const globeEl = globeContainerRef.current!;

      /* ─── Hero exit: stop auto-rotate & drag ─── */
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

        const { rotX: targetRotX, rotY: targetRotY } = lngLatToRot(
          sci.focus.lng,
          sci.focus.lat,
        );

        const countryImg = section.querySelector(
          ".country-img",
        ) as HTMLElement;
        const photoFrame = section.querySelector(
          ".photo-frame",
        ) as HTMLElement;
        const textEl = section.querySelector(
          ".scientist-text",
        ) as HTMLElement;

        // Initial GSAP state — everything invisible & centered
        gsap.set(countryImg, {
          xPercent: -50,
          yPercent: -50,
          opacity: 0,
          scale: 0.3,
        });
        gsap.set(photoFrame, {
          xPercent: -50,
          yPercent: -50,
          opacity: 0,
          y: 40,
          rotation: sci.photoRotation,
        });
        gsap.set(textEl, {
          yPercent: -50,
          opacity: 0,
          x: 60,
        });

        /* ─── Scroll-driven timeline ─── */
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

        // Phase 1 ▸ Rotate globe to face country + camera zoom
        tl.to(
          group.rotation,
          {
            y: targetRotY,
            x: targetRotX,
            duration: 2.5,
            ease: "power2.inOut",
          },
          0,
        );
        tl.to(
          camera.position,
          { z: 1.2, duration: 2.5, ease: "power2.in" },
          0,
        );

        // Phase 2 ▸ Globe fades out, country silhouette fades in (centered)
        tl.to(globeEl, { opacity: 0, duration: 1.8 }, 2);
        tl.to(countryImg, { opacity: 0.3, scale: 1, duration: 1.8 }, 2.4);

        // Phase 3 ▸ Country slides left + opacity up, photo appears
        tl.to(
          countryImg,
          { x: "-22vw", opacity: 0.85, duration: 2 },
          4.2,
        );
        tl.to(
          photoFrame,
          { opacity: 1, x: "-18vw", y: 0, duration: 1.6 },
          4.8,
        );

        // Phase 4 ▸ Text fades in
        tl.to(textEl, { opacity: 1, x: 0, duration: 1.4 }, 6);

        if (!isLast) {
          // Phase 5 ▸ Hold (7.4 → 8 gap)
          // Phase 6 ▸ Fade out + reset globe for next scientist
          tl.to(
            [countryImg, photoFrame, textEl],
            { opacity: 0, duration: 1.2 },
            8,
          );
          tl.to(globeEl, { opacity: 1, duration: 1 }, 9);
          tl.to(camera.position, { z: 2.6, duration: 1.2 }, 9);
        }
      });
    }, 100);

    return () => {
      clearTimeout(timer);
      ScrollTrigger.getAll().forEach((t) => t.kill());
    };
  }, []);

  /* ─── Render ─── */

  return (
    <div className="bg-[#fff9e9] text-[#580A0A] overflow-x-hidden">
      {/* ── Fixed globe ── */}
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

      {/* ── Hero ── */}
      <section
        ref={heroRef}
        className="relative z-10 h-screen w-full flex flex-col items-center"
        style={{ paddingTop: "100px" }}
      >
        <div className="absolute top-8 left-8 w-8 h-8 bg-[#5d0f14]" />
        <h1
          className="text-[24px] tracking-[8px]"
          style={{ fontFamily: "Georgia, serif", color: "#580A0A" }}
        >
          WOMEN IN STEM
        </h1>
      </section>

      {/* ── Scientists ── */}
      {scientists.map((sci) => (
        <section
          key={sci.name}
          className="scientist-section relative z-10 h-screen w-full overflow-hidden"
        >
          {/* Top-left icon */}
          <div className="absolute top-8 left-8 w-8 h-8 bg-[#5d0f14] z-50" />

          {/* Country silhouette */}
          <img
            className="country-img absolute top-1/2 left-1/2 pointer-events-none opacity-0"
            src={sci.country}
            alt=""
            style={{ width: sci.countryWidth }}
          />

          {/* Scientist photo */}
          <div
            className={`photo-frame absolute top-1/2 left-1/2 pointer-events-none opacity-0${
              sci.hasFrame ? "" : " photo-frame--needs-border"
            }`}
          >
            <img src={sci.photo} alt={sci.name} />
          </div>

          {/* Text */}
          <div
            className="scientist-text absolute top-1/2 opacity-0"
            style={{ left: "55%", width: "38%", maxWidth: 520 }}
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
