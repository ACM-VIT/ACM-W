import { useEffect, useRef, useState} from "react";
import { gsap } from "gsap";
import leftArr from "../assets/leftArr.png";
import rightArr from "../assets/rightArr.png";
import { blogs } from "../data/blogs";
import BlogStampRoll from "./BlogStampRoll";
import StampBorder from "../components/StampBorder";

const SPREAD = 90;

function BlogStampsDesktop() {
  const [viewport, setViewport] = useState({ w: 1200, h: 800 });
  const [activeIdx, setActiveIdx] = useState<number | null>(null);
  const [isFlipped, setIsFlipped] = useState(false);
  const [order, setOrder] = useState(() => blogs.map((_, i) => i));

  const cardRefs = useRef<Array<HTMLDivElement | null>>([]);
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
    const tx = offset * fanSpacing;
    const ty = Math.abs(offset) * fanDrop;
    const zIndex = 10 - Math.abs(offset);
    return { angle, zIndex, tx, ty };
  };

  const cardW = Math.min(viewport.w * 0.28, viewport.h * 0.42);
  const cardH = cardW * 1.25;
  const fanSpacing = viewport.w * 0.145;
  const fanDrop = viewport.h * 0.025;
  const fanBaseOffset = viewport.h * 0.035;
  const baseSpan = cardW + fanSpacing * (n - 1);
  const scale = Math.max(0.6, Math.min(1.2, (viewport.w * 0.97) / baseSpan));
  const fanHeight = Math.max(viewport.h * 0.32, Math.min(viewport.h * 0.6, cardH * 1.9 * scale));
  const fanTop = viewport.h - fanHeight - fanBaseOffset;
  const headingTop = Math.max(viewport.h * 0.03, fanTop / 2);
  const contentScale = Math.max(0.75, Math.min(1, scale));
  const imageHeight = Math.round(cardH * 0.5 * contentScale);
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
        { y: viewport.h * 0.375, opacity: 0, rotation: 0, x: 0 },
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

  const zoomCard = (i: number) => {
    const el = cardRefs.current[i];
    if (!el) return;
    cardRefs.current.forEach((c, j) => {
      if (j === i || !c) return;
      const dir = j < i ? -1 : 1;
      gsap.to(c, {
        x: dir * viewport.w * 0.04,
        opacity: 0.28,
        duration: 0.4,
        ease: "power2.out",
      });
    });
    const maxScaleW = (viewport.w * 0.72) / (cardW * scale);
    const maxScaleH = (viewport.h * 0.72) / (cardH * scale);
    const targetScale = Math.max(1, Math.min(1.4, maxScaleW, maxScaleH));
    const targetY =
      (cardH * targetScale - viewport.h / scale) / 2;
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
  };

  const closeZoom = () => {
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
  };

  const hoverCard = (cardIdx: number, entering: boolean) => {
    if (activeIdx !== null) return;
    const el = cardRefs.current[cardIdx];
    const slot = order.indexOf(cardIdx);
    if (!el || slot < 0) return;
    const { ty } = getFanProps(slot);
    gsap.to(el, {
      y: entering ? ty - cardH * 0.05 : ty,
      duration: 0.35,
      ease: "power2.out",
    });
  };

  const hint =
    activeIdx === null
      ? "tap a card to read more"
      : !isFlipped
        ? "tap again"
        : "";

  const handleCardClick = (cardIdx: number) => {
    if (activeIdx === null) zoomCard(cardIdx);
    else if (activeIdx === cardIdx) {
      if (!isFlipped) flipCard(cardIdx);
      else closeZoom();
    } else {
      closeZoom();
      setTimeout(() => zoomCard(cardIdx), 420);
    }
  };

  const navigate = (dir: number) => {
    closeZoom();
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
        fontFamily: "'Georgia', serif",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        overflow: "hidden",
        userSelect: "none",
      }}
    >
      <style>{`
        @keyframes blog-hint-in {
          from { opacity: 0; transform: translateY(0.25rem); }
          to { opacity: 0.8; transform: none; }
        }
      `}</style>

      <div
        style={{
          position: "absolute",
          top: headingTop,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          zIndex: 30,
          pointerEvents: "none",
        }}
      >
        <h2
          style={{
            fontSize: "clamp(2.5rem, 4vw, 3.125rem)",
            fontFamily: "Kovanov, Georgia, serif",
            color: "#580a0a",
            letterSpacing: "0.015em",
            fontWeight: "bold",
            lineHeight: "normal",
            textTransform: "uppercase",
            margin: 0,
            filter: activeIdx !== null ? "blur(6px)" : "none",
            opacity: activeIdx !== null ? 0.35 : 1,
            transition: "filter 0.25s ease, opacity 0.25s ease",
          }}
        >
          Blogs
        </h2>
        <p
          key={hint}
          style={{
            margin: "0.55rem 0 0",
            fontStyle: "italic",
            fontSize: "clamp(0.72rem, 0.95vw, 0.85rem)",
            letterSpacing: "0.05em",
            color: "#8b4040",
            opacity: 0,
            animation: hint ? "blog-hint-in 0.7s ease 0.5s both" : "none",
          }}
        >
          {hint || " "}
        </p>
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{
          position: "absolute",
          left: "1.2vw",
          top: fanTop + viewport.h * 0.005,
          background: "none",
          border: "none",
          cursor: "pointer",
          zIndex: 60,
          pointerEvents: "auto",
        }}
        aria-label="Previous"
      >
        <img
          src={leftArr}
          alt=""
          style={{ width: "clamp(1.35rem, 2.2vw, 1.625rem)", aspectRatio: "1 / 1", display: "block" }}
        />
      </button>
      <button
        onClick={() => navigate(1)}
        style={{
          position: "absolute",
          right: "1.2vw",
          top: fanTop + viewport.h * 0.005,
          background: "none",
          border: "none",
          cursor: "pointer",
          zIndex: 60,
          pointerEvents: "auto",
        }}
        aria-label="Next"
      >
        <img
          src={rightArr}
          alt=""
          style={{ width: "clamp(1.35rem, 2.2vw, 1.625rem)", aspectRatio: "1 / 1", display: "block" }}
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
          bottom: -fanBaseOffset,
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
              onMouseEnter={() => hoverCard(cardIdx, true)}
              onMouseLeave={() => hoverCard(cardIdx, false)}
              style={{
                position: "absolute",
                width: cardW,
                height: cardH,
                bottom: 0,
                left: -cardW / 2,
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
                  perspective: "56rem",
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
                          padding: "2.2% 2.2% 1.7%",
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
                            gap: "2%",
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
                            paddingTop: "1.2%",
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
                        padding: "2.8% 2.2% 2.2%",
                        boxSizing: "border-box",
                      }}
                    >
                      <p
                        style={{
                          textAlign: "center",
                          fontWeight: "bold",
                          fontSize: titleSize,
                          color: "#3a1212",
                          margin: "0 0 1.7%",
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
                          marginTop: "2.2%",
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

export default function BlogStamps() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 768
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  if (isMobile) return <BlogStampRoll />;
  return <BlogStampsDesktop />;
}
