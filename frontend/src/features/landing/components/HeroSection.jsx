import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import QRCode from 'qrcode';
import './HeroSection.css';

const QR_APPLY_URL = 'https://hris1.primepowersystem.com/apply';

export default function HeroSection() {
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  useEffect(() => {
    QRCode.toDataURL(QR_APPLY_URL, {
      width: 260,
      margin: 1,
      color: {
        dark: '#0a1b2e',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'M',
    })
      .then((url) => {
        setQrCodeUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate apply QR code', err);
      });
  }, []);

  return (
    <section className="lp-hero" aria-label="Hero — PRIMEPOWER MANPOWER">
      {/* Decorative background */}
      <div className="lp-hero__deco" aria-hidden="true">
        <div className="lp-hero__ring lp-hero__ring--a" />
        <div className="lp-hero__ring lp-hero__ring--b" />
        <div className="lp-hero__ring lp-hero__ring--c" />
        <div className="lp-hero__ring lp-hero__ring--d" />
        <div className="lp-hero__blob-red" />
        <div className="lp-hero__blob-blue" />
        <div className="lp-hero__gold-line" />
      </div>

      {/* Split layout: text left, image right */}
      <div className="lp-hero__split">
        {/* Left: text content */}
        <div className="lp-hero__content">

          {/* Headline */}
          <h1 className="lp-hero__headline">
            Connecting <em>Talent</em> with<br />
            Opportunity, at Scale
          </h1>

          {/* Sub */}
          <p className="lp-hero__sub">
            PRIMEPOWER MANPOWER is a trusted recruitment and deployment agency
            providing comprehensive staffing solutions — from applicant screening
            to seamless deployment and contract renewal management.
          </p>

          {/* Apply Now QR Code Section */}
          <div className="lp-hero__apply-qr" id="hero-apply-now">
            <div className="lp-hero__qr-card">
              <a
                href={QR_APPLY_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="lp-hero__qr-code-wrap"
                title="Scan with phone or click to open application form"
                aria-label="QR code redirecting to applicant registration"
              >
                <div className="lp-hero__qr-box">
                  {qrCodeUrl ? (
                    <img
                      src={qrCodeUrl}
                      alt="QR Code redirecting to PRIMEPOWER application form"
                      className="lp-hero__qr-img"
                    />
                  ) : (
                    <div className="lp-hero__qr-skeleton" />
                  )}
                  <span className="lp-hero__qr-corner lp-hero__qr-corner--tl" aria-hidden="true" />
                  <span className="lp-hero__qr-corner lp-hero__qr-corner--tr" aria-hidden="true" />
                  <span className="lp-hero__qr-corner lp-hero__qr-corner--bl" aria-hidden="true" />
                  <span className="lp-hero__qr-corner lp-hero__qr-corner--br" aria-hidden="true" />
                </div>
                <span className="lp-hero__qr-hint">Scan with Camera</span>
              </a>

              <div className="lp-hero__qr-meta">
                <span className="lp-hero__qr-title">APPLY NOW</span>
                <p className="lp-hero__qr-text">
                  Scan this QR code with your mobile camera to redirect to the online application form.
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="lp-hero__stats" aria-label="Company statistics">
            <div className="lp-hero__stat">
              <div className="lp-hero__stat-value">35<span>+</span></div>
              <div className="lp-hero__stat-label">Years of<br />Experience</div>
            </div>
            <div className="lp-hero__stat-sep" aria-hidden="true" />
            <div className="lp-hero__stat">
              <div className="lp-hero__stat-value">100K<span>+</span></div>
              <div className="lp-hero__stat-label">Workers<br />Deployed</div>
            </div>
            <div className="lp-hero__stat-sep" aria-hidden="true" />
            <div className="lp-hero__stat">
              <div className="lp-hero__stat-value">14<span></span></div>
              <div className="lp-hero__stat-label">Regional<br />Offices</div>
            </div>
            <div className="lp-hero__stat-sep" aria-hidden="true" />
            <div className="lp-hero__stat">
              <div className="lp-hero__stat-value">1990<span></span></div>
              <div className="lp-hero__stat-label">Est. Feb 16,<br />Philippines</div>
            </div>
          </div>
        </div>

        {/* Right: photo card */}
        <div className="lp-hero__photo-wrap" aria-hidden="true">
          <div className="lp-hero__photo-card">
            <img
              src="/landing-hero.jpg"
              alt="PRIMEPOWER recruitment team in a professional meeting"
              className="lp-hero__photo"
            />
          </div>
          {/* Decorative dot grid */}
          <div className="lp-hero__dot-grid" aria-hidden="true" />
        </div>
      </div>

      {/* Scroll cue */}
      <div className="lp-hero__scroll-cue" aria-hidden="true">
        <span>Scroll</span>
        <div className="lp-hero__scroll-arrow">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12l7 7 7-7" />
          </svg>
        </div>
      </div>
    </section>
  );
}
