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

const REVEAL_WIDTH = 190;
/** Left-to-right reveal speed, in postcard units per second. */
const WRITE_SPEED = 90;

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
      return rect;
    });

    cardGroup.appendChild(writing);

    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let timeline: gsap.core.Timeline | null = null;
    if (reduceMotion) {
      clipRects.forEach((rect) =>
        rect.setAttribute("width", String(REVEAL_WIDTH)),
      );
    } else {
      timeline = gsap.timeline({ delay: LOADER_INTRO_SECONDS });
      clipRects.forEach((rect) => {
        timeline!.to(
          rect,
          {
            attr: { width: REVEAL_WIDTH },
            duration: REVEAL_WIDTH / WRITE_SPEED,
            ease: "power1.inOut",
          },
          ">0.25",
        );
      });
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
      aria-label="Envelope opening to reveal a postcard that reads welcome to acm-w"
      dangerouslySetInnerHTML={{ __html: loaderMarkup }}
    />
  );
}
