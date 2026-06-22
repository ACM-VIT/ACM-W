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
    <div className="eventStampFrame">
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
    rotation: 6.5,
    description:
      "Code2Create is ACM-W’s flagship 48 hour overnight hackathon and one of the largest student run hackathons at VIT Vellore. With 2000+ participants every edition, it brings together developers, designers and problem solvers from across the country to build, innovate and create under one roof. The energy of 48 hours is unlike anything else, teams forming, ideas taking shape, prototypes being built from scratch and solutions emerging that nobody saw coming. From first timers finding their footing to experienced builders pushing their limits, Code2Create creates a space where every participant is challenged, every idea is taken seriously and every team walks out having built something they are genuinely proud of. It is not just a hackathon. It is where real builders are made."
  },
  {
    title: "Insipher",
    logo: insipher,
    rotation: -6.5,
    description:
      "Inspiher is ACM-W’s recurring speaker series dedicated to celebrating women in STEM and the journeys that brought them there. Each edition features an intimate one on one conversation between ACM-W members and an accomplished woman in the field, diving deep into her story, the path she chose, the challenges she faced, the moments that defined her, and the heights she has reached. It is not a formal talk or a rehearsed panel. It is an honest, personal conversation that makes the journeys of women in tech feel real and reachable. Every edition of Inspiher leaves the room with something to think about, something to aspire to, and the reminder that there is space for everyone in this field."
  },
  {
    title: "Neural Hack",
    logo: neuralHack,
    rotation: 7,
    description:
      "The Neural Hack is a 36 hour hackathon presented by ACM-W, built entirely around data centric machine learning. It goes beyond just writing models, participants are challenged to think critically about data quality, representation and the real world impact of the solutions they build. The Neural Hack actively encourages inclusive participation and champions diverse voices in tech, with a strong focus on empowering women in STEM to lead, innovate and take up space in one of the fastest growing fields in the world. Whether you are just getting started with ML or have been building models for years, The Neural Hack is a space where curiosity meets challenge and where the work you do in 36 hours can actually mean something."
  },
];

export default function EventsPage() {
  return (
    <>
      <style>{EVENTS_PAGE_STYLES}</style>
      <div className="eventsPage">
        <div className="eventsShell">
          <h1 className="eventsTitle">EVENTS</h1>

          <div className="eventsList">
            {events.map((event, index) => {
              const reverse = index % 2 === 1

              return (
                <section
                  key={event.title}
                  className={`eventRow ${reverse ? "eventRow--reverse" : ""}`}
                >
                  <div className="eventStampWrap">
                    <div
                      className="eventStampWrapInner"
                      style={{
                        transform: `rotate(${reverse ? 8 : -8}deg)`,
                      }}
                    >
                      <EventStamp
                        logo={event.logo}
                        imageRotation={event.rotation}
                      />
                    </div>
                  </div>

                  <p className="eventCopy">{event.description}</p>
                </section>
              )
            })}
          </div>
        </div>
      </div>
    </>
  );
}
const EVENTS_PAGE_STYLES = `
.eventsPage {
  min-height: 100vh;
  background: #fff9e9;
  position: relative;
  overflow: hidden;
  padding: clamp(3rem, 5vw, 5rem) clamp(1rem, 4vw, 3rem) clamp(4rem, 6vw, 6rem);
  box-sizing: border-box;
}

.eventsShell {
  width: min(1400px, 100%);
  margin: 0 auto;
}

.eventsTitle {
  text-align: center;
  color: #5b0f0f;
  font-size: clamp(2.25rem, 5vw, 3.5rem);
  line-height: 0.95;
  margin: 0 0 clamp(6rem, 7vw, 6.5rem);
  font-family: Kovanov, Georgia, serif;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.eventsList {
  display: flex;
  flex-direction: column;
  gap: clamp(3.5rem, 7vw, 5.75rem);
}

.eventRow {
  display: grid;
  grid-template-columns: minmax(320px, 1.1fr) minmax(280px, 0.9fr);
  align-items: center;
  gap: clamp(2rem, 5vw, 4rem);
}

.eventRow--reverse {
  grid-template-columns: minmax(280px, 0.9fr) minmax(320px, 1.1fr);
}

.eventStampWrap {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}

.eventStampWrapInner {
  width: min(100%, 820px);
}

.eventStampFrame {
  width: 100%;
  aspect-ratio: 820 / 600;
}

.eventStampFrame img {
  display: block;
}

.eventCopy {
  color: #321515;
  line-height: 1.8;
  font-size: clamp(0.98rem, 1.2vw, 1.08rem);
  font-family: Kovanov, Georgia, serif;
  font-weight: 700;
  margin: 0;
  max-width: 56ch;
}

.eventRow--reverse .eventCopy {
  justify-self: end;
}

.eventRow--reverse .eventStampWrap {
  order: 2;
}

.eventRow--reverse .eventCopy {
  order: 1;
  justify-self: start;
}

@media (max-width: 900px) {
  .eventsPage {
    overflow: visible;
  }

  .eventsList {
    gap: 4rem;
  }

  .eventRow,
  .eventRow--reverse {
    grid-template-columns: 1fr;
    gap: 3rem;
  }

  .eventRow--reverse .eventCopy,
  .eventCopy {
    justify-self: stretch;
    max-width: none;
  }

  .eventRow--reverse .eventStampWrap,
  .eventRow--reverse .eventCopy {
    order: initial;
  }

  .eventCopy {
    font-size: 1rem;
    line-height: 1.7;
    margin-top: 0.25rem;
  }

  .eventStampWrapInner {
    width: min(100%, 680px);
  }
}

@media (max-width: 640px) {
  .eventsPage {
    padding-inline: 0.9rem;
    padding-top: 2.5rem;
  }

  .eventsShell {
    width: 100%;
  }

  .eventsTitle {
    margin-bottom: 2.25rem;
    letter-spacing: 0.06em;
  }

  .eventsList {
    gap: 2.5rem;
  }

  .eventStampWrapInner {
    width: min(100%, 560px);
  }

  .eventCopy {
    font-size: 0.95rem;
    line-height: 1.65;
  }
}
`;