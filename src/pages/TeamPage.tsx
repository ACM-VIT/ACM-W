import { useEffect, useMemo, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import envelopeIcon from "../assets/teams/envelope.png";
import cherukuri from "../assets/teams/cherukuri.png";
import lavanya from "../assets/teams/lavanya.png";
import mahendra from "../assets/teams/mahendra.png";
import navdha from "../assets/teams/navdha.png";
import adheesh from "../assets/teams/adheesh.png";
import aarjav from "../assets/teams/aarjav.png";
import prakhar from "../assets/teams/prakhar.png";
import rohit from "../assets/teams/rohit.png";
import drushti from "../assets/teams/drashti.png";
import shaurya from "../assets/teams/shaurya.png";
import ishaan from "../assets/teams/ishaan.png";
import rishit from "../assets/teams/rishit.png";
import vansh from "../assets/teams/vansh.png";
import nishtha from "../assets/teams/nishtha.png";
import krishika from "../assets/teams/krishika.png";
import harshit from "../assets/teams/harshit.png";

import ProfileCard from "../components/ProfileCard";

gsap.registerPlugin(ScrollTrigger);

const iconColorFilter =
  "invert(12%) sepia(33%) saturate(4950%) hue-rotate(338deg) brightness(72%) contrast(104%)";

const teamData = [
  {
    name: "Dr. Aswani Kumar Cherukuri",
    role: "Faculty Co-ordinator",
    imageSrc: "cherukuri",
    row: 1,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Lavanya Jain",
    role: "ACM-W Chairperson",
    imageSrc: "lavanya",
    row: 2,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Mahendra Choudary",
    role: "ACM-W Vice Chairperson",
    imageSrc: "mahendra",
    row: 2,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Navdha Sharma",
    role: "ACM-W Secretary",
    imageSrc: "navdha",
    row: 2,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Adheesh Garg",
    role: "ACM-W Technical Director",
    imageSrc: "adheesh",
    row: 3,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Aarjav Jain",
    role: "ACM-W Design Lead",
    imageSrc: "aarjav",
    row: 3,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Prakhar Joshi",
    role: "ACM Chairperson",
    imageSrc: "prakhar",
    row: 4,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Rohit Sakamuri",
    role: "ACM Vice Chairperson",
    imageSrc: "rohit",
    row: 4,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Drushti Shukla",
    role: "ACM Secretary",
    imageSrc: "drushti",
    row: 5,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Shaurya Garg",
    role: "ACM Co-Secretary",
    imageSrc: "shaurya",
    row: 5,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Ishaan Samdani",
    role: "ACM Technical Director",
    imageSrc: "ishaan",
    row: 5,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Rishit Shivam",
    role: "ACM Research Lead",
    imageSrc: "rishit",
    row: 6,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Vansh Dhir",
    role: "ACM Projects Lead",
    imageSrc: "vansh",
    row: 6,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Nishtha Agrawal",
    role: "ACM Design Lead",
    imageSrc: "nishtha",
    row: 6,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Krishika Sureka",
    role: "ACM Creative Lead",
    imageSrc: "krishika",
    row: 7,
    githubLink: "#",
    linkedinLink: "#",
  },
  {
    name: "Harshit Narang",
    role: "ACM Competitions Lead",
    imageSrc: "harshit",
    row: 7,
    githubLink: "#",
    linkedinLink: "#",
  },
];

const imageMap: Record<string, string> = {
  cherukuri,
  lavanya,
  mahendra,
  navdha,
  adheesh,
  aarjav,
  prakhar,
  rohit,
  drushti,
  shaurya,
  ishaan,
  rishit,
  vansh,
  nishtha,
  krishika,
  harshit,
};

export default function TeamSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  const rows = useMemo(() => {
    const rowSet = new Set(teamData.map((member) => member.row));
    return Array.from(rowSet).sort((a, b) => a - b);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const cards = gsap.utils.toArray<HTMLElement>(".team-card");
      gsap.from(cards, {
        opacity: 0,
        y: 50,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.1,
        immediateRender: false,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 75%",
          toggleActions: "play none none none",
          once: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative w-full overflow-hidden bg-[#B49880] py-16 text-[#580A0A] sm:py-20"
    >
      <img
        src={envelopeIcon}
        alt=""
        className="absolute left-6 top-6 h-7 w-7"
        style={{ filter: iconColorFilter }}
      />

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-6">
        <h2
          className="text-center text-[32px] tracking-[0.08em] sm:text-[40px]"
          style={{
            fontFamily: "Kovanov, Georgia, serif",
            fontWeight: 700,
            color: "#580A0A",
          }}
        >
          THE TEAM
        </h2>

        <div className="mt-12 flex w-full flex-col gap-10">
          {rows.map((row) => {
            const rowMembers = teamData.filter(
              (member) => member.row === row,
            );

            return (
              <div
                key={row}
                className="flex flex-col items-center gap-6 md:flex-row md:justify-center md:gap-8"
              >
                {rowMembers.map((member) => (
                  <ProfileCard
                    key={member.name}
                    name={member.name}
                    role={member.role}
                    imageSrc={imageMap[member.imageSrc]}
                    githubLink={member.githubLink}
                    linkedinLink={member.linkedinLink}
                  />
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
