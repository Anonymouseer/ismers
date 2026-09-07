import React from 'react';

/**
 * Modern vector illustration of Corporate Client Collaboration & Manpower Deployment.
 * Styled in PRIMEPOWER corporate system colors (#007DCC, #E4F0F8, #0A1B2E, #10B981, #D98A2B).
 * Enhanced with grounding shadow base and floating enterprise metric indicators.
 */
export default function ClientAuthIllustration() {
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
          <radialGradient id="clientSystemGlow" cx="50%" cy="45%" r="55%">
            <stop offset="0%" stopColor="#007DCC" stopOpacity="0.16" />
            <stop offset="70%" stopColor="#007DCC" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#007DCC" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="clientDeskGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#007DCC" />
            <stop offset="100%" stopColor="#00528A" />
          </linearGradient>
          <linearGradient id="clientSuitGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0A1B2E" />
            <stop offset="100%" stopColor="#1B324D" />
          </linearGradient>
          <linearGradient id="consultantShirtGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#D98A2B" />
            <stop offset="100%" stopColor="#B46E1B" />
          </linearGradient>
          <linearGradient id="screenGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F0F7FD" />
            <stop offset="100%" stopColor="#D9ECFA" />
          </linearGradient>
        </defs>

        {/* Ambient Halo */}
        <circle cx="260" cy="180" r="155" fill="url(#clientSystemGlow)" />

        {/* Grounding Platform Shadow */}
        <ellipse cx="260" cy="316" rx="215" ry="14" fill="#007DCC" fillOpacity="0.08" />
        <ellipse cx="260" cy="316" rx="165" ry="8" fill="#0A1B2E" fillOpacity="0.06" />

        {/* Floor Horizon Lines */}
        <path d="M40 310H480" stroke="#007DCC" strokeOpacity="0.22" strokeWidth="2" strokeLinecap="round" />
        <path d="M80 322H400" stroke="#007DCC" strokeOpacity="0.12" strokeWidth="2" strokeLinecap="round" />
        <path d="M140 332H280" stroke="#007DCC" strokeOpacity="0.06" strokeWidth="2" strokeLinecap="round" />

        {/* Background Geometric Accents */}
        <circle cx="95" cy="85" r="18" stroke="#007DCC" strokeOpacity="0.20" strokeWidth="2" strokeDasharray="3 3" />
        <circle cx="420" cy="75" r="15" stroke="#007DCC" strokeOpacity="0.22" strokeWidth="2" strokeDasharray="3 3" />

        {/* ── FLOATING METRICS CARD (Top Right) ── */}
        <g id="floating-card-right">
          <rect x="340" y="55" width="135" height="52" rx="10" fill="#FFFFFF" stroke="rgba(0, 125, 204, 0.20)" strokeWidth="1.5" />
          <circle cx="360" cy="74" r="10" fill="#10B981" fillOpacity="0.15" />
          <path d="M356 74L359 77L365 71" stroke="#10B981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          <text x="376" y="73" fill="#0A1B2E" fontSize="11" fontWeight="800" fontFamily="sans-serif">98.5% Fill Rate</text>
          <text x="376" y="85" fill="#486F91" fontSize="9" fontWeight="600" fontFamily="sans-serif">Active PRF Orders</text>
        </g>

        {/* ── FLOATING METRICS CARD (Top Left) ── */}
        <g id="floating-card-left">
          <rect x="45" y="65" width="130" height="50" rx="10" fill="#FFFFFF" stroke="rgba(0, 125, 204, 0.20)" strokeWidth="1.5" />
          <circle cx="65" cy="83" r="10" fill="#007DCC" fillOpacity="0.15" />
          <path d="M61 83H69M65 79V87" stroke="#007DCC" strokeWidth="2" strokeLinecap="round" />
          <text x="81" y="81" fill="#0A1B2E" fontSize="11" fontWeight="800" fontFamily="sans-serif">Verified Talent</text>
          <text x="81" y="93" fill="#486F91" fontSize="9" fontWeight="600" fontFamily="sans-serif">Ready Deployment</text>
        </g>

        {/* ── CLIENT ACCOUNT MANAGER (Right Seated) ── */}
        <g id="account-manager">
          <ellipse cx="370" cy="142" rx="18" ry="21" fill="#0A1B2E" />
          <circle cx="370" cy="146" r="14" fill="#FED7AA" />
          <rect x="366" y="156" width="8" height="10" fill="#FED7AA" />
          <path d="M356 138C356 126 384 126 384 138C384 143 380 147 376 149C372 147 368 147 364 149C360 147 356 143 356 138Z" fill="#0A1B2E" />
          {/* Cardigan / Outfit in Cerulean Blue */}
          <path d="M352 166C352 158 388 158 388 166L392 215H348L352 166Z" fill="#007DCC" />
          <path d="M362 166L370 178L378 166" stroke="#FFFFFF" strokeWidth="1.5" fill="none" />
        </g>

        {/* ── CENTRAL EXECUTIVE CONFERENCE DESK & DISPLAY ── */}
        <g id="central-desk">
          {/* Desk Base */}
          <rect x="140" y="195" width="240" height="105" rx="8" fill="url(#clientDeskGrad)" />
          {/* Desk Top Bevel */}
          <rect x="135" y="187" width="250" height="12" rx="4" fill="#007DCC" />
          {/* Subtle Reflection */}
          <path d="M140 225L380 203V211L140 233V225Z" fill="#FFFFFF" fillOpacity="0.18" />

          {/* Large Center Client Dashboard Tablet / Screen */}
          <rect x="200" y="148" width="120" height="42" rx="4" fill="#0A1B2E" />
          <rect x="204" y="152" width="112" height="34" rx="2" fill="url(#screenGrad)" />
          {/* Chart on Screen */}
          <path d="M214 176L228 168L242 172L258 162L274 165L290 157" stroke="#007DCC" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
          <circle cx="290" cy="157" r="3" fill="#10B981" />
          <path d="M250 190H270L266 193H254L250 190Z" fill="#94A3B8" />

          {/* Documents / PRF Folder on Desk */}
          <rect x="156" y="180" width="30" height="10" rx="1.5" fill="#FFFFFF" />
          <rect x="158" y="183" width="20" height="2" fill="#007DCC" />
          <rect x="158" y="186" width="14" height="2" fill="#94A3B8" />
        </g>

        {/* ── CORPORATE CLIENT REPRESENTATIVE (Left) ── */}
        <g id="client-rep">
          {/* Legs & Formal Trousers */}
          <rect x="106" y="240" width="13" height="70" rx="3" fill="#0A1B2E" />
          <rect x="123" y="240" width="13" height="70" rx="3" fill="#0A1B2E" />
          {/* Oxford Shoes */}
          <rect x="102" y="304" width="20" height="8" rx="3" fill="#007DCC" />
          <rect x="123" y="304" width="20" height="8" rx="3" fill="#007DCC" />

          {/* Suit Jacket */}
          <path d="M100 166C100 158 142 158 142 166L144 244H98L100 166Z" fill="url(#clientSuitGrad)" />
          {/* Tie & Inner Shirt */}
          <path d="M117 166L121 174L125 166" stroke="#FFFFFF" strokeWidth="2" fill="none" />
          <path d="M121 174L119 200L121 204L123 200L121 174Z" fill="#E51937" />

          {/* Neck & Face */}
          <rect x="117" y="152" width="8" height="18" fill="#FED7AA" rx="2" />
          <circle cx="121" cy="142" r="14" fill="#FED7AA" />

          {/* Corporate Haircut */}
          <path
            d="M107 140C107 125 135 123 136 136C136 142 133 144 129 139C124 133 115 134 111 138C108 141 107 140 107 140Z"
            fill="#0A1B2E"
          />

          {/* Arm resting on desk */}
          <path d="M136 172L168 189H184V195H166L134 180L136 172Z" fill="url(#clientSuitGrad)" />

          {/* Left Arm holding leather portfolio */}
          <path d="M100 172L92 220L100 222L106 178L100 172Z" fill="url(#clientSuitGrad)" />
          <rect x="86" y="220" width="22" height="18" rx="3" fill="#D98A2B" />
          <path d="M93 220V215H101V220" stroke="#D98A2B" strokeWidth="2" fill="none" />
        </g>
      </svg>
    </div>
  );
}
