import { useEffect, useRef } from 'react';
import './ServicesSection.css';

const SERVICES = [
  {
    id: 'recruitment',
    num: '01',
    title: 'Recruitment',
    desc: 'End-to-end applicant sourcing, profiling, and pipeline management tailored to client job orders and position requirements.',
    features: [
      'Proactive candidate pool sourcing',
      'PRF job order requirement matching',
      'High-volume & skilled role fulfillment',
    ],
  },
  {
    id: 'selection',
    num: '02',
    title: 'Selection & Screening',
    desc: 'Structured interview panels, skills assessment, background verification, and final candidate shortlisting for client review.',
    features: [
      'Structured technical & behavioral interviews',
      'Comprehensive background & credential checks',
      'Curated shortlist scoring matrices',
    ],
  },
  {
    id: 'deployment',
    num: '03',
    title: 'Deployment & Assignment',
    desc: 'Seamless onboarding coordination, deployment scheduling, and real-time tracking of placed employees across client sites.',
    features: [
      'Pre-deployment briefing & site orientation',
      'Rapid mobilization across client facilities',
      'Real-time workforce roster & assignment sync',
    ],
  },
  {
    id: 'prf',
    num: '04',
    title: 'PRF Job Orders',
    desc: 'Systematic management of Personnel Requisition Forms — from client submission and position matching to fulfillment tracking.',
    features: [
      'Digital PRF intake & order specification',
      'Clear fulfillment SLA tracking & milestones',
      'Direct recruiter-to-client coordination',
    ],
  },
  {
    id: 'renewal',
    num: '05',
    title: 'Contract Renewal',
    desc: 'Proactive monitoring and administration of employment contracts — ensuring timely renewals and uninterrupted client coverage.',
    features: [
      'Automated 30/60/90-day renewal alerts',
      'Philippine Labor Code & tenure compliance',
      'Zero disruption to client workforce coverage',
    ],
  },
  {
    id: 'analytics',
    num: '06',
    title: 'AI-Powered Analytics',
    desc: 'Intelligent recruitment dashboards and predictive analytics to support executive decision-making on workforce planning and capacity.',
    features: [
      'Predictive talent supply & demand modeling',
      'Executive KPI dashboards & fill-rate tracking',
      'Data-driven insights for resource planning',
    ],
  },
];

export default function ServicesSection() {
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
    <section id="services" className="lp-section lp-section--light lp-services" ref={ref} aria-labelledby="services-heading">
      <div className="lp-container">
        {/* Header */}
        <div className="lp-services__header">
          <h2 id="services-heading" className="lp-section-heading lp-reveal lp-reveal-delay-1">
            Comprehensive Staffing Solutions
          </h2>
          <p className="lp-section-body lp-reveal lp-reveal-delay-2">
            From initial applicant sourcing to post-placement contract administration,
            PRIMEPOWER delivers end-to-end manpower services designed for operational excellence.
          </p>
        </div>

        {/* Editorial photo strip */}
        <div className="lp-services__photo-strip lp-reveal lp-reveal-delay-3">
          <img
            src="/landing-interview.jpg"
            alt="Professional recruitment interview — PRIMEPOWER recruiter meeting a candidate"
            className="lp-services__photo"
          />
        </div>

        {/* Grid */}
        <div className="lp-services__grid">
          {SERVICES.map((svc, i) => (
            <div
              key={svc.id}
              className={`lp-service-card lp-reveal lp-reveal-delay-${Math.min(i + 1, 6)}`}
              aria-label={`Service: ${svc.title}`}
            >
              {/* Card top banner */}
              <div className="lp-service-card__top">
                <span className="lp-service-card__index">{svc.num}</span>
              </div>

              {/* Title and description */}
              <h3 className="lp-service-card__title">{svc.title}</h3>
              <p className="lp-service-card__desc">{svc.desc}</p>

              {/* Feature highlights list */}
              <ul className="lp-service-card__features" role="list">
                {svc.features.map((feat) => (
                  <li key={feat} className="lp-service-card__feature-item">
                    <span className="lp-service-card__feature-bullet" aria-hidden="true" />
                    <span>{feat}</span>
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
