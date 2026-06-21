import { useId, type ReactNode } from "react";

import neuralHack from "../assets/NeuralHack.png";
import insipher from "../assets/Inspiher.svg";
import C2C from "../assets/C2C.png";

function StampBorder({ children }: { children: ReactNode }) {
  const MAROON = "#6b1212";
  const CREAM = "#F2E8CF";

  const scallop = 3;
  const border = 32;
  const gap = 3;

  const maskId = useId();

  const positions: number[] = [];
  const step = scallop * 2 + gap;

  for (let p = 0; p <= 100; p += step) {
    positions.push(p);
  }

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
      }}
    >
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
        }}
      >
        <defs>
          <mask id={maskId}>
            <rect width="100" height="100" fill="white" />

            {positions.map((p) => (
              <circle key={`t-${p}`} cx={p} cy="0" r={scallop} fill="black" />
            ))}

            {positions.map((p) => (
              <circle
                key={`b-${p}`}
                cx={p}
                cy="100"
                r={scallop}
                fill="black"
              />
            ))}

            {positions.map((p) => (
              <circle
                key={`l-${p}`}
                cx="0"
                cy={p}
                r={scallop}
                fill="black"
              />
            ))}

            {positions.map((p) => (
              <circle
                key={`r-${p}`}
                cx="100"
                cy={p}
                r={scallop}
                fill="black"
              />
            ))}
          </mask>
        </defs>

        <rect
          width="100"
          height="100"
          fill={MAROON}
          mask={`url(#${maskId})`}
        />

        <rect
          x={border}
          y={border}
          width={100 - border * 2}
          height={100 - border * 2}
          fill={CREAM}
        />
      </svg>

      <div
        style={{
          position: "absolute",
          inset: border,
          background: CREAM,
        }}
      >
        {children}
      </div>
    </div>
  );
}

function EventStamp({
  logo,
}: {
  logo: string;
}) {
  return (
    <div
      style={{
        width: 820,
        height: 600,
      }}
    >
      <StampBorder>
        <div
          style={{
            width: "100%",
            height: "100%",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <img
            src={logo}
            alt=""
            draggable={false}
            style={{
              width: "82%",
              height: "82%",
              objectFit: "contain",
            }}
          />
        </div>
      </StampBorder>
    </div>
  );
}

const events = [
  {
    title: "C2C",
    logo: C2C,
    description:
    "Presented by ACM-VIT and ACM W-VIT, The Neural Hack is a 36-hour hackathon focused on data-centric machine learning, encouraging inclusive participation and empowering diverse voices-especially women in tech-to lead innovation in STEM fields. Presented by ACM-VIT and ACM W-VIT, The Neural Hack is a 36-hour hackathon focused on data-centric machine learning, encouraging inclusive participation and empowering diverse voices-especially women in tech-to lead innovation in STEM fields. Presented by ACM-VIT and ACM W-VIT, The Neural Hack is a 36-hour hackathon focused on data-centric machine learning, encouraging inclusive participation and empowering diverse voices-especially women in tech-to lead innovation in STEM fields. Presented by ACM-VIT and ACM W-VIT, The Neural Hack is a 36-hour hackathon focused on data-centric machine learning, encouraging inclusive."  },
  {
    title: "Insipher",
    logo: insipher,
    description:
      "Insipher is ACM-W's flagship event fostering innovation, collaboration, and technical excellence through engaging challenges and inspiring experiences.",
  },
  {
    title: "Neural Hack",
    logo: neuralHack,
    description:
      "The Neural Hack is a 36-hour hackathon focused on data-centric machine learning, encouraging inclusive participation and empowering diverse voices-especially women in tech-to lead innovation in STEM fields.",
  },
];

export default function EventsPage() {
  return (
    <div
      style={{
        minHeight: "2400px",
        background: "#FFF9E9",
        position: "relative",
        overflow: "hidden",
      }}
    >
      <h1
        style={{
          textAlign: "center",
          paddingTop: "60px",
          color: "#5B0F0F",
          fontSize: "3.5rem",
          margin: 0,
          fontFamily: "Georgia, serif",
        }}
      >
        EVENTS
      </h1>

      {/* EVENT 1 */}

      <div
        style={{
          position: "absolute",
          left: "-20px",
          top: "250px",
          transform: "rotate(-8deg)",
        }}
      >
        <EventStamp logo={events[0].logo} />
      </div>

      <div
        style={{
          position: "absolute",
          right: "70px",
          top: "330px",
          width: "500px",
        }}
      >
        <p
          style={{
            color: "#321515",
            lineHeight: 1.9,
            fontSize: "0.95rem",
          }}
        >
          {events[0].description}
        </p>
      </div>

      {/* EVENT 2 */}

      <div
        style={{
          position: "absolute",
          right: "-20px",
          top: "850px",
          transform: "rotate(8deg)",
        }}
      >
        <EventStamp logo={events[1].logo} />
      </div>

      <div
        style={{
          position: "absolute",
          left: "70px",
          top: "1030px",
          width: "500px",
        }}
      >
        <p
          style={{
            color: "#321515",
            lineHeight: 1.9,
            fontSize: "0.95rem",
          }}
        >
          {events[1].description}
        </p>
      </div>

      {/* EVENT 3 */}

      <div
        style={{
          position: "absolute",
          left: "-20px",
          top: "1450px",
          transform: "rotate(-7deg)",
        }}
      >
        <EventStamp logo={events[2].logo} />
      </div>

      <div
        style={{
          position: "absolute",
          right: "70px",
          top: "1640px",
          width: "500px",
        }}
      >
        <p
          style={{
            color: "#321515",
            lineHeight: 1.9,
            fontSize: "0.95rem",
          }}
        >
          {events[2].description}
        </p>
      </div>
    </div>
  );
}