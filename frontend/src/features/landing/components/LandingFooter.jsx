import { Link } from 'react-router-dom';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import './LandingFooter.css';

const YEAR = new Date().getFullYear();

export default function LandingFooter() {
  const scrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="lp-footer" role="contentinfo">
      <div className="lp-footer__grid">
        {/* Brand column */}
        <div className="lp-footer__brand">
          <Link to="/" className="lp-footer__logo" aria-label="PRIMEPOWER MANPOWER — Home">
            <img src={primepowerLogo} alt="PRIMEPOWER Logo" className="lp-footer__logo-img" />
            <div className="lp-footer__logo-text">
              <span className="lp-footer__logo-name">PRIMEPOWER</span>
              <span className="lp-footer__logo-sub">Manpower Services</span>
            </div>
          </Link>
          <p className="lp-footer__desc">
            A trusted recruitment and deployment agency delivering comprehensive
            manpower solutions — from applicant sourcing to contract administration
            — in full compliance with Philippine labor regulations.
          </p>
          <div className="lp-footer__tagline">
            <div className="lp-footer__tagline-dot" aria-hidden="true" />
            Excellence in Manpower Solutions
          </div>
        </div>

        {/* Services column */}
        <div>
          <div className="lp-footer__col-title">Services</div>
          <ul className="lp-footer__links" role="list">
            <li><button onClick={() => scrollTo('services')} className="lp-footer__btn-link">Recruitment</button></li>
            <li><button onClick={() => scrollTo('services')} className="lp-footer__btn-link">Selection &amp; Screening</button></li>
            <li><button onClick={() => scrollTo('services')} className="lp-footer__btn-link">Deployment</button></li>
            <li><button onClick={() => scrollTo('services')} className="lp-footer__btn-link">PRF Job Orders</button></li>
            <li><button onClick={() => scrollTo('services')} className="lp-footer__btn-link">Contract Renewal</button></li>
            <li><Link to="/login" className="lp-footer__link">Staff Portal</Link></li>
          </ul>
        </div>

        {/* Contact Us column */}
        <div>
          <div className="lp-footer__col-title">Contact Us</div>
          <ul className="lp-footer__links" role="list">
            <li><Link to="/offices" className="lp-footer__link">Our Nationwide Offices</Link></li>
            <li><a href="tel:+639178146352" className="lp-footer__link">+63 917 814 6352</a></li>
            <li><a href="mailto:marketing@primepower.com.ph" className="lp-footer__link">Marketing Inquiries</a></li>
            <li><a href="mailto:hr@primepower.com.ph" className="lp-footer__link">HR Inquiries</a></li>
            <li><Link to="/apply" className="lp-footer__link">Walk-In Application</Link></li>
          </ul>
        </div>

        {/* We're Social column */}
        <div>
          <div className="lp-footer__col-title">We're Social</div>
          <ul className="lp-footer__links" role="list">
            <li><a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="lp-footer__link">Like Us on Facebook</a></li>
            <li><a href="https://www.linkedin.com" target="_blank" rel="noopener noreferrer" className="lp-footer__link">Follow Us on LinkedIn</a></li>
            <li><a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="lp-footer__link">Subscribe to our YouTube</a></li>
            <li><a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="lp-footer__link">Find Us on TikTok</a></li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="lp-footer__bottom">
        <p className="lp-footer__copy">
          &copy; {YEAR} <strong>PRIMEPOWER MANPOWER</strong>. All rights reserved.
          Compliant with RA 10173 — Philippine Data Privacy Act.
        </p>
        <div className="lp-footer__bottom-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <Link to="/login">Staff Portal</Link>
        </div>
      </div>
    </footer>
  );
}
