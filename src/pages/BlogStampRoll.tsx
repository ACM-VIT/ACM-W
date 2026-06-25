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
        padding: "20px 12px 30px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
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
          fontSize: 32,
          marginBottom: 20,
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
                  width: "88vw",
                  maxWidth: 340,
                  height: 460,
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
                        height: 220,
                        objectFit: "cover",
                      }}
                    />

                    <div
                      style={{
                        flex: 1,
                        display: "flex",
                        flexDirection: "column",
                        padding: 12,
                      }}
                    >
                      <h3
                        style={{
                          margin: 0,
                          textAlign: "center",
                          color: "#3a1212",
                          fontSize: 16,
                          lineHeight: 1.3,
                        }}
                      >
                        {blog.title}
                      </h3>

                      <p
                        style={{
                          marginTop: 8,
                          marginBottom: 12,
                          textAlign: "center",
                          fontStyle: "italic",
                          color: "#6b1a1a",
                          fontSize: 12,
                        }}
                      >
                        By: {blog.author}
                      </p>

                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 11,
                          color: "#8b4040",
                          marginBottom: 10,
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
                          fontSize: 12,
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
                          marginTop: 12,
                          color: "#6b1a1a",
                          textDecoration: "underline",
                          fontSize: 13,
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
            padding: 4,
          }}
        >
          <img src={leftArr} alt="" style={{ width: 22, height: 22 }} />
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
            padding: 4,
          }}
        >
          <img src={rightArr} alt="" style={{ width: 22, height: 22 }} />
        </button>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          marginTop: 18,
        }}
      >
        {blogs.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            style={{
              width: 8,
              height: 8,
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
          marginTop: 8,
          color: "#6b1212",
          fontWeight: 600,
          fontSize: 13,
        }}
      >
        {current + 1} / {blogs.length}
      </div>
    </div>
  );
}