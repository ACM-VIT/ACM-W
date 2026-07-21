import PaperPlaneAnimation from "../components/PaperPlaneAnimation";

export default function BestChapter() {
  return (
    <div
      data-award-card
      style={{
        position: "relative",
        width: "100%",
        paddingTop: "clamp(3rem, 8vh, 5rem)",
        paddingBottom: "clamp(6rem, 16vh, 10rem)",
        overflow: "visible",
      }}
    >
      <div
        style={{
          background: "#B49880",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "clamp(4rem, 12vh, 6.25rem) clamp(1rem, 4vw, 1.5rem)",
          position: "relative",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontFamily: "Kovanov, Georgia, serif",
            fontWeight: "bold",
            fontSize: "clamp(2.8rem, 7vw, 6.5rem)",
            color: "#580A0A",
            margin: 0,
            lineHeight: 1.05,
            textTransform: "uppercase",
            letterSpacing: "0.03em",
            textAlign: "center",
          }}
        >
          Best Emerging
          <br />
          Chapter
        </h2>

        <p
          style={{
            fontFamily: "Kovanov, serif",
            fontStyle: "normal",
            fontWeight: "normal",
            fontSize: "clamp(1.1rem, 2vw, 1.6rem)",
            color: "#580A0A",
            margin: 0,
            marginTop: "clamp(1rem, 3vh, 1.5rem)",
            textAlign: "center",
          }}
        >
          By ACM India
        </p>
      </div>

      <PaperPlaneAnimation />
    </div>
  );
}
