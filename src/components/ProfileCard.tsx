import cardBg from "../assets/teams/team-postcard.png";


type ProfileCardProps = {
  name: string;
  role: string;
  imageSrc: string;
  primaryLink?: {
    href?: string;
    iconSrc: string;
    label: string;
  };
  secondaryLink?: {
    href?: string;
    iconSrc: string;
    label: string;
  };
};

export default function ProfileCard({
  name,
  role,
  imageSrc,
  primaryLink,
  secondaryLink,
}: ProfileCardProps) {
  const isValidLink = (href?: string) => Boolean(href && href !== "#");
  return (
    <article
      className="team-card relative flex aspect-[21/11.5] w-[min(92vw,26.25rem)] flex-col justify-center border border-[#5d0f14]/60 bg-cover bg-center p-[clamp(0.75rem,2.5vw,1rem)] shadow-md transition-all duration-300 ease-out hover:-translate-y-2 hover:scale-[1.02] hover:shadow-2xl hover:shadow-black/20 hover:z-10 sm:w-[min(42vw,26.25rem)]"
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
              className="text-[clamp(0.95rem,2.4vw,1.125rem)] font-bold leading-tight text-[#2f1b1b]"
              style={{ fontFamily: "Kovanov, Georgia, serif" }}
            >
              {name}
            </h3>
            <p
              className="mt-1 text-[clamp(0.78rem,2vw,0.875rem)] text-[#5b4a4a]"
              style={{ fontFamily: "Quicksand, Arial, sans-serif" }}
            >
              {role}
            </p>
          </div>

          <div className="flex items-center justify-center gap-3">
            {primaryLink && isValidLink(primaryLink.href) && (
              <a
                href={primaryLink.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} ${primaryLink.label}`}
              >
                <img
                  src={primaryLink.iconSrc}
                  alt=""
                  className="h-[clamp(1.25rem,4.5vw,1.5rem)] w-[clamp(1.25rem,4.5vw,1.5rem)]"
                />
              </a>
            )}
            {secondaryLink && isValidLink(secondaryLink.href) && (
              <a
                href={secondaryLink.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${name} ${secondaryLink.label}`}
              >
                <img
                  src={secondaryLink.iconSrc}
                  alt=""
                  className="h-[clamp(1.25rem,4.5vw,1.5rem)] w-[clamp(1.25rem,4.5vw,1.5rem)]"
                />
              </a>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
