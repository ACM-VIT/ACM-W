import { useEffect, useState } from "react";
import EnvelopeMenu from "./EnvelopeMenu";
import loaderAnimationPath from "./assets/loader.json?url";
import { LottieAnimation } from "./components/LottieAnimation";
import BlogStamps from "./pages/BlogStamps";
import ContributorsSection from "./pages/Contributors";
import TeamPage from "./pages/TeamPage";
import WomenInStem from "./pages/WomenInStem";
import "./App.css";

// Automatically manages showing the navbar when you scroll PAST the landing section
function GlobalNavbar() {
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    let frameId: number | null = null;
    let currentShowNavbar = false;

    const updateNavbarVisibility = () => {
      frameId = null;
      const nextShowNavbar = window.scrollY > window.innerHeight * 0.5;

      if (nextShowNavbar !== currentShowNavbar) {
        currentShowNavbar = nextShowNavbar;
        setShowNavbar(nextShowNavbar);
      }
    };

    const handleScroll = () => {
      if (frameId === null) {
        frameId = window.requestAnimationFrame(updateNavbarVisibility);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    // run once on mount
    updateNavbarVisibility();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);

      if (frameId !== null) {
        window.cancelAnimationFrame(frameId);
      }
    };
  }, []);

  return (
    <div
      className={`fixed top-12 left-12 z-50 transition-all duration-500 origin-center ${
        showNavbar ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
      }`}
    >
      <EnvelopeMenu />
    </div>
  );
}

export default function App() {
  return (
    <main className="relative overflow-x-hidden bg-[#fff9e9]">
      <GlobalNavbar />

      <section id="home" className="fullscreen-lottie">
        <LottieAnimation
          animationPath={loaderAnimationPath}
          className="fullscreen-animation"
        />
      </section>

      <AboutSections />

      <section
        id="blogs"
        style={{
          position: "relative",
          zIndex: 20,
        }}
      >
        <BlogStamps />
      </section>

      <section
        id="women-in-stem"
        style={{
          position: "relative",
          zIndex: 10,
          background: "#fff9e9",
        }}
      >
        <WomenInStem />
      </section>

      <section
        id="team"
        style={{
          position: "relative",
          zIndex: 5,
        }}
      >
        <TeamPage />
      </section>

      <section
        id="contributors"
        style={{
          position: "relative",
          zIndex: 1,
        }}
      >
        <ContributorsSection />
      </section>
    </main>
  );
}

function AboutSections() {
  return (
    <section className="relative z-20 bg-[#fff9e9] px-6 py-20 text-[#580A0A] sm:py-24">
      <div className="mx-auto grid w-full max-w-6xl gap-10 md:grid-cols-2">
        <article id="about-acmw" className="scroll-mt-24">
          <p className="mb-3 text-sm uppercase tracking-[0.24em] text-[#7a4444]">
            Chapter
          </p>
          <h2
            className="mb-6 text-[32px] font-bold tracking-[0.08em] sm:text-[40px]"
            style={{ fontFamily: "Kovanov, Georgia, serif" }}
          >
            ABOUT ACM-W
          </h2>
          <p className="text-lg leading-8 text-[#5e4d4d]">
            ACM-W celebrates, supports, and advocates for women in computing.
            The chapter builds a space for technical growth, mentorship,
            collaboration, and leadership through community initiatives and
            events.
          </p>
        </article>

        <article id="about-acm" className="scroll-mt-24">
          <p className="mb-3 text-sm uppercase tracking-[0.24em] text-[#7a4444]">
            Community
          </p>
          <h2
            className="mb-6 text-[32px] font-bold tracking-[0.08em] sm:text-[40px]"
            style={{ fontFamily: "Kovanov, Georgia, serif" }}
          >
            ABOUT ACM
          </h2>
          <p className="text-lg leading-8 text-[#5e4d4d]">
            ACM connects students and computing professionals through projects,
            research, workshops, and peer learning. The student chapter brings
            that culture of curiosity and engineering practice to campus.
          </p>
        </article>
      </div>
    </section>
  );
}
