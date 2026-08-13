import { useEffect, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import closedEnv from "../assets/closed.svg";
import openEnv from "../assets/open.svg";
import "./MobileEnvelopeNavbar.css";

const navItems = [
  { label: "Home", href: "#home" },
  { label: "About", href: "#about" },
  { label: "Events", href: "#events" },
  { label: "Best Chapter", href: "#best-chapter" },
  { label: "Blogs", href: "#blogs" },
  { label: "Women in STEM", href: "#title-card-section" },
  { label: "Team", href: "#team" },
  { label: "Contributors", href: "#contributors" },
];

function scrollToSection(href: string) {
  const target = document.querySelector(href);
  if (!target) return;

  const navOffset = 56;
  const titleCardOffset = href === "#title-card-section" ? 24 : 0;
  const targetTop =
    target.getBoundingClientRect().top +
    window.scrollY -
    navOffset +
    titleCardOffset;

  window.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });

  const refreshAfterScroll = () => {
    ScrollTrigger.refresh();

    const globeEl = document.querySelector(
      ".globe-fixed-container",
    ) as HTMLElement | null;
    if (globeEl && href !== "#women-in-stem") {
      globeEl.style.visibility = "hidden";
      globeEl.style.pointerEvents = "none";
    }
  };

  if ("onscrollend" in window) {
    window.addEventListener("scrollend", refreshAfterScroll, { once: true });
  } else {
    globalThis.setTimeout(refreshAfterScroll, 650);
  }
}

export default function MobileEnvelopeNavbar() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <nav className="mobile-envelope-navbar" aria-label="Mobile navigation">
      <button
        type="button"
        className="mobile-envelope-toggle"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <img src={isOpen ? openEnv : closedEnv} alt="" />
      </button>

      <div
        className={`mobile-envelope-links ${isOpen ? "is-open" : ""}`}
        aria-hidden={!isOpen}
      >
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="mobile-envelope-link"
            tabIndex={isOpen ? 0 : -1}
            onClick={(event) => {
              event.preventDefault();
              setIsOpen(false);
              scrollToSection(item.href);
            }}
          >
            {item.label}
          </a>
        ))}
      </div>
    </nav>
  );
}
