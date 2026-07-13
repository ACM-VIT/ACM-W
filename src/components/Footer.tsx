import { useState, useRef, useEffect, useCallback } from "react";

// Postcard frame PNGs — portrait 432×552 (or 216×276); rotated -90° to landscape
import footerPink1 from "../assets/footer/footer_pink1.png";
import footerBlack1 from "../assets/footer/footer_black1.png";
import footerPink2 from "../assets/footer/footer_pink2.png";
import footerBlack2 from "../assets/footer/footer_black2.png";

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

// Alternating postcard frames — portrait PNGs rotated -90deg to landscape
const postcardFrames = [footerPink1, footerBlack1, footerPink2, footerBlack2];
const postcardAccentColors = ["#FEC3E3", "#130043", "#FEC3E3", "#130043"];

/*
 * Frame geometry (from SVG reference):
 *   Portrait frame PNG: 216 × 275  (or 432 × 552 at 2×)
 *   After -90deg rotation -> landscape: 275w x 216h
 *
 * The container is sized as 275:216 landscape.
 * Inside the container the frame image is rotated -90°.
 *
 * When an element is rotated -90° with transform-origin: center center:
 *   - Its rendered width = original height
 *   - Its rendered height = original width
 * To fill the container exactly:
 *   - Set the frame img width  = container height (216 units, becomes rendered height after rotation)
 *   - Set the frame img height = container width  (275 units, becomes rendered width after rotation)
 * In percentage terms (relative to container):
 *   - img width  = (containerH / containerW) * 100% = (216 / 275) * 100% ~= 78.55%
 *   - img height = (containerW / containerH) * 100% = (275 / 216) * 100% ~= 127.31%
 */
const FRAME_W = 216; // original portrait width
const FRAME_H = 275; // original portrait height
// Landscape container aspect ratio after rotation
const CONTAINER_AR = `${FRAME_H} / ${FRAME_W}`; // "275 / 216"
// Frame img sizing (percentages of container)
const IMG_WIDTH_PCT = `${((FRAME_W / FRAME_H) * 100).toFixed(2)}%`;   // ~78.55%
const IMG_HEIGHT_PCT = `${((FRAME_H / FRAME_W) * 100).toFixed(2)}%`;  // ~127.31%
const CARDS_PER_PAGE = 3;

export default function Footer() {
  const [currentPage, setCurrentPage] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelLockRef = useRef(false);
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

  // Wheel moves through three-card pages: 1-3, then 4-6, then 7-9.
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      // Only shift on horizontal scroll
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;

      const delta = e.deltaX;
      if (delta === 0) return;

      const nextPage = currentPage + (delta > 0 ? 1 : -1);
      if (nextPage < 0 || nextPage >= totalPages) return;

      e.preventDefault();
      if (wheelLockRef.current) return;
      wheelLockRef.current = true;
      scrollToPage(nextPage);
      window.setTimeout(() => {
        wheelLockRef.current = false;
      }, 650);
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [currentPage, scrollToPage, totalPages]);

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
              const frame = postcardFrames[index % postcardFrames.length];
              const accentColor = postcardAccentColors[index % postcardAccentColors.length];
              const isFirstInGroup = index % 3 === 0;

              return (
                <div
                  key={index}
                  data-card-index={index}
                  style={{
                    /* Landscape container: 275w x 216h (frame rotated -90deg) */
                    width: "clamp(16rem, 25vw, 21.5rem)",
                    aspectRatio: CONTAINER_AR,
                    flexShrink: 0,
                    position: "relative",
                    scrollSnapAlign: isFirstInGroup ? "start" : undefined,
                    overflow: "hidden",
                    background: "#f8f1e4",
                    borderRadius: "18px",
                    /* No explicit border-radius — the frame PNG has its own rounded corners */
                  }}
                >
                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: 0,
                      zIndex: 0,
                      background: "#f8f1e4",
                    }}
                  />

                  {/* PNG postcard base — rotated -90° from portrait to landscape.
                      Sized so that after rotation, the frame exactly covers the container. */}
                  <img
                    src={frame}
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    style={{
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      width: IMG_WIDTH_PCT,
                      height: IMG_HEIGHT_PCT,
                      objectFit: "fill",
                      transform: "translate(-50%, -50%) rotate(-90deg)",
                      transformOrigin: "center center",
                      zIndex: 1,
                      pointerEvents: "none",
                    }}
                  />

                  {/* Photo layer — clipped inside the postcard outline and rendered above the base. */}
                  <div
                    style={{
                      position: "absolute",
                      top: "13%",
                      left: "10%",
                      right: "10%",
                      bottom: "13%",
                      borderRadius: "6px",
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

                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: "5%",
                      zIndex: 3,
                      border: `clamp(8px, 1.4vw, 18px) solid ${accentColor}`,
                      borderRadius: "14px",
                      pointerEvents: "none",
                      boxSizing: "border-box",
                    }}
                  />

                  <div
                    aria-hidden="true"
                    style={{
                      position: "absolute",
                      inset: "10%",
                      zIndex: 4,
                      border: "clamp(4px, 0.85vw, 11px) solid #F8F6F1",
                      borderRadius: "8px",
                      pointerEvents: "none",
                      boxSizing: "border-box",
                    }}
                  />
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
            justifyContent: "center",
          }}
        >
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
        </div>
      </div>
    </footer>
  );
}
