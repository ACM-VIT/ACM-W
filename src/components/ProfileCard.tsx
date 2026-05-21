


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
      className="team-card flex h-[200px] w-[340px] flex-col justify-center border border-[#5d0f14]/60 bg-cover bg-center p-4 shadow-md transition-all duration-300 ease-in-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-900/20 sm:h-[230px] sm:w-[420px]"
      style={{ backgroundImage: `url(${cardBg})` }}
    >
      <div className="relative flex h-full w-full items-stretch">
        <div className="flex w-1/2 items-center justify-center pr-3">
          <div className="h-full w-full">
            <img
              className="h-full w-full object-cover"
              src={imageSrc}
              alt={name}
            />
          </div>
        </div>

        <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-[#5d0f14]/60" />

        <div className="flex w-1/2 flex-col justify-between pl-3 py-2">
          <div>
            <h3
              className="text-[16px] font-bold leading-tight text-[#2f1b1b] sm:text-[18px]"
              style={{ fontFamily: "Kovanov, Georgia, serif" }}
            >
              {name}
            </h3>
            <p
              className="mt-1 text-[13px] text-[#5b4a4a] sm:text-[14px]"
              style={{ fontFamily: "Quicksand, Arial, sans-serif" }}
            >
              {role}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            <a
              href={githubLink}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${name} GitHub`}
            >
              <img
                src={githubIcon}
                alt=""
                className="h-5 w-5"
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
                className="h-5 w-5"
                style={{ filter: iconColorFilter }}
              />
            </a>
          </div>
        </div>
      </div>
    </article>
  );
}
