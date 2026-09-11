import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import './WhyPrimepowerSection.css';

const PILLARS = [
  {
    num: '01',
    title: 'Regulatory Compliance',
    desc: 'Full adherence to DOLE regulations, Philippine Labor Code, and RA 10173 Data Privacy Act across all recruitment activities.',
  },
  {
    num: '02',
    title: 'Dedicated Account Management',
    desc: 'Each client is assigned a dedicated recruitment coordinator ensuring consistent communication and rapid fulfillment of job orders.',
  },
  {
    num: '03',
    title: 'AI-Assisted Screening',
    desc: 'Our HR Smart Recruitment System leverages AI analytics to rank and surface the most qualified candidates, reducing time-to-hire significantly.',
  },
  {
    num: '04',
    title: 'Transparent Reporting',
    desc: 'Clients access real-time deployment dashboards, PRF tracking, and contract renewal alerts through the dedicated Client Portal.',
  },
];

const METRICS = [
  { value: '35',    unit: '+', label: 'Years of Experience',  fill: '100%' },
  { value: '100K',  unit: '+', label: 'Workers Deployed',     fill: '90%'  },
  { value: '14',    unit: '',  label: 'Regional Offices',     fill: '72%'  },
  { value: '100',   unit: '%', label: 'Nationwide Coverage',  fill: '100%' },
];

const MILESTONES = [
  '35 Years Experience',
  'Deployed >100,000',
  'Prestigious Client List',
  '14 Regional Offices',
  'Created Jobs For Filipinos',
  'All Over The Philippines',
];

export default function WhyPrimepowerSection() {
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
      { threshold: 0.10 }
    );

    const items = ref.current?.querySelectorAll('.lp-reveal, .lp-why__metric-card');
    items?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="why" className="lp-section lp-section--dark lp-why" ref={ref} aria-labelledby="why-heading">
      <div className="lp-container">
        <div className="lp-why__inner">
          {/* Left: text + pillars */}
          <div className="lp-why__left">
            <h2 id="why-heading" className="lp-section-heading lp-section-heading--light lp-reveal lp-reveal-delay-1">
              Market Leader in Manpower
            </h2>
            <blockquote className="lp-why__quote lp-reveal lp-reveal-delay-2">
              The company was organized on February 16, 1990, and became the
              leading Provider of Skilled Personnel to various industries,
              servicing 5-star Hotels, Restaurants, Resorts, and Department
              Stores just to name a few.
            </blockquote>
            <div className="lp-why__pillars">
              {PILLARS.map((p, i) => (
                <div key={p.title} className={`lp-why__pillar lp-reveal lp-reveal-delay-${Math.min(i + 3, 6)}`}>
                  <div className="lp-why__pillar-num">{p.num}</div>
                  <div className="lp-why__pillar-text">
                    <strong>{p.title}</strong>
                    <span>{p.desc}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Service Milestones */}
            <div className="lp-why__milestones lp-reveal lp-reveal-delay-5">
              <div className="lp-why__milestones-label">Our Service Milestones</div>
              <div className="lp-why__milestones-grid">
                {MILESTONES.map((m) => (
                  <div key={m} className="lp-why__milestone-item">
                    <span className="lp-why__milestone-dot" aria-hidden="true" />
                    <span>{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ marginTop: 36 }} className="lp-reveal lp-reveal-delay-6">
              <Link to="/apply" className="lp-btn lp-btn--primary" id="why-apply-cta">
                Start Your Application
                <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
          </div>

          {/* Right: photo + metric grid */}
          <div>
            {/* Deployment photo */}
            <div className="lp-why__photo-wrap lp-reveal lp-reveal-delay-2">
              <img
                src="/landing-deployment.jpg"
                alt="PRIMEPOWER deployed workers ready for assignment"
                className="lp-why__photo"
              />
            </div>

            {/* Metrics */}
            <div className="lp-why__metrics" aria-label="Company metrics">
              {METRICS.map((m) => (
                <div
                  key={m.label}
                  className="lp-why__metric-card"
                  style={{ '--fill-pct': m.fill }}
                >
                  <div className="lp-why__metric-value">
                    {m.value}<span>{m.unit}</span>
                  </div>
                  <div className="lp-why__metric-label">{m.label}</div>
                  <div className="lp-why__metric-bar">
                    <div className="lp-why__metric-bar-fill" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
