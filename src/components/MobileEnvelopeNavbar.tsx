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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  useEffect(() => {
    let frameId: number | null = null;
    let currentIsVisible = false;

    const updateNavbarVisibility = () => {
      frameId = null;

      const aboutSection = document.querySelector("#about");
      if (!aboutSection) return;

      const navOffset = 56;
      const threshold = aboutSection.getBoundingClientRect().top + window.scrollY - navOffset;
      const nextIsVisible = window.scrollY >= threshold;

      if (nextIsVisible !== currentIsVisible) {
        currentIsVisible = nextIsVisible;
        setIsVisible(nextIsVisible);
        if (!nextIsVisible) setIsOpen(false);
      }
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateNavbarVisibility);
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", handleScroll);
    updateNavbarVisibility();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
    };
  }, []);

  return (
    <nav
      className={`mobile-envelope-navbar ${isVisible ? "is-visible" : ""} ${isOpen ? "is-open" : ""}`}
      aria-label="Mobile navigation"
      aria-hidden={!isVisible}
    >
      <button
        type="button"
        className="mobile-envelope-toggle"
        aria-label={isOpen ? "Close navigation menu" : "Open navigation menu"}
        aria-expanded={isOpen}
        tabIndex={isVisible ? 0 : -1}
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
