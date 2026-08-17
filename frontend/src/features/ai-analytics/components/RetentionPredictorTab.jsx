import React, { useState, useEffect, useMemo } from 'react';
import { RETENTION_RISK_STAFF } from '../data/mockAiAnalyticsData';
import { CLIENTS } from '../../client-management/data/mockClients';
import { logoUrl } from '../../client-management/utils/clientDisplay';
import ClientsRetentionTable from './ClientsRetentionTable';
import RetentionActionModal from './RetentionActionModal';
import Pagination from '../../../components/common/Pagination';

/**
 * Calculate contract urgency countdown relative to reference date (2026-08-06)
 */
function getUrgencyInfo(dateStr) {
  if (!dateStr) return { text: 'N/A', days: 999, color: 'var(--muted-fg)' };

  const today = new Date('2026-08-06');
  const end = new Date(dateStr);
  const diffTime = end.getTime() - today.getTime();
  const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (days < 0) {
    return {
      text: `Expired ${Math.abs(days)}d ago`,
      days,
      color: 'var(--red)',
      isExpired: true,
    };
  }
  if (days === 0) {
    return {
      text: 'Expires Today',
      days: 0,
      color: 'var(--red)',
      isUrgent: true,
    };
  }
  if (days <= 30) {
    return {
      text: `${days}d left`,
      days,
      color: 'var(--red)',
      isUrgent: true,
    };
  }
  if (days <= 90) {
    return {
      text: `${days}d left`,
      days,
      color: 'var(--amber)',
      isUpcoming: true,
    };
  }
  return {
    text: `${days}d left`,
    days,
    color: 'var(--muted-fg)',
  };
}

/**
 * Download currently filtered items as CSV file
 */
