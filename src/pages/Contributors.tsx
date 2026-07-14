import { useState, useRef, useEffect } from "react";
import cardBg from "../assets/contributors/ContributorsPostcard.png";

import githubIcon from "../assets/teams/github.png";
import linkedinIcon from "../assets/teams/linkedin.png";
import tamanna from "../assets/contributors/tamanna.png";
import maitri from "../assets/contributors/maitri.png";
import ishita from "../assets/contributors/ishita.png";
import nitu from "../assets/contributors/nitu.png";
import jahnavi from "../assets/contributors/jahnavi.png";
import sudiksha from "../assets/contributors/sudiksha.png";
import chinmayee from "../assets/contributors/chinmayee.png";
import ananya from "../assets/contributors/ananya.png";
import nimesha from "../assets/contributors/nimesha.png";

const imageMap = {
  ananya, chinmayee, jahnavi, nimesha, nitu, sudiksha, maitri, tamanna, ishita,
};

type ImageKey = keyof typeof imageMap;

type SocialLink = {
  href?: string;
  iconSrc: string;
  label: string;
};

type Contributor = {
  name: string;
  imageSrc: ImageKey;
  bio: string;
  primaryLink?: SocialLink;
  secondaryLink?: SocialLink;
};

const contributors: Contributor[] = [
  {
    name: "Aribam Tamanna Sharma",
    imageSrc: "tamanna",
    bio: "Do your best in everything. No matter the outcome, you will always be proud that you gave it your all.",
    primaryLink: {
      href: "https://github.com/A-Taman",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/aribam-tamanna-sharma?utm_source=share_via&utm_content=profile&utm_medium=member_android",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Maitri Shah",
    imageSrc: "maitri",
    bio: "Built the auth system & API layer.",
    primaryLink: {
      href: "https://github.com/Maitri-shah29",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/maitri-shah29",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Ishita Joshi",
    imageSrc: "ishita",
    bio: "Have courage and be kind - Cinderella",
    primaryLink: {
      href: "https://github.com/Ishitajoshii",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/ishita-joshi7/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Nitu S U",
    imageSrc: "nitu",
    bio: "You can't go back and change the beginning, but you can start where you are and change the ending",
    primaryLink: {
      href: "https://github.com/nitusuu",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/nitu-s-u-7643b5321/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Jahnavi Singh",
    imageSrc: "jahnavi",
    bio: "Built the auth system & API layer.",
    primaryLink: {
      href: "https://github.com/POSTI-25",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/jahnavisingh512/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Sudiksha Kathuria",
    imageSrc: "sudiksha",
    bio: "For the hope of it all",
    primaryLink: {
      href: "https://github.com/sudiksha-kathuria",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/sudiksha-kathuria/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Chinmayee Badiger",
    imageSrc: "chinmayee",
    bio: "Built the auth system & API layer.",
    primaryLink: {
      href: "https://github.com/chinmayeebadiger",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/chinmayee-badiger-2111a1326/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Ananya Bisht",
    imageSrc: "ananya",
    bio: "It always seems impossible until it's done",
    primaryLink: {
      href: "https://github.com/ananyab1404",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/ananya-bisht-a27036367/",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
  {
    name: "Nimesha Subramanian",
    imageSrc: "nimesha",
    bio: "Built the auth system & API layer.",
    primaryLink: {
      href: "https://github.com/nimeshas",
      iconSrc: githubIcon,
      label: "GitHub",
    },
    secondaryLink: {
      href: "https://www.linkedin.com/in/nimeshas",
      iconSrc: linkedinIcon,
      label: "LinkedIn",
    },
  },
];

function ContributorCard({ contributor }: { contributor: Contributor }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div style={{ width: 200, height: 280, flexShrink: 0, perspective: "900px" }}>
      <div
        style={{
          position: "relative",
          width: "100%",
          height: "100%",
          transformStyle: "preserve-3d",
          transition: "transform 0.55s cubic-bezier(0.4, 0, 0.2, 1)",
          transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
        }}
      >
        {/* ── FRONT ── */}
        <div
          onClick={() => setFlipped(true)}
          style={{
            ...faceBase,
            cursor: "pointer",
            pointerEvents: flipped ? "none" : "auto",
          }}
        >
          <img
            src={cardBg}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 1,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              padding: "12px 12px 0px 12px",
            }}
          >
            <div style={{ flex: 1, overflow: "hidden", borderRadius: 1 }}>
              <img
                src={imageMap[contributor.imageSrc]}
                alt={contributor.name}
                style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "top center", display: "block" }}
              />
            </div>
            <div style={{ height: 46, display: "flex", alignItems: "center", justifyContent: "center", padding: "0 4px" }}>
              <span
                style={{
                  fontSize: 11.5,
                  fontWeight: 700,
                  color: "#000000",
                  textAlign: "center",
                  width: "100%",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: "Kovanov, Georgia, serif",
                  letterSpacing: "0.02em",
                }}
              >
                {contributor.name}
              </span>
            </div>
          </div>
        </div>

        {/* ── BACK ── */}
        <div
          onClick={() => setFlipped(false)}
          style={{
            ...faceBase,
            transform: "rotateY(180deg)",
            cursor: "pointer",
            pointerEvents: flipped ? "auto" : "none",
          }}
        >
          <img
            src={cardBg}
            alt=""
            style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", zIndex: 0 }}
          />
          <div
            style={{
              position: "relative",
              zIndex: 2,
              width: "100%",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "20px 16px",
              gap: 10,
            }}
          >
            <p
              style={{
                fontSize: 13,
                fontWeight: 700,
                color: "#000000",
                textAlign: "center",
                margin: 0,
                fontFamily: "Kovanov, Georgia, serif",
                letterSpacing: "0.05em",
              }}
            >
              {contributor.name}
            </p>

            <div style={{ width: 36, height: 1, borderRadius: 1, flexShrink: 0 }} />

            <p
              style={{
                fontSize: 10.5,
                color: "rgb(0,0,0)",
                textAlign: "center",
                margin: 0,
                lineHeight: 1.6,
                fontFamily: "Kovanov, Georgia, serif",
                fontStyle: "italic",
                flexShrink: 0,
              }}
            >
              {contributor.bio}
            </p>

            <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
              {contributor.primaryLink?.href && (
                <a
                  href={contributor.primaryLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={contributor.primaryLink.label}
                  onClick={(e) => e.stopPropagation()}
                  style={iconLinkStyle}
                >
                  <img
                    src={contributor.primaryLink.iconSrc}
                    alt={contributor.primaryLink.label}
                    style={{ width: 40, height: 40, objectFit: "contain" }}
                  />
                </a>
              )}
              {contributor.secondaryLink?.href && (
                <a
                  href={contributor.secondaryLink.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={contributor.secondaryLink.label}
                  onClick={(e) => e.stopPropagation()}
                  style={iconLinkStyle}
                >
                  <img
                    src={contributor.secondaryLink.iconSrc}
                    alt={contributor.secondaryLink.label}
                    style={{ width: 40, height: 40, objectFit: "contain" }}
                  />
                </a>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ContributorsSection() {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    const onWheel = (e: WheelEvent) => {
      const maxScroll = el.scrollWidth - el.clientWidth;
      if (maxScroll <= 0) return;
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) return;
      const delta = e.deltaX;
      if (delta === 0) return;
      const atStart = el.scrollLeft <= 0 && delta < 0;
      const atEnd = el.scrollLeft >= maxScroll && delta > 0;
      if (atStart || atEnd) return;

      e.preventDefault();
      el.scrollLeft += delta;
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section className="relative w-full overflow-hidden bg-[#B49880] py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-25 mix-blend-multiply"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\" viewBox=\"0 0 160 160\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"2\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"160\" height=\"160\" filter=\"url(%23n)\" opacity=\"0.5\"/%3E%3C/svg%3E')",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6">
        <h2
          className="text-center text-[32px] font-bold tracking-[0.08em] sm:text-[40px]"
          style={{ fontFamily: "Kovanov, Georgia, serif", color: "#580A0A" }}
        >
          CONTRIBUTORS
        </h2>

        <div
          ref={scrollRef}
          className="mt-12 w-full"
          style={{
            overflowX: "auto",
            overflowY: "visible",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
          }}
        >
          <div style={{ display: "flex", gap: 24, width: "max-content", padding: "4px 4px 16px" }}>
            {contributors.map((c) => (
              <ContributorCard key={c.name} contributor={c} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

const faceBase: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  backfaceVisibility: "hidden",
  WebkitBackfaceVisibility: "hidden",
  overflow: "hidden",
};

const iconLinkStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 34,
  height: 34,
  borderRadius: 8,
  textDecoration: "none",
  backdropFilter: "blur(4px)",
};