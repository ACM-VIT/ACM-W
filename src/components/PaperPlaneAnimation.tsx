import { useRef, useLayoutEffect } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import planeImg from "../assets/plane.png";

gsap.registerPlugin(MotionPathPlugin, ScrollTrigger);

const FLIGHT_PATH =
  "M 150,120" +
  " C 300,100 250,250 200,400" +
  " C 150,700 400,820 720,820" +
  " C 950,820 1100,750 1200,600" +
  " C 1260,510 1320,480 1400,500";

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
