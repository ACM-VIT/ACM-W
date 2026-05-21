import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { gsap } from "gsap";
import leftArr from "../assets/leftArr.png";
import rightArr from "../assets/rightArr.png";
import { blogs } from "../data/blogs";

const NOISE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='250' height='250'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='250' height='250' filter='url(%23n)' opacity='0.06'/%3E%3C/svg%3E\")";

function StampBorder({ children }: { children: ReactNode }) {
  const MAROON = "#6b1212";
  const CREAM = "#F2E8CF";
  const scallop = 3;
  const border = 20;
  const gap = 3;
  const maskId = useId();
  const positions: number[] = [];
  const step = scallop * 2 + gap;
  for (let p = 0; p <= 100; p += step) {
    positions.push(p);
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      {/* TRUE SCALLOPED BORDER */}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <defs>
          <mask id={maskId} maskUnits="userSpaceOnUse">
            <rect x="0" y="0" width="100" height="100" fill="white" />
            {positions.map((p) => (
              <circle key={`t-${p}`} cx={p} cy="0" r={scallop} fill="black" />
            ))}
            {positions.map((p) => (
              <circle
                key={`b-${p}`}
                cx={p}
                cy="100"
                r={scallop}
                fill="black"
              />
            ))}
            {positions.map((p) => (
              <circle key={`l-${p}`} cx="0" cy={p} r={scallop} fill="black" />
            ))}
            {positions.map((p) => (
              <circle
                key={`r-${p}`}
                cx="100"
                cy={p}
                r={scallop}
                fill="black"
              />
            ))}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100"
          height="100"
          fill={MAROON}
          mask={`url(#${maskId})`}
        />

        {/* INNER PAPER */}
        <rect
          x={border}
          y={border}
          width={100 - border * 2}
          height={100 - border * 2}
          fill={CREAM}
        />
      </svg>

      {/* CONTENT */}
      <div
        style={{
          position: "absolute",
          inset: border,
          background: CREAM,
          backgroundImage: NOISE,
          overflow: "hidden",
        }}
      >
        {children}
      </div>
    </div>
  );
}

const CARD_W = 360;
const CARD_H = 450;
const SPREAD = 90;
const FAN_SPACING = 200;
const FAN_DROP = 20;
const FAN_BASE_OFFSET = 28;

