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
  imageRotation = 0,
}: {
  logo: string;
  imageRotation?: number;
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
              transform: `rotate(${imageRotation}deg)`,
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
      "Code2Create is ACM-W’s flagship 48 hour overnight hackathon and one of the largest student run hackathons at VIT Vellore. With 2000+ participants every edition, it brings together developers, designers and problem solvers from across the country to build, innovate and create under one roof. The energy of 48 hours is unlike anything else, teams forming, ideas taking shape, prototypes being built from scratch and solutions emerging that nobody saw coming. From first timers finding their footing to experienced builders pushing their limits, Code2Create creates a space where every participant is challenged, every idea is taken seriously and every team walks out having built something they are genuinely proud of. It is not just a hackathon. It is where real builders are made."
  },
  {
    title: "Insipher",
    logo: insipher,
    description:
      "Inspiher is ACM-W’s recurring speaker series dedicated to celebrating women in STEM and the journeys that brought them there. Each edition features an intimate one on one conversation between ACM-W members and an accomplished woman in the field, diving deep into her story, the path she chose, the challenges she faced, the moments that defined her, and the heights she has reached. It is not a formal talk or a rehearsed panel. It is an honest, personal conversation that makes the journeys of women in tech feel real and reachable. Every edition of Inspiher leaves the room with something to think about, something to aspire to, and the reminder that there is space for everyone in this field."
  },
  {
    title: "Neural Hack",
    logo: neuralHack,
    description:
      "The Neural Hack is a 36 hour hackathon presented by ACM-W, built entirely around data centric machine learning. It goes beyond just writing models, participants are challenged to think critically about data quality, representation and the real world impact of the solutions they build. The Neural Hack actively encourages inclusive participation and champions diverse voices in tech, with a strong focus on empowering women in STEM to lead, innovate and take up space in one of the fastest growing fields in the world. Whether you are just getting started with ML or have been building models for years, The Neural Hack is a space where curiosity meets challenge and where the work you do in 36 hours can actually mean something."
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
          fontFamily: "Kovanov, Georgia, serif",
          fontWeight: "bold",
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
        <EventStamp logo={events[0].logo} imageRotation={6.5} />
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
            fontSize: "1rem",
            fontFamily: "Kovanov, Georgia, serif",
            fontWeight: "bold",
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
        <EventStamp logo={events[1].logo} imageRotation={-6.5} />
      </div>

      <div
        style={{
          position: "absolute",
          left: "70px",
          top: "990px",
          width: "500px",
        }}
      >
        <p
          style={{
            color: "#321515",
            lineHeight: 1.9,
            fontSize: "1rem",
            fontFamily: "Kovanov, Georgia, serif",
            fontWeight: "bold",
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
        <EventStamp logo={events[2].logo} imageRotation={7} />
      </div>

      <div
        style={{
          position: "absolute",
          right: "70px",
          top: "1560px",
          width: "500px",
        }}
      >
        <p
          style={{
            color: "#321515",
            lineHeight: 1.9,
            fontSize: "1rem",
            fontFamily: "Kovanov, Georgia, serif",
            fontWeight: "bold",
          }}
        >
          {events[2].description}
        </p>
      </div>
    </div>
  );
}