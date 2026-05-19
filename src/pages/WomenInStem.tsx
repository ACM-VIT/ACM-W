import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import globe from "../assets/Globe.png";
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
    title: "Mathematician - United Kingdom",
    text: `Ada Lovelace is widely regarded as the world's first computer
programmer. Her notes on Charles Babbage's Analytical Engine introduced
the idea that machines could go beyond calculations and manipulate symbols.`,
  },
];

export default function WomenInStem() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sections = gsap.utils.toArray<HTMLElement>(".scientist-section");

    sections.forEach((section) => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "+=250%",
          scrub: true,
          pin: true,
        },
      });

      tl.fromTo(
        section.querySelector(".globe"),
        {
          scale: 1,
          opacity: 1,
        },
        {
          scale: 6,
          duration: 2,
          ease: "power2.inOut",
        },
      )
        .fromTo(
          section.querySelector(".country"),
          {
            opacity: 0,
            scale: 0.7,
          },
          {
            opacity: 1,
            scale: 1.2,
            duration: 1,
          },
          "-=1.5",
        )
        .to(
          section.querySelector(".country"),
          {
            x: "-35vw",
            y: 40,
            scale: 1,
            duration: 1.2,
          },
          "+=0.2",
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
          "-=1",
        );
    });

    return () => {
      ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="bg-[#f4efe6] text-[#4f1919] overflow-x-hidden"
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

        <img
          src={globe}
          alt=""
          className="w-[70vw] max-w-[900px] object-contain opacity-95"
        />
      </section>

      {scientists.map((item) => (
        <section
          key={item.name}
          className="scientist-section relative h-screen w-full overflow-hidden bg-[#f4efe6]"
        >
          <div className="absolute top-8 left-8 w-8 h-8 bg-[#5d0f14] z-50" />

          <div className="absolute inset-0 flex items-center justify-center">
            <img
              src={globe}
              alt=""
              className="globe absolute w-[65vw] opacity-90"
            />

            <img
              src={item.country}
              alt=""
              className="country absolute w-[28vw] max-w-[350px]"
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
