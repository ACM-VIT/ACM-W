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
  // Deep valley — prominent dip
  "C 400,720 550,850 820,750 " +
  // High peak — prominent rise
  "C 1000,680 1100,450 1280,500 " +
  // Dip back down and exit
  "C 1380,530 1430,620 1500,600 " +
  // Clean exit off right edge
  "C 1490,630 1520,625 1560,630";

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
