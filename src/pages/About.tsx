import envelopeImg from '../assets/about/envelope.png'
import aboutAcmWImg from '../assets/about/about-acm-w.svg'
import aboutAcmVitImg from '../assets/about/about-acm-vit.svg'
import './About.css'

const BODY_COPY =
  'Presented by ACM-VIT and ACM W-VIT, The Neural Hack is a 36-hour hackathon focused on data-centric machine learning, encouraging inclusive participation and empowering diverse voices-especially women in tech-to lead innovation in STEM fields. Presented by ACM-VIT and ACM W-VIT, The Neural Hack is a 36-hour hackathon focused on data-centric machine learning, encouraging inclusive participation and empowering diverse voices-especially women in tech-to lead innovation in STEM fields. Presented by ACM-VIT and ACM W-VIT, The Neural Hack is a 36-hour hackathon focused on data-centric machine learning, encouraging inclusive participation and empowering diverse voices-especially women in tech-to lead innovation in STEM fields. Presented by ACM-VIT and ACM W-VIT, The Neural Hack is a 36-hour hackathon focused on data-centric machine learning, encouraging inclusive.'

export default function About() {
  return (
    <main className="about">
      <button className="about_mail" type="button" aria-label="Mail">
        <img src={envelopeImg} alt="" className="about_mailIcon" />
      </button>

      <div className="about_cards">
        {/* Section 1 — overlay lives outside the figure so its z-index escapes the filter stacking context */}
        <section className="about_section">
          <div className="about_card-wrap">
            <figure className="about_polaroid about_polaroid--acmw">
              <img src={aboutAcmWImg} alt="ACM-W members group photo" className="about_polaroid-img" />
            </figure>
            <div className="about_overlay about_overlay--acmw">
              <h2 className="about_cardTitle">ABOUT ACM - W</h2>
              <p className="about_cardBody">{BODY_COPY}</p>
            </div>
          </div>
        </section>

        {/* Section 2 — slides on top of section 1 at scroll boundary */}
        <section className="about_section about_section--top">
          <div className="about_card-wrap about_card-wrap--acmvit">
            <figure className="about_polaroid about_polaroid--acmvit">
              <img src={aboutAcmVitImg} alt="ACM-VIT members group photo" className="about_polaroid-img" />
            </figure>
            <div className="about_overlay about_overlay--acmvit">
              <h2 className="about_cardTitle">ABOUT ACM - VIT</h2>
              <p className="about_cardBody">{BODY_COPY}</p>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
