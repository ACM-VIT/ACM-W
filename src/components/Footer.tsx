import footerBlack1 from "../assets/footer/footer_black1.png";
import footerPink1 from "../assets/footer/footer_pink1.png";
import footerBlack2 from "../assets/footer/footer_black2.png";
import footerPink2 from "../assets/footer/footer_pink2.png";

const footerCards = [footerBlack1, footerPink1, footerBlack2, footerPink2];
const cards = [...footerCards, ...footerCards, ...footerCards];

export default function Footer() {
  return (
    <footer className="relative w-full overflow-hidden bg-[#B49880] py-16 sm:py-20">
      <div
        className="pointer-events-none absolute inset-0 z-0 opacity-25 mix-blend-multiply"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=\"http://www.w3.org/2000/svg\" width=\"160\" height=\"160\" viewBox=\"0 0 160 160\"%3E%3Cfilter id=\"n\"%3E%3CfeTurbulence type=\"fractalNoise\" baseFrequency=\"0.8\" numOctaves=\"2\" stitchTiles=\"stitch\"/%3E%3C/filter%3E%3Crect width=\"160\" height=\"160\" filter=\"url(%23n)\" opacity=\"0.5\"/%3E%3C/svg%3E')",
          backgroundRepeat: "repeat",
        }}
      />

      <div className="relative z-10 mx-auto flex w-full max-w-6xl flex-col items-center px-6">
        <div
          style={{
            overflowX: "auto",
            overflowY: "visible",
            msOverflowStyle: "none",
            scrollbarWidth: "none",
            width: "100%",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "clamp(1rem, 4vw, 3.5rem)",
              width: "max-content",
              padding: "0.25rem 0.25rem 0.5rem",
            }}
          >
            {cards.map((card, index) => (
              <div
                key={`${card}-${index}`}
                style={{
                  width: "clamp(8rem, 18vw, 15rem)",
                  aspectRatio: "1 / 1",
                  flexShrink: 0,
                }}
              >
                <img
                  src={card}
                  alt=""
                  style={{
                    display: "block",
                    width: "100%",
                    height: "100%",
                    objectFit: "contain",
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
