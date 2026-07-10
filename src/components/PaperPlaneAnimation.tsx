import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import planeImg from "../assets/plane.png";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

const FLIGHT_PATH =
  "M 75,25 C 115,10 155,45 190,28" +
  " C 150,75 95,140 65,220" +
  " C 38,320 32,430 50,530" +
  " C 68,575 155,608 310,618" +
  " C 510,628 720,618 880,598" +
  " C 940,588 990,572 1040,555";

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

      gsap.set(planeGroup, { x: 75, y: 25 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: svg.closest("[data-award-card]") || svg,
          start: "top 80%",
          once: true,
        },
      });

      tl.to(
        maskPath,
        { strokeDashoffset: 0, duration: 3.5, ease: "power1.inOut" },
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
          duration: 3.5,
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
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid meet"
      style={{
        position: "absolute",
        inset: 0,
        width: "100%",
        height: "100%",
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 50,
        background: "transparent",
      }}
    >
      <defs>
        <mask id="plane-trail-mask">
          <path
            ref={maskPathRef}
            d={FLIGHT_PATH}
            fill="none"
            stroke="white"
            strokeWidth="10"
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
        strokeDasharray="12 10"
        mask="url(#plane-trail-mask)"
      />

      <g ref={planeGroupRef}>
        <image
          href={planeImg}
          x="-18"
          y="-18"
          width="36"
          height="36"
        />
      </g>
    </svg>
  );
}
