import { useEffect, useState } from "react";
import EnvelopeMenu from "./EnvelopeMenu";
import EnvelopeFooter from './components/EnvelopeFooter';
import PostcardLoader from "./components/PostcardLoader";
import About from "./pages/About";
import BlogStamps from "./pages/BlogStamps";
import ContributorsSection from "./pages/Contributors";
import Events from "./pages/Events";
import BestChapter from "./pages/BestChapter";
import TeamPage from "./pages/TeamPage";
import WomenInStem from "./pages/WomenInStem";
import Footer from "./components/Footer";
import TitleCard from "./components/TitleCard";

import "./App.css";

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
    updateNavbarVisibility();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (frameId !== null) window.cancelAnimationFrame(frameId);
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
        <PostcardLoader />
      </section>

      <section id="about" style={{ position: "relative", zIndex: 20 }}>
        <About />
      </section>

      <section id="events" style={{ position: "relative", zIndex: 20 }}>
        <Events />
      </section>

      <section id="best-chapter" style={{ position: "relative", zIndex: 20 }}>
        <BestChapter />
      </section>

      <section id="blogs" style={{ position: "relative", zIndex: 20 }}>
        <BlogStamps />
      </section>

      <section id="title-card-section" style={{ position: "relative", zIndex: 15 }}>
        <TitleCard />
      </section>

      <section
        id="women-in-stem"
        style={{ position: "relative", zIndex: 10, background: "#fff9e9" }}
      >
        <WomenInStem />
      </section>

      {/* Higher z-index than women-in-stem so TeamPage always renders on top */}
      <section id="team" style={{ position: "relative", zIndex: 20 }}>
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

        <Footer />
        
      <section
        id="envelope-footer"
        style={{
          position: "relative",
          zIndex: 0,
        }}
      >
        <EnvelopeFooter />
      </section>
    </main>
  );
}
