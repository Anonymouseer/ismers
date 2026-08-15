import { useState, useEffect } from 'react';

export default function PpeIssuanceModal({ candidate, job, onClose, onIssued, readOnly = false }) {
  const [items, setItems] = useState(
    candidate?.ppeIssuance || {
      uniformShirt: true,
      shirtSize: 'Large (L)',
      safetyShoes: true,
      shoeSize: 'Size 42 (US 9)',
      safetyVest: true,
      idBadge: true,
      whistleKit: true,
    }
  );

  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!candidate) return null;

  const toggleItem = (key) => {
    if (readOnly) return;
    // Checked items cannot be unchecked
    if (items[key]) return;
    setItems((prev) => ({
      ...prev,
      [key]: true,
    }));
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSave = () => {
    const ppeData = {
      ...items,
      issuedAt: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      issuedBy: 'HR Logistics & Equipment Officer / PRIMEPOWER',
      status: 'PPE Kit Issued',
    };

    if (onIssued) {
      onIssued(ppeData);
    }
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-overlay open" style={{ zIndex: 1200 }} onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box" style={{ maxWidth: '680px' }}>
        {/* HEADER */}
        <div className="modal-head" style={{ borderBottom: '1px solid var(--border)' }}>
          <div className="modal-avatar" style={{ background: 'var(--amber, #d97706)' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '18px', height: '18px' }}>
              <path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.47a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.47a2 2 0 0 0-1.34-2.23z" />
            </svg>
          </div>
          <div className="modal-title-wrap">
            <div className="modal-jo-title">Uniform &amp; PPE Kit Issuance Tracker</div>
            <div className="modal-jo-sub">DOLE OSHS Site Equipment &amp; Protective Gear Sign-Off &middot; {candidate.name}</div>
          </div>
          <button className="modal-close" onClick={onClose}>
            <svg className="icon" viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12" /></svg>
          </button>
        </div>

        {/* NOTIFICATION BANNER */}
        {savedSuccess && (
          <div style={{ background: 'var(--green-soft, #e8f5e9)', color: 'var(--green, #149e6e)', padding: '10px 18px', fontSize: '12px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '16px', height: '16px' }}>
              <polyline points="20 6 9 17 4 12" />
            </svg>
            Uniform &amp; PPE equipment issuance logged and signed off.
          </div>
        )}

        <div className="modal-scroll" style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {/* 1. UNIFORM POLO SHIRTS */}
            <div style={{ background: 'var(--panel)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: readOnly ? 'default' : 'pointer' }} onClick={() => toggleItem('uniformShirt')}>
                <input type="checkbox" checked={Boolean(items.uniformShirt)} disabled={Boolean(items.uniformShirt) || readOnly} onChange={() => {}} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)' }}>PRIMEPOWER Company Uniform Polo (2 Sets)</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--muted)' }}>Standard branded company polo shirts</div>
                </div>
              </div>
              {readOnly ? (
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', background: 'var(--bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  {items.shirtSize || 'Size: Large (L)'}
                </span>
              ) : (
                <select
                  value={items.shirtSize}
                  onChange={(e) => setItems((p) => ({ ...p, shirtSize: e.target.value }))}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '11px', outline: 'none' }}
                >
                  <option value="Small (S)">Size: Small (S)</option>
                  <option value="Medium (M)">Size: Medium (M)</option>
                  <option value="Large (L)">Size: Large (L)</option>
                  <option value="Extra Large (XL)">Size: Extra Large (XL)</option>
                  <option value="2X Large (2XL)">Size: 2X Large (2XL)</option>
                </select>
              )}
            </div>

            {/* 2. STEEL-TOE SAFETY SHOES */}
            <div style={{ background: 'var(--panel)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: readOnly ? 'default' : 'pointer' }} onClick={() => toggleItem('safetyShoes')}>
                <input type="checkbox" checked={Boolean(items.safetyShoes)} disabled={Boolean(items.safetyShoes) || readOnly} onChange={() => {}} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)' }}>Heavy-Duty Steel-Toe Safety Shoes</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--muted)' }}>OSHS-compliant impact &amp; puncture-resistant footwear</div>
                </div>
              </div>
              {readOnly ? (
                <span style={{ fontSize: '11px', fontWeight: 700, color: 'var(--primary)', background: 'var(--bg)', padding: '4px 10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                  {items.shoeSize || 'Size 42 (US 9)'}
                </span>
              ) : (
                <select
                  value={items.shoeSize}
                  onChange={(e) => setItems((p) => ({ ...p, shoeSize: e.target.value }))}
                  style={{ padding: '6px 10px', borderRadius: '6px', border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)', fontSize: '11px', outline: 'none' }}
                >
                  <option value="Size 39 (US 6.5)">Size 39 (US 6.5)</option>
                  <option value="Size 40 (US 7.5)">Size 40 (US 7.5)</option>
                  <option value="Size 41 (US 8)">Size 41 (US 8)</option>
                  <option value="Size 42 (US 9)">Size 42 (US 9)</option>
                  <option value="Size 43 (US 10)">Size 43 (US 10)</option>
                  <option value="Size 44 (US 11)">Size 44 (US 11)</option>
                </select>
              )}
            </div>

            {/* 3. HIGH-VIS SAFETY VEST */}
            <div style={{ background: 'var(--panel)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', cursor: readOnly ? 'default' : 'pointer' }} onClick={() => toggleItem('safetyVest')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={Boolean(items.safetyVest)} disabled={Boolean(items.safetyVest) || readOnly} onChange={() => {}} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)' }}>High-Visibility Reflectorized Safety Vest</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--muted)' }}>Fluorescent safety vest for warehouse &amp; site visibility</div>
                </div>
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--green, #149e6e)', fontWeight: 700 }}>Universal</span>
            </div>

            {/* 4. COMPANY ID BADGE & LANYARD */}
            <div style={{ background: 'var(--panel)', padding: '14px', borderRadius: '8px', border: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '14px', cursor: readOnly ? 'default' : 'pointer' }} onClick={() => toggleItem('idBadge')}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <input type="checkbox" checked={Boolean(items.idBadge)} disabled={Boolean(items.idBadge) || readOnly} onChange={() => {}} style={{ width: '18px', height: '18px', accentColor: 'var(--primary)' }} />
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--text)' }}>Company ID Security Badge &amp; Breakaway Lanyard</div>
                  <div style={{ fontSize: '10.5px', color: 'var(--muted)' }}>Official photo ID with barcode and emergency hotline</div>
                </div>
              </div>
              <span style={{ fontSize: '10.5px', color: 'var(--green, #149e6e)', fontWeight: 700 }}>Issued</span>
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <div style={{ padding: '14px 20px', background: 'var(--panel)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button type="button" className="rs-stage-btn" onClick={handlePrint}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', marginRight: '5px' }}>
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            Print PPE Sign-Off PDF
          </button>

          {!readOnly ? (
            <button
              type="button"
              className="rs-stage-btn primary"
              style={{ background: 'var(--green, #149e6e)', color: '#fff', borderColor: 'var(--green, #149e6e)' }}
              onClick={handleSave}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ width: '14px', height: '14px', marginRight: '5px' }}>
                <polyline points="20 6 9 17 4 12" />
              </svg>
              Sign Off PPE Issuance
            </button>
          ) : (
            <button
              type="button"
              className="rs-stage-btn primary"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

