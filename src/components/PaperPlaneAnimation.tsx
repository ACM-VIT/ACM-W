import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import planeImg from "../assets/plane.png";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

const FLIGHT_PATH =
  // First bump — keep exactly
  "M 60,240 " +
  "C 180,260 300,180 400,220 " +
  // Graceful drop down
  "C 490,255 510,380 460,510 " +
  // Smooth into bottom sweep
  "C 410,630 480,700 580,660 " +
  // Bump 1 — prominent rise then dip
  "C 660,620 700,560 780,600 " +
  // Bump 2 — prominent dip then rise
  "C 860,640 900,700 980,660 " +
  // Bump 3 — rise up high
  "C 1060,620 1100,550 1180,590 " +
  // Bump 4 — dip and rise
  "C 1260,630 1300,680 1380,640 " +
  // Bump 5 — final rise and exit
  "C 1440,610 1470,560 1520,570";

export default function PaperPlaneAnimation() {
  const svgRef = useRef<SVGSVGElement>(null);
  const maskPathRef = useRef<SVGPathElement>(null);
  const planeGroupRef = useRef<SVGGElement>(null);

  useLayoutEffect(() => {
    const svg = svgRef.current;
    const maskPath = maskPathRef.current;
    const planeGroup = planeGroupRef.current;
    if (!svg || !maskPath || !planeGroup) return;

    const pathLen = maskPath.getTotalLength();

    const ctx = gsap.context(() => {
      gsap.set(maskPath, {
        strokeDasharray: pathLen,
        strokeDashoffset: pathLen,
      });

      gsap.set(planeGroup, { x: 60, y: 240 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: svg.closest("[data-award-card]") || svg,
          start: "top 80%",
          once: true,
        },
      });

      tl.to(
        maskPath,
        { strokeDashoffset: 0, duration: 5.5, ease: "power1.inOut" },
        0
      );

      tl.to(
        planeGroup,
        {
          motionPath: {
            path: FLIGHT_PATH,
            autoRotate: true,
            alignOrigin: [0.5, 0.5],
          },
          duration: 5.5,
          ease: "power1.inOut",
        },
        0
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 1440 1100"
      preserveAspectRatio="xMidYMid slice"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 50,
      }}
    >
      <defs>
        <mask id="plane-trail-mask">
          <path
            ref={maskPathRef}
            d={FLIGHT_PATH}
            fill="none"
            stroke="white"
            strokeWidth="12"
            strokeLinecap="round"
          />
        </mask>
      </defs>

      <path
        d={FLIGHT_PATH}
        fill="none"
        stroke="#1a1a1a"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="14 11"
        mask="url(#plane-trail-mask)"
      />

      <g ref={planeGroupRef}>
        <image
          href={planeImg}
          x="-23"
          y="-23"
          width="46"
          height="46"
        />
      </g>
    </svg>
  );
}