function exportToCSV(items, filename = 'Workforce_Retention_Risk_Report.csv') {
  if (!items || !items.length) return;

  const headers = [
    'Employee ID',
    'Employee Name',
    'Position',
    'Client Site',
    'Risk Level',
    'Risk Score',
    'Attendance Rate',
    'Contract End Date',
    'Urgency / Days Left',
    'Key Risk Factors',
    'AI Recommended Action',
    'Action Status',
  ];

  const rows = items.map((item) => {
    const urgency = getUrgencyInfo(item.contractEnd);
    return [
      `"${item.id}"`,
      `"${item.employeeName.replace(/"/g, '""')}"`,
      `"${item.position.replace(/"/g, '""')}"`,
      `"${item.client.replace(/"/g, '""')}"`,
      `"${item.riskLevel}"`,
      item.riskScore,
      `"${item.attendance}"`,
      `"${item.contractEnd}"`,
      `"${urgency.text}"`,
      `"${(item.keyFactors || []).join('; ').replace(/"/g, '""')}"`,
      `"${(item.recommendedAction || '').replace(/"/g, '""')}"`,
      `"${item.actionStatus || 'Pending Action'}"`,
    ];
  });

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export default function RetentionPredictorTab() {
  // ── NAVIGATION DRILL-DOWN STATE ──
  // Level 1: selectedClientName === null
  // Level 2: selectedClientName !== null && activePosition === null
  // Level 3: selectedClientName !== null && activePosition !== null
  const [selectedClientName, setSelectedClientName] = useState(null);
  const [activePosition, setActivePosition] = useState(null);

  // ── MODAL & PERSISTENT STAFF STATE ──
  const [staffData, setStaffData] = useState(() => {
    return [...RETENTION_RISK_STAFF];
  });
  const [actionModalStaff, setActionModalStaff] = useState(null);
  const [toastMessage, setToastMessage] = useState('');

  // ── LEVEL 1 FILTER STATE ──
  const [clientSearch, setClientSearch] = useState('');
  const [clientFilter, setClientFilter] = useState('all');

  // ── LEVEL 3 FILTER & VIEW STATES ──
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('primepower_retention_view') || 'card';
  });
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [contractRange, setContractRange] = useState('all');
  const [sortBy, setSortBy] = useState('risk-desc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());

  // Persist View Mode
  useEffect(() => {
    localStorage.setItem('primepower_retention_view', viewMode);
  }, [viewMode]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 4000);
  };

  // ── BUILD UNIFIED CLIENT DIRECTORY (LEVEL 1) ──
  const clientDirectory = useMemo(() => {
    return CLIENTS.map((c) => {
      const assignedStaff = staffData.filter((s) => s.client === c.name);
      const highCount = assignedStaff.filter((s) => s.riskLevel === 'High Risk').length;
      const medCount = assignedStaff.filter((s) => s.riskLevel === 'Medium Risk').length;
      const lowCount = assignedStaff.filter((s) => s.riskLevel === 'Low Risk').length;
      const totalStaff = assignedStaff.length || (c.name === 'Sunrise Hospitality Group' ? 5 : c.name === 'Northline BPO' ? 3 : c.name === 'ABC Logistics' ? 4 : c.name === 'Delta Manufacturing' ? 3 : 2);

      // Compute average attendance
      let avgAttendanceNum = 92;
      if (assignedStaff.length > 0) {
        const sum = assignedStaff.reduce((acc, s) => {
          const num = parseInt(s.attendance, 10) || 85;
          return acc + num;
        }, 0);
        avgAttendanceNum = Math.round(sum / assignedStaff.length);
      } else {
        avgAttendanceNum = c.name === 'Sunrise Hospitality Group' ? 94 : c.name === 'ABC Logistics' ? 88 : 91;
      }

      return {
        name: c.name,
        industry: c.industry || 'Manpower & Staffing',
        status: c.status || 'active',
        totalStaff: totalStaff,
        highRiskCount: highCount,
        medRiskCount: medCount,
        lowRiskCount: lowCount,
        avgAttendance: `${avgAttendanceNum}%`,
        avgAttendanceNum: avgAttendanceNum,
        site: c.site || (c.jobs?.[0]?.location) || 'Metro Manila, NCR',
        supervisor: c.am || 'Karla Reyes',
        supervisorContact: '+63 917 555 0184',
      };
    });
  }, [staffData]);

  // Filtered Client List for Level 1
  const filteredClientList = useMemo(() => {
    const q = clientSearch.trim().toLowerCase();
    return clientDirectory.filter((c) => {
      const matchesQ =
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.industry.toLowerCase().includes(q) ||
        c.site.toLowerCase().includes(q);

      let matchesFilter = true;
      if (clientFilter === 'high_risk') matchesFilter = c.highRiskCount > 0;
      else if (clientFilter === 'medium_risk') matchesFilter = c.medRiskCount > 0;
      else if (clientFilter === 'active') matchesFilter = c.status === 'active';

      return matchesQ && matchesFilter;
    });
  }, [clientDirectory, clientSearch, clientFilter]);

  // Selected Client Object
  const selectedClientData = useMemo(() => {
    if (!selectedClientName) return null;
    return clientDirectory.find((c) => c.name === selectedClientName) || null;
  }, [selectedClientName, clientDirectory]);

  // ── BUILD JOBS / POSITIONS LIST UNDER SELECTED CLIENT (LEVEL 2) ──
  const clientPositions = useMemo(() => {
    if (!selectedClientName) return [];

    const clientStaff = staffData.filter((s) => s.client === selectedClientName);
    const positionMap = new Map();

    // Group actual staff by position
    clientStaff.forEach((staff) => {
      const pos = staff.position || 'General Operations';
      if (!positionMap.has(pos)) {
        positionMap.set(pos, {
          title: pos,
          client: selectedClientName,
          site: selectedClientData?.site || 'Client Operations Facility',
          staffList: [],
        });
      }
      positionMap.get(pos).staffList.push(staff);
    });

    // Also populate fallback positions from mockClients if needed
    const baseClient = CLIENTS.find((c) => c.name === selectedClientName);
    if (baseClient && baseClient.jobs) {
      baseClient.jobs.forEach((j) => {
        if (!positionMap.has(j.title)) {
          positionMap.set(j.title, {
            title: j.title,
            client: selectedClientName,
            site: j.location || selectedClientData?.site || 'Client Operations Facility',
            staffList: [
              {
                id: `RISK-${selectedClientName.substring(0, 3).toUpperCase()}-01`,
                employeeName: j.applicants?.[0]?.name || 'Michael Tan',
                client: selectedClientName,
                position: j.title,
                contractEnd: '2026-11-15',
                riskLevel: 'Low Risk',
                riskScore: 18,
                attendance: '95%',
                keyFactors: ['Consistent Attendance Record', 'Positive Client Feedback'],
                recommendedAction: 'Standard 3-Month Renewal Notice',
                actionStatus: 'On Track',
              },
            ],
          });
        }
      });
    }

    return Array.from(positionMap.values()).map((p) => {
      const highCount = p.staffList.filter((s) => s.riskLevel === 'High Risk').length;
      const medCount = p.staffList.filter((s) => s.riskLevel === 'Medium Risk').length;
      const lowCount = p.staffList.filter((s) => s.riskLevel === 'Low Risk').length;

      const sumAtt = p.staffList.reduce((acc, s) => acc + (parseInt(s.attendance, 10) || 85), 0);
      const avgAtt = p.staffList.length ? Math.round(sumAtt / p.staffList.length) : 90;

      return {
        ...p,
        totalStaff: p.staffList.length,
        highRiskCount: highCount,
        medRiskCount: medCount,
        lowRiskCount: lowCount,
        avgAttendance: `${avgAtt}%`,
        avgAttendanceNum: avgAtt,
      };
    });
  }, [selectedClientName, staffData, selectedClientData]);

  // Selected Position Object
  const selectedPositionData = useMemo(() => {
    if (!activePosition || !clientPositions.length) return null;
    return clientPositions.find((p) => p.title === activePosition) || null;
  }, [activePosition, clientPositions]);

  // ── FILTERED DEPLOYED STAFF (LEVEL 3) ──
  const filteredStaff = useMemo(() => {
    if (!selectedPositionData) return [];
    let list = [...selectedPositionData.staffList];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.employeeName.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q) ||
          (s.keyFactors || []).some((f) => f.toLowerCase().includes(q))
      );
    }

    if (riskFilter !== 'all') {
      list = list.filter((s) => s.riskLevel === riskFilter);
    }

    if (contractRange !== 'all') {
      list = list.filter((s) => {
        const urgency = getUrgencyInfo(s.contractEnd);
        if (contractRange === 'expired') return urgency.days < 0;
        if (contractRange === '30days') return urgency.days >= 0 && urgency.days <= 30;
        if (contractRange === '60days') return urgency.days >= 0 && urgency.days <= 60;
        if (contractRange === '90days') return urgency.days >= 0 && urgency.days <= 90;
        return true;
      });
    }

    // Sort Logic
    if (sortBy === 'risk-desc') list.sort((a, b) => b.riskScore - a.riskScore);
    else if (sortBy === 'risk-asc') list.sort((a, b) => a.riskScore - b.riskScore);
    else if (sortBy === 'name-asc') list.sort((a, b) => a.employeeName.localeCompare(b.employeeName));
    else if (sortBy === 'urgency-asc') {
      list.sort((a, b) => getUrgencyInfo(a.contractEnd).days - getUrgencyInfo(b.contractEnd).days);
    }

    return list;
  }, [selectedPositionData, search, riskFilter, contractRange, sortBy]);

  // Pagination for Level 3
  const totalPages = Math.max(1, Math.ceil(filteredStaff.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginatedStaff = filteredStaff.slice((safePage - 1) * pageSize, safePage * pageSize);

  // Global Risk Counts
  const globalHigh = staffData.filter((r) => r.riskLevel === 'High Risk').length;
  const globalMed = staffData.filter((r) => r.riskLevel === 'Medium Risk').length;
  const globalLow = staffData.filter((r) => r.riskLevel === 'Low Risk').length;

  // Selection handlers
  const toggleSelectAll = () => {
    if (selectedIds.size === filteredStaff.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredStaff.map((item) => item.id)));
    }
  };

  const toggleSelectOne = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleRowExpand = (id) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Handle action complete from modal
  const handleActionComplete = (staffId, actionType, meta) => {
    setStaffData((prev) =>
      prev.map((item) => {
        if (item.id === staffId) {
          return {
            ...item,
            actionStatus: 'Notice Dispatched',
            lastAction: {
              type: actionType,
              ...meta,
            },
          };
        }
        return item;
      })
    );
    showToast(`Retention action successfully executed and dispatched to employee email! Control No: ${meta.memoControlNo}`);
    setActionModalStaff(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 'calc(100vh - 200px)' }}>
      {/* ── TOAST NOTIFICATION BANNER ── */}
      {toastMessage && (
        <div
          style={{
            background: 'var(--primary)',
            color: '#fff',
            padding: '10px 16px',
            borderRadius: 10,
            fontSize: 12,
            fontWeight: 700,
            boxShadow: 'var(--shadow-md)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            animation: 'fadeIn 0.2s ease',
          }}
        >
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage('')} style={{ background: 'none', border: 'none', color: '#fff', cursor: 'pointer', fontWeight: 800 }}>
            ✕
          </button>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LEVEL 1: CLIENTS DIRECTORY (When selectedClientName === null)
          ───────────────────────────────────────────────────────────── */}
      {selectedClientName === null && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* SUMMARY RISK COUNTERS & EXPORT */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
              <div
                className={`risk-summary-badge high ${clientFilter === 'high_risk' ? 'active' : ''}`}
                onClick={() => setClientFilter(clientFilter === 'high_risk' ? 'all' : 'high_risk')}
                title="Filter accounts with High Risk staff"
                style={{ cursor: 'pointer' }}
              >
                <span>● {globalHigh} High Risk Staff</span>
              </div>

              <div
                className={`risk-summary-badge med ${clientFilter === 'medium_risk' ? 'active' : ''}`}
                onClick={() => setClientFilter(clientFilter === 'medium_risk' ? 'all' : 'medium_risk')}
                title="Filter accounts with Medium Risk staff"
                style={{ cursor: 'pointer' }}
              >
                <span>● {globalMed} Medium Risk Staff</span>
              </div>

              <div
                className="risk-summary-badge low"
                title="Staff on track"
              >
                <span>● {globalLow} On Track</span>
              </div>

              {clientFilter !== 'all' && (
                <button
                  onClick={() => setClientFilter('all')}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
                >
                  Reset Filter
                </button>
              )}
            </div>

            <button
              onClick={() => exportToCSV(staffData, 'Workforce_Retention_All_Clients.csv')}
              style={{
                padding: '7px 14px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'var(--text)',
                fontSize: 12,
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
                boxShadow: 'var(--shadow-xs)',
              }}
            >
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Export Global Retention Report
            </button>
          </div>

          {/* SEARCH & FILTER BAR */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap', background: 'var(--secondary)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 12 }}>
            <div style={{ flex: '1 1 240px', position: 'relative' }}>
              <svg viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, stroke: 'var(--muted-fg)', fill: 'none', strokeWidth: 2 }}>
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search client account, industry, or deployment site..."
                value={clientSearch}
                onChange={(e) => setClientSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  fontSize: 12,
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
              style={{
                padding: '7px 12px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'var(--text)',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="all">All Corporate Accounts</option>
              <option value="high_risk">Accounts with High Risk Staff</option>
              <option value="medium_risk">Accounts with Medium Risk Staff</option>
              <option value="active">Active Accounts Only</option>
            </select>
          </div>

          {/* CLIENT DIRECTORY TABLE COMPONENT */}
          <ClientsRetentionTable
            clientList={filteredClientList}
            onSelectClient={(cName) => {
              setSelectedClientName(cName);
              setActivePosition(null);
              setPage(1);
            }}
          />
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LEVEL 2: JOB ROLES GRID (When selectedClientName !== null && activePosition === null)
          ───────────────────────────────────────────────────────────── */}
      {selectedClientName !== null && activePosition === null && selectedClientData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* BREADCRUMB HEADER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted-fg)' }}>
              <button
                type="button"
                onClick={() => setSelectedClientName(null)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', padding: 0 }}
              >
                ← Back to Client Accounts
              </button>
              <span>/</span>
              <b style={{ color: 'var(--text)' }}>{selectedClientName}</b>
            </div>

            <button
              onClick={() => setSelectedClientName(null)}
              className="btn"
              style={{ fontSize: 11.5, padding: '5px 12px' }}
            >
              Change Client Account
            </button>
          </div>

          {/* CLIENT SUMMARY BANNER */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <img
                src={logoUrl(selectedClientName)}
                alt=""
                width={46}
                height={46}
                style={{ borderRadius: 10, border: '1px solid var(--border-soft)' }}
              />
              <div>
                <h2 style={{ margin: 0, fontSize: 18, fontWeight: 900, color: 'var(--text)' }}>
                  {selectedClientName}
                </h2>
                <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 2 }}>
                  {selectedClientData.industry} &nbsp;·&nbsp; Facility: <b>{selectedClientData.site}</b>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 700 }}>Total Deployed:</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--text)' }}>{selectedClientData.totalStaff} Staff</div>
              </div>
              <div style={{ height: 30, width: 1, background: 'var(--border)' }} />
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--muted-fg)', textTransform: 'uppercase', fontWeight: 700 }}>Avg Attendance:</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--green)' }}>{selectedClientData.avgAttendance}</div>
              </div>
            </div>
          </div>

          {/* POSITION CARDS GRID HEADER */}
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--text)' }}>
            Active Job Roles &amp; Deployed Staff Retention Breakdown ({clientPositions.length} Positions)
          </div>

          {/* POSITION CARDS GRID */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
            {clientPositions.map((pos) => {
              return (
                <div
                  key={pos.title}
                  style={{
                    background: 'var(--panel)',
                    border: '1px solid var(--border)',
                    borderRadius: 14,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    gap: 14,
                    boxShadow: 'var(--shadow-xs)',
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    cursor: 'pointer',
                  }}
                  onClick={() => {
                    setActivePosition(pos.title);
                    setPage(1);
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-2px)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'var(--shadow-xs)';
                  }}
                >
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--text)' }}>{pos.title}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted-fg)', marginTop: 2 }}>{pos.site}</div>
                      </div>
                      <span style={{ padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 800, background: 'var(--secondary)', color: 'var(--primary)' }}>
                        {pos.totalStaff} Deployed
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: 6, marginTop: 12, flexWrap: 'wrap' }}>
                      {pos.highRiskCount > 0 && (
                        <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 8, background: 'var(--red-soft)', color: 'var(--red)', border: '1px solid var(--red)' }}>
                          ● {pos.highRiskCount} High Risk
                        </span>
                      )}
                      {pos.medRiskCount > 0 && (
                        <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 8, background: 'var(--amber-soft)', color: 'var(--amber)', border: '1px solid var(--amber)' }}>
                          ● {pos.medRiskCount} Med Risk
                        </span>
                      )}
                      {pos.lowRiskCount > 0 && (
                        <span style={{ fontSize: 10.5, fontWeight: 800, padding: '2px 8px', borderRadius: 8, background: 'var(--green-soft)', color: 'var(--green)', border: '1px solid var(--green)' }}>
                          ● {pos.lowRiskCount} On Track
                        </span>
                      )}
                    </div>
                  </div>

                  <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontSize: 11.5, color: 'var(--muted-fg)' }}>
                      Avg Attendance: <b style={{ color: 'var(--text)' }}>{pos.avgAttendance}</b>
                    </div>
                    <button
                      type="button"
                      className="btn primary"
                      style={{ padding: '5px 12px', fontSize: 11, fontWeight: 800 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        setActivePosition(pos.title);
                        setPage(1);
                      }}
                    >
                      View Staff Retention Records →
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          LEVEL 3: EMPLOYEE RETENTION PROFILES & TAKE ACTION
          (When selectedClientName !== null && activePosition !== null)
          ───────────────────────────────────────────────────────────── */}
      {selectedClientName !== null && activePosition !== null && selectedPositionData && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {/* BREADCRUMB HEADER */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--muted-fg)' }}>
              <button
                type="button"
                onClick={() => setSelectedClientName(null)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', padding: 0 }}
              >
                Client Accounts
              </button>
              <span>/</span>
              <button
                type="button"
                onClick={() => setActivePosition(null)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: 800, cursor: 'pointer', padding: 0 }}
              >
                {selectedClientName}
              </button>
              <span>/</span>
              <b style={{ color: 'var(--text)' }}>{activePosition}</b>
            </div>

            <button
              onClick={() => setActivePosition(null)}
              className="btn"
              style={{ fontSize: 11.5, padding: '5px 12px' }}
            >
              ← Back to Job Positions
            </button>
          </div>

          {/* POSITION BANNER */}
          <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 14 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: 'var(--primary)', textTransform: 'uppercase' }}>
                {selectedClientName} &nbsp;·&nbsp; {selectedPositionData.site}
              </div>
              <h2 style={{ margin: '2px 0 0', fontSize: 17, fontWeight: 900, color: 'var(--text)' }}>
                {activePosition}
              </h2>
            </div>

            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 8, background: 'var(--secondary)', color: 'var(--text)' }}>
                {selectedPositionData.totalStaff} Deployed Staff
              </span>
              {selectedPositionData.highRiskCount > 0 && (
                <span style={{ fontSize: 12, fontWeight: 800, padding: '4px 10px', borderRadius: 8, background: 'var(--red-soft)', color: 'var(--red)', border: '1px solid var(--red)' }}>
                  {selectedPositionData.highRiskCount} High Risk
                </span>
              )}
            </div>
          </div>

          {/* TOOLBAR CONTROLS (SEARCH, FILTERS, EXPORT & VIEW MODE) */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', background: 'var(--secondary)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 12 }}>
            <div style={{ flex: '1 1 200px', minWidth: 180, position: 'relative' }}>
              <svg viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, stroke: 'var(--muted-fg)', fill: 'none', strokeWidth: 2 }}>
                <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
              </svg>
              <input
                type="text"
                placeholder="Search staff name, ID, or risk factor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '6px 12px 6px 30px',
                  borderRadius: 8,
                  border: '1px solid var(--border)',
                  background: 'var(--panel)',
                  color: 'var(--text)',
                  fontSize: 11.5,
                  outline: 'none',
                }}
              />
            </div>

            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'var(--text)',
                fontSize: 11.5,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Risk Levels</option>
              <option value="High Risk">High Risk</option>
              <option value="Medium Risk">Medium Risk</option>
              <option value="Low Risk">Low Risk</option>
            </select>

            <select
              value={contractRange}
              onChange={(e) => setContractRange(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'var(--text)',
                fontSize: 11.5,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="all">All Expiry Dates</option>
              <option value="expired">Expired Contracts</option>
              <option value="30days">Ending ≤ 30 Days</option>
              <option value="60days">Ending ≤ 60 Days</option>
              <option value="90days">Ending ≤ 90 Days</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              style={{
                padding: '6px 10px',
                borderRadius: 8,
                border: '1px solid var(--border)',
                background: 'var(--panel)',
                color: 'var(--text)',
                fontSize: 11.5,
                fontWeight: 600,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="risk-desc">Highest Risk First</option>
              <option value="urgency-asc">Most Urgent Expiry</option>
              <option value="name-asc">Name A-Z</option>
            </select>

            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
              <button
                onClick={() => exportToCSV(filteredStaff, `${selectedClientName}_${activePosition}_Retention.csv`)}
                className="btn"
                style={{ padding: '5px 10px', fontSize: 11, fontWeight: 700 }}
              >
                Export CSV
              </button>

              <div style={{ display: 'flex', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 2 }}>
                <button
                  onClick={() => setViewMode('card')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: viewMode === 'card' ? 'var(--primary)' : 'transparent',
                    color: viewMode === 'card' ? '#fff' : 'var(--muted-fg)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Card
                </button>
                <button
                  onClick={() => setViewMode('table')}
                  style={{
                    padding: '4px 8px',
                    borderRadius: 6,
                    border: 'none',
                    background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                    color: viewMode === 'table' ? '#fff' : 'var(--muted-fg)',
                    fontSize: 11,
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                >
                  Table
                </button>
              </div>
            </div>
          </div>

          {/* MAIN DEPLOYED STAFF LIST (TABLE OR CARDS) */}
          {filteredStaff.length === 0 ? (
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 36, textAlign: 'center' }}>
              <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>No Staff Match Your Filters</div>
              <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>Try adjusting risk level or contract range filters.</div>
            </div>
          ) : viewMode === 'table' ? (
            /* COMPACT TABLE VIEW */
            <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
                <thead>
                  <tr style={{ background: 'var(--panel)', borderBottom: '1px solid var(--border)', color: 'var(--muted-fg)', fontWeight: 700, fontSize: 10.5, textTransform: 'uppercase' }}>
                    <th style={{ width: 36, padding: '12px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filteredStaff.length && filteredStaff.length > 0}
                        onChange={toggleSelectAll}
                      />
                    </th>
                    <th style={{ width: 30 }}></th>
                    <th style={{ padding: '12px' }}>Employee Name</th>
                    <th style={{ padding: '12px' }}>Attendance</th>
                    <th style={{ padding: '12px' }}>Contract Expiry</th>
                    <th style={{ padding: '12px' }}>Risk Score</th>
                    <th style={{ padding: '12px' }}>Status</th>
                    <th style={{ padding: '12px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {paginatedStaff.map((staff) => {
                    const isSelected = selectedIds.has(staff.id);
                    const isExpanded = expandedRowIds.has(staff.id);
                    const urgency = getUrgencyInfo(staff.contractEnd);
                    const riskColor = staff.riskScore >= 75 ? 'var(--red)' : staff.riskScore >= 40 ? 'var(--amber)' : 'var(--green)';
                    const riskBg = staff.riskScore >= 75 ? 'var(--red-soft)' : staff.riskScore >= 40 ? 'var(--amber-soft)' : 'var(--green-soft)';

                    return (
                      <React.Fragment key={staff.id}>
                        <tr style={{ borderBottom: '1px solid var(--border-soft)', background: isSelected ? 'var(--secondary)' : 'transparent' }}>
                          <td style={{ textAlign: 'center', padding: '12px' }}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectOne(staff.id)}
                            />
                          </td>
                          <td style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleRowExpand(staff.id)}>
                            <span style={{ color: 'var(--muted-fg)', fontSize: 10 }}>{isExpanded ? '▲' : '▼'}</span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                {staff.employeeName.charAt(0)}
                              </div>
                              <div>
                                <div style={{ fontWeight: 800, color: 'var(--text)' }}>{staff.employeeName}</div>
                                <div style={{ fontSize: 10.5, color: 'var(--muted-fg)' }}>{staff.id}</div>
                              </div>
                            </div>
                          </td>
                          <td style={{ padding: '12px', fontWeight: 800 }}>{staff.attendance}</td>
                          <td style={{ padding: '12px' }}>
                            <div style={{ fontWeight: 700 }}>{staff.contractEnd}</div>
                            <span style={{ fontSize: 10, fontWeight: 800, color: urgency.color }}>
                              {urgency.text}
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ fontSize: 11, fontWeight: 800, color: riskColor, background: riskBg, padding: '3px 8px', borderRadius: 10, border: `1px solid ${riskColor}` }}>
                              {staff.riskLevel} ({staff.riskScore})
                            </span>
                          </td>
                          <td style={{ padding: '12px' }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: staff.actionStatus === 'Notice Dispatched' ? 'var(--green)' : 'var(--muted-fg)' }}>
                              {staff.actionStatus || 'Pending Action'}
                            </span>
                          </td>
                          <td style={{ padding: '12px', textAlign: 'right' }}>
                            <button
                              type="button"
                              className="btn primary"
                              style={{ padding: '5px 12px', fontSize: 11, fontWeight: 800 }}
                              onClick={() => setActionModalStaff(staff)}
                            >
                              Take Action
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr style={{ background: 'var(--bg)' }}>
                            <td colSpan={8} style={{ padding: '12px 18px' }}>
                              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
                                <div>
                                  <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 4 }}>
                                    Identified Risk Factors
                                  </div>
                                  {(staff.keyFactors || []).map((f, idx) => (
                                    <div key={idx} style={{ fontSize: 11.5, color: 'var(--text)', display: 'flex', gap: 6, marginTop: 2 }}>
                                      <span style={{ color: riskColor }}>●</span> {f}
                                    </div>
                                  ))}
                                </div>
                                <div>
                                  <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 4 }}>
                                    AI Recommended Retention Action
                                  </div>
                                  <div style={{ fontSize: 11.5, color: 'var(--text)', background: 'var(--panel)', padding: 8, borderRadius: 8, border: '1px solid var(--border)' }}>
                                    {staff.recommendedAction}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARD VIEW LAYOUT */
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14 }}>
              {paginatedStaff.map((staff) => {
                const urgency = getUrgencyInfo(staff.contractEnd);
                const riskColor = staff.riskScore >= 75 ? 'var(--red)' : staff.riskScore >= 40 ? 'var(--amber)' : 'var(--green)';
                const riskBg = staff.riskScore >= 75 ? 'var(--red-soft)' : staff.riskScore >= 40 ? 'var(--amber-soft)' : 'var(--green-soft)';

                return (
                  <div
                    key={staff.id}
                    style={{
                      background: 'var(--panel)',
                      border: `1px solid ${staff.riskScore >= 75 ? 'var(--red)' : 'var(--border)'}`,
                      borderRadius: 14,
                      padding: 16,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      gap: 12,
                      boxShadow: 'var(--shadow-xs)',
                    }}
                  >
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            {staff.employeeName.charAt(0)}
                          </div>
                          <div>
                            <div style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>{staff.employeeName}</div>
                            <div style={{ fontSize: 10.5, color: 'var(--muted-fg)' }}>{staff.id}</div>
                          </div>
                        </div>

                        <span style={{ fontSize: 10.5, fontWeight: 800, color: riskColor, background: riskBg, padding: '3px 8px', borderRadius: 10, border: `1px solid ${riskColor}` }}>
                          {staff.riskLevel} ({staff.riskScore})
                        </span>
                      </div>

                      <div style={{ background: 'var(--bg)', borderRadius: 8, padding: '10px 12px', marginTop: 12, fontSize: 11.5, display: 'flex', flexDirection: 'column', gap: 4 }}>
                        <div><b style={{ color: 'var(--muted-fg)' }}>Attendance:</b> <span style={{ fontWeight: 800 }}>{staff.attendance}</span></div>
                        <div><b style={{ color: 'var(--muted-fg)' }}>Contract End:</b> <span style={{ fontWeight: 700 }}>{staff.contractEnd}</span> &nbsp;(<span style={{ color: urgency.color, fontWeight: 800 }}>{urgency.text}</span>)</div>
                        <div><b style={{ color: 'var(--muted-fg)' }}>Action Status:</b> <span style={{ color: staff.actionStatus === 'Notice Dispatched' ? 'var(--green)' : 'var(--muted-fg)', fontWeight: 700 }}>{staff.actionStatus || 'Pending Action'}</span></div>
                      </div>

                      <div style={{ marginTop: 10 }}>
                        <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 4 }}>
                          Detected Risk Factors:
                        </div>
                        {(staff.keyFactors || []).map((f, idx) => (
                          <div key={idx} style={{ fontSize: 11, color: 'var(--text)', display: 'flex', gap: 5, marginTop: 2 }}>
                            <span style={{ color: riskColor }}>●</span> {f}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div style={{ borderTop: '1px solid var(--border-soft)', paddingTop: 12, display: 'flex', gap: 8, marginTop: 'auto' }}>
                      <button
                        type="button"
                        className="btn primary"
                        style={{ flex: 1, padding: '6px 12px', fontSize: 11, fontWeight: 800 }}
                        onClick={() => setActionModalStaff(staff)}
                      >
                        Take Action
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* LEVEL 3 PAGINATION BAR */}
          {filteredStaff.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10, padding: '10px 0' }}>
              <div style={{ fontSize: 12, color: 'var(--muted-fg)', fontWeight: 600 }}>
                Showing <b>{(safePage - 1) * pageSize + 1}</b> – <b>{Math.min(safePage * pageSize, filteredStaff.length)}</b> of <b>{filteredStaff.length}</b> staff profiles
              </div>
              <Pagination
                currentPage={safePage}
                totalPages={totalPages}
                onPageChange={setPage}
                totalItems={filteredStaff.length}
                pageSize={pageSize}
              />
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          RETENTION INTERVENTION & EMAIL DISPATCH MODAL
          ───────────────────────────────────────────────────────────── */}
      {actionModalStaff && (
        <RetentionActionModal
          staff={actionModalStaff}
          open={Boolean(actionModalStaff)}
          onClose={() => setActionModalStaff(null)}
          onActionComplete={handleActionComplete}
        />
      )}
    </div>
  );
}
