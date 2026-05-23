import BlogStamps from "./pages/BlogStamps";
import TeamPage from "./pages/TeamPage";
import WomenInStem from "./pages/WomenInStem";
import ContributorsSection from "./pages/Contributors";

export default function App() {
  return (
    <main className="overflow-x-hidden">
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