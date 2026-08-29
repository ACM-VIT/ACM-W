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

/* ─── Constants ─── */

const GLOBE_SIZE = "min(100vw, 100svh, 58rem)";

const DEG = Math.PI / 180;
const HALF_PI = Math.PI / 2;
const GLOBE_BASE_ROT_X = 0.2;

/**
 * Focus a location without pitching the globe per country.
 *
 * Longitude controls the horizontal spin. Latitude controls a vertical group
 * offset after the fixed base tilt, so the globe stays upright while the
 * requested country moves toward the center during the zoom.
 */
function lngLatToFocus(lng: number, lat: number) {
  const latRad = lat * DEG;
  const sinLat = Math.sin(latRad);
  const cosLat = Math.cos(latRad);
  const projectedY =
    Math.cos(GLOBE_BASE_ROT_X) * sinLat -
    Math.sin(GLOBE_BASE_ROT_X) * cosLat;

  return {
    rotY: -(HALF_PI + lng * DEG),
    rotX: GLOBE_BASE_ROT_X,
    y: -projectedY,
  };
}

/* ─── Scientist Data ─── */

type ScientistData = {
  name: string;
  country: string;
  photo: string;
  /** Geographic centre of the country on the real globe */
  focus: { lng: number; lat: number };
  title: string;
  text: string;
  countryWidth: string;
  photoRotation: number;
  /** true when the photo PNG already includes a vintage paper frame */
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
    countryWidth: "min(32.5rem, 36vw)",
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
    countryWidth: "min(28.75rem, 32vw)",
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
    countryWidth: "min(25rem, 28vw)",
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
    countryWidth: "min(30rem, 33.5vw)",
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
    countryWidth: "min(35rem, 39vw)",
    photoRotation: -4,
    hasFrame: true,
  },
];

/* ─── Camera distances ─── */

/** Default zoom-out (globe fits comfortably in the viewport) */
const CAM_DEFAULT_Z = 3.0;
/** Full zoom-in (close-up of a country region) */
const CAM_ZOOM_Z = 1.3;

/*
 * ─── Scroll choreography ───
 *
 * Nothing here is pinned. The globe is a `position: sticky` layer at the top
 * of the section (see .globe-sticky-container) and every scientist is a
 * 160svh block in normal flow whose 100svh "stage" is itself sticky — so the
 * page height is final on first paint, the document scrolls as one surface,
 * and each scene simply holds still for ~60vh of scroll while it's centred.
 *
 * Each scientist has one timeline scrubbed from "top bottom" to "bottom top"
 * of its 160svh block. In that progress space:
 *   0.385 → block top hits viewport top (stage sticks)
 *   0.615 → block bottom hits viewport bottom (stage releases)
 * The stage is stationary between those two, which is where the content
 * plateaus. The windows below are chosen so the globe hand-off between two
 * adjacent scientists never has two timelines writing the camera at once:
 * scientist N zooms back out by 0.72, and scientist N+1 only starts rotating
 * at its own 0.16 — which is N's 0.775.
 */
const T = {
  rotateStart: 0.16,
  rotateDur: 0.22,
  globeOutStart: 0.26,
  globeOutDur: 0.12,
  countryInStart: 0.3,
  countryInDur: 0.1,
  spreadStart: 0.37,
  spreadDur: 0.09,
  textStart: 0.42,
  textDur: 0.08,
  contentOutStart: 0.6,
  contentOutDur: 0.08,
  globeBackStart: 0.62,
  globeBackDur: 0.1,
} as const;

/* ─── Component ─── */

