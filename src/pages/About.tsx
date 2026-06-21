import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import aboutAcmWImg from '../assets/about/about-acm-w.svg'
import aboutAcmVitImg from '../assets/about/about-acm-vit.svg'

gsap.registerPlugin(ScrollTrigger)

const ABOUT_STYLES = `
.about,
html,
body,
#root {
  width: 100%;
  min-height: 100svh;
  margin: 0;
  background-color: #fff9e9;
}

#root {
  max-width: none;
  border: none;
  text-align: left;
}

.about {
  position: relative;
  overflow-x: hidden;
  background-color: #fff9e9;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.045'/%3E%3C/svg%3E");
}

.about_scroll-track {
  height: 450vh;
}

.about_stage {
  position: relative;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  min-height: 100svh;
  padding: 0;
  box-sizing: border-box;
}

.about_stack {
  position: relative;
  width: 118vw;
  height: min(73vw, calc(100svh - 20px));
  min-width: 0;
}

.about_polaroid {
  position: absolute;
  top: 0;
  left: 50%;
  width: 3000px;
  height: 100%;
  margin: 0;
  filter: drop-shadow(0 14px 32px rgba(60, 34, 24, 0.16));
  will-change: transform, opacity;
}

.about_polaroid--acmw {
  z-index: 2;
}

.about_polaroid--acmvit {
  z-index: 3;
}

.about_polaroid-img {
  display: block;
  width: 100%;
  height: 100%;
  will-change: filter, opacity, transform;
}

.about_overlay {
  position: absolute;
  inset: 21.5% 10.5% 20.5% 10.5%;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  margin: 0;
  padding: 0;
  color: #fff;
  pointer-events: none;
  transform-origin: center center;
  overflow: hidden;
  width: auto;
}

.about_cardTitle {
  flex-shrink: 0;
  margin: 0;
  padding: 0;
  font-family: 'Times New Roman', Times, 'Liberation Serif', serif;
  font-size: clamp(26px, 3vw, 44px);
  font-weight: 700;
  line-height: 1.12;
  letter-spacing: 0.06em;
  text-align: center;
  text-transform: uppercase;
  transform-origin: center center;
}

/* Match SVG tilt: ACM-W ≈ -7.2°, ACM-VIT ≈ +7.2° */
.about_polaroid--acmw .about_overlay {
  transform: rotate(-7.2deg);
}

.about_polaroid--acmvit .about_overlay {
  transform: rotate(7.2deg);
}

.about_cardBody {
  width: 100%;
  max-width: 800px;
  margin: auto auto 0;
  font-family: 'Times New Roman', Times, 'Liberation Serif', serif;
  font-size: clamp(11px, 1.08vw, 16px);
  font-weight: 400;
  line-height: 1.0;
  text-align: center;
  hyphens: auto;
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  white-space: pre-wrap;
}

@media (max-width: 768px) {
  .about_scroll-track {
    height: 500vh;
  }

  .about_stage {
    padding: 0;
  }

  .about_stack {
    width: 118vw;
    height: min(73vw, calc(100svh - 16px));
  }

  .about_overlay {
    inset: 22.5% 10% 20% 10%;
  }

  .about_cardTitle {
    font-size: clamp(22px, 5.5vw, 30px);
  }

  .about_cardBody {
    font-size: 10px;
    line-height: 1.26;
  }
}
`

const BODY_COPY =
  'Presented by ACM-VIT and ACM W-VIT, The Neural Hack is a 36-hour hackathon focused on data-centric machine learning.\n\nEncouraging inclusive participation and empowering diverse voices—especially women in tech—to lead innovation in STEM fields.\n\nBuilding a community where technical growth, mentorship, collaboration, and leadership thrive.'

const REVEAL_DURATION = 2.4
const HOLD_DURATION = 1.1
const EXIT_DURATION = REVEAL_DURATION
const ENTER_DURATION = REVEAL_DURATION
const SECOND_CONTENT_DELAY = 0.35
const SECOND_CONTENT_DURATION = REVEAL_DURATION

const CARD_HIDDEN = {
  y: 96,
  scale: 0.92,
  opacity: 0,
}

const CARD_VISIBLE = {
  y: 0,
  scale: 1,
  opacity: 1,
}

const IMAGE_WASHED = {
  opacity: 0.15,
  filter: 'brightness(2.6) saturate(0.25)',
}

const IMAGE_FULL = {
  opacity: 1,
  filter: 'brightness(1) saturate(1)',
}

type AboutCardParts = {
  card: HTMLElement
  image: HTMLElement
  overlay: HTMLElement
}

function revealCard(
  tl: gsap.core.Timeline,
  { card, image, overlay }: AboutCardParts,
  position: string | number,
) {
  tl.set(card, { visibility: 'visible' }, position)
    .fromTo(
      card,
      { ...CARD_HIDDEN, xPercent: -50 },
      { ...CARD_VISIBLE, xPercent: -50, duration: REVEAL_DURATION, ease: 'none' },
      position,
    )
    .fromTo(
      image,
      { ...IMAGE_WASHED },
      { ...IMAGE_FULL, duration: REVEAL_DURATION, ease: 'none' },
      position,
    )
    .fromTo(
      overlay,
      { opacity: 0 },
      { opacity: 1, duration: REVEAL_DURATION, ease: 'none' },
      position,
    )
}

