import {
  useId,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";

import neuralHack from "../assets/NeuralHack.png";
import insipher from "../assets/Inspiher.svg";
import C2C from "../assets/C2C.png";

interface ParallaxState {
  ref: React.RefObject<HTMLDivElement | null>;
  offsetY: number;
  opacity: number;
  scale: number;
}

function useParallax(speed = 0.15): ParallaxState {
  const ref = useRef<HTMLDivElement>(null);

  const [state, setState] = useState({
    offsetY: 0,
    opacity: 1,
    scale: 1,
  });

  useEffect(() => {
    const update = () => {
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;

      const distance = elementCenter - viewportCenter;
      const normalized = distance / viewportCenter;

      setState({
        offsetY: -normalized * 30 * speed,
        opacity: Math.max(0.65, 1 - Math.abs(normalized) * 0.35),
        scale: 1 + (1 - Math.abs(normalized)) * 0.04,
      });
    };

    update();

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [speed]);

  return { ref, ...state };
}

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
  parallax,
}: {
  logo: string;
  imageRotation?: number;
  parallax: ParallaxState;
}) {
  return (
    <div
      className="eventStampFrame"
      style={{
        transform: `translateY(${parallax.offsetY}px) scale(${parallax.scale})`,
        opacity: parallax.opacity,
        transition: "transform 0.25s ease, opacity 0.3s ease",
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
    rotation: 6.5,
    description:
      "Code2Create is ACM-W’s flagship 48 hour overnight hackathon and one of the largest student run hackathons at VIT Vellore. With 2000+ participants every edition, it brings together developers, designers and problem solvers from across the country to build, innovate and create under one roof.",
  },
  {
    title: "Inspiher",
    logo: insipher,
    rotation: -6.5,
    description:
      "Inspiher is ACM-W’s recurring speaker series dedicated to celebrating women in STEM and the journeys that brought them there. Every edition features an intimate conversation with accomplished women in technology and research.",
  },
  {
    title: "Neural Hack",
    logo: neuralHack,
    rotation: 7,
    description:
      "The Neural Hack is a 36 hour hackathon focused on data-centric machine learning. Participants tackle real-world challenges while learning about responsible AI, data quality and impactful innovation.",
  },
];

export default function EventsPage() {
  const stamp1 = useParallax(0.12);
  const stamp2 = useParallax(0.18);
  const stamp3 = useParallax(0.14);

  const parallaxs = [stamp1, stamp2, stamp3];

  return (
    <>
      <style>{EVENTS_PAGE_STYLES}</style>

      <div className="eventsPage">
        <div className="eventsShell">
          <h1 className="eventsTitle">EVENTS</h1>

          <div className="eventsList">
            {events.map((event, index) => {
              const reverse = index % 2 === 1;
              const parallax = parallaxs[index];

              return (
                <section
                  key={event.title}
                  className={`eventRow ${
                    reverse ? "eventRow--reverse" : ""
                  }`}
                >
                  <div
                    className="eventStampWrap"
                    ref={parallax.ref}
                  >
                    <div
                      className="eventStampWrapInner"
                      style={{
                        transform: `rotate(${reverse ? 8 : -8}deg)`,
                      }}
                    >
                      <EventStamp
                        logo={event.logo}
                        imageRotation={event.rotation}
                        parallax={parallax}
                      />
                    </div>
                  </div>

                  <div className="eventContent">
                    <h2>{event.title}</h2>
                    <p className="eventCopy">
                      {event.description}
                    </p>
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

const EVENTS_PAGE_STYLES = `
.eventsPage{
  min-height:100vh;
  background:#FFF9E9;
  padding:4rem 1.5rem;
}

.eventsShell{
  width:min(1400px,100%);
  margin:0 auto;
}

.eventsTitle{
  text-align:center;
  color:#5B0F0F;
  font-size:clamp(2.5rem,5vw,4rem);
  margin-bottom:4rem;
  font-family:Kovanov,Georgia,serif;
}

.eventsList{
  display:flex;
  flex-direction:column;
  gap:4rem;
}

.eventRow{
  display:grid;
  grid-template-columns:1.15fr 0.85fr;
  align-items:center;
  gap:2rem;
}

.eventRow--reverse{
  grid-template-columns:0.85fr 1.15fr;
}

.eventRow--reverse .eventStampWrap{
  order:2;
}

.eventRow--reverse .eventContent{
  order:1;
}

.eventStampWrap{
  display:flex;
  justify-content:center;
}

.eventStampWrapInner{
  width:min(100%,720px);
}

.eventStampFrame{
  width:100%;
  aspect-ratio:820/600;
}

.eventContent h2{
  color:#5B0F0F;
  margin-bottom:1rem;
  font-size:clamp(1.5rem,3vw,2rem);
}

.eventCopy{
  color:#321515;
  font-family:Kovanov,Georgia,serif;
  font-weight:700;
  line-height:1.8;
  font-size:clamp(.95rem,1.1vw,1.08rem);
}

@media (max-width:900px){

  .eventsList{
    gap:3rem;
  }

  .eventRow,
  .eventRow--reverse{
    grid-template-columns:1fr;
  }

  .eventRow--reverse .eventStampWrap,
  .eventRow--reverse .eventContent{
    order:initial;
  }

  .eventStampWrapInner{
    width:100%;
    max-width:620px;
  }

  .eventContent{
    text-align:center;
  }
}

@media (max-width:640px){

  .eventsPage{
    padding:2.5rem 1rem;
  }

  .eventsTitle{
    margin-bottom:2rem;
  }

  .eventsList{
    gap:2.25rem;
  }

  .eventStampFrame{
    aspect-ratio:1.25;
  }

  .eventCopy{
    line-height:1.65;
    font-size:.95rem;
  }
}`;