export default function WomenInStem() {
  const globeRef = useRef<Globe3DHandle>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Globe3D wires up `group`/`camera` in its own effect, and children's
    // effects run before the parent's, so the handle is ready here.
    const globe = globeRef.current;
    const globeEl = globeContainerRef.current;
    const root = rootRef.current;
    if (!globe?.group || !globe?.camera || !globeEl || !root) return;

    const group = globe.group;
    const camera = globe.camera;
    const globeEdgeFadeEl = globeEl.querySelector<HTMLElement>(".globe-edge-fade");

    /* The globe is fully scroll-driven — no idle auto-rotate phase. */
    globe.setAutoRotate(false);
    globe.setDragEnabled(false);

    const matchMedia = gsap.matchMedia();

    const setupScientistTimelines = (mobile: boolean) => {
      const sections = gsap.utils.toArray<HTMLElement>(".scientist-section", root);

      sections.forEach((section, i) => {
        const sci = scientists[i];
        const isLast = i === sections.length - 1;

        const { rotX: targetRotX, rotY: targetRotY, y: targetY } = lngLatToFocus(
          sci.focus.lng,
          sci.focus.lat,
        );

        const countryImg = section.querySelector<HTMLElement>(".country-img")!;
        const photoFrame = section.querySelector<HTMLElement>(".photo-frame")!;
        const textEl = section.querySelector<HTMLElement>(".scientist-text")!;

        gsap.set(countryImg, {
          xPercent: -50,
          yPercent: -50,
          opacity: 0,
          scale: 0.3,
          x: 0,
          y: 0,
        });
        gsap.set(photoFrame, {
          xPercent: -50,
          yPercent: -50,
          opacity: 0,
          y: mobile ? "2vh" : "4vh",
          x: 0,
          rotation: sci.photoRotation,
        });
        gsap.set(textEl, {
          yPercent: mobile ? 0 : -50,
          xPercent: mobile ? -50 : 0,
          opacity: 0,
          x: mobile ? 0 : "4vw",
          y: 0,
        });

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: 0.6,
          },
        });

        /* Spin + tilt the globe onto the country, and push the camera in. */
        tl.to(
          group.rotation,
          { y: targetRotY, x: targetRotX, duration: T.rotateDur, ease: "power2.inOut" },
          T.rotateStart,
        );
        tl.to(
          group.position,
          { y: targetY, duration: T.rotateDur, ease: "power2.inOut" },
          T.rotateStart,
        );
        tl.to(
          camera.position,
          { z: CAM_ZOOM_Z, duration: T.rotateDur, ease: "power2.in" },
          T.rotateStart,
        );
        if (globeEdgeFadeEl) {
          tl.to(globeEdgeFadeEl, { opacity: 1, duration: T.rotateDur * 0.6 }, T.rotateStart + 0.04);
        }

        /* Globe dissolves into the country silhouette. */
        tl.to(globeEl, { opacity: 0, duration: T.globeOutDur, ease: "power1.inOut" }, T.globeOutStart);
        tl.to(
          countryImg,
          {
            opacity: mobile ? 0.55 : 0.3,
            scale: mobile ? 0.85 : 1,
            duration: T.countryInDur,
            ease: "power1.out",
          },
          T.countryInStart,
        );

        /* Silhouette slides aside, photo and text come in. */
        if (mobile) {
          tl.to(
            countryImg,
            { y: "-22vh", x: 0, opacity: 0.65, scale: 0.75, duration: T.spreadDur, ease: "power2.out" },
            T.spreadStart,
          );
          tl.to(
            photoFrame,
            { opacity: 1, x: 0, y: "-4vh", duration: T.spreadDur, ease: "power2.out" },
            T.spreadStart + 0.02,
          );
          tl.to(textEl, { opacity: 1, duration: T.textDur, ease: "power1.out" }, T.textStart);
        } else {
          tl.to(
            countryImg,
            { x: "-22vw", opacity: 0.85, duration: T.spreadDur, ease: "power2.out" },
            T.spreadStart,
          );
          tl.to(
            photoFrame,
            { opacity: 1, x: "-18vw", y: 0, duration: T.spreadDur, ease: "power2.out" },
            T.spreadStart + 0.02,
          );
          tl.to(textEl, { opacity: 1, x: 0, duration: T.textDur, ease: "power1.out" }, T.textStart);
        }

        /* Hand back to the globe for the next scientist. The last one just
           scrolls away with the sticky globe still dissolved. */
        if (!isLast) {
          tl.to(
            [countryImg, photoFrame, textEl],
            { opacity: 0, duration: T.contentOutDur, ease: "power1.in" },
            T.contentOutStart,
          );
          tl.to(globeEl, { opacity: 1, duration: T.globeBackDur, ease: "power1.inOut" }, T.globeBackStart);
          tl.to(
            camera.position,
            { z: CAM_DEFAULT_Z, duration: T.globeBackDur, ease: "power2.out" },
            T.globeBackStart,
          );
          if (globeEdgeFadeEl) {
            tl.to(globeEdgeFadeEl, { opacity: 0, duration: T.globeBackDur }, T.globeBackStart);
          }
        }

        // Every scene must be exactly one progress unit long, otherwise the
        // scrub maps the section's scroll range to the wrong span.
        tl.set({}, {}, 1);
      });
    };

    matchMedia.add("(min-width: 48.0625rem)", () => {
      setupScientistTimelines(false);
    });
    matchMedia.add("(max-width: 48rem)", () => {
      setupScientistTimelines(true);
    });

    return () => {
      matchMedia.revert();
    };
  }, []);

  /* ─── Render ─── */

  return (
    <div ref={rootRef} className="women-in-stem">
      {/* ── Sticky globe (see .globe-sticky-container) ── */}
      <div ref={globeContainerRef} className="globe-sticky-container">
        <div className="globe-stage">
          <Globe3D
            ref={globeRef}
            className="globe-soft-edge"
            size={GLOBE_SIZE}
            lineColor="#5d0f14"
            sphereColor="#fff9e9"
            rotationSpeed={0.002}
            initialRotX={GLOBE_BASE_ROT_X}
            initialRotY={0}
            enableDrag={false}
          />
          {/* Feathers the globe's rim into the page background — see .globe-edge-fade */}
          <div className="globe-edge-fade" aria-hidden="true" />
        </div>
      </div>

      {/* ── Scientists ── */}
      {scientists.map((sci) => (
        <section key={sci.name} className="scientist-section">
          <div className="scientist-stage">
            {/* Country silhouette */}
            <img
              className="country-img absolute top-1/2 left-1/2 pointer-events-none opacity-0"
              src={sci.country}
              alt=""
              loading="lazy"
              decoding="async"
              style={{ width: sci.countryWidth }}
            />

            {/* Scientist photo */}
            <img
              className="photo-frame absolute top-1/2 left-1/2 pointer-events-none opacity-0"
              src={sci.photo}
              alt={sci.name}
              loading="lazy"
              decoding="async"
            />

            {/* Text */}
            <div className="scientist-text absolute top-1/2 opacity-0 left-[55%] w-[38%] max-w-[35rem] max-md:left-1/2 max-md:top-auto max-md:bottom-[16vh] max-md:w-[88vw] max-md:max-w-none max-md:-translate-x-1/2 max-md:translate-y-0 max-md:text-center max-md:z-[3] max-md:px-2 max-[30rem]:w-[92vw] max-[30rem]:bottom-[14vh]">
              <h2 className="scientist-name">{sci.name}</h2>
              <p className="scientist-subtitle">{sci.title}</p>
              <p className="scientist-desc">{sci.text}</p>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
