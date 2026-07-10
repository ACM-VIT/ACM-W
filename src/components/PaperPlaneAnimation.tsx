import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import planeImg from "../assets/plane.png";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

const FLIGHT_PATH =
  "M 120,150 " +
  "C 220,150 350,120 420,240 " + 
  "C 480,380 380,500 420,650 " + 
  "C 460,820 900,850 1180,750 " + 
  "C 1300,650 1300,480 1420,520 " + 
  "C 1520,560 1580,750 1650,700";

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

      gsap.set(planeGroup, { x: 150, y: 120 });

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
