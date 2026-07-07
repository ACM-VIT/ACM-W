import aboutAcmWImg from '../assets/about/about-acm-w.svg'
import aboutAcmVitImg from '../assets/about/about-acm-vit.svg'
import './About.css'

const BODY_PARAGRAPHS = [
  'Presented by ACM-VIT and ACM W-VIT, The Neural Hack is a 36-hour hackathon focused on data-centric machine learning.',
  'Encouraging inclusive participation and empowering diverse voices—especially women in tech—to lead innovation in STEM fields.',
  'Building a community where technical growth, mentorship, collaboration, and leadership thrive.',
] as const

function AboutCardBody() {
  return (
    <div className="about_cardBody">
      {BODY_PARAGRAPHS.map((paragraph) => (
        <p key={paragraph}>{paragraph}</p>
      ))}
    </div>
  )
}

export default function About() {
  return (
    <main className="about">
      <div className="about_cards">
        <section className="about_section">
          <div className="about_card-wrap">
            <figure className="about_polaroid about_polaroid--acmw">
              <img src={aboutAcmWImg} alt="ACM-W members group photo" className="about_polaroid-img" />
            </figure>
            <figcaption className="about_overlay about_overlay--acmw">
              <h2 className="about_cardTitle">ABOUT ACM - W</h2>
              <AboutCardBody />
            </figcaption>
          </div>
        </section>

        <section id="about-acm" className="about_section about_section--top">
          <div className="about_card-wrap about_card-wrap--acmvit">
            <figure className="about_polaroid about_polaroid--acmvit">
              <img src={aboutAcmVitImg} alt="ACM-VIT members group photo" className="about_polaroid-img" />
            </figure>
            <figcaption className="about_overlay about_overlay--acmvit">
              <h2 className="about_cardTitle">ABOUT ACM - VIT</h2>
              <AboutCardBody />
            </figcaption>
          </div>
        </section>
      </div>
    </main>
  )
}
