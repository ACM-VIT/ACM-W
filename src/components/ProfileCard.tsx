


import githubIcon from "../assets/teams/github.png";
import linkedinIcon from "../assets/teams/linkedin.png";
import cardBg from "../assets/teams/team-postcard.png";

const iconColorFilter =
  "invert(12%) sepia(33%) saturate(4950%) hue-rotate(338deg) brightness(72%) contrast(104%)";

type ProfileCardProps = {
  name: string;
  role: string;
  imageSrc: string;
  githubLink: string;
  linkedinLink: string;
};

export default function ProfileCard({
  name,
  role,
  imageSrc,
  githubLink,
  linkedinLink,
}: ProfileCardProps) {
  return (
    <article
      className="team-card flex h-[170px] w-[280px] flex-col justify-center border border-[#5d0f14]/60 bg-cover bg-center p-3 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:h-[180px] sm:w-[320px]"
      style={{ backgroundImage: `url(${cardBg})` }}
    >
      <div className="flex h-full w-full items-stretch">
        <div className="w-[38%] pr-3">
          <img
            className="h-full w-full object-cover"
            src={imageSrc}
            alt={name}
          />
        </div>

        <div className="w-px bg-[#5d0f14]/60" />

        <div className="flex flex-1 flex-col justify-between pl-3 py-1">
          <div>
            <h3
              className="text-[14px] font-bold leading-tight text-[#2f1b1b] sm:text-[15px]"
              style={{ fontFamily: "Kovanov, Georgia, serif" }}
            >
              {name}
            </h3>
            <p
              className="mt-1 text-[11px] text-[#5b4a4a] sm:text-[12px]"
              style={{ fontFamily: "Quicksand, Arial, sans-serif" }}
            >
              {role}
            </p>
          </div>

          <div className="flex items-center justify-end gap-2">
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} GitHub`}
            >
              <img
                src={githubIcon}
                alt=""
                className="h-4 w-4"
                style={{ filter: iconColorFilter }}
              />
            </a>
            <a
              href={linkedinLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} LinkedIn`}
            >
              <img
                src={linkedinIcon}
                alt=""
                className="h-4 w-4"
                style={{ filter: iconColorFilter }}
              />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
