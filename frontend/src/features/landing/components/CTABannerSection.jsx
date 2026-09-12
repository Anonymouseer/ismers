import { useState, useEffect, useRef } from 'react';
import QRCode from 'qrcode';
import './CTABannerSection.css';

const QR_APPLY_URL = 'https://hris1.primepowersystem.com/apply';

export default function CTABannerSection() {
  const ref = useRef(null);
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

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('lp-visible');
          }
        });
      },
      { threshold: 0.15 }
    );

    const items = ref.current?.querySelectorAll('.lp-reveal');
    items?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section className="lp-cta-banner" ref={ref} aria-labelledby="cta-heading">
      <div className="lp-cta-banner__inner">
        <div className="lp-cta-banner__tag lp-reveal">
          Get Started Today
        </div>

        <h2 id="cta-heading" className="lp-cta-banner__heading lp-reveal lp-reveal-delay-1">
          Ready to Find Your Next<br />Placement?
        </h2>

        <p className="lp-cta-banner__sub lp-reveal lp-reveal-delay-2">
          Whether you are an applicant seeking your next opportunity or a company
          looking to fulfill your staffing requirements — PRIMEPOWER MANPOWER is
          your trusted partner.
        </p>

        {/* Integrated QR Code Card */}
        <div className="lp-cta-banner__qr-card lp-reveal lp-reveal-delay-3" id="cta-apply-qr">
          <a
            href={QR_APPLY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="lp-cta-banner__qr-code-wrap"
            title="Scan with phone or click to open application form"
            aria-label="QR code redirecting to applicant registration"
          >
            <div className="lp-cta-banner__qr-box">
              {qrCodeUrl ? (
                <img
                  src={qrCodeUrl}
                  alt="QR Code redirecting to PRIMEPOWER application form"
                  className="lp-cta-banner__qr-img"
                />
              ) : (
                <div className="lp-cta-banner__qr-skeleton" />
              )}
              <span className="lp-cta-banner__qr-corner lp-cta-banner__qr-corner--tl" aria-hidden="true" />
              <span className="lp-cta-banner__qr-corner lp-cta-banner__qr-corner--tr" aria-hidden="true" />
              <span className="lp-cta-banner__qr-corner lp-cta-banner__qr-corner--bl" aria-hidden="true" />
              <span className="lp-cta-banner__qr-corner lp-cta-banner__qr-corner--br" aria-hidden="true" />
            </div>
            <span className="lp-cta-banner__qr-hint">Scan with Camera</span>
          </a>

          <div className="lp-cta-banner__qr-content">
            <span className="lp-cta-banner__qr-title">APPLY NOW</span>
            <p className="lp-cta-banner__qr-desc">
              Scan this QR code with your mobile camera to redirect to the online application form.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
