import About from './pages/About';
import BlogStamps from "./pages/BlogStamps";
import TeamPage from "./pages/TeamPage";
import WomenInStem from "./pages/WomenInStem";
import ContributorsSection from "./pages/Contributors";
import { useState, useEffect } from 'react';
import EnvelopeMenu from './EnvelopeMenu';
import './App.css';

// A section placeholder for teammates to replace with their own components later
function Section({ id, title }: { id: string, title: string }) {
  return (
    <main className="overflow-x-hidden">
      <section
      style={{
          position: "relative",
          zIndex: 20,
        }}>
      <About />
      </section>

      <section
        style={{
          position: "relative",
          zIndex: 20,
        }}
      >
        <BlogStamps />
      </section>

      <section
        id="women-in-stem-section"
        style={{
          position: "relative",
          zIndex: 10,
          background: "#fff9e9",
        }}
      >
        <WomenInStem />
      </section>

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
    <div
      className="bg-[#e6ddd0] font-sans relative overflow-x-hidden"
      style={{
        backgroundImage:
          `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160' viewBox='0 0 160 160'%3E%3Crect width='160' height='160' fill='%23e6ddd0'/%3E%3Cg fill='%234a1010' fill-opacity='0.05'%3E%3Ccircle cx='18' cy='24' r='1'/%3E%3Ccircle cx='62' cy='41' r='1'/%3E%3Ccircle cx='121' cy='29' r='1'/%3E%3Ccircle cx='33' cy='86' r='1'/%3E%3Ccircle cx='95' cy='74' r='1'/%3E%3Ccircle cx='142' cy='98' r='1'/%3E%3Ccircle cx='49' cy='131' r='1'/%3E%3Ccircle cx='109' cy='143' r='1'/%3E%3Ccircle cx='149' cy='151' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      {/* Global Nav that watches scroll */}
      <GlobalNavbar />

      {/* The Landing Page (Takes up exactly one full screen height) */}
      <section id="home" className="h-screen flex flex-col items-center justify-center text-[#4a1010] border-b border-[#4a1010]/20">
        <h1 className="text-6xl font-serif font-bold mb-4 tracking-wider text-center">Welcome to ACM-W</h1>
        <p className="text-xl italic">Scroll down to see the envelope appear...</p>
      </section>

      {/* 
        The Scrollable Sections your teammates will build!
        Right now, they're placeholders, but they correspond to the Envelope links.
      */}
      <Section id="about-acmw" title="About ACM-W" />
      <Section id="about-acm" title="About ACM" />
      <Section id="contributors" title="Contributors" />
      <Section id="team" title="The Team" />
      <Section id="blogs" title="Blogs" />
      <Section id="women-in-stem" title="Women in Stem" />
      
      <footer className="h-40 flex items-center justify-center text-[#4a1010]/60">
        End of page
      </footer>
    </div>
  );
}