export default function BlogStamps() {
  const [viewport, setViewport] = useState({ w: 1200, h: 800 });
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [order, setOrder] = useState(() => blogs.map((_, i) => i));

  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
  const hintRef = useRef<HTMLParagraphElement | null>(null);
  const n = blogs.length;

  useEffect(() => {
    const update = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const getFanProps = (slot: number) => {
    const centerSlot = Math.floor(n / 2);
    const step = SPREAD / (n - 1);
    const angle = -SPREAD / 2 + slot * step;
    const offset = slot - centerSlot;
    const tx = offset * FAN_SPACING;
    const ty = Math.abs(offset) * FAN_DROP;
    const zIndex = 10 - Math.abs(offset);
    return { angle, zIndex, tx, ty };
  };

  const baseSpan = CARD_W + FAN_SPACING * (n - 1);
  const scale = Math.max(0.6, Math.min(1.2, (viewport.w - 40) / baseSpan));
  const fanHeight = Math.max(260, Math.min(480, CARD_H * 1.9 * scale));
  const fanTop = viewport.h - fanHeight - FAN_BASE_OFFSET;
  const headingTop = Math.max(20, fanTop / 2);
  const contentScale = Math.max(0.75, Math.min(1, scale));
  const imageHeight = Math.round(CARD_H * 0.5 * contentScale);
  const titleSize = 14 * contentScale;
  const authorSize = 10 * contentScale;
  const metaSize = 8 * contentScale;
  const bodySize = 9 * contentScale;
  const linkSize = 10 * contentScale;

  useEffect(() => {
    order.forEach((cardIdx, slot) => {
      const el = cardRefs.current[cardIdx];
      if (!el) return;
      const { angle, zIndex, tx, ty } = getFanProps(slot);
      gsap.fromTo(
        el,
        { y: 300, opacity: 0, rotation: 0, x: 0 },
        {
          y: ty,
          x: tx,
          opacity: 1,
          rotation: angle,
          zIndex,
          duration: 0.75,
          ease: "back.out(1.5)",
          delay: 0.15 + slot * 0.09,
        }
      );
    });
    if (hintRef.current) {
      gsap.fromTo(
        hintRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.6, delay: 0.9 }
      );
    }
  }, []);

  useEffect(() => {
    if (activeIdx !== null) return;
    order.forEach((cardIdx, slot) => {
      const el = cardRefs.current[cardIdx];
      if (!el) return;
      const { angle, zIndex, tx, ty } = getFanProps(slot);
      gsap.to(el, {
        rotation: angle,
        x: tx,
        y: ty,
        scale: 1,
        opacity: 1,
        zIndex,
        duration: 0.55,
        ease: "back.out(1.4)",
        delay: slot * 0.03,
      });
    });
  }, [order, activeIdx]);

  const updateHint = (text: string) => {
    if (!hintRef.current) return;
    gsap.to(hintRef.current, {
      opacity: 0,
      duration: 0.18,
      onComplete: () => {
        if (hintRef.current) hintRef.current.textContent = text;
        gsap.to(hintRef.current, { opacity: 1, duration: 0.3 });
      },
    });
  };

  const zoomCard = (i: number) => {
    const el = cardRefs.current[i];
    if (!el) return;
    cardRefs.current.forEach((c, j) => {
      if (j === i || !c) return;
      const dir = j < i ? -1 : 1;
      gsap.to(c, {
        x: dir * 50,
        opacity: 0.28,
        duration: 0.4,
        ease: "power2.out",
      });
    });
    const maxScaleW = (viewport.w * 0.72) / (CARD_W * scale);
    const maxScaleH = (viewport.h * 0.72) / (CARD_H * scale);
    const targetScale = Math.max(1, Math.min(1.4, maxScaleW, maxScaleH));
    const targetY =
      (CARD_H * targetScale - viewport.h / scale) / 2;
    gsap.to(el, {
      x: 0,
      y: targetY,
      rotation: 0,
      scale: targetScale,
      zIndex: 50,
      duration: 0.55,
      ease: "back.out(1.4)",
    });
    setActiveIdx(i);
    setIsFlipped(false);
    updateHint("Click again to read");
  };

  const flipCard = (i: number) => {
    const inner = cardRefs.current[i]?.querySelector<HTMLDivElement>(
      ".stamp-inner"
    );
    if (!inner) return;
    gsap.to(inner, {
      rotationY: 180,
      duration: 0.65,
      ease: "power2.inOut",
    });
    setIsFlipped(true);
    updateHint("Click to close");
  };

  const closeZoom = (silent = false) => {
    if (activeIdx === null) return;
    const el = cardRefs.current[activeIdx];
    const inner = el?.querySelector<HTMLDivElement>(".stamp-inner");
    if (inner) {
      gsap.to(inner, { rotationY: 0, duration: 0.4, ease: "power2.inOut" });
    }
    const slot = order.indexOf(activeIdx);
    if (slot < 0) return;
    const { angle, zIndex, tx, ty } = getFanProps(slot);
    gsap.to(el, {
      x: tx,
      y: ty,
      rotation: angle,
      scale: 1,
      zIndex,
      duration: 0.55,
      ease: "back.out(1.4)",
    });
    order.forEach((cardIdx, slotIdx) => {
      const c = cardRefs.current[cardIdx];
      if (!c) return;
      const { angle: oa, zIndex: oz, tx: ox, ty: oy } = getFanProps(slotIdx);
      gsap.to(c, {
        x: ox,
        y: oy,
        rotation: oa,
        opacity: 1,
        zIndex: oz,
        duration: 0.5,
        ease: "power2.out",
      });
    });
    setActiveIdx(null);
    setIsFlipped(false);
    if (!silent) updateHint("Click a stamp to zoom in");
  };

  const handleCardClick = (cardIdx: number) => {
    if (activeIdx === null) zoomCard(cardIdx);
    else if (activeIdx === cardIdx) {
      if (!isFlipped) flipCard(cardIdx);
      else closeZoom();
    } else {
      closeZoom(true);
      setTimeout(() => zoomCard(cardIdx), 420);
    }
  };

  const navigate = (dir: number) => {
    closeZoom(true);
    setTimeout(() => {
      setOrder((prev) => {
        if (dir < 0) return [...prev.slice(1), prev[0]];
        return [prev[prev.length - 1], ...prev.slice(0, -1)];
      });
    }, 420);
  };

  return (
    <div
      style={{
        width: "100%",
        minHeight: "100vh",
        height: "100vh",
        background: "#FFF9E9",
        backgroundImage: NOISE,
        fontFamily: "'Georgia', serif",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <div style={{ position: "absolute", top: 18, left: 18 }}>
        <svg
          width="36"
          height="28"
          viewBox="0 0 36 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="36" height="28" rx="3" fill="#6b1616" />
          <polyline
            points="0,0 18,16 36,0"
            fill="#8b2a2a"
            stroke="#8b2a2a"
            strokeWidth="1"
          />
          <line
            x1="0"
            y1="28"
            x2="13"
            y2="14"
            stroke="#7a1c1c"
            strokeWidth="1.2"
          />
          <line
            x1="36"
            y1="28"
            x2="23"
            y2="14"
            stroke="#7a1c1c"
            strokeWidth="1.2"
          />
        </svg>
      </div>

      <h2
        style={{
          fontSize: 27,
          fontFamily: "'Kovanov'",
          color: "#3a1212",
          letterSpacing: "0.28em",
          fontWeight: "bold",
          textTransform: "uppercase",
          position: "absolute",
          top: headingTop,
          margin: 0,
          filter: activeIdx !== null ? "blur(6px)" : "none",
          opacity: activeIdx !== null ? 0.35 : 1,
          transition: "filter 0.25s ease, opacity 0.25s ease",
        }}
      >
        Blogs
      </h2>

      <p
        ref={hintRef}
        style={{
          fontSize: 11,
          color: "#8b4040",
          fontStyle: "italic",
          margin: "2px 0 0",
          opacity: 0,
        }}
      >
        Click a stamp to zoom in
      </p>

      <button
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          left: 14,
          top: `calc(100% - ${fanHeight}px - 24px)`,
          background: "none",
          border: "none",
          cursor: "pointer",
          zIndex: 20,
        }}
        aria-label="Previous"
      >
        <img
          src={leftArr}
          alt=""
          style={{ width: 26, height: 26, display: "block" }}
        />
      </button>
      <button
        onClick={() => navigate(1)}
        style={{
          position: "absolute",
          right: 14,
          top: `calc(100% - ${fanHeight}px - 24px)`,
          background: "none",
          border: "none",
          cursor: "pointer",
          zIndex: 20,
        }}
        aria-label="Next"
      >
        <img
          src={rightArr}
          alt=""
          style={{ width: 26, height: 26, display: "block" }}
        />
      </button>

      {activeIdx !== null && (
        <div
          onClick={() => closeZoom()}
          style={{
            position: "absolute",
            inset: 0,
            background: "rgba(50,14,14,0.15)",
            zIndex: 10,
          }}
        />
      )}

      <div
        style={{
          position: "absolute",
          bottom: -FAN_BASE_OFFSET,
          left: 0,
          right: 0,
          height: fanHeight,
          pointerEvents: "none",
          zIndex: 20,
        }}
      >
        <div
          style={{
            position: "absolute",
            bottom: 0,
            left: "50%",
            width: 0,
            height: 0,
            transform: `scale(${scale})`,
            transformOrigin: "bottom center",
          }}
        >
          {order.map((cardIdx) => {
            const blog = blogs[cardIdx];
            return (
            <div
              key={blog.id}
              ref={(el) => {
                cardRefs.current[cardIdx] = el;
              }}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick(cardIdx);
              }}
              style={{
                position: "absolute",
                width: CARD_W,
                height: CARD_H,
                bottom: 0,
                left: -CARD_W / 2,
                opacity: 0,
                transformOrigin: "bottom center",
                cursor: "pointer",
                pointerEvents: "all",
              }}
            >
              <div
                className="stamp-inner"
                style={{
                  position: "relative",
                  width: "100%",
                  height: "100%",
                  transformStyle: "preserve-3d",
                  perspective: 900,
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                  }}
                >
                  <StampBorder>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: "100%",
                        overflow: "hidden",
                      }}
                    >
                      <img
                        src={blog.image}
                        alt={blog.title}
                        style={{
                          width: "100%",
                          height: imageHeight,
                          objectFit: "cover",
                        }}
                        draggable={false}
                      />
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          flex: 1,
                          padding: "8px 8px 6px",
                          textAlign: "center",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                            justifyContent: "center",
                            textAlign: "center",
                            flex: 1,
                            gap: 6,
                          }}
                        >
                          <p
                            style={{
                              textAlign: "center",
                              fontWeight: "bold",
                              fontSize: titleSize,
                              color: "#3a1212",
                              lineHeight: 1.3,
                              margin: 0,
                            }}
                          >
                            {blog.title}
                          </p>
                          <p
                            style={{
                              textAlign: "center",
                              fontStyle: "italic",
                              fontSize: authorSize,
                              color: "#6b1a1a",
                              margin: 0,
                            }}
                          >
                            By: {blog.author}
                          </p>
                        </div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            width: "100%",
                            paddingTop: 4,
                            fontSize: metaSize,
                            color: "#8b4040",
                            borderTop: "0.5px solid #c8a090",
                          }}
                        >
                          <span>{blog.date}</span>
                          <span>{blog.read}</span>
                        </div>
                      </div>
                    </div>
                  </StampBorder>
                </div>
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                  }}
                >
                  <StampBorder>
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        width: "100%",
                        height: "100%",
                        padding: "10px 8px 8px",
                        boxSizing: "border-box",
                      }}
                    >
                      <p
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: titleSize,
                          color: "#3a1212",
                          margin: "0 0 6px",
                        }}
                      >
                        {blog.title}
                      </p>
                      <p
                        style={{
                          flex: 1,
                          overflow: "hidden",
                          fontSize: bodySize,
                          color: "#3a1212",
                          lineHeight: 1.55,
                          margin: 0,
                        }}
                      >
                        {blog.body}
                      </p>
                      <a
                        href={blog.link}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          textAlign: "center",
                          textDecoration: "underline",
                          marginTop: 8,
                          display: "block",
                          fontSize: linkSize,
                          color: "#6b1a1a",
                        }}
                      >
                        Read more -&gt;
                      </a>
                    </div>
                  </StampBorder>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>
    </div>
  );
}
