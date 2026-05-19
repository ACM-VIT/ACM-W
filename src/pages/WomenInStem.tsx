import { useEffect, useRef, useState } from "react";
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

const scientists = [
  {
    name: "Kalpana Chawla",
    country: india,
    photo: kalpana,
    accentTop: "42%",
    accentLeft: "68%",
    focus: {
      lng: 78.9,
      lat: 21.1,
      x: -150,
      y: 26,
    },
    title: "Astronaut - India",
    text: `Kalpana Chawla was the first woman of Indian origin in space.
She served as a mission specialist and primary robotic arm operator
on Space Shuttle Columbia. Her journey inspired millions of women
to pursue science, aerospace and engineering.`,
  },
  {
    name: "Marie Curie",
    country: poland,
    photo: marie,
    accentTop: "38%",
    accentLeft: "50%",
    focus: {
      lng: 19.1,
      lat: 52.1,
      x: -8,
      y: 118,
    },
    title: "Physicist - Poland",
    text: `Marie Curie pioneered research on radioactivity and became
the first woman to win a Nobel Prize. She remains the only person
to win Nobel Prizes in two scientific fields - Physics and Chemistry.`,
  },
  {
    name: "Ada Lovelace",
    country: uk,
    photo: ada,
    accentTop: "28%",
    accentLeft: "44%",
    focus: {
      lng: -3.4,
      lat: 55.4,
      x: 52,
      y: 146,
    },
    title: "Mathematician - United Kingdom",
    text: `Ada Lovelace is widely regarded as the world's first computer
programmer. Her notes on Charles Babbage's Analytical Engine introduced
the idea that machines could go beyond calculations and manipulate symbols.`,
  },
];

export default function WomenInStem() {
  const containerRef = useRef<HTMLDivElement>(null);
  const globeRefs = useRef<Array<Globe3DHandle | null>>([]);
  const [globeSizes, setGlobeSizes] = useState({ hero: 520, section: 460 });

  useEffect(() => {
    const updateGlobeSizes = () => {
      setGlobeSizes({
        hero: Math.min(520, Math.max(280, window.innerWidth * 0.58)),
        section: Math.min(460, Math.max(240, window.innerWidth * 0.5)),
      });
    };

    updateGlobeSizes();
    window.addEventListener("resize", updateGlobeSizes);

    return () => {
      window.removeEventListener("resize", updateGlobeSizes);
    };
  }, []);

  useEffect(() => {
    const sections = gsap.utils.toArray<HTMLElement>(".scientist-section");

    sections.forEach((section, index) => {
      const globe = section.querySelector(".globe");
      const targetX = Number(section.dataset.focusX ?? 0);
      const targetY = Number(section.dataset.focusY ?? 0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=250%",
          scrub: true,
          pin: true,
          onEnter: () => {
            const focus = scientists[index].focus;
            globeRefs.current[index]?.resume();
            globeRefs.current[index]?.rotateTo(focus.lng, focus.lat, 900);
          },
          onEnterBack: () => {
            const focus = scientists[index].focus;
            globeRefs.current[index]?.resume();
            globeRefs.current[index]?.rotateTo(focus.lng, focus.lat, 900);
          },
        },
      });

      tl.fromTo(
        globe,
        {
          scale: 1,
          opacity: 1,
          x: 0,
          y: 0,
        },
        {
          scale: 2.75,
          x: targetX,
          y: targetY,
          duration: 2,
          ease: "power2.inOut",
        },
      )
        .fromTo(
          section.querySelector(".country"),
          {
            opacity: 0,
            scale: 0.35,
          },
          {
            opacity: 0.28,
            scale: 0.52,
            duration: 1,
          },
          "-=1.5",
        )
        .to(
          section.querySelector(".country"),
          {
            x: "-32vw",
            y: 72,
            scale: 0.42,
            duration: 1.2,
          },
          "+=0.2",
        )
        .call(() => {
          globeRefs.current[index]?.pause();
        })
        .to(
          [globe, section.querySelector(".country")],
          {
            opacity: 0,
            duration: 0.8,
            ease: "power2.out",
          },
          "+=0.1",
        )
        .fromTo(
          section.querySelector(".content"),
          {
            opacity: 0,
            x: 120,
          },
          {
            opacity: 1,
            x: 0,
            duration: 1,
          },
          "-=0.55",
        );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-[#fff9e9] text-[#580A0A] overflow-x-hidden"
    >
      <section className="h-screen w-full relative flex items-center justify-center">
        <div className="absolute top-8 left-8 w-8 h-8 bg-[#5d0f14]" />

        <h1
          className="absolute top-12 text-[14px] tracking-[4px]"
          style={{
            fontFamily: "Georgia, serif",
          }}
        >
          WOMEN IN STEM
        </h1>

        <Globe3D
          size={globeSizes.hero}
          className="opacity-95"
          lineColor="#5d0f14"
          sphereColor="#fff9e9"
          rotationSpeed={0.002}
        />
      </section>

      {scientists.map((item) => (
        <section
          key={item.name}
          className="scientist-section relative h-screen w-full overflow-hidden bg-[#fff9e9]"
          data-focus-x={item.focus.x}
          data-focus-y={item.focus.y}
        >
          <div className="absolute top-8 left-8 w-8 h-8 bg-[#5d0f14] z-50" />

          <div className="absolute inset-0 flex items-center justify-center">
            <Globe3D
              ref={(node) => {
                globeRefs.current[scientists.indexOf(item)] = node;
              }}
              size={globeSizes.section}
              className="globe absolute opacity-90"
              lineColor="#5d0f14"
              sphereColor="#fff9e9"
              rotationSpeed={0.002}
            />

            <img
              src={item.country}
              alt=""
              className="country absolute w-[18vw] max-w-[220px] pointer-events-none"
              style={{
                top: item.accentTop,
                left: item.accentLeft,
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>

          <div className="content absolute inset-0 flex items-center justify-end px-[8vw]">
            <div className="w-[42vw] flex gap-10 items-start">
              <div className="relative rotate-[-6deg] shrink-0">
                <div className="absolute inset-0 bg-black scale-105 -z-10 translate-x-2 translate-y-2" />

                <img
                  src={item.photo}
                  alt=""
                  className="w-[260px] object-cover shadow-2xl"
                />
              </div>

              <div className="pt-10">
                <h2
                  className="text-[38px] leading-none mb-6"
                  style={{
                    fontFamily: "Georgia, serif",
                    color: "#580A0A",
                  }}
                >
                  {item.name}
                </h2>

                <p className="uppercase tracking-[2px] text-[11px] mb-5">
                  {item.title}
                </p>

                <p
                  className="leading-[1.9] text-[14px] text-[#5e4d4d]"
                  style={{
                    fontFamily: "Georgia, serif",
                  }}
                >
                  {item.text}
                </p>
              </div>
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
