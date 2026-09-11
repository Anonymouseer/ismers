import { useEffect, useRef } from 'react';
import './HowItWorksSection.css';

const STEPS = [
  {
    num: '01',
    title: 'Submit Application',
    desc: 'Applicants complete the self-service online registration with employment history and digital document submissions.',
    checkpoints: [
      'Self-service applicant portal',
      'Resume & employment profiling',
      'Digital document & ID verification',
    ],
    progress: '25%',
  },
  {
    num: '02',
    title: 'Screening & Assessment',
    desc: 'Our recruitment team evaluates qualifications, validates credentials, and conducts preliminary competency reviews.',
    checkpoints: [
      'Comprehensive background checks',
      'Competency & skills evaluation',
      'DOLE labor compliance validation',
    ],
    progress: '50%',
  },
  {
    num: '03',
    title: 'Client Interview',
    desc: 'Shortlisted candidates are presented directly to client hiring managers for structured final interviews and selection.',
    checkpoints: [
      'Candidate dossier presentation',
      'Interview coordination & logistics',
      'Client selection & offer endorsement',
    ],
    progress: '75%',
  },
  {
    num: '04',
    title: 'Deployment & Placement',
    desc: 'Approved candidates undergo pre-deployment briefing, site orientation, and seamless mobilization to client facilities.',
    checkpoints: [
      'Pre-deployment site orientation',
      'Facility assignment & onboarding',
      'Ongoing contract renewal tracking',
    ],
    progress: '100%',
  },
];

export default function HowItWorksSection() {
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
      { threshold: 0.12 }
    );

    const items = ref.current?.querySelectorAll('.lp-reveal');
    items?.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <section id="how" className="lp-section lp-how" ref={ref} aria-labelledby="how-heading">
      <div className="lp-container">
        {/* Header */}
        <div className="lp-how__header">
          <h2 id="how-heading" className="lp-section-heading lp-reveal lp-reveal-delay-1">
            How It Works
          </h2>
          <p className="lp-section-body lp-reveal lp-reveal-delay-2">
            A streamlined, transparent four-stage process from application to
            deployment — designed for efficiency on both the applicant and client side.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="lp-how__grid" role="list">
          {STEPS.map((step, i) => (
            <div
              key={step.num}
              className={`lp-how-card lp-reveal lp-reveal-delay-${Math.min(i + 2, 6)}`}
              role="listitem"
              aria-label={`Step ${step.num}: ${step.title}`}
            >
              {/* Top Meta Bar */}
              <div className="lp-how-card__header">
                <div className="lp-how-card__badge">{step.num}</div>
              </div>

              {/* Title & Description */}
              <h3 className="lp-how-card__title">{step.title}</h3>
              <p className="lp-how-card__desc">{step.desc}</p>

              {/* Checkpoints */}
              <ul className="lp-how-card__checkpoints" role="list">
                {step.checkpoints.map((item) => (
                  <li key={item} className="lp-how-card__checkpoint-item">
                    <span className="lp-how-card__checkpoint-dash" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
