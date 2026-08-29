import React from 'react';

/**
 * Modern vector illustration of an HR Recruitment & Selection consultation desk.
 * Styled strictly in PRIMEPOWER corporate system colors (#007DCC, #E4F0F8, #0A1B2E, #E51937, #D98A2B).
 * Enhanced with grounding platform shadow and balanced geometry.
 */
export default function AuthIllustration() {
  return (
    <div className="auth-illustration-wrap">
      <svg
        viewBox="0 0 520 370"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="auth-illustration-svg"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="systemGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#007DCC" stopOpacity="0.14" />
            <stop offset="70%" stopColor="#007DCC" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#007DCC" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="deskPrimeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#007DCC" />
            <stop offset="100%" stopColor="#005A96" />
          </linearGradient>
          <linearGradient id="plantGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#007DCC" />
            <stop offset="100%" stopColor="#004D80" />
          </linearGradient>
          <linearGradient id="applicantShirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D98A2B" />
            <stop offset="100%" stopColor="#B46E1B" />
          </linearGradient>
        </defs>

        {/* Ambient Halo */}
        <circle cx="260" cy="180" r="150" fill="url(#systemGlow)" />

        {/* Grounding Shadow Platform Base */}
        <ellipse cx="260" cy="316" rx="210" ry="14" fill="#007DCC" fillOpacity="0.07" />
        <ellipse cx="260" cy="316" rx="160" ry="8" fill="#0A1B2E" fillOpacity="0.05" />

        {/* Floor Horizon Lines */}
        <path d="M40 310H480" stroke="#007DCC" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
        <path d="M80 322H400" stroke="#007DCC" strokeOpacity="0.12" strokeWidth="2" strokeLinecap="round" />
        <path d="M140 332H280" stroke="#007DCC" strokeOpacity="0.06" strokeWidth="2" strokeLinecap="round" />

        {/* Background Subtle Geometric Accents */}
        <circle cx="105" cy="95" r="16" stroke="#007DCC" strokeOpacity="0.22" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="210" cy="65" r="22" stroke="#007DCC" strokeOpacity="0.18" strokeWidth="2" strokeDasharray="4 4" />
        <circle cx="395" cy="90" r="14" stroke="#007DCC" strokeOpacity="0.25" strokeWidth="2" strokeDasharray="3 3" />

        {/* ── RECRUITER (Seated behind consultation desk) ── */}
        <g id="recruiter">
          {/* Hair back */}
          <ellipse cx="235" cy="142" rx="19" ry="22" fill="#0A1B2E" />
          {/* Head & Neck */}
          <circle cx="235" cy="146" r="14" fill="#FED7AA" />
          <rect x="231" y="156" width="8" height="10" fill="#FED7AA" />
          {/* Hair front */}
          <path d="M220 138C220 126 250 126 250 138C250 143 246 147 242 149C238 147 234 147 230 149C224 147 220 143 220 138Z" fill="#0A1B2E" />
          {/* Inner Blouse */}
          <path d="M216 164C216 156 254 156 254 164L260 210H210L216 164Z" fill="#E4F0F8" />
          {/* Cardigan in Cerulean Blue */}
          <path d="M212 168C212 160 224 158 224 168L220 210H208L212 168Z" fill="#007DCC" />
          <path d="M258 168C258 160 246 158 246 168L250 210H262L258 168Z" fill="#007DCC" />
        </g>

        {/* ── CONSULTATION RECEPTION DESK ── */}
        <g id="desk">
          {/* Main Counter Base */}
          <rect x="150" y="195" width="220" height="105" rx="6" fill="url(#deskPrimeGrad)" />
          {/* Top Counter Bar */}
          <rect x="146" y="187" width="228" height="12" rx="4" fill="#007DCC" />
          {/* Front Highlight stripe */}
          <path d="M150 225L370 203V211L150 233V225Z" fill="#FFFFFF" fillOpacity="0.18" />
          {/* Laptop on desk */}
          <rect x="180" y="175" width="40" height="14" rx="2" fill="#0A1B2E" />
          <path d="M174 189H226L222 193H178L174 189Z" fill="#94A3B8" />
          {/* Pen holder & mini plant */}
          <rect x="310" y="171" width="18" height="16" rx="3" fill="#E51937" />
          <circle cx="316" cy="165" r="4" fill="#007DCC" />
          <circle cx="322" cy="161" r="4" fill="#33A1E6" />
          <circle cx="320" cy="167" r="3" fill="#007DCC" />
        </g>

        {/* ── CANDIDATE / APPLICANT ── */}
        <g id="applicant">
          {/* Legs */}
          <rect x="106" y="240" width="13" height="70" rx="3" fill="#0A1B2E" />
          <rect x="123" y="240" width="13" height="70" rx="3" fill="#0A1B2E" />
          {/* Shoes */}
          <rect x="102" y="304" width="20" height="8" rx="3" fill="#007DCC" />
          <rect x="123" y="304" width="20" height="8" rx="3" fill="#007DCC" />

          {/* Torso & Shirt — seamlessly connected */}
          <path d="M102 168C102 160 140 160 140 168L142 244H100L102 168Z" fill="url(#applicantShirtGrad)" />

          {/* Neck */}
          <rect x="117" y="152" width="8" height="18" fill="#FED7AA" rx="2" />

          {/* Head & Face */}
          <circle cx="121" cy="142" r="14" fill="#FED7AA" />

          {/* Hair (Clean professional styling) */}
          <path
            d="M107 140C107 125 135 123 136 136C136 142 133 144 129 139C124 133 115 134 111 138C108 141 107 140 107 140Z"
            fill="#0A1B2E"
          />

          {/* Collar detail */}
          <path d="M117 168L121 174L125 168" stroke="#0A1B2E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />

          {/* Right Arm on counter */}
          <path d="M136 172L172 189H190V195H170L134 180L136 172Z" fill="url(#applicantShirtGrad)" />

          {/* Left Arm holding briefcase */}
          <path d="M102 172L94 220L102 222L108 178L102 172Z" fill="url(#applicantShirtGrad)" />
          <rect x="88" y="220" width="22" height="18" rx="3" fill="#E51937" />
          <path d="M95 220V215H103V220" stroke="#E51937" strokeWidth="2" fill="none" />
        </g>

        {/* ── OFFICE PLANT (Right side) ── */}
        <g id="plant">
          {/* Pot */}
          <path d="M400 270H430L426 292H404L400 270Z" fill="#D98A2B" />
          {/* Foliage in PrimePower Blue gradient */}
          <path
            d="M415 270C415 270 388 240 392 205C396 170 422 150 422 150C422 150 448 170 452 205C456 240 429 270 429 270H415Z"
            fill="url(#plantGrad)"
          />
          {/* Leaf Ribs */}
          <path d="M422 154V265" stroke="#FFFFFF" strokeOpacity="0.35" strokeWidth="2" strokeLinecap="round" />
          <path d="M408 215C414 220 420 228 422 234" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
          <path d="M436 215C430 220 424 228 422 234" stroke="#FFFFFF" strokeOpacity="0.25" strokeWidth="1.5" strokeLinecap="round" />
        </g>
      </svg>
    </div>
  );
}
