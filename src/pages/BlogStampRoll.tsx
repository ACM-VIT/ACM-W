import { useState } from "react";
import StampBorder from "../components/StampBorder";
import leftArr from "../assets/leftArr.png";
import rightArr from "../assets/rightArr.png";
import { blogs } from "../data/blogs";

export default function BlogStampRoll() {
  const [current, setCurrent] = useState(0);
  const [touchStart, setTouchStart] = useState<number | null>(null);

  const next = () => {
    setCurrent((prev) => (prev + 1) % blogs.length);
  };

  const prev = () => {
    setCurrent((prev) => (prev - 1 + blogs.length) % blogs.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStart === null) return;

    const diff = touchStart - e.changedTouches[0].clientX;

    if (diff > 50) next();
    else if (diff < -50) prev();

    setTouchStart(null);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#FFF9E9",
        padding: "clamp(1rem, 3vh, 1.25rem) clamp(0.75rem, 3vw, 1rem) clamp(1.5rem, 3vh, 1.5rem)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
        fontFamily: "'Georgia', serif",
      }}
    >
      <h2
        style={{
          fontFamily: "Kovanov, Georgia, serif",
          color: "#580a0a",
          letterSpacing: "0.015em",
          fontWeight: "bold",
          lineHeight: "normal",
          textTransform: "uppercase",
          fontSize: "clamp(2rem, 8vw, 2.4rem)",
          marginBottom: "clamp(1rem, 3vh, 1.25rem)",
        }}
      >
        Blogs
      </h2>

      <div
        style={{
          width: "100%",
          position: "relative",
          overflow: "hidden",
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <div
          style={{
            display: "flex",
            transform: `translateX(-${current * 100}%)`,
            transition: "transform 0.35s ease",
          }}
        >
          {blogs.map((blog) => (
            <div
              key={blog.id}
              style={{
                minWidth: "100%",
                display: "flex",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  width: "75vw",
                  maxWidth: "21.25rem",
                  height: "min(68svh, 112vw)",
                }}
              >
                <StampBorder>
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      width: "100%",
                      height: "100%",
                    }}
                  >
                    <img
                      src={blog.image}
                      alt={blog.title}
                      draggable={false}
                      style={{
                        width: "100%",
                        height: "48%",
                        objectFit: "cover",
                      }}
                    />

                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        padding: "3.5%",
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          textAlign: "center",
                          color: "#3a1212",
                          fontSize: "clamp(0.95rem, 4.2vw, 1rem)",
                          lineHeight: 1.3,
                        }}
                      >
                        {blog.title}
                      </h3>

                      <p
                        style={{
                          marginTop: "2.3%",
                          marginBottom: "3.5%",
                          textAlign: "center",
                          fontStyle: "italic",
                          color: "#6b1a1a",
                          fontSize: "clamp(0.72rem, 3.2vw, 0.75rem)",
                        }}
                      >
                        By: {blog.author}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: "clamp(0.66rem, 3vw, 0.7rem)",
                          color: "#8b4040",
                          marginBottom: "3%",
                        }}
                      >
                        <span>{blog.date}</span>
                        <span>{blog.read}</span>
                      </div>

                      <p
                        style={{
                          flex: 1,
                          margin: 0,
                          overflow: "hidden",
                          fontSize: "clamp(0.72rem, 3.2vw, 0.75rem)",
                          lineHeight: 1.6,
                          color: "#3a1212",
                        }}
                      >
                        {blog.body}
                      </p>

                      <a
                        href={blog.link}
                        target="_blank"
                        rel="noreferrer"
                        style={{
                          textAlign: "center",
                          marginTop: "3.5%",
                          color: "#6b1a1a",
                          textDecoration: "underline",
                          fontSize: "clamp(0.78rem, 3.4vw, 0.82rem)",
                        }}
                      >
                        Read more →
                      </a>
                    </div>
                  </div>
                </StampBorder>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prev}
          aria-label="Previous"
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "1%",
          }}
        >
          <img src={leftArr} alt="" style={{ width: "clamp(1.25rem, 5vw, 1.375rem)", aspectRatio: "1 / 1" }} />
        </button>

        <button
          onClick={next}
          aria-label="Next"
          style={{
            position: "absolute",
            right: 0,
            top: "50%",
            transform: "translateY(-50%)",
            border: "none",
            background: "transparent",
            cursor: "pointer",
            padding: "1%",
          }}
        >
          <img src={rightArr} alt="" style={{ width: "clamp(1.25rem, 5vw, 1.375rem)", aspectRatio: "1 / 1" }} />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginTop: "clamp(1rem, 3vh, 1.125rem)",
        }}
      >
        {blogs.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: "0.5rem",
              aspectRatio: "1 / 1",
              borderRadius: "50%",
              border: "none",
              padding: 0,
              cursor: "pointer",
              background: current === idx ? "#6b1212" : "#d8cdb8",
            }}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: "0.5rem",
          color: "#6b1212",
          fontWeight: 600,
          fontSize: "0.8125rem",
        }}
      >
        {current + 1} / {blogs.length}
      </div>
    </div>
  );
}
