import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './CTABannerSection.css';

export default function CTABannerSection() {
  const ref = useRef(null);

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

        <div className="lp-cta-banner__actions lp-reveal lp-reveal-delay-3">
          <Link
            to="/apply"
            className="lp-cta-banner__btn-primary"
            id="cta-apply-now"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" />
              <rect x="9" y="3" width="6" height="4" rx="1" />
              <path d="m9 12 2 2 4-4" />
            </svg>
            Apply as a Candidate
          </Link>
        </div>
      </div>
    </section>
  );
}
