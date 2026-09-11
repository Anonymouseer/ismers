import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import './LandingNavbar.css';

export default function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMenu = () => setMenuOpen(false);

  const scrollTo = (id) => {
    closeMenu();
    if (location.pathname !== '/') {
      navigate(`/#${id}`);
      return;
    }
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <nav className={`lp-navbar${scrolled ? ' scrolled' : ''}`} role="navigation" aria-label="Main navigation">
        <div className="lp-navbar__inner">
          {/* Logo */}
          <Link to="/" className="lp-navbar__logo" aria-label="PRIMEPOWER MANPOWER — Home">
            <img src={primepowerLogo} alt="PRIMEPOWER Logo" className="lp-navbar__logo-img" />
            <div className="lp-navbar__logo-text">
              <span className="lp-navbar__logo-name">PRIMEPOWER</span>
              <span className="lp-navbar__logo-sub">Manpower Services</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <ul className="lp-navbar__links" role="list">
            <li><button className="lp-navbar__link" onClick={() => scrollTo('services')}>Services</button></li>
            <li><button className="lp-navbar__link" onClick={() => scrollTo('why')}>Why Us</button></li>
            <li><button className="lp-navbar__link" onClick={() => scrollTo('how')}>How It Works</button></li>
            <li><Link to="/offices" className={`lp-navbar__link${location.pathname === '/offices' ? ' active' : ''}`} onClick={closeMenu}>Our Offices</Link></li>
            <li><button className="lp-navbar__link" onClick={() => scrollTo('contact')}>Contact</button></li>
          </ul>

          {/* Desktop CTA buttons */}
          <div className="lp-navbar__actions">
            <Link to="/apply" className="lp-navbar__btn-cta" id="nav-apply-now">Apply Now</Link>
          </div>

          {/* Hamburger */}
          <button
            id="nav-hamburger"
            className={`lp-navbar__hamburger${menuOpen ? ' open' : ''}`}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Toggle mobile menu"
            aria-expanded={menuOpen}
          >
            <span />
            <span />
            <span />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <div
        className={`lp-navbar__mobile-menu${menuOpen ? ' open' : ''}`}
        aria-hidden={!menuOpen}
        role="menu"
      >
        <button onClick={() => scrollTo('services')} className="lp-navbar__mobile-link">Services</button>
        <button onClick={() => scrollTo('why')} className="lp-navbar__mobile-link">Why Us</button>
        <button onClick={() => scrollTo('how')} className="lp-navbar__mobile-link">How It Works</button>
        <Link to="/offices" className={`lp-navbar__mobile-link${location.pathname === '/offices' ? ' active' : ''}`} onClick={closeMenu}>Our Offices</Link>
        <button onClick={() => scrollTo('contact')} className="lp-navbar__mobile-link">Contact</button>
        <div className="lp-navbar__mobile-divider" />
        <Link to="/apply" className="lp-navbar__btn-cta" onClick={closeMenu} id="nav-mobile-apply" style={{ justifyContent: 'center' }}>Apply Now</Link>
      </div>
    </>
  );
}