function crossfadeCards(
  tl: gsap.core.Timeline,
  outgoing: AboutCardParts,
  incoming: AboutCardParts,
  position: string | number,
) {
  tl.set(incoming.card, { visibility: 'visible' }, position)
    .to(
      outgoing.card,
      {
        y: 0,
        yPercent: -115,
        scale: 0.96,
        opacity: 0,
        duration: EXIT_DURATION,
        ease: 'none',
      },
      position,
    )
    .to(
      outgoing.image,
      { ...IMAGE_WASHED, duration: EXIT_DURATION, ease: 'none' },
      position,
    )
    .to(outgoing.overlay, { opacity: 0, duration: EXIT_DURATION, ease: 'none' }, position)
    .set(outgoing.card, { visibility: 'hidden' })
    .fromTo(
      incoming.card,
      { y: 0, yPercent: 115, scale: 0.96, opacity: 0, xPercent: -50 },
      {
        y: 0,
        yPercent: 0,
        scale: 1,
        opacity: 1,
        xPercent: -50,
        duration: ENTER_DURATION,
        ease: 'none',
      },
      `>-=0.1`,
    )
    .fromTo(
      incoming.image,
      { ...IMAGE_WASHED },
      { ...IMAGE_FULL, duration: ENTER_DURATION, ease: 'none' },
      '<',
    )
    .fromTo(
      incoming.overlay,
      { opacity: 0 },
      { opacity: 1, duration: SECOND_CONTENT_DURATION, ease: 'none' },
      `>+=${SECOND_CONTENT_DELAY}`,
    )
}

export default function About() {
  const rootRef = useRef<HTMLElement>(null)

  useLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const ctx = gsap.context(() => {
      const acmw = root.querySelector<HTMLElement>('.about_polaroid--acmw')
      const acmwImg = root.querySelector<HTMLElement>(
        '.about_polaroid--acmw .about_polaroid-img',
      )
      const acmwOverlay = root.querySelector<HTMLElement>(
        '.about_polaroid--acmw .about_overlay',
      )
      const acmvit = root.querySelector<HTMLElement>('.about_polaroid--acmvit')
      const acmvitImg = root.querySelector<HTMLElement>(
        '.about_polaroid--acmvit .about_polaroid-img',
      )
      const acmvitOverlay = root.querySelector<HTMLElement>(
        '.about_polaroid--acmvit .about_overlay',
      )
      const stage = root.querySelector<HTMLElement>('.about_stage')
      const scrollTrack = root.querySelector<HTMLElement>('.about_scroll-track')

      if (
        !acmw ||
        !acmwImg ||
        !acmwOverlay ||
        !acmvit ||
        !acmvitImg ||
        !acmvitOverlay ||
        !stage ||
        !scrollTrack
      ) {
        return
      }

      gsap.set([acmw, acmvit], {
        visibility: 'hidden',
        xPercent: -50,
        transformOrigin: '50% 50%',
        ...CARD_HIDDEN,
      })
      gsap.set([acmwImg, acmvitImg], { ...IMAGE_WASHED })
      gsap.set([acmwOverlay, acmvitOverlay], { opacity: 0 })

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: scrollTrack,
          start: 'top top',
          end: 'bottom bottom',
          scrub: 1,
          pin: stage,
          anticipatePin: 1,
          invalidateOnRefresh: true,
        },
      })

      const acmwParts = { card: acmw, image: acmwImg, overlay: acmwOverlay }
      const acmvitParts = { card: acmvit, image: acmvitImg, overlay: acmvitOverlay }

      tl.to({}, { duration: 0.28 })
      revealCard(tl, acmwParts, '+=0')
      tl.to({}, { duration: HOLD_DURATION })
      tl.addLabel('handoff')
      crossfadeCards(tl, acmwParts, acmvitParts, 'handoff')
      tl.to({}, { duration: HOLD_DURATION })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <>
      <style>{ABOUT_STYLES}</style>
      <main className="about" ref={rootRef}>
        <div className="about_scroll-track">
          <div className="about_stage">
            <div className="about_stack">
              <figure className="about_polaroid about_polaroid--acmw">
                <img
                  src={aboutAcmWImg}
                  alt="ACM-W members group photo"
                  className="about_polaroid-img"
                />
                <figcaption className="about_overlay">
                  <h2 className="about_cardTitle">ABOUT ACM - W</h2>
                  <p className="about_cardBody">{BODY_COPY}</p>
                </figcaption>
              </figure>

              <figure className="about_polaroid about_polaroid--acmvit">
                <img
                  src={aboutAcmVitImg}
                  alt="ACM-VIT members group photo"
                  className="about_polaroid-img"
                />
                <figcaption className="about_overlay">
                  <h2 className="about_cardTitle">ABOUT ACM - VIT</h2>
                  <p className="about_cardBody">{BODY_COPY}</p>
                </figcaption>
              </figure>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}
