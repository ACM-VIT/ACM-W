import loaderAnimationPath from "./assets/loader.json?url";
import { LottieAnimation } from "./components/LottieAnimation";
import BlogStamps from "./pages/BlogStamps";
import TeamPage from "./pages/TeamPage";
import WomenInStem from "./pages/WomenInStem";
import ContributorsSection from "./pages/Contributors";
import "./App.css";

export default function App() {
  return (
    <main className="overflow-x-hidden">
      <section className="fullscreen-lottie">
        <LottieAnimation
          animationPath={loaderAnimationPath}
          className="fullscreen-animation"
        />
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
        style={{
          position: "relative",
          zIndex: 10,
          background: "#fff9e9",
        }}
      >
        <WomenInStem />
      </section>

      <section
        style={{
          position: "relative",
          zIndex: 5,
        }}
      >
        <TeamPage />
      </section>

      <section
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
