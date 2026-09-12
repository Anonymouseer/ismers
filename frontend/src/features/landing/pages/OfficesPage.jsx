import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import LandingNavbar from '../components/LandingNavbar';
import LandingFooter from '../components/LandingFooter';
import primepowerLogo from '../../../assets/primepower-logo.svg';
import './OfficesPage.css';

const MAIN_OFFICE = {
  name: 'PRIMEPOWER MANPOWER — Head Office',
  company: 'Primepower Network, Inc.',
  type: 'National Corporate Headquarters',
  address: '3197 Kalayaan Avenue cor. Harvard St., Brgy. Pinagkaisahan, Makati City, Metro Manila, Philippines',
  hotline: '+63 917 814 6352',
  fbUrl: 'https://www.facebook.com/pms.main.official',
  recruiters: [
    { name: 'Ms. Pabie', phone: '0981-563-7989' },
    { name: 'Ms. Dhan', phone: '0904-803-5969' },
    { name: 'Ms. Joan', phone: '0967-432-8140' },
    { name: 'Ms. Sarah', phone: '0946-471-1687' },
  ],
  emails: [
    { label: 'Recruitment', address: 'so_recruitment@primepowermanpower.com' },
    { label: 'Human Resources', address: 'hr@primepower.com.ph' },
    { label: 'Client Inquiries', address: 'marketing@primepower.com.ph' },
  ],
  hours: 'Monday to Friday: 8:00 AM – 5:00 PM | Saturday: 8:00 AM – 12:00 PM',
};

