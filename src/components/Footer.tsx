import { useState, useRef, useEffect, useCallback } from "react";

// Postcard frame PNGs — native landscape 276×216 (552×432 at 2×), no rotation needed.
// The two doodled frames ship as a cleaned frame + a separate transparent doodle,
// so the doodle can ride the border band instead of being buried under the photo.
import framePink from "../assets/footer/Group 1000007240.png";
import frameNavy from "../assets/footer/Group 1000007241.png";
import framePinkClean from "../assets/footer/frame-pink-clean.png";
import frameNavyClean from "../assets/footer/frame-navy-clean.png";
import doodleLighthouse from "../assets/footer/doodle-lighthouse.png";
import doodleBalloon from "../assets/footer/doodle-balloon.png";
import leftArr from "../assets/leftArr.png";
import rightArr from "../assets/rightArr.png";

// Gallery photos — dynamically import the first 9 photos from the gallery folder.
const photoModules = import.meta.glob<{ default: string }>(
  "../assets/gallery/*.{jpg,jpeg,png,webp}",
  { eager: true }
);

// Sort by filename to keep a stable postcard order.
const sortedPhotos = Object.entries(photoModules)
  .sort(([a], [b]) => a.localeCompare(b, undefined, { numeric: true }))
  .map(([, mod]) => mod.default);

// Ensure we always have 9 slots
const galleryPhotos: (string | null)[] = Array.from({ length: 9 }, (_, i) =>
  sortedPhotos[i] ?? null
);

/*
 * Frame geometry:
 *   Landscape frame PNG: 276 × 216 (552 × 432 at 2×) — already landscape,
 *   so the frame simply fills the card with no rotation.
 *
 * Each frame draws its own double border (outer colour ring + cream band +
 * inked inner rule), so the card needs no CSS borders of its own. The inner
 * white window measured off the PNGs starts at ~7% from the left/right edges
 * and ~9% from the top/bottom; the photo is inset slightly past that so the
 * ink stroke stays visible on top of it.
 */
const FRAME_W = 276;
const FRAME_H = 216;
const CONTAINER_AR = `${FRAME_W} / ${FRAME_H}`; // "276 / 216"
// Photo window inside the frame's inked rule
const PHOTO_INSET_X = "7.8%";
const PHOTO_INSET_Y = "9.8%";

/*
 * Doodle placement. The left border band runs from the card edge to the inked
 * rule at 7.8%; its cream stretch (~2.5%–7%) is the readable part, so a doodle
 * this wide sits on the cream with a slight bite into the outer colour ring.
 * Both doodles are navy ink, which reads on the pink and the navy frame alike
 * because the band under them is cream either way.
 */
const DOODLE_WIDTH = "5.6%";
const DOODLE_LEFT = "1.6%";

/* Alternating postcard frames — pink / navy, every one carrying a border doodle.
   The doodle is an overlay rather than part of the frame art, so the two plain
   frames get one too. Motif and vertical anchor both alternate, so no page of
   three cards ever shows the same doodle in the same spot twice. */
const postcards = [
  { frame: framePink, doodle: doodleBalloon, doodleY: { bottom: "12%" } },
  { frame: frameNavyClean, doodle: doodleBalloon, doodleY: { top: "12%" } },
  { frame: framePinkClean, doodle: doodleLighthouse, doodleY: { bottom: "12%" } },
  { frame: frameNavy, doodle: doodleLighthouse, doodleY: { top: "12%" } },
] as const;

const CARDS_PER_PAGE = 3;

