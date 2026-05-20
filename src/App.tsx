import BlogStamps from "./pages/BlogStamps";
import WomenInStem from "./pages/WomenInStem";

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
    </main>
  );
}