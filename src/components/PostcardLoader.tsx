import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import loaderMarkup from "../assets/Loader.svg?raw";

const SVG_NS = "http://www.w3.org/2000/svg";

/**
 * The loader SVG's own CSS keyframes run for 3s (envelope opens, postcard
 * slides out and settles). The handwriting starts right after that, once
 * the card is fully visible.
 */
const LOADER_INTRO_SECONDS = 3.05;

const FONT_STACK =
  "'Segoe Script', 'Brush Script MT', 'Lucida Handwriting', cursive";

/**
 * The postcard's ruled address lines, in the coordinate frame of
 * #Group_1000007222 (the group that carries the postcard, so the text rides
 * its slide-out animation). The lines sit at y ≈ 163.1, 185.3, 207.5, 229.7,
 * 251.9 and span x ≈ 262.7 → 449.8. Each entry writes one line of text with
 * its baseline resting on a rule, revealed left to right.
 */
const LINES = [
  { text: "welcome to", x: 266, baseline: 184 },
  { text: "acm-w", x: 266, baseline: 206.2 },
];

const REVEAL_PADDING = 8;
/** Left-to-right reveal speed, in postcard units per second. */
const WRITE_SPEED = 105;
const LINE_GAP_SECONDS = 0.08;
const HEART_GAP_SECONDS = 0.04;

/** Little heart outline (~10 wide, ~10 tall, dip at 0,0, point at 0,3). */
const HEART_D =
  "M 0,3 C -1.2,0.6 -5,-1.4 -5,-4 C -5,-6 -3.4,-7 -1.9,-7 C -0.8,-7 0,-6.4 0,-5.4 C 0,-6.4 0.8,-7 1.9,-7 C 3.4,-7 5,-6 5,-4 C 5,-1.4 1.2,0.6 0,3";
const HEART_GAP = 10;

export default function PostcardLoader() {
  const containerRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const cardGroup = container.querySelector<SVGGElement>(
      "#Group_1000007222",
    );
    if (!cardGroup) return;

    const writing = document.createElementNS(SVG_NS, "g");
    writing.setAttribute("aria-hidden", "true");

    const textEls: SVGTextElement[] = [];
    const clipRects = LINES.map(({ text, x, baseline }, i) => {
      const clipId = `postcard-writing-clip-${i}`;

      const clipPath = document.createElementNS(SVG_NS, "clipPath");
      clipPath.setAttribute("id", clipId);
      const rect = document.createElementNS(SVG_NS, "rect");
      rect.setAttribute("x", String(x - 4));
      rect.setAttribute("y", String(baseline - 24));
      rect.setAttribute("width", "0");
      rect.setAttribute("height", "34");
      clipPath.appendChild(rect);

      const textEl = document.createElementNS(SVG_NS, "text");
      textEl.setAttribute("x", String(x));
      textEl.setAttribute("y", String(baseline));
      textEl.setAttribute("fill", "#221a14");
      textEl.setAttribute("font-family", FONT_STACK);
      textEl.setAttribute("font-size", "15");
      textEl.setAttribute("clip-path", `url(#${clipId})`);
      textEl.textContent = text;

      writing.appendChild(clipPath);
      writing.appendChild(textEl);
      textEls.push(textEl);
      return rect;
    });

    // Hand-drawn heart after the last line's text; positioned lazily so the
    // text width is measured with the final (loaded) font.
    const heart = document.createElementNS(SVG_NS, "path");
    heart.setAttribute("d", HEART_D);
    heart.setAttribute("fill", "none");
    heart.setAttribute("stroke", "#221a14");
    heart.setAttribute("stroke-width", "1.1");
    heart.setAttribute("stroke-linecap", "round");
    heart.setAttribute("stroke-linejoin", "round");
    heart.setAttribute("visibility", "hidden");
    writing.appendChild(heart);

    cardGroup.appendChild(writing);

    const lastLine = LINES[LINES.length - 1];
    const positionHeart = () => {
      const textWidth = textEls[textEls.length - 1].getComputedTextLength();
      heart.setAttribute(
        "transform",
        `translate(${lastLine.x + textWidth + HEART_GAP} ${lastLine.baseline - 3})`,
      );
      heart.setAttribute("visibility", "visible");
    };

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timeline: gsap.core.Timeline | null = null;
    const getRevealWidths = () =>
      textEls.map((textEl) =>
        Math.ceil(textEl.getComputedTextLength()) + REVEAL_PADDING,
      );

    if (reduceMotion) {
      const revealWidths = getRevealWidths();
      clipRects.forEach((rect, i) =>
        rect.setAttribute("width", String(revealWidths[i])),
      );
      positionHeart();
    } else {
      timeline = gsap.timeline({ delay: LOADER_INTRO_SECONDS });
      const revealWidths = getRevealWidths();
      clipRects.forEach((rect, i) => {
        const revealWidth = revealWidths[i];
        timeline!.to(
          rect,
          {
            attr: { width: revealWidth },
            duration: revealWidth / WRITE_SPEED,
            ease: "power1.inOut",
          },
          `>${LINE_GAP_SECONDS}`,
        );
      });
      // Draw the heart's outline once the text has finished writing.
      timeline.call(() => {
        positionHeart();
        const length = heart.getTotalLength();
        gsap.set(heart, { strokeDasharray: length, strokeDashoffset: length });
        gsap.to(heart, {
          strokeDashoffset: 0,
          duration: 0.35,
          ease: "power1.out",
        });
      }, undefined, `>${HEART_GAP_SECONDS}`);
    }

    return () => {
      timeline?.kill();
      writing.remove();
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="fullscreen-animation"
      role="img"
      aria-label="Envelope opening to reveal a postcard that reads welcome to acm-w, with a little heart"
      dangerouslySetInnerHTML={{ __html: loaderMarkup }}
    />
  );
}
