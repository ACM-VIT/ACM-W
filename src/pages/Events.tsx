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
    let rafId: number | null = null;

    const update = () => {
      rafId = null;
      if (!ref.current) return;

      const rect = ref.current.getBoundingClientRect();
      const viewportCenter = window.innerHeight / 2;
      const elementCenter = rect.top + rect.height / 2;

      const distance = elementCenter - viewportCenter;
      const normalized = distance / viewportCenter;

      setState({
        offsetY: -normalized * 3 * speed,
        opacity: Math.max(0.65, 1 - Math.abs(normalized) * 0.35),
        scale: 1 + (1 - Math.abs(normalized)) * 0.04,
      });
    };

    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(update);
    };

    update();

    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
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
    <div className="relative h-full w-full">
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 h-full w-full"
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

      <div className="absolute inset-[5.333%] bg-[#F2E8CF]">
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
      className="aspect-[820/600] w-full transition-[transform,opacity] duration-300 ease-out max-sm:aspect-[1.25]"
      style={{
        transform: `translateY(${parallax.offsetY}vh) scale(${parallax.scale})`,
        opacity: parallax.opacity,
      }}
    >
      <StampBorder>
        <div className="flex h-full w-full items-center justify-center">
          <img
            src={logo}
            alt=""
            draggable={false}
            className="h-[82%] w-[82%] object-contain"
            style={{ transform: `rotate(${imageRotation}deg)` }}
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
    <div className="min-h-screen bg-[#fff9e9] px-6 py-16 max-sm:px-4 max-sm:py-10">
      <div className="mx-auto w-full max-w-[min(92vw,87.5rem)]">
        <h1 className="mb-16 text-center font-[Kovanov,Georgia,serif] text-[clamp(3.5rem,5vw,4rem)] font-bold text-[#5B0F0F] max-sm:mb-8">
          EVENTS
        </h1>

        <div className="flex flex-col gap-16 max-[56.25rem]:gap-12 max-sm:gap-9">
          {events.map((event, index) => {
            const reverse = index % 2 === 1;
            const parallax = parallaxs[index];

            return (
              <section
                key={event.title}
                className={`grid items-center gap-8 max-[56.25rem]:grid-cols-1 ${
                  reverse
                    ? "grid-cols-[0.85fr_1.15fr]"
                    : "grid-cols-[1.15fr_0.85fr]"
                }`}
              >
                <div
                  ref={parallax.ref}
                  className={`flex justify-center ${
                    reverse ? "order-2 max-[56.25rem]:order-none" : ""
                  }`}
                >
                  <div
                    className="w-full max-w-[min(50vw,45rem)] max-[56.25rem]:max-w-[min(86vw,38.75rem)]"
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

                <div
                  className={`max-[56.25rem]:text-center ${
                    reverse ? "order-1 max-[56.25rem]:order-none" : ""
                  }`}
                >
                  <h2 className="mb-4 text-[clamp(1.5rem,3vw,2rem)] text-[#5B0F0F]">
                    {event.title}
                  </h2>
                  <p className="font-[Kovanov,Georgia,serif] text-[clamp(0.95rem,1.1vw,1.08rem)] font-bold leading-[1.8] text-[#321515] max-sm:text-[0.95rem] max-sm:leading-[1.65]">
                    {event.description}
                  </p>
                </div>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
