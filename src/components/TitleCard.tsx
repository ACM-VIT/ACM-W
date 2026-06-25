import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Globe3D from "../assets/globe_3d";
import type { Globe3DHandle } from "../assets/globe_3d";

gsap.registerPlugin(ScrollTrigger);

const GLOBE_SIZE = 660;
const FONT = "'Playfair Display', Georgia, serif";
const COLOR = "#5a0a10";

/**
 * TitleCard — Scroll-pinned full-screen reveal between Blogs and WomenInStem.
 *
 * Composition (top-left AND bottom-right):
 *   ┌─────────┬────┐
 *   │ WOMEN   │    │
 *   │         │ IN │
 *   │ STEM    │    │
 *   └─────────┴────┘
 *
 * Both blocks drift slowly leftward.
 * Globe stays fixed centre (z:10).
 */
export default function TitleCard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const topBlockRef = useRef<HTMLDivElement>(null);
  const botBlockRef = useRef<HTMLDivElement>(null);
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<Globe3DHandle>(null);

  useEffect(() => {
    const section = sectionRef.current!;
    const topBlock = topBlockRef.current!;
    const botBlock = botBlockRef.current!;
    const globeWrap = globeWrapRef.current!;

    /* ── Initial hidden states ── */
    gsap.set(topBlock, { opacity: 0 });
    gsap.set(botBlock, { opacity: 0 });
    gsap.set(globeWrap, { opacity: 0, scale: 0.80 });

    /* ── Reveal timeline ── */
    const revealTl = gsap.timeline({ paused: true });
    revealTl
      .to(topBlock, { opacity: 1, duration: 1.0, ease: "power3.out" }, 0.1)
      .to(botBlock, { opacity: 1, duration: 1.0, ease: "power3.out" }, 0.35)
      .to(globeWrap, { opacity: 1, scale: 1, duration: 1.3, ease: "back.out(1.5)" }, 0.65);

    /* ── ScrollTrigger pin & scrubbed drift ── */
    const pinDuration = window.innerHeight * 2.0;

    const scrubTl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: `+=${pinDuration}`,
        pin: true,
        pinSpacing: true,
        anticipatePin: 1,
        scrub: 1.5,
        onEnter: () => {
          revealTl.play(0);
        },
        onLeaveBack: () => {
          revealTl.pause(0);
          gsap.set(topBlock, { opacity: 0 });
          gsap.set(botBlock, { opacity: 0 });
          gsap.set(globeWrap, { opacity: 0, scale: 0.80 });
        },
      }
    });

    // Animate text drifting outwards as user scrolls through the pin
    scrubTl.to(topBlock, { x: "18vw", ease: "none" }, 0);
    scrubTl.to(botBlock, { x: "-18vw", ease: "none" }, 0);

    return () => {
      revealTl.kill();
      scrubTl.kill();
      ScrollTrigger.getAll()
        .filter((t) => t.vars.trigger === section)
        .forEach((t) => t.kill());
    };
  }, []);

  /**
   * The two-column text block:
   *   Left col: WOMEN (top) + STEM (bottom)  — smaller size
   *   Right col: IN                           — large size, spans both rows
   */
  function TextBlock({ flip = false }: { flip?: boolean }) {
    const smallSz = "calc(clamp(38px, 5.5vw, 72px) + 50px)";
    const largeSz = "calc(clamp(80px, 12vw, 155px) + 140px)";

    const smallStyle: React.CSSProperties = {
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: smallSz,
      letterSpacing: "-0.03em",
      color: COLOR,
      lineHeight: 0.95,
      whiteSpace: "nowrap",
      display: "block",
    };

    const largeStyle: React.CSSProperties = {
      fontFamily: FONT,
      fontWeight: 900,
      fontSize: largeSz,
      letterSpacing: "-0.04em",
      color: COLOR,
      lineHeight: 0.88,
      whiteSpace: "nowrap",
      display: "flex",
      alignItems: "center",
    };

    return (
      <div
        style={{
          display: "flex",
          flexDirection: flip ? "row-reverse" : "row",
          alignItems: "center",
          gap: "clamp(6px, 1.2vw, 18px)",
        }}
      >
        {/* Left (or right when flipped) column: WOMEN + STEM stacked */}
        <div style={{ display: "flex", flexDirection: "column" }}>
          <span style={smallStyle}>WOMEN</span>
          <span style={smallStyle}>STEM</span>
        </div>

        {/* Right (or left when flipped) column: IN tall */}
        <span style={largeStyle}>IN</span>
      </div>
    );
  }

  return (
    <div
      ref={sectionRef}
      id="title-card"
      style={{
        position: "relative",
        width: "100%",
        height: "100vh",
        overflow: "hidden",
        background: "#FFF9E9",
      }}
    >
      {/* ── Paper grain ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23g)' opacity='0.12'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "300px 300px",
          mixBlendMode: "multiply",
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* ── Vignette ── */}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(110,50,15,0.16) 100%)",
          pointerEvents: "none",
          zIndex: 1,
        }}
      />

      {/* ── TOP-LEFT block ── */}
      <div
        ref={topBlockRef}
        style={{
          position: "absolute",
          top: "clamp(12px, 4vh, 48px)",
          left: 0,
          zIndex: 2,
          userSelect: "none",
          pointerEvents: "none",
          /* bleed left slightly so the composition touches the edge */
          marginLeft: "-1vw",
        }}
      >
        <TextBlock flip={false} />
      </div>

      {/* ── BOTTOM-RIGHT block ── */}
      <div
        ref={botBlockRef}
        style={{
          position: "absolute",
          bottom: "clamp(12px, 4vh, 48px)",
          right: 0,
          zIndex: 2,
          userSelect: "none",
          pointerEvents: "none",
          marginRight: "-1vw",
        }}
      >
        <TextBlock flip={false} />
      </div>

      {/* ── Globe — centred, in front of both blocks (z:10) ── */}
      <div
        ref={globeWrapRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          zIndex: 10,
          pointerEvents: "none",
          filter: "drop-shadow(0 10px 52px rgba(90,10,16,0.22))",
        }}
      >
        <Globe3D
          ref={globeRef}
          size={GLOBE_SIZE}
          lineColor="#5d0f14"
          sphereColor="#fdf6e3"
          rotationSpeed={0.003}
          initialRotX={0.2}
          initialRotY={0.6}
          enableDrag={false}
        />
      </div>
    </div>
  );
}