export default function Footer() {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const totalPages = Math.ceil(galleryPhotos.length / CARDS_PER_PAGE);

  const scrollToPage = useCallback(
    (page: number) => {
      const container = containerRef.current;
      if (!container) return;
      const boundedPage = Math.min(Math.max(page, 0), totalPages - 1);
      const firstCard = container.querySelector(
        '[data-card-index="0"]'
      ) as HTMLElement;
      if (!firstCard) return;
      const cardWidth = firstCard.offsetWidth;
      const gap =
        parseFloat(
          getComputedStyle(container.firstElementChild!).gap
        ) || 32;
      const targetScroll = boundedPage * (cardWidth * CARDS_PER_PAGE + gap * (CARDS_PER_PAGE - 1));
      container.scrollTo({
        left: targetScroll,
        behavior: "smooth",
      });
      setCurrentPage(boundedPage);
    },
    [totalPages]
  );

  // Track current page from scroll position
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let scrollTimeout: ReturnType<typeof setTimeout>;

    const handleScroll = () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        const firstCard = container.querySelector(
          '[data-card-index="0"]'
        ) as HTMLElement;
        if (!firstCard) return;
        const cardWidth = firstCard.offsetWidth;
        const gap =
          parseFloat(
            getComputedStyle(container.firstElementChild!).gap
          ) || 32;
        const pageWidth = cardWidth * CARDS_PER_PAGE + gap * (CARDS_PER_PAGE - 1);
        const page = Math.round(container.scrollLeft / pageWidth);
        setCurrentPage(Math.min(Math.max(page, 0), totalPages - 1));
      }, 100);
    };

    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      container.removeEventListener("scroll", handleScroll);
      clearTimeout(scrollTimeout);
    };
  }, [totalPages]);

  // The vertical wheel is deliberately NOT captured here: the gallery pages
  // via the dots, the arrows, swipe, or a horizontal trackpad gesture, so the
  // page keeps scrolling as one continuous surface.

  return (
    <footer
      style={{
        position: "relative",
        zIndex: 50,
        isolation: "isolate",
        width: "100%",
        overflow: "hidden",
        backgroundColor: "#B49880",
        // Keep the gallery visually attached to the section above it.
        // The cards already have a small internal bleed allowance.
        padding: "0",
        border: "1px solid #000",
        marginBottom: "-1px",
        boxSizing: "border-box",
      }}
    >
      {/* Paper/noise texture approximating the SVG's filtered brown surface. */}
      <div
        style={{
          pointerEvents: "none",
          position: "absolute",
          inset: 0,
          zIndex: 0,
          opacity: 0.42,
          mixBlendMode: "multiply",
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"220\" height=\"220\" viewBox=\"0 0 220 220\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.67\" numOctaves=\"3\" stitchTiles=\"stitch\" seed=\"838\"/%3E%3CfeColorMatrix type=\"saturate\" values=\"0\"/%3E%3C/filter%3E%3Crect width=\"220\" height=\"220\" fill=\"%233c2218\" filter=\"url(%23n)\" opacity=\"0.38\"/%3E%3C/svg%3E')",
          backgroundRepeat: "repeat",
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          width: "100%",
          maxWidth: "min(72rem, calc(100vw - 2rem))",
          padding: "0 1rem",
        }}
      >
        {/* Scrollable postcard container */}
        <div
          ref={containerRef}
          className="gallery-scroll-hide"
          style={{
            overflowX: "auto",
            overflowY: "visible",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            width: "min(100%, calc((clamp(16rem, 25vw, 21.5rem) * 3) + (clamp(1rem, 2.4vw, 2rem) * 2)))",
            scrollSnapType: "x mandatory",
            overscrollBehaviorX: "contain",
          }}
        >
          <style>{`
            .gallery-scroll-hide::-webkit-scrollbar { display: none; }
          `}</style>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(1rem, 2.4vw, 2rem)",
              width: "max-content",
              padding: "0.25rem 0 0.5rem",
            }}
          >
            {galleryPhotos.map((photo, index) => {
              const { frame, doodle, doodleY } = postcards[index % postcards.length];
              const isFirstInGroup = index % 3 === 0;

              return (
                <div
                  key={index}
                  data-card-index={index}
                  style={{
                    /* Landscape container matching the frame PNG: 276w x 216h */
                    width: "clamp(16rem, 25vw, 21.5rem)",
                    aspectRatio: CONTAINER_AR,
                    flexShrink: 0,
                    position: "relative",
                    scrollSnapAlign: isFirstInGroup ? "start" : undefined,
                    /* No background or border-radius — the frame PNG carries its
                       own rounded outline and transparent corners. */
                  }}
                >
                  {/* PNG postcard frame — fills the card, drawn behind the photo. */}
                  <img
                    src={frame}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "fill",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  />

                  {/* Photo layer — sits inside the frame's inner window. */}
                  <div
                    style={{
                      position: "absolute",
                      top: PHOTO_INSET_Y,
                      left: PHOTO_INSET_X,
                      right: PHOTO_INSET_X,
                      bottom: PHOTO_INSET_Y,
                      borderRadius: "4px",
                      overflow: "hidden",
                      zIndex: 2,
                      background: "#f8f1e4",
                    }}
                  >
                    {photo ? (
                      <img
                        src={photo}
                        alt={`Gallery photo ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "100%",
                          objectFit: "cover",
                          objectPosition: "center",
                          display: "block",
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: "100%",
                          height: "100%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#130043",
                          fontSize: "0.85rem",
                          fontFamily: "Kovanov, Georgia, serif",
                          letterSpacing: "0.05em",
                        }}
                      >
                        Photo {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Doodle motif — rides the left border band, above the photo
                      so it is never clipped by the photo window. */}
                  {doodle && (
                    <img
                      src={doodle}
                      alt=""
                      aria-hidden="true"
                      draggable={false}
                      style={{
                        position: "absolute",
                        left: DOODLE_LEFT,
                        ...doodleY,
                        width: DOODLE_WIDTH,
                        height: "auto",
                        zIndex: 3,
                        pointerEvents: "none",
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Pagination dots */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            marginTop: "clamp(0.5rem, 1.2vw, 0.875rem)",
            /* Shift only the dots upward — a transform leaves the row's box in
               flow, so the rule below the footer keeps its original position. */
            transform: "translateY(-0.75rem)",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <button
            type="button"
            onClick={() => scrollToPage(currentPage - 1)}
            disabled={currentPage === 0}
            aria-label="Previous photos"
            style={{ ...galleryArrowStyle, opacity: currentPage === 0 ? 0.3 : 1 }}
          >
            <img src={leftArr} alt="" style={{ width: "1.1rem", aspectRatio: "1 / 1", display: "block" }} />
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              onClick={() => scrollToPage(i)}
              aria-label={`Go to page ${i + 1}`}
              style={{
                width: currentPage === i ? "32px" : "10px",
                height: "10px",
                borderRadius: "5px",
                border: "none",
                background:
                  currentPage === i ? "#580A0A" : "rgba(88, 10, 10, 0.35)",
                cursor: "pointer",
                transition: "all 0.3s ease",
                padding: 0,
              }}
            />
          ))}
          <button
            type="button"
            onClick={() => scrollToPage(currentPage + 1)}
            disabled={currentPage >= totalPages - 1}
            aria-label="Next photos"
            style={{
              ...galleryArrowStyle,
              opacity: currentPage >= totalPages - 1 ? 0.3 : 1,
            }}
          >
            <img src={rightArr} alt="" style={{ width: "1.1rem", aspectRatio: "1 / 1", display: "block" }} />
          </button>
        </div>
      </div>
    </footer>
  );
}

const galleryArrowStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  padding: "0.5rem",
  margin: "0 0.25rem",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  transition: "opacity 0.2s ease",
};
