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

/* ─── Component ─── */

export default function WomenInStem() {
  const globeRef = useRef<Globe3DHandle>(null);
  const globeContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let matchMedia: gsap.MatchMedia | undefined;

    const timer = setTimeout(() => {
      const globe = globeRef.current;
      if (!globe?.group || !globe?.camera) return;

      const group = globe.group;
      const camera = globe.camera;
      const globeEl = globeContainerRef.current;
      const globeSoftEdgeEl = globeEl?.querySelector(
        ".globe-soft-edge",
      ) as HTMLElement | null;
      if (!globeEl || !globeSoftEdgeEl) return;
      const clearGlobeSoftEdge = () => {
        globeSoftEdgeEl.classList.remove("is-globe-zooming");
        globeSoftEdgeEl.style.removeProperty("--globe-edge-alpha-62");
        globeSoftEdgeEl.style.removeProperty("--globe-edge-alpha-78");
        globeSoftEdgeEl.style.removeProperty("--globe-edge-alpha-91");
        globeSoftEdgeEl.style.removeProperty("--globe-edge-alpha-100");
      };
      const setGlobeSoftEdge = (progress: number) => {
        const fadeIn = gsap.utils.clamp(0, 1, (progress - 0.04) / 0.08);
        const fadeOut = gsap.utils.clamp(0, 1, (0.28 - progress) / 0.08);
        const rawStrength = Math.min(fadeIn, fadeOut);
        const strength = rawStrength * rawStrength * (3 - 2 * rawStrength);

        if (strength <= 0.001) {
          clearGlobeSoftEdge();
          return;
        }

        globeSoftEdgeEl.classList.add("is-globe-zooming");
        globeSoftEdgeEl.style.setProperty(
          "--globe-edge-alpha-62",
          (1 - strength * 0.18).toFixed(3),
        );
        globeSoftEdgeEl.style.setProperty(
          "--globe-edge-alpha-78",
          (1 - strength * 0.52).toFixed(3),
        );
        globeSoftEdgeEl.style.setProperty(
          "--globe-edge-alpha-91",
          (1 - strength * 0.84).toFixed(3),
        );
        globeSoftEdgeEl.style.setProperty(
          "--globe-edge-alpha-100",
          (1 - strength).toFixed(3),
        );
      };

      /* The globe is fully scroll-driven — no idle auto-rotate phase. */
      globe.setAutoRotate(false);
      globe.setDragEnabled(false);

      /* ─── Globe visibility: show while women-in-stem is active ───
         Starts at "top bottom" so the big globe is revealed as the
         TitleCard scrolls away, with no idle scroll span before the
         first scientist section pins and drives the rotation. */
      ScrollTrigger.create({
        trigger: "#women-in-stem",
        start: "top bottom",
        end: "bottom top",
        onToggle: ({ isActive }) => {
          globeEl.style.visibility = isActive ? "visible" : "hidden";
        },
        onRefresh: ({ isActive }) => {
          globeEl.style.visibility = isActive ? "visible" : "hidden";
        },
      });

      /* ─── Scientist scroll sections (desktop vs mobile layouts) ─── */
      const sections = gsap.utils.toArray<HTMLElement>(".scientist-section");

      const setupScientistTimelines = (mobile: boolean) => {
        sections.forEach((section, i) => {
          const sci = scientists[i];
          const isLast = i === sections.length - 1;

          const {
            rotX: targetRotX,
            rotY: targetRotY,
            y: targetY,
          } = lngLatToFocus(
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
            scrollTrigger: {
              trigger: section,
              start: "top top",
              end: isLast ? "+=280%" : "+=340%",
              scrub: 1,
              pin: true,
              anticipatePin: 1,
              onUpdate: (self) => {
                setGlobeSoftEdge(self.progress);
              },
              onLeave: () => {
                clearGlobeSoftEdge();
              },
              onLeaveBack: () => {
                clearGlobeSoftEdge();
              },
            },
          });

          tl.to(
            group.rotation,
            {
              y: targetRotY,
              x: targetRotX,
              duration: 2.0,
              ease: "power2.inOut",
            },
            0,
          );
          tl.to(
            group.position,
            {
              y: targetY,
              duration: 2.0,
              ease: "power2.inOut",
            },
            0,
          );
          tl.to(
            camera.position,
            { z: CAM_ZOOM_Z, duration: 2.8, ease: "power2.in" },
            0.5,
          );

          tl.to(globeEl, { opacity: 0, duration: 2.6, ease: "power1.inOut" }, 1.4);
          tl.to(
            countryImg,
            {
              opacity: mobile ? 0.55 : 0.3,
              scale: mobile ? 0.85 : 1,
              duration: 1.8,
            },
            3.2,
          );

          if (mobile) {
            tl.to(
              countryImg,
              { y: "-22vh", x: 0, opacity: 0.65, scale: 0.75, duration: 2 },
              5,
            );
            tl.to(
              photoFrame,
              { opacity: 1, x: 0, y: "-4vh", duration: 1.6 },
              5.6,
            );
            tl.to(textEl, { opacity: 1, duration: 1.4 }, 7);
          } else {
            tl.to(
              countryImg,
              { x: "-22vw", opacity: 0.85, duration: 2 },
              5,
            );
            tl.to(
              photoFrame,
              { opacity: 1, x: "-18vw", y: 0, duration: 1.6 },
              5.6,
            );
            tl.to(textEl, { opacity: 1, x: 0, duration: 1.4 }, 7);
          }

          if (!isLast) {
            tl.to(
              [countryImg, photoFrame, textEl],
              { opacity: 0, duration: 1.2 },
              9.2,
            );
            tl.to(globeEl, { opacity: 1, duration: 1 }, 10.2);
            tl.to(
              camera.position,
              { z: CAM_DEFAULT_Z, duration: 1.2 },
              10.2,
            );
          }
        });
      };

      matchMedia = gsap.matchMedia();
      matchMedia.add("(min-width: 48.0625rem)", () => {
        setupScientistTimelines(false);
      });
      matchMedia.add("(max-width: 48rem)", () => {
        setupScientistTimelines(true);
      });
    }, 120);

    return () => {
      clearTimeout(timer);
      matchMedia?.revert();
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
          className="globe-soft-edge"
          size={GLOBE_SIZE}
          lineColor="#5d0f14"
          sphereColor="#fff9e9"
          rotationSpeed={0.002}
          initialRotX={GLOBE_BASE_ROT_X}
          initialRotY={0}
          enableDrag={false}
        />
      </div>

      {/* ── Scientists ── */}
      {scientists.map((sci) => (
        <section
          key={sci.name}
          className="scientist-section relative z-10 h-screen w-full overflow-hidden"
        >

          {/* Country silhouette */}
          <img
            className="country-img absolute top-1/2 left-1/2 pointer-events-none opacity-0"
            src={sci.country}
            alt=""
            style={{ width: sci.countryWidth }}
          />

          {/* Scientist photo */}
          <img
            className="photo-frame absolute top-1/2 left-1/2 pointer-events-none opacity-0"
            src={sci.photo}
            alt={sci.name}
          />

          {/* Text */}
          <div
            className="scientist-text absolute top-1/2 opacity-0 left-[55%] w-[38%] max-w-[35rem] max-md:left-1/2 max-md:top-auto max-md:bottom-[16vh] max-md:w-[88vw] max-md:max-w-none max-md:-translate-x-1/2 max-md:translate-y-0 max-md:text-center max-md:z-[3] max-md:px-2 max-[30rem]:w-[92vw] max-[30rem]:bottom-[14vh]"
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
