// Read-only display of the extended personal/family/emergency fields from
// the paper application form. Editing these isn't wired up yet (they're
// set once at intake via the registration form) — add an edit toggle here
// later if staff need to correct them after the fact, same pattern as
// BasicInfoSection.
export default function PersonalDetailsSection({ candidate }) {
  const hasFamilyInfo =
    candidate.spouseName || candidate.fatherName || candidate.motherName;
  const hasPersonalExtras =
    candidate.placeOfBirth || candidate.height || candidate.weight || candidate.religion;
  const hasEmergency = candidate.emergencyContactName || candidate.emergencyContactAddress;

  if (!hasFamilyInfo && !hasPersonalExtras && !hasEmergency) return null;

  return (
    <div className="sheet-section">
      <div className="sheet-label">
        <span className="sheet-label-text">
          <span className="sheet-label-icon" style={{ background: 'var(--amber-soft)', color: 'var(--amber)' }}>
            <svg className="icon" viewBox="0 0 24 24"><circle cx="9" cy="8" r="3" /><path d="M2.5 19.5c0-3.6 2.9-6 6.5-6s6.5 2.4 6.5 6" /><circle cx="17" cy="7" r="2.2" /><path d="M20.5 15.5c0-2.5-1.8-4.2-4-4.6" /></svg>
          </span>
          Personal & Family Details
        </span>
      </div>
      <div className="meta-grid">
        {hasPersonalExtras && (
          <div className="meta-row">
            <div className="k">Personal</div>
            <div className="v">
              {[
                candidate.placeOfBirth && `Born in ${candidate.placeOfBirth}`,
                candidate.height && `${candidate.height} tall`,
                candidate.weight && `${candidate.weight}`,
                candidate.religion,
              ].filter(Boolean).join(' · ')}
            </div>
          </div>
        )}
        {candidate.spouseName && (
          <div className="meta-row"><div className="k">Spouse</div><div className="v">{candidate.spouseName}{candidate.spouseOccupation ? ` — ${candidate.spouseOccupation}` : ''}</div></div>
        )}
        {candidate.fatherName && (
          <div className="meta-row"><div className="k">Father</div><div className="v">{candidate.fatherName}{candidate.fatherOccupation ? ` — ${candidate.fatherOccupation}` : ''}</div></div>
        )}
        {candidate.motherName && (
          <div className="meta-row"><div className="k">Mother</div><div className="v">{candidate.motherName}{candidate.motherOccupation ? ` — ${candidate.motherOccupation}` : ''}</div></div>
        )}
        {candidate.familyAddress && (
          <div className="meta-row"><div className="k">Family Address</div><div className="v">{candidate.familyAddress}</div></div>
        )}
        {hasEmergency && (
          <div className="meta-row">
            <div className="k">Emergency Contact</div>
            <div className="v">{[candidate.emergencyContactName, candidate.emergencyContactAddress].filter(Boolean).join(' · ')}</div>
          </div>
        )}
      </div>
    </div>
  );
}