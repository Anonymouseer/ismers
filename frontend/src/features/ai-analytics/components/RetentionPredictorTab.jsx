import React, { useState, useEffect, useMemo } from 'react';
import { RETENTION_RISK_STAFF } from '../data/mockAiAnalyticsData';
import Pagination from '../../../components/common/Pagination';

// Extract unique list of clients and positions for filtering
const UNIQUE_CLIENTS = [...new Set(RETENTION_RISK_STAFF.map((s) => s.client))];
const UNIQUE_POSITIONS = [...new Set(RETENTION_RISK_STAFF.map((s) => s.position))];

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
      `"${item.keyFactors.join('; ').replace(/"/g, '""')}"`,
      `"${item.recommendedAction.replace(/"/g, '""')}"`,
      `"${item.actionStatus}"`,
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
  // 1. Persistence & Layout View Mode (Card vs Table)
  const [viewMode, setViewMode] = useState(() => {
    return localStorage.getItem('primepower_retention_view') || 'card';
  });

  const [groupByClient, setGroupByClient] = useState(() => {
    return localStorage.getItem('primepower_retention_group_client') === 'true';
  });

  // 2. Filter States
  const [search, setSearch] = useState('');
  const [riskFilter, setRiskFilter] = useState('all');
  const [clientFilter, setClientFilter] = useState('all');
  const [positionFilter, setPositionFilter] = useState('all');
  const [contractRange, setContractRange] = useState('all');
  const [sortBy, setSortBy] = useState('risk-desc');

  // 3. Pagination & Selection States
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [expandedRowIds, setExpandedRowIds] = useState(new Set());
  const [collapsedGroups, setCollapsedGroups] = useState(new Set());
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  // Persist View Mode
  useEffect(() => {
    localStorage.setItem('primepower_retention_view', viewMode);
  }, [viewMode]);

  useEffect(() => {
    localStorage.setItem('primepower_retention_group_client', groupByClient);
  }, [groupByClient]);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(''), 3500);
  };

  // Filter & Sort Logic (AND condition across search, risk, client, position, contractRange)
  const filtered = useMemo(() => {
    let list = [...RETENTION_RISK_STAFF];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.employeeName.toLowerCase().includes(q) ||
          s.client.toLowerCase().includes(q) ||
          s.position.toLowerCase().includes(q) ||
          s.id.toLowerCase().includes(q)
      );
    }

    if (riskFilter !== 'all') {
      list = list.filter((s) => s.riskLevel === riskFilter);
    }

    if (clientFilter !== 'all') {
      list = list.filter((s) => s.client === clientFilter);
    }

    if (positionFilter !== 'all') {
      list = list.filter((s) => s.position === positionFilter);
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
  }, [search, riskFilter, clientFilter, positionFilter, contractRange, sortBy]);

  // Reset page to 1 when filters change
  useEffect(() => {
    setPage(1);
    setSelectedIds(new Set());
  }, [search, riskFilter, clientFilter, positionFilter, contractRange, sortBy, pageSize]);

  // Pagination Math
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedStaff = useMemo(() => {
    return filtered.slice((page - 1) * pageSize, page * pageSize);
  }, [filtered, page, pageSize]);

  // Summary Card Counts (Total dataset)
  const highCount = RETENTION_RISK_STAFF.filter((r) => r.riskLevel === 'High Risk').length;
  const medCount = RETENTION_RISK_STAFF.filter((r) => r.riskLevel === 'Medium Risk').length;
  const lowCount = RETENTION_RISK_STAFF.filter((r) => r.riskLevel === 'Low Risk').length;

  // Toggle Risk Filter via Summary Badges
  const handleBadgeClick = (level) => {
    if (riskFilter === level) {
      setRiskFilter('all');
    } else {
      setRiskFilter(level);
    }
  };

  // Checkbox Selection
  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((item) => item.id)));
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

  // Row Expansion for Table View
  const toggleRowExpand = (id) => {
    setExpandedRowIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Group Collapse
  const toggleGroupCollapse = (clientName) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(clientName)) next.delete(clientName);
      else next.add(clientName);
      return next;
    });
  };

  // Grouped Staff Data (when Group By Client is enabled)
  const groupedStaff = useMemo(() => {
    const groups = {};
    paginatedStaff.forEach((item) => {
      if (!groups[item.client]) groups[item.client] = [];
      groups[item.client].push(item);
    });
    return groups;
  }, [paginatedStaff]);

  // Active Filters list for Removable Chips
  const activeFilterChips = useMemo(() => {
    const chips = [];
    if (search.trim()) chips.push({ type: 'search', label: `Search: "${search}"`, clear: () => setSearch('') });
    if (riskFilter !== 'all') chips.push({ type: 'risk', label: `Risk: ${riskFilter}`, clear: () => setRiskFilter('all') });
    if (clientFilter !== 'all') chips.push({ type: 'client', label: `Client: ${clientFilter}`, clear: () => setClientFilter('all') });
    if (positionFilter !== 'all') chips.push({ type: 'position', label: `Role: ${positionFilter}`, clear: () => setPositionFilter('all') });
    if (contractRange !== 'all') {
      const rangeLabels = {
        expired: 'Expired Contracts',
        '30days': 'Ending ≤ 30 Days',
        '60days': 'Ending ≤ 60 Days',
        '90days': 'Ending ≤ 90 Days',
      };
      chips.push({ type: 'contract', label: `Expiry: ${rangeLabels[contractRange]}`, clear: () => setContractRange('all') });
    }
    return chips;
  }, [search, riskFilter, clientFilter, positionFilter, contractRange]);

  const clearAllFilters = () => {
    setSearch('');
    setRiskFilter('all');
    setClientFilter('all');
    setPositionFilter('all');
    setContractRange('all');
  };

  // Selected Employee Array for Batch Action
  const selectedEmployeesList = useMemo(() => {
    return RETENTION_RISK_STAFF.filter((s) => selectedIds.has(s.id));
  }, [selectedIds]);

  const handleBatchConfirmAction = () => {
    showToast(`Batch retention action executed for ${selectedIds.size} employees!`);
    setShowBatchModal(false);
    setSelectedIds(new Set());
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minHeight: 'calc(100vh - 200px)' }}>
      {/* TOAST BANNER NOTIFICATION */}
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

      {/* 1. INTERACTIVE SUMMARY RISK BADGES & STAT COUNTS */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
          <div
            className={`risk-summary-badge high ${riskFilter === 'High Risk' ? 'active' : ''}`}
            onClick={() => handleBadgeClick('High Risk')}
            title="Click to filter High Risk employees"
          >
            <span>● {highCount} High Risk</span>
          </div>

          <div
            className={`risk-summary-badge med ${riskFilter === 'Medium Risk' ? 'active' : ''}`}
            onClick={() => handleBadgeClick('Medium Risk')}
            title="Click to filter Medium Risk employees"
          >
            <span>● {medCount} Medium Risk</span>
          </div>

          <div
            className={`risk-summary-badge low ${riskFilter === 'Low Risk' ? 'active' : ''}`}
            onClick={() => handleBadgeClick('Low Risk')}
            title="Click to filter Low Risk employees"
          >
            <span>● {lowCount} On Track</span>
          </div>

          {riskFilter !== 'all' && (
            <button
              onClick={() => setRiskFilter('all')}
              style={{ background: 'none', border: 'none', color: 'var(--primary)', fontSize: 11, fontWeight: 700, cursor: 'pointer' }}
            >
              Reset Badge Filter
            </button>
          )}
        </div>

        {/* EXPORT CSV & VIEW TOGGLE */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            onClick={() => exportToCSV(filtered)}
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
            title="Export filtered workforce risk data to CSV file"
          >
            <svg viewBox="0 0 24 24" style={{ width: 14, height: 14, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export CSV
          </button>

          {/* VIEW MODE TOGGLE (CARD VS TABLE) */}
          <div style={{ display: 'flex', background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 8, padding: 3 }}>
            <button
              onClick={() => setViewMode('card')}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: 'none',
                background: viewMode === 'card' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'card' ? '#fff' : 'var(--muted-fg)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Switch to Card List View"
            >
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
              </svg>
              Card View
            </button>
            <button
              onClick={() => setViewMode('table')}
              style={{
                padding: '5px 10px',
                borderRadius: 6,
                border: 'none',
                background: viewMode === 'table' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'table' ? '#fff' : 'var(--muted-fg)',
                cursor: 'pointer',
                fontWeight: 700,
                fontSize: 11,
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
              title="Switch to Compact Table View"
            >
              <svg viewBox="0 0 24 24" style={{ width: 13, height: 13, stroke: 'currentColor', fill: 'none', strokeWidth: 2 }}>
                <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
                <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
              </svg>
              Table View
            </button>
          </div>
        </div>
      </div>

      {/* 2. ADVANCED FILTERS & SEARCH CONTROL TOOLBAR (UNIFIED REFERENCE STYLE) */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', background: 'var(--secondary)', border: '1px solid var(--border)', padding: '8px 12px', borderRadius: 12 }}>
        {/* SEARCH INPUT */}
        <div style={{ flex: '1 1 220px', minWidth: 200, position: 'relative' }}>
          <svg viewBox="0 0 24 24" style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', width: 14, height: 14, stroke: 'var(--muted-fg)', fill: 'none', strokeWidth: 2 }}>
            <circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" />
          </svg>
          <input
            type="text"
            placeholder="Search employee, ID, client, or position..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%', padding: '6px 12px 6px 30px', borderRadius: 8, border: '1px solid var(--border)',
              background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, outline: 'none',
            }}
          />
        </div>

        {/* RISK FILTER */}
        <select
          value={riskFilter}
          onChange={(e) => setRiskFilter(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all">All Risk Levels</option>
          <option value="High Risk">High Risk</option>
          <option value="Medium Risk">Medium Risk</option>
          <option value="Low Risk">Low Risk</option>
        </select>

        {/* CLIENT FILTER */}
        <select
          value={clientFilter}
          onChange={(e) => setClientFilter(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all">All Clients / Sites</option>
          {UNIQUE_CLIENTS.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

        {/* POSITION FILTER */}
        <select
          value={positionFilter}
          onChange={(e) => setPositionFilter(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all">All Roles / Positions</option>
          {UNIQUE_POSITIONS.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>

        {/* CONTRACT END DATE RANGE FILTER */}
        <select
          value={contractRange}
          onChange={(e) => setContractRange(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="all">All Expiry Dates</option>
          <option value="expired">Expired Contracts</option>
          <option value="30days">Ending in ≤ 30 Days</option>
          <option value="60days">Ending in ≤ 60 Days</option>
          <option value="90days">Ending in ≤ 90 Days</option>
        </select>

        {/* SORT BY */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)',
            background: 'var(--panel)', color: 'var(--text)', fontSize: 11.5, fontWeight: 600, cursor: 'pointer', outline: 'none',
          }}
        >
          <option value="risk-desc">Highest Risk First</option>
          <option value="urgency-asc">Most Urgent Expiry First</option>
          <option value="risk-asc">Lowest Risk First</option>
          <option value="name-asc">Name A-Z</option>
        </select>

        {/* GROUP BY CLIENT TOGGLE */}
        <button
          onClick={() => setGroupByClient((prev) => !prev)}
          style={{
            padding: '6px 12px',
            borderRadius: 8,
            border: '1px solid var(--border)',
            background: groupByClient ? 'var(--primary)' : 'var(--panel)',
            color: groupByClient ? '#fff' : 'var(--text)',
            fontSize: 11.5,
            fontWeight: 700,
            cursor: 'pointer',
            transition: 'all 0.15s ease',
          }}
        >
          {groupByClient ? 'Ungroup View' : 'Group by Client'}
        </button>
      </div>

      {/* 3. ACTIVE REMOVABLE FILTER CHIPS */}
      {activeFilterChips.length > 0 && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 11, fontWeight: 800, color: 'var(--muted-fg)' }}>Active Filters:</span>
          {activeFilterChips.map((chip) => (
            <div key={chip.type} className="filter-chip">
              <span>{chip.label}</span>
              <span className="filter-chip-remove" onClick={chip.clear}>✕</span>
            </div>
          ))}
          <button
            onClick={clearAllFilters}
            style={{ background: 'none', border: 'none', color: 'var(--red)', fontSize: 11, fontWeight: 700, cursor: 'pointer', marginLeft: 4 }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* 4. RESULTS COUNT & PAGE SIZE SELECTOR TOOLBAR */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--muted-fg)' }}>
          Showing <b style={{ color: 'var(--text)' }}>{filtered.length}</b> employee risk profile{filtered.length === 1 ? '' : 's'}
          {selectedIds.size > 0 && <span style={{ marginLeft: 8, color: 'var(--primary)' }}>({selectedIds.size} selected)</span>}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* ROWS PER PAGE SELECTOR */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--muted-fg)', fontWeight: 600 }}>
            <span>Rows per page:</span>
            <select
              value={pageSize}
              onChange={(e) => setPageSize(Number(e.target.value))}
              style={{
                padding: '4px 8px', borderRadius: 6, border: '1px solid var(--border)',
                background: 'var(--panel)', color: 'var(--text)', fontSize: 12, fontWeight: 700, cursor: 'pointer',
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
          </div>

          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            totalItems={filtered.length}
            pageSize={pageSize}
          />
        </div>
      </div>

      {/* ZERO RESULTS EMPTY STATE */}
      {filtered.length === 0 && (
        <div style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, padding: 40, textAlign: 'center' }}>
          <svg viewBox="0 0 24 24" style={{ width: 36, height: 36, stroke: 'var(--muted-fg)', fill: 'none', strokeWidth: 1.5, marginBottom: 10 }}>
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>No Employee Records Match Your Filters</div>
          <div style={{ fontSize: 12, color: 'var(--muted-fg)', marginTop: 4 }}>Try clearing active search or adjusting risk level and contract expiry filters.</div>
          <button className="btn primary" onClick={clearAllFilters} style={{ marginTop: 14, padding: '7px 16px', fontSize: 12 }}>
            Reset All Filters
          </button>
        </div>
      )}

      {/* 5. MAIN CONTENT DISPLAY (COMPACT TABLE VIEW VS CARD VIEW) */}
      {filtered.length > 0 && (
        <>
          {viewMode === 'table' ? (
            /* COMPACT TABLE VIEW */
            <div className="retention-table-wrap">
              <table className="retention-table">
                <thead>
                  <tr>
                    <th style={{ width: 36, textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.size === filtered.length && filtered.length > 0}
                        onChange={toggleSelectAll}
                        title="Select All Employees"
                      />
                    </th>
                    <th style={{ width: 32 }}></th>
                    <th>Employee Name</th>
                    <th>Position / Role</th>
                    <th>Client / Deployment Site</th>
                    <th>Attendance</th>
                    <th>Contract End</th>
                    <th>Risk Score</th>
                    <th style={{ textAlign: 'right' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {(groupByClient ? Object.entries(groupedStaff) : [['All', paginatedStaff]]).map(([clientName, items]) => {
                    const isGroupCollapsed = collapsedGroups.has(clientName);
                    const groupHigh = items.filter((i) => i.riskLevel === 'High Risk').length;
                    const groupMed = items.filter((i) => i.riskLevel === 'Medium Risk').length;

                    return (
                      <React.Fragment key={clientName}>
                        {groupByClient && (
                          <tr key={`group-${clientName}`}>
                            <td colSpan={9} style={{ padding: '6px 12px', background: 'var(--bg)' }}>
                              <div className="retention-group-header" onClick={() => toggleGroupCollapse(clientName)}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 12.5, color: 'var(--text)' }}>
                                  <span>{isGroupCollapsed ? '►' : '▼'}</span>
                                  <span>{clientName}</span>
                                  <span style={{ fontSize: 11, color: 'var(--muted-fg)', fontWeight: 600 }}>({items.length} staff)</span>
                                </div>
                                <div style={{ display: 'flex', gap: 8, fontSize: 10.5, fontWeight: 800 }}>
                                  {groupHigh > 0 && <span style={{ color: 'var(--red)' }}>● {groupHigh} High</span>}
                                  {groupMed > 0 && <span style={{ color: 'var(--amber)' }}>● {groupMed} Medium</span>}
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}

                        {!isGroupCollapsed &&
                          items.map((staff) => {
                            const isSelected = selectedIds.has(staff.id);
                            const isExpanded = expandedRowIds.has(staff.id);
                            const urgency = getUrgencyInfo(staff.contractEnd);

                            const riskColor = staff.riskScore >= 75 ? 'var(--red)' : staff.riskScore >= 40 ? 'var(--amber)' : 'var(--green)';
                            const riskBg = staff.riskScore >= 75 ? 'var(--red-soft)' : staff.riskScore >= 40 ? 'var(--amber-soft)' : 'var(--green-soft)';

                            return (
                              <React.Fragment key={staff.id}>
                                <tr className={`table-row-main ${isSelected ? 'is-selected' : ''}`}>
                                  <td style={{ textAlign: 'center' }}>
                                    <input
                                      type="checkbox"
                                      checked={isSelected}
                                      onChange={() => toggleSelectOne(staff.id)}
                                    />
                                  </td>
                                  <td style={{ textAlign: 'center', cursor: 'pointer' }} onClick={() => toggleRowExpand(staff.id)}>
                                    <span style={{ color: 'var(--muted-fg)', fontSize: 10 }}>{isExpanded ? '▲' : '▼'}</span>
                                  </td>
                                  <td>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => toggleRowExpand(staff.id)}>
                                      <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 11, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                        {staff.employeeName.charAt(0)}
                                      </div>
                                      <div>
                                        <div style={{ fontWeight: 800, fontSize: 12.5, color: 'var(--text)' }}>{staff.employeeName}</div>
                                        <div style={{ fontSize: 10, color: 'var(--muted-fg)' }}>{staff.id}</div>
                                      </div>
                                    </div>
                                  </td>
                                  <td style={{ fontWeight: 600 }}>{staff.position}</td>
                                  <td><b style={{ color: 'var(--primary)' }}>{staff.client}</b></td>
                                  <td><b style={{ fontWeight: 800 }}>{staff.attendance}</b></td>
                                  <td>
                                    <div>
                                      <div style={{ fontWeight: 700 }}>{staff.contractEnd}</div>
                                      <span className="urgency-badge" style={{ background: urgency.color === 'var(--red)' ? 'var(--red-soft)' : urgency.color === 'var(--amber)' ? 'var(--amber-soft)' : 'var(--bg)', color: urgency.color }}>
                                        {urgency.text}
                                      </span>
                                    </div>
                                  </td>
                                  <td>
                                    <span style={{ fontSize: 11, fontWeight: 800, color: riskColor, background: riskBg, padding: '3px 10px', borderRadius: 12, border: `1px solid ${riskColor}` }}>
                                      {staff.riskLevel} ({staff.riskScore})
                                    </span>
                                  </td>
                                  <td style={{ textAlign: 'right' }}>
                                    <button
                                      className="btn primary"
                                      onClick={() => showToast(`Initiated retention action for ${staff.employeeName}`)}
                                      style={{ padding: '4px 10px', fontSize: 10.5, fontWeight: 700 }}
                                    >
                                      Take Action
                                    </button>
                                  </td>
                                </tr>

                                {/* INLINE EXPANDED ROW DETAILS */}
                                {isExpanded && (
                                  <tr className="table-row-expanded-content">
                                    <td colSpan={9}>
                                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                                        <div>
                                          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 6 }}>
                                            Identified Risk Factors
                                          </div>
                                          {staff.keyFactors.map((f, idx) => (
                                            <div key={idx} style={{ fontSize: 11.5, color: 'var(--text)', display: 'flex', gap: 6, marginTop: 3 }}>
                                              <span style={{ color: riskColor }}>●</span> {f}
                                            </div>
                                          ))}
                                        </div>
                                        <div>
                                          <div style={{ fontSize: 10.5, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 6 }}>
                                            AI Recommended Retention Action
                                          </div>
                                          <div style={{ fontSize: 12, color: 'var(--text)', background: 'var(--panel)', padding: 10, borderRadius: 8, border: '1px solid var(--border)' }}>
                                            <b>Suggested Protocol:</b> {staff.recommendedAction}
                                          </div>
                                        </div>
                                      </div>
                                    </td>
                                  </tr>
                                )}
                              </React.Fragment>
                            );
                          })}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            /* CARD VIEW LAYOUT WITH BATCH SELECTION & GROUPING */
            <div className="retention-card-grid">
              {(groupByClient ? Object.entries(groupedStaff) : [['All', paginatedStaff]]).map(([clientName, items]) => {
                const isGroupCollapsed = collapsedGroups.has(clientName);
                const groupHigh = items.filter((i) => i.riskLevel === 'High Risk').length;
                const groupMed = items.filter((i) => i.riskLevel === 'Medium Risk').length;

                return (
                  <div key={clientName} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {groupByClient && (
                      <div className="retention-group-header" onClick={() => toggleGroupCollapse(clientName)}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>
                          <span>{isGroupCollapsed ? '►' : '▼'}</span>
                          <span>{clientName}</span>
                          <span style={{ fontSize: 11, color: 'var(--muted-fg)', fontWeight: 600 }}>({items.length} staff)</span>
                        </div>
                        <div style={{ display: 'flex', gap: 8, fontSize: 11, fontWeight: 800 }}>
                          {groupHigh > 0 && <span style={{ color: 'var(--red)' }}>● {groupHigh} High Risk</span>}
                          {groupMed > 0 && <span style={{ color: 'var(--amber)' }}>● {groupMed} Medium Risk</span>}
                        </div>
                      </div>
                    )}

                    {!isGroupCollapsed &&
                      items.map((staff) => {
                        const isSelected = selectedIds.has(staff.id);
                        const urgency = getUrgencyInfo(staff.contractEnd);

                        const riskColor = staff.riskScore >= 75 ? 'var(--red)' : staff.riskScore >= 40 ? 'var(--amber)' : 'var(--green)';
                        const riskBg = staff.riskScore >= 75 ? 'var(--red-soft)' : staff.riskScore >= 40 ? 'var(--amber-soft)' : 'var(--green-soft)';

                        return (
                          <div
                            key={staff.id}
                            style={{
                              background: isSelected ? 'rgba(0, 125, 204, 0.05)' : 'var(--panel)',
                              border: isSelected ? '1.5px solid var(--primary)' : '1px solid var(--border)',
                              borderRadius: 14,
                              padding: 18,
                              boxShadow: 'var(--shadow-xs)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 12,
                              transition: 'all 0.14s ease',
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelectOne(staff.id)}
                                  style={{ width: 16, height: 16, cursor: 'pointer' }}
                                />
                                <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'var(--primary)', color: '#fff', fontWeight: 800, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                  {staff.employeeName.charAt(0)}
                                </div>
                                <div>
                                  <div style={{ fontWeight: 800, fontSize: 13.5, color: 'var(--text)' }}>{staff.employeeName}</div>
                                  <div style={{ fontSize: 11, color: 'var(--muted-fg)' }}>
                                    {staff.position} · <b style={{ color: 'var(--primary)' }}>{staff.client}</b>
                                  </div>
                                </div>
                              </div>
                              <span style={{ fontSize: 11, fontWeight: 800, color: riskColor, background: riskBg, padding: '4px 11px', borderRadius: 12, border: `1px solid ${riskColor}` }}>
                                {staff.riskLevel} ({staff.riskScore})
                              </span>
                            </div>

                            <div style={{ display: 'flex', gap: 12 }}>
                              <div style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '7px 12px', textAlign: 'center' }}>
                                <div style={{ fontSize: 10, color: 'var(--muted-fg)', fontWeight: 700 }}>Attendance Rate</div>
                                <div style={{ fontSize: 14, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>{staff.attendance}</div>
                              </div>
                              <div style={{ flex: 1, background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: '7px 12px', textAlign: 'center' }}>
                                <div style={{ fontSize: 10, color: 'var(--muted-fg)', fontWeight: 700 }}>Contract End</div>
                                <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--text)', marginTop: 2 }}>{staff.contractEnd}</div>
                                <span className="urgency-badge" style={{ marginTop: 2, background: urgency.color === 'var(--red)' ? 'var(--red-soft)' : urgency.color === 'var(--amber)' ? 'var(--amber-soft)' : 'var(--panel)', color: urgency.color }}>
                                  {urgency.text}
                                </span>
                              </div>
                            </div>

                            <div style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', borderRadius: 8, padding: 12 }}>
                              <div style={{ fontSize: 10, fontWeight: 800, color: 'var(--muted-fg)', textTransform: 'uppercase', marginBottom: 6 }}>Risk Factors</div>
                              {staff.keyFactors.map((f, i) => (
                                <div key={i} style={{ fontSize: 11.5, color: 'var(--text)', display: 'flex', gap: 6, marginTop: 3 }}>
                                  <span style={{ color: riskColor }}>●</span> {f}
                                </div>
                              ))}
                            </div>

                            <div style={{ marginTop: 4, paddingTop: 10, borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10 }}>
                              <div style={{ fontSize: 11, color: 'var(--muted-fg)', flex: 1 }}>
                                <b style={{ color: 'var(--text)' }}>AI Action:</b> {staff.recommendedAction}
                              </div>
                              <button
                                className="btn primary"
                                onClick={() => showToast(`Retention action initiated for ${staff.employeeName}`)}
                                style={{ padding: '6px 12px', fontSize: 11, fontWeight: 700, flexShrink: 0 }}
                              >
                                Take Action
                              </button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* 6. FLOATING BULK ACTION BAR */}
      {selectedIds.size >= 2 && (
        <div className="retention-bulk-bar">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontWeight: 800, fontSize: 13, color: 'var(--text)' }}>
            <span style={{ background: 'var(--primary)', color: '#fff', borderRadius: 10, padding: '2px 8px', fontSize: 11 }}>
              {selectedIds.size}
            </span>
            <span>Employees Selected</span>
          </div>

          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <button
              className="btn primary"
              onClick={() => setShowBatchModal(true)}
              style={{ padding: '7px 14px', fontSize: 11.5, fontWeight: 700 }}
            >
              Batch Take Action ({selectedIds.size})
            </button>
            <button
              className="btn"
              onClick={() => exportToCSV(selectedEmployeesList, 'Batch_Retention_Selected_Employees.csv')}
              style={{ padding: '7px 14px', fontSize: 11.5, fontWeight: 700, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
            >
              Export Selected
            </button>
            <button
              onClick={() => setSelectedIds(new Set())}
              style={{ background: 'none', border: 'none', color: 'var(--muted-fg)', cursor: 'pointer', fontSize: 11.5, fontWeight: 700 }}
            >
              Clear Selection
            </button>
          </div>
        </div>
      )}

      {/* 7. BATCH ACTION CONFIRMATION MODAL */}
      {showBatchModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10, 27, 46, 0.55)',
            backdropFilter: 'blur(3px)',
            zIndex: 150,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
          }}
        >
          <div
            style={{
              background: 'var(--panel)',
              border: '1px solid var(--border)',
              borderRadius: 16,
              width: '100%',
              maxWidth: 580,
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: 'var(--shadow-lg)',
              padding: 24,
              display: 'flex',
              flexDirection: 'column',
              gap: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border)', paddingBottom: 12 }}>
              <div style={{ fontSize: 16, fontWeight: 800, color: 'var(--text)' }}>
                Batch Retention Action Protocol ({selectedIds.size} Selected)
              </div>
              <button onClick={() => setShowBatchModal(false)} style={{ background: 'none', border: 'none', color: 'var(--muted-fg)', fontSize: 16, cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ fontSize: 12, color: 'var(--muted-fg)' }}>
              Executing retention protocols for the following selected employees across deployment sites:
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 260, overflowY: 'auto', paddingRight: 4 }}>
              {selectedEmployeesList.map((emp) => (
                <div key={emp.id} style={{ background: 'var(--bg)', border: '1px solid var(--border-soft)', padding: '10px 12px', borderRadius: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: 12, color: 'var(--text)' }}>{emp.employeeName}</div>
                    <div style={{ fontSize: 10.5, color: 'var(--muted-fg)' }}>{emp.position} · {emp.client}</div>
                  </div>
                  <span style={{ fontSize: 10, fontWeight: 800, color: emp.riskScore >= 75 ? 'var(--red)' : 'var(--amber)', background: emp.riskScore >= 75 ? 'var(--red-soft)' : 'var(--amber-soft)', padding: '2px 8px', borderRadius: 8 }}>
                    {emp.riskLevel} ({emp.riskScore})
                  </span>
                </div>
              ))}
            </div>

            <div style={{ background: 'rgba(0, 125, 204, 0.08)', border: '1px solid var(--border)', borderRadius: 10, padding: 12, fontSize: 11.5, color: 'var(--text)' }}>
              <b>Batch System Protocol:</b> System will generate automated retention counseling tickets and send contract extension drafts to the respective HR Area Managers for execution.
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
              <button className="btn" onClick={() => setShowBatchModal(false)} style={{ padding: '8px 16px', fontSize: 12, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}>
                Cancel
              </button>
              <button className="btn primary" onClick={handleBatchConfirmAction} style={{ padding: '8px 18px', fontSize: 12, fontWeight: 700 }}>
                Confirm Batch Action ({selectedIds.size})
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
