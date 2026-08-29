import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Globe3D from "../assets/globe_3d";
import type { Globe3DHandle } from "../assets/globe_3d";

gsap.registerPlugin(ScrollTrigger);

const GLOBE_SIZE = "min(74vw, 74svh, 41.25rem)";
const FONT = "'Playfair Display', Georgia, serif";
const COLOR = "#5a0a10";

function TextBlock({ flip = false }: { flip?: boolean }) {
  const smallSz = "clamp(5.5rem, 9vw, 7.6rem)";
  const largeSz = "clamp(13rem, 21vw, 18.4rem)";

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
        gap: "clamp(0.375rem, 1.2vw, 1.125rem)",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column" }}>
        <span style={smallStyle}>WOMEN</span>
        <span style={smallStyle}>STEM</span>
      </div>

      <span style={largeStyle}>IN</span>
    </div>
  );
}

/**
 * TitleCard — full-screen title between Blogs and WomenInStem.
 *
 * Composition (top-left AND bottom-right):
 *   ┌─────────┬────┐
 *   │ WOMEN   │    │
 *   │         │ IN │
 *   │ STEM    │    │
 *   └─────────┴────┘
 *
 * It is a plain 100svh section in document flow — nothing is pinned. One
 * scrubbed timeline runs while the section crosses the viewport: the text
 * and globe fade up as it enters, and the two text blocks drift apart for
 * the whole pass. Because it's a scrub there is no "onEnter" moment to miss:
 * land anywhere on it (nav, reload, back button) and it's already in the
 * right state.
 */
export default function TitleCard() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const topBlockRef = useRef<HTMLDivElement>(null);
  const botBlockRef = useRef<HTMLDivElement>(null);
  const globeWrapRef = useRef<HTMLDivElement>(null);
  const globeRef = useRef<Globe3DHandle>(null);

  useEffect(() => {
    const section = sectionRef.current;
    const topBlock = topBlockRef.current;
    const botBlock = botBlockRef.current;
    const globeWrap = globeWrapRef.current;
    if (!section || !topBlock || !botBlock || !globeWrap) return;

    // Progress 0 → section top at viewport bottom; 1 → section bottom at
    // viewport top; 0.5 → section exactly filling the viewport.
    const tl = gsap.timeline({
      defaults: { ease: "none" },
      scrollTrigger: {
        trigger: section,
        start: "top bottom",
        end: "bottom top",
        scrub: 0.6,
      },
    });

    tl.fromTo(topBlock, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" }, 0.08)
      .fromTo(botBlock, { opacity: 0 }, { opacity: 1, duration: 0.22, ease: "power2.out" }, 0.14)
      .fromTo(
        globeWrap,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.26, ease: "power2.out" },
        0.16,
      )
      // Slow drift apart across the entire pass.
      .fromTo(topBlock, { x: "-6vw" }, { x: "12vw", duration: 1 }, 0)
      .fromTo(botBlock, { x: "6vw" }, { x: "-12vw", duration: 1 }, 0);

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  return (
    <div
      ref={sectionRef}
      id="title-card"
      style={{
        position: "relative",
        width: "100%",
        height: "100svh",
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
          backgroundSize: "18.75rem 18.75rem",
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
          top: "clamp(0.75rem, 4vh, 3rem)",
          left: 0,
          zIndex: 2,
          userSelect: "none",
          pointerEvents: "none",
          /* bleed left slightly so the composition touches the edge */
          marginLeft: "-1vw",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        <TextBlock flip={false} />
      </div>

      {/* ── BOTTOM-RIGHT block ── */}
      <div
        ref={botBlockRef}
        style={{
          position: "absolute",
          bottom: "clamp(0.75rem, 4vh, 3rem)",
          right: 0,
          zIndex: 2,
          userSelect: "none",
          pointerEvents: "none",
          marginRight: "-1vw",
          opacity: 0,
          willChange: "transform, opacity",
        }}
      >
        <TextBlock flip={false} />
      </div>

      {/* ── Globe — centred, in front of both blocks ── */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          display: "grid",
          placeItems: "center",
          zIndex: 10,
          pointerEvents: "none",
        }}
      >
        <div
          ref={globeWrapRef}
          style={{
            opacity: 0,
            filter: "drop-shadow(0 10px 52px rgba(90,10,16,0.22))",
            willChange: "transform, opacity",
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
    </div>
  );
}