const REGIONAL_OFFICES = [
  {
    id: 'bacolod',
    code: 'BACOLOD',
    title: 'Primepower Bacolod',
    fbUrl: 'https://www.facebook.com/pms.bacolod.official/?ref=embed_page#',
    region: 'Visayas',
    followers: '96 followers',
    postTime: 'about a year ago',
    likesCount: 38,
    postSnippet: 'We are recruiting 150-Steelman and 150-Carpenter for immediate placement in Bacolod.',
    theme: 'hazard-yellow',
    flyer: {
      headline: 'URGENT HIRING',
      mainRole: '150 - STEELMAN',
      subRole: '150 - CARPENTER',
      badges: ['Steelman', 'Carpenter', 'Industrial Trades', 'Govt Benefits', '13th Month Pay'],
      highlight: 'Assigned in Bacolod & Western Visayas',
    },
    location: 'Bacolod City, Negros Occidental',
    contact: '0981-563-7989',
    email: 'so_recruitment@primepowermanpower.com',
  },
  {
    id: 'baguio',
    code: 'BAGUIO',
    title: 'Primepower Baguio',
    fbUrl: 'https://www.facebook.com/pms.baguio.official/?ref=embed_page#',
    region: 'Luzon',
    followers: '155 followers',
    postTime: 'about a year ago',
    likesCount: 42,
    postSnippet: 'Become part of our premier hospitality team in Baguio City. Apply today!',
    theme: 'hotel-navy',
    flyer: {
      headline: 'WE ARE HIRING',
      mainRole: 'HOTEL & HOSPITALITY TEAM',
      subRole: 'Become Part of Our Team',
      badges: ['Receptionist', 'Server', 'Steward', 'Bellman', 'Room Attendant'],
      highlight: 'Top Hotels & Highland Resorts in Baguio',
    },
    location: 'Baguio City, Benguet',
    contact: 'pms.baguiocoordinator@gmail.com',
    email: 'pms.baguiocoordinator@gmail.com',
  },
  {
    id: 'bataan',
    code: 'BATAAN',
    title: 'Primepower Bataan',
    fbUrl: 'https://www.facebook.com/pms.bataan.official/?ref=embed_page#',
    region: 'Luzon',
    followers: '193 followers',
    postTime: 'about a year ago',
    likesCount: 29,
    postSnippet: 'Active hiring for Freeport Area of Bataan industrial and manufacturing facilities.',
    theme: 'industrial-blue',
    flyer: {
      headline: 'WE ARE HIRING',
      mainRole: 'FREEPORT INDUSTRIAL STAFF',
      subRole: 'Manufacturing & Operations',
      badges: ['Production Technicians', 'Warehouse Personnel', 'QC Inspectors', 'Maintenance'],
      highlight: 'Freeport Area of Bataan & Economic Zone',
    },
    location: 'Mariveles / Balanga, Bataan',
    contact: '+63 917 814 6352',
    email: 'bataan.recruitment@primepower.com.ph',
  },
  {
    id: 'bicol',
    code: 'BICOL',
    title: 'Primepower Bicol',
    fbUrl: 'https://www.facebook.com/pms.bicol.official/?ref=embed_page#',
    region: 'Luzon',
    followers: '153 followers',
    postTime: 'about 2 years ago',
    likesCount: 31,
    postSnippet: 'Job Hiring - Area Supervisor & Regional Commercial Operations across Bicol.',
    theme: 'corporate-slate',
    flyer: {
      headline: 'JOB HIRING',
      mainRole: 'AREA SUPERVISOR',
      subRole: 'Regional Workforce Leadership',
      badges: ['Area Supervisor', 'Retail Leads', 'Field Coordinators', 'Branch Frontline'],
      highlight: 'Legazpi & Naga Commercial Centers',
    },
    location: 'Legazpi City / Naga City, Bicol',
    contact: '+63 917 814 6352',
    email: 'bicol.operations@primepower.com.ph',
  },
  {
    id: 'bohol',
    code: 'BOHOL',
    title: 'Primepower Bohol',
    fbUrl: 'https://www.facebook.com/pms.bohol.official/?ref=embed_page#',
    region: 'Visayas',
    followers: '322 followers',
    postTime: 'about a year ago',
    likesCount: 54,
    postSnippet: 'We are recruiting Delivery Riders for Pizza Hut and hospitality partners across Bohol.',
    theme: 'rider-amber',
    flyer: {
      headline: "WE'RE HIRING",
      mainRole: 'DELIVERY RIDERS',
      subRole: 'For Pizza Hut & Food Chains',
      badges: ['Driver’s License', 'Customer Oriented', 'F&B Support', 'Resort Staff'],
      highlight: 'Tagbilaran City & Panglao Island',
    },
    location: 'Tagbilaran City / Panglao Island, Bohol',
    contact: 'primepower.boholjobs@gmail.com',
    email: 'primepower.boholjobs@gmail.com',
  },
  {
    id: 'boracay',
    code: 'BORACAY',
    title: 'Primepower Boracay',
    fbUrl: 'https://www.facebook.com/pms.boracay.official?ref=embed_page',
    region: 'Visayas',
    followers: '414 followers',
    postTime: 'about 2 years ago',
    likesCount: 67,
    postSnippet: 'Job Hiring - Area Supervisor and 5-Star Island Resort staff in Boracay.',
    theme: 'resort-teal',
    flyer: {
      headline: '5-STAR RESORT OPERATIONS',
      mainRole: 'AREA SUPERVISOR',
      subRole: 'Luxury Hospitality Management',
      badges: ['Area Supervisor', 'Front Desk', 'F&B Captains', 'Housekeeping Specialists'],
      highlight: 'Station 1 & 2 Luxury Resorts',
    },
    location: 'Station 1 & 2, Boracay Island, Aklan',
    contact: '+63 917 814 6352',
    email: 'boracay.staffing@primepower.com.ph',
  },
  {
    id: 'cdo',
    code: 'CDO',
    title: 'Primepower Cagayan de Oro',
    fbUrl: 'https://www.facebook.com/pms.cdo.official/?ref=embed_page#',
    region: 'Mindanao',
    followers: '108 followers',
    postTime: 'about a year ago',
    likesCount: 22,
    postSnippet: 'Commercial facility attendants, warehouse logistics, and retail roles available in CDO.',
    theme: 'distribution-blue',
    flyer: {
      headline: 'WE ARE HIRING',
      mainRole: 'COMMERCIAL & LOGISTICS',
      subRole: 'Distribution & Retail Solutions',
      badges: ['Logistics Staff', 'Retail Associates', 'Cashiers', 'Facility Utility'],
      highlight: 'Northern Mindanao Commercial Hub',
    },
    location: 'Cagayan de Oro City, Misamis Oriental',
    contact: '+63 917 814 6352',
    email: 'cdo.recruitment@primepower.com.ph',
  },
  {
    id: 'cebu',
    code: 'CEBU',
    title: 'Primepower Cebu',
    fbUrl: 'https://www.facebook.com/pms.cebu.official/?ref=embed_page#',
    region: 'Visayas',
    followers: '201 followers',
    postTime: 'about a year ago',
    likesCount: 48,
    postSnippet: 'Visit our regional office located at Gil Garcia St., Capitol Site, Cebu City.',
    theme: 'cebu-royal',
    flyer: {
      headline: 'ENTERPRISE MANPOWER',
      mainRole: 'METRO CEBU OPERATIONS',
      subRole: 'Commercial & Hospitality Placement',
      badges: ['Building Maintenance', 'Hospitality Crew', 'Office Staff', 'Skilled Labor'],
      highlight: 'Gil Garcia St., Capitol Site, Cebu City',
    },
    location: 'Gil Garcia St., Capitol Site, Cebu City',
    contact: '+63 917 814 6352',
    email: 'cebu.office@primepower.com.ph',
  },
  {
    id: 'davao',
    code: 'DAVAO',
    title: 'Primepower Davao',
    fbUrl: 'https://www.facebook.com/pms.davao.official/?ref=embed_page#',
    region: 'Mindanao',
    followers: '437 followers',
    postTime: 'about a year ago',
    likesCount: 75,
    postSnippet: 'Visit our office at 3rd Floor Knights of Columbus Bldg, CM Recto St, Davao City.',
    theme: 'davao-cyan',
    flyer: {
      headline: "WE'RE HIRING!",
      mainRole: 'HOSPITALITY & DINING TEAM',
      subRole: 'Multiple Positions Available',
      badges: ['Team Member', 'F&B', 'Housekeeping', 'Executive Assistant', 'Bellman', 'Bartender'],
      highlight: '3rd Floor Knights of Columbus Bldg, CM Recto St',
    },
    location: '3rd Flr Knights of Columbus, CM Recto St, Davao City',
    contact: 'pinkyhonculada@gmail.com',
    email: 'pms.areasupdvo@gmail.com',
  },
  {
    id: 'elnido',
    code: 'EL NIDO',
    title: 'Primepower El Nido',
    fbUrl: 'https://www.facebook.com/pms.elnido.official/?ref=embed_page#',
    region: 'Luzon',
    followers: '863 followers',
    postTime: 'about a year ago',
    likesCount: 112,
    postSnippet: 'We Are Hiring for SEDA Lio 5 STAR Hotel and premier resorts in El Nido, Palawan.',
    theme: 'elnido-blue',
    flyer: {
      headline: 'URGENT HIRING',
      mainRole: 'SEDA LIO 5-STAR HOTEL',
      subRole: 'Luxury Resort Operations',
      badges: ['Front Desk Staff', 'Telephone Operator', 'PA Attendant', 'Gardener', 'Bellman'],
      highlight: 'SEDA Lio 5-Star Resort, El Nido, Palawan',
    },
    location: 'El Nido, Palawan',
    contact: 'elnidoprime@gmail.com',
    email: 'primepowermanpower388@gmail.com',
  },
  {
    id: 'iloilo',
    code: 'ILOILO',
    title: 'Primepower Iloilo',
    fbUrl: 'https://www.facebook.com/pms.iloilo.official/?ref=embed_page#',
    region: 'Visayas',
    followers: '61 followers',
    postTime: 'about a year ago',
    likesCount: 19,
    postSnippet: 'Commercial centers, retail staffing, and restaurant dining crew in Iloilo City.',
    theme: 'corporate-slate',
    flyer: {
      headline: 'WE ARE HIRING',
      mainRole: 'COMMERCIAL & DINING CREW',
      subRole: 'Panay Island Operations',
      badges: ['Dining Personnel', 'Retail Merchandisers', 'Facility Maintenance', 'Customer Care'],
      highlight: 'Iloilo City Business District',
    },
    location: 'Iloilo City, Iloilo',
    contact: '+63 917 814 6352',
    email: 'iloilo.recruitment@primepower.com.ph',
  },
  {
    id: 'pampanga',
    code: 'PAMPANGA',
    title: 'Primepower Pampanga',
    fbUrl: 'https://www.facebook.com/pms.pampanga.official/?ref=embed_page#',
    region: 'Luzon',
    followers: '103 followers',
    postTime: 'about a year ago',
    likesCount: 26,
    postSnippet: 'Clark Freeport Zone warehouse, industrial manufacturing, and hospitality staffing.',
    theme: 'industrial-blue',
    flyer: {
      headline: 'WE ARE HIRING',
      mainRole: 'CLARK FREEPORT OPERATIONS',
      subRole: 'Industrial & Warehouse Logistics',
      badges: ['Warehouse Staff', 'Technical Assembly', 'Casino Attendants', 'Office Admin'],
      highlight: 'Clark Freeport Zone, Pampanga',
    },
    location: 'Clark / San Fernando / Angeles, Pampanga',
    contact: '+63 917 814 6352',
    email: 'pampanga.branch@primepower.com.ph',
  },
  {
    id: 'puerto-princesa',
    code: 'PUERTO PRINCESA',
    title: 'Primepower Puerto Princesa',
    fbUrl: 'https://www.facebook.com/pms.puertoprincesa.official/?ref=embed_page#',
    region: 'Luzon',
    followers: '190 followers',
    postTime: 'about a year ago',
    likesCount: 34,
    postSnippet: 'We Are Hiring: Public Area Attendants and hotel maintenance in Puerto Princesa.',
    theme: 'hotel-navy',
    flyer: {
      headline: 'WE ARE HIRING!',
      mainRole: 'PUBLIC AREA ATTENDANT',
      subRole: 'Hotel & Commercial Facility Care',
      badges: ['Public Area Attendant', 'Hotel Maintenance', 'Utility Technicians', 'Physically Fit'],
      highlight: 'Puerto Princesa Tourism Corridor',
    },
    location: 'Puerto Princesa City, Palawan',
    contact: '+63 917 814 6352',
    email: 'puertoprincesa@primepower.com.ph',
  },
  {
    id: 'tagaytay',
    code: 'TAGAYTAY',
    title: 'Primepower Tagaytay',
    fbUrl: 'https://www.facebook.com/pms.tagaytay.official/?ref=embed_page#',
    region: 'Luzon',
    followers: '497 followers',
    postTime: 'about a month ago',
    likesCount: 63,
    postSnippet: 'PMS Primepower Network Inc is looking for Cashiers, Receiving Clerks, and Bakers.',
    theme: 'tagaytay-gold',
    flyer: {
      headline: 'WE ARE HIRING',
      mainRole: 'HIGHLAND HOSPITALITY',
      subRole: 'Resorts & Dining Operations',
      badges: ['Cashier', 'Receiving Clerk', 'Baker', 'Telephone Operator', 'Service Crew'],
      highlight: 'Tagaytay Tourism & Highland Resorts',
    },
    location: 'Tagaytay City, Cavite',
    contact: '+63 917 814 6352',
    email: 'tagaytay.recruitment@primepower.com.ph',
  },
];

