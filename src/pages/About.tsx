import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import aboutAcmWImg from '../assets/about/about-acm-w.svg'
import aboutAcmVitImg from '../assets/about/about-acm-vit.svg'
import mailIcon from '../assets/open.svg'
import './About.css'

gsap.registerPlugin(ScrollTrigger)

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
      const mail = root.querySelector<HTMLElement>('.about_mail')

      if (
        !acmw ||
        !acmwImg ||
        !acmwOverlay ||
        !acmvit ||
        !acmvitImg ||
        !acmvitOverlay ||
        !stage ||
        !scrollTrack ||
        !mail
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
      gsap.set(mail, { y: 0, opacity: 1 })

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
      tl.to(mail, { y: -96, opacity: 0, duration: EXIT_DURATION, ease: 'none' }, 'handoff')
      tl.to({}, { duration: HOLD_DURATION })
    }, root)

    return () => ctx.revert()
  }, [])

  return (
    <main className="about" ref={rootRef}>
      <button className="about_mail" aria-label="Menu">
        <img src={mailIcon} alt="Menu icon" className="about_mailIcon" />
      </button>
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
  )
}
