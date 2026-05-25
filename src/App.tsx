import { useState, useEffect } from 'react';
import EnvelopeMenu from './EnvelopeMenu';
import './App.css';

// A section placeholder for teammates to replace with their own components later
function Section({ id, title }: { id: string, title: string }) {
  return (
    <section id={id} className="min-h-screen flex flex-col items-center justify-center px-8 border-b border-[#4a1010]/20 text-[#4a1010]">
      <h2 className="text-4xl font-serif font-bold mb-4">{title}</h2>
      <p>This is the placeholder section for {title}. Your teammates will build here.</p>
    </section>
  );
}

// Automatically manages showing the navbar when you scroll PAST the landing section
function GlobalNavbar() {
  const [showNavbar, setShowNavbar] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      // If the scroll position is further down than half the window height (Landing Page), show it
      if (window.scrollY > window.innerHeight * 0.5) {
        setShowNavbar(true);
      } else {
        setShowNavbar(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // run once on mount
    handleScroll();
    
    return () => window.removeEventListener('scroll', handleScroll);
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

function App() {
  return (
    <div className="bg-[url('https://www.transparenttextures.com/patterns/cream-paper.png')] bg-[#e6ddd0] font-sans relative overflow-x-hidden">
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

export default App;