export default function OfficesPage() {
  const [selectedRegion, setSelectedRegion] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [followedBranches, setFollowedBranches] = useState({});
  const [likedBranches, setLikedBranches] = useState({});
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  const toggleFollow = (id) => {
    setFollowedBranches((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleLike = (id) => {
    setLikedBranches((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleShare = (office) => {
    const shareUrl = `${window.location.origin}/offices#${office.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl).then(() => {
        setCopiedId(office.id);
        setTimeout(() => setCopiedId(null), 2200);
      });
    }
  };

  const filteredOffices = REGIONAL_OFFICES.filter((office) => {
    const matchesRegion =
      selectedRegion === 'ALL' || office.region.toUpperCase() === selectedRegion;
    const query = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !query ||
      office.code.toLowerCase().includes(query) ||
      office.title.toLowerCase().includes(query) ||
      office.location.toLowerCase().includes(query) ||
      office.flyer.mainRole.toLowerCase().includes(query) ||
      office.flyer.badges.some((b) => b.toLowerCase().includes(query));
    return matchesRegion && matchesQuery;
  });

  const regionCounts = {
    ALL: REGIONAL_OFFICES.length,
    LUZON: REGIONAL_OFFICES.filter((o) => o.region === 'Luzon').length,
    VISAYAS: REGIONAL_OFFICES.filter((o) => o.region === 'Visayas').length,
    MINDANAO: REGIONAL_OFFICES.filter((o) => o.region === 'Mindanao').length,
  };

  return (
    <div className="landing-page lp-offices-page">
      <LandingNavbar />

      <main className="lp-offices-main">
        {/* Header Hero */}
        <section className="lp-offices-hero">
          <div className="lp-container">
            <div className="lp-offices-hero__inner">
              <span className="lp-offices-hero__tag">Nationwide Network</span>
              <h1 className="lp-offices-hero__title">Our Offices Across the Philippines</h1>
              <p className="lp-offices-hero__sub">
                PRIMEPOWER operates 15 strategic hubs across Luzon, Visayas, and Mindanao.
                Explore our Makati Corporate Headquarters and 14 regional deployment branches.
              </p>

              {/* Fast Stats */}
              <div className="lp-offices-hero__stats">
                <div className="lp-offices-hero__stat">
                  <span className="lp-offices-hero__stat-num">01</span>
                  <span className="lp-offices-hero__stat-label">Corporate Headquarters (Makati)</span>
                </div>
                <div className="lp-offices-hero__stat-divider" aria-hidden="true" />
                <div className="lp-offices-hero__stat">
                  <span className="lp-offices-hero__stat-num">14</span>
                  <span className="lp-offices-hero__stat-label">Regional Branch Offices</span>
                </div>
                <div className="lp-offices-hero__stat-divider" aria-hidden="true" />
                <div className="lp-offices-hero__stat">
                  <span className="lp-offices-hero__stat-num">100%</span>
                  <span className="lp-offices-hero__stat-label">Nationwide Coverage</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: MAIN OFFICE (Headquarters) */}
        <section className="lp-main-office-section" id="main-office">
          <div className="lp-container">
            <div className="lp-section-label-bar">
              <span className="lp-section-label-bar__dot" aria-hidden="true" />
              <span>HEADQUARTERS</span>
            </div>
            <h2 className="lp-main-office-heading">Main Office &amp; Corporate Center</h2>

            <div className="lp-main-office-card">
              <div className="lp-main-office-card__left">
                <div className="lp-main-office-card__badge-wrap">
                  <div className="lp-main-office-card__emblem">
                    <img src={primepowerLogo} alt="PRIMEPOWER Logo" className="lp-main-office-card__logo" />
                  </div>
                  <div className="lp-main-office-card__type">{MAIN_OFFICE.type}</div>
                </div>

                <h3 className="lp-main-office-card__title">{MAIN_OFFICE.name}</h3>
                <p className="lp-main-office-card__company">{MAIN_OFFICE.company}</p>

                <div className="lp-main-office-card__info-row">
                  <svg className="lp-main-office-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <div>
                    <strong>Office Address</strong>
                    <p>{MAIN_OFFICE.address}</p>
                  </div>
                </div>

                <div className="lp-main-office-card__info-row">
                  <svg className="lp-main-office-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  <div>
                    <strong>Operating Hours</strong>
                    <p>{MAIN_OFFICE.hours}</p>
                  </div>
                </div>

                <div className="lp-main-office-card__info-row">
                  <svg className="lp-main-office-card__icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                  <div>
                    <strong>National Hotline</strong>
                    <p><a href="tel:+639178146352">{MAIN_OFFICE.hotline}</a></p>
                  </div>
                </div>
              </div>

              <div className="lp-main-office-card__right">
                <div className="lp-main-office-card__subheading">Recruitment &amp; HR Coordinators</div>
                <div className="lp-main-office-recruiters-grid">
                  {MAIN_OFFICE.recruiters.map((r) => (
                    <div key={r.name} className="lp-main-office-recruiter-item">
                      <span className="lp-main-office-recruiter-dot" aria-hidden="true" />
                      <div className="lp-main-office-recruiter-meta">
                        <strong>{r.name}</strong>
                        <a href={`tel:${r.phone}`}>{r.phone}</a>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="lp-main-office-card__subheading" style={{ marginTop: 22 }}>Email Communications</div>
                <div className="lp-main-office-emails-list">
                  {MAIN_OFFICE.emails.map((e) => (
                    <div key={e.address} className="lp-main-office-email-item">
                      <span className="lp-main-office-email-label">{e.label}:</span>
                      <a href={`mailto:${e.address}`} className="lp-main-office-email-link">{e.address}</a>
                    </div>
                  ))}
                </div>

                <div className="lp-main-office-card__cta-row">
                  <Link to="/apply" className="lp-btn lp-btn--primary">
                    <span>Submit Application to HQ</span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </Link>
                  <a
                    href={MAIN_OFFICE.fbUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="lp-btn lp-btn--ghost"
                    title="Visit PRIMEPOWER Official Facebook Page"
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="#1877f2" aria-hidden="true">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span>Official Facebook Page</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: REGIONAL OFFICES NETWORK (Visual Social Flyer Cards) */}
        <section className="lp-regional-section" id="regional-offices">
          <div className="lp-container">
            <div className="lp-section-label-bar">
              <span className="lp-section-label-bar__dot" aria-hidden="true" />
              <span>REGIONAL HUBS</span>
            </div>

            <div className="lp-regional-header">
              <div>
                <h2 className="lp-regional-heading">Regional Office Network (14 Branches)</h2>
                <p className="lp-regional-sub">
                  Authentic branch announcements, specialized placement hubs, and local deployment networks across the Philippines.
                </p>
              </div>

              {/* Search Bar */}
              <div className="lp-regional-search">
                <svg className="lp-regional-search__icon" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Filter by city, role, or keyword..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="lp-regional-search__input"
                  aria-label="Search regional offices"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="lp-regional-search__clear"
                    aria-label="Clear search"
                  >
                    &times;
                  </button>
                )}
              </div>
            </div>

            {/* Region Filter Tabs */}
            <div className="lp-regional-tabs" role="tablist" aria-label="Filter by island region">
              <button
                role="tab"
                aria-selected={selectedRegion === 'ALL'}
                className={`lp-regional-tab${selectedRegion === 'ALL' ? ' active' : ''}`}
                onClick={() => setSelectedRegion('ALL')}
              >
                All Regions ({regionCounts.ALL})
              </button>
              <button
                role="tab"
                aria-selected={selectedRegion === 'LUZON'}
                className={`lp-regional-tab${selectedRegion === 'LUZON' ? ' active' : ''}`}
                onClick={() => setSelectedRegion('LUZON')}
              >
                Luzon ({regionCounts.LUZON})
              </button>
              <button
                role="tab"
                aria-selected={selectedRegion === 'VISAYAS'}
                className={`lp-regional-tab${selectedRegion === 'VISAYAS' ? ' active' : ''}`}
                onClick={() => setSelectedRegion('VISAYAS')}
              >
                Visayas ({regionCounts.VISAYAS})
              </button>
              <button
                role="tab"
                aria-selected={selectedRegion === 'MINDANAO'}
                className={`lp-regional-tab${selectedRegion === 'MINDANAO' ? ' active' : ''}`}
                onClick={() => setSelectedRegion('MINDANAO')}
              >
                Mindanao ({regionCounts.MINDANAO})
              </button>
            </div>

            {/* Offices Grid */}
            {filteredOffices.length === 0 ? (
              <div className="lp-regional-empty">
                <p>No regional offices matched: &ldquo;{searchQuery}&rdquo;</p>
                <button onClick={() => { setSearchQuery(''); setSelectedRegion('ALL'); }} className="lp-btn lp-btn--ghost">
                  Reset Filters
                </button>
              </div>
            ) : (
              <div className="lp-regional-grid">
                {filteredOffices.map((office) => {
                  const isFollowed = !!followedBranches[office.id];
                  const isLiked = !!likedBranches[office.id];
                  const likes = office.likesCount + (isLiked ? 1 : 0);

                  return (
                    <div key={office.id} id={office.id} className="lp-regional-item">
                      {/* Left: Round Brand Emblem matching the user's screenshots */}
                      <div className="lp-regional-emblem-wrap">
                        <div className="lp-regional-emblem-circle">
                          <img
                            src={primepowerLogo}
                            alt={`PRIMEPOWER ${office.code} Logo`}
                            className="lp-regional-emblem-img"
                          />
                        </div>
                        <span className="lp-regional-emblem-code">{office.code}</span>
                      </div>

                      {/* Right: Authentic Social Media Flyer Card */}
                      <div className="lp-social-card">
                        {/* 1. Facebook Page Header */}
                        <div className="lp-social-card__header">
                          <a
                            href={office.fbUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lp-social-card__avatar"
                            title={`Open ${office.title} on Facebook`}
                          >
                            <img src={primepowerLogo} alt="" className="lp-social-card__avatar-img" />
                          </a>
                          <div className="lp-social-card__header-text">
                            <h3 className="lp-social-card__name">
                              <a
                                href={office.fbUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                title={`Open ${office.title} on Facebook`}
                              >
                                {office.title}
                              </a>
                            </h3>
                            <span className="lp-social-card__followers">{office.followers}</span>
                          </div>
                          <div className="lp-social-card__header-actions">
                            <a
                              href={office.fbUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="lp-social-card__btn-follow"
                              title={`Follow ${office.title} on Facebook`}
                            >
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor" aria-hidden="true">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                              <span>Follow Page</span>
                            </a>
                            <button
                              onClick={() => handleShare(office)}
                              className="lp-social-card__btn-share"
                              title="Share Branch"
                            >
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
                                <polyline points="16 6 12 2 8 6" />
                                <line x1="12" y1="2" x2="12" y2="15" />
                              </svg>
                              <span>{copiedId === office.id ? 'Copied' : 'Share'}</span>
                            </button>
                          </div>
                        </div>

                        {/* 2. Sub-Tabs Bar (Profile / Messages) */}
                        <div className="lp-social-card__tabs">
                          <span className="lp-social-card__tab active">Profile</span>
                          <span className="lp-social-card__tab">Messages</span>
                        </div>

                        {/* 3. Graphical Recruitment Flyer (Replaces the ugly wall of text!) */}
                        <div className={`lp-flyer lp-flyer--${office.theme}`}>
                          {/* Top Hazard / Accent Bar */}
                          <div className="lp-flyer__stripe" aria-hidden="true" />

                          <div className="lp-flyer__content">
                            <div className="lp-flyer__header-row">
                              <span className="lp-flyer__tag">{office.flyer.headline}</span>
                              <span className="lp-flyer__location-chip">{office.code}</span>
                            </div>

                            <div className="lp-flyer__title-block">
                              <div className="lp-flyer__role-main">{office.flyer.mainRole}</div>
                              <div className="lp-flyer__role-sub">{office.flyer.subRole}</div>
                            </div>

                            {/* Visual Role Badges */}
                            <div className="lp-flyer__badges-wrap">
                              {office.flyer.badges.map((badge) => (
                                <span key={badge} className="lp-flyer__role-badge">
                                  {badge}
                                </span>
                              ))}
                            </div>

                            {/* Location & Highlight Strip */}
                            <div className="lp-flyer__highlight-bar">
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <span>{office.flyer.highlight}</span>
                            </div>
                          </div>

                          {/* Bottom Hazard / Accent Bar */}
                          <div className="lp-flyer__stripe" aria-hidden="true" />
                        </div>

                        {/* 4. Social Post Metadata */}
                        <div className="lp-social-card__post-meta">
                          <a
                            href={office.fbUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lp-social-card__meta-left"
                            title={`Open ${office.title} on Facebook`}
                          >
                            <img src={primepowerLogo} alt="" className="lp-social-card__post-avatar" />
                            <div>
                              <strong>{office.title}</strong>
                              <span>{office.postTime} &bull; Public</span>
                            </div>
                          </a>
                          <a
                            href={office.fbUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lp-social-card__fb-link"
                            title={`Open official ${office.title} Facebook Page`}
                            aria-label={`Open official ${office.title} Facebook Page`}
                          >
                            <svg className="lp-social-card__fb-icon" viewBox="0 0 24 24" width="16" height="16" fill="#1877f2" aria-hidden="true">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                          </a>
                        </div>

                        <p className="lp-social-card__caption">
                          {office.postSnippet}
                        </p>

                        {/* 5. Engagement Bar (Like, Facebook Link, Inquire, Share) */}
                        <div className="lp-social-card__reactions-bar">
                          <button
                            onClick={() => toggleLike(office.id)}
                            className={`lp-social-card__reaction-btn${isLiked ? ' liked' : ''}`}
                            aria-label="Like post"
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill={isLiked ? '#1877f2' : 'none'} stroke={isLiked ? '#1877f2' : 'currentColor'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3" />
                            </svg>
                            <span>Like ({likes})</span>
                          </button>

                          <a
                            href={office.fbUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="lp-social-card__reaction-btn"
                            title={`Visit ${office.title} on Facebook`}
                          >
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="#1877f2" aria-hidden="true">
                              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                            </svg>
                            <span>Facebook</span>
                          </a>

                          <a
                            href={office.email ? `mailto:${office.email}` : '#'}
                            className="lp-social-card__reaction-btn"
                            title={`Inquire via email: ${office.email}`}
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                            </svg>
                            <span>Inquire</span>
                          </a>

                          <button
                            onClick={() => handleShare(office)}
                            className="lp-social-card__reaction-btn"
                            aria-label="Share post link"
                          >
                            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="18" cy="5" r="3" />
                              <circle cx="6" cy="12" r="3" />
                              <circle cx="18" cy="19" r="3" />
                              <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                              <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                            </svg>
                            <span>Share</span>
                          </button>
                        </div>

                        {/* 6. Action Buttons Linking to Apply & Official Facebook */}
                        <div className="lp-social-card__footer">
                          <Link to="/apply" className="lp-social-card__apply-btn">
                            <span>Apply via {office.code} Hub</span>
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                          </Link>
                          {office.fbUrl && (
                            <a
                              href={office.fbUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="lp-social-card__fb-outline-btn"
                              title={`Visit official ${office.title} Facebook Page`}
                            >
                              <svg viewBox="0 0 24 24" width="13" height="13" fill="#1877f2" aria-hidden="true">
                                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                              </svg>
                              <span>Official Facebook</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* BOTTOM CTA: Fast Application Navigation */}
        <section className="lp-offices-cta">
          <div className="lp-container">
            <div className="lp-offices-cta__inner">
              <h2 className="lp-offices-cta__heading">Ready to Register with PRIMEPOWER?</h2>
              <p className="lp-offices-cta__sub">
                Complete your self-service registration online. Our recruitment teams across the Makati Head Office and all 14 regional branches review candidate submissions daily.
              </p>
              <div className="lp-offices-cta__actions">
                <Link to="/apply" className="lp-btn lp-btn--primary">
                  <span>Start Online Application</span>
                  <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
                <Link to="/" className="lp-btn lp-btn--ghost">
                  <span>Back to Home</span>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <LandingFooter />
    </div>
  );
}
