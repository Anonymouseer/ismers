import { STATUS_META, STATUS_ORDER, stageToStatus, attendanceRate, countdownLabel } from '../services/DeploymentAssignmentService';
import PersonAvatar from '../../../components/common/PersonAvatar';

export default function Board({ deployments, activeStatus, onOpen }) {
  const visibleStatuses = activeStatus === 'all'
    ? STATUS_ORDER
    : STATUS_ORDER.filter((s) => s === activeStatus);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 14 }}>
      {visibleStatuses.map((status) => {
        const meta = STATUS_META[status];
        const items = deployments.filter((d) => stageToStatus(d.stage) === status);

        return (
          <div key={status} style={{ background: 'var(--panel)', border: '1px solid var(--border)', borderRadius: 14, overflow: 'hidden', boxShadow: 'var(--shadow-xs)' }}>
            {/* STAGE GROUP HEADER */}
            <div style={{ padding: '12px 18px', background: 'var(--bg)', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ width: 10, height: 10, borderRadius: '50%', background: meta.color }}></span>
                <span style={{ fontWeight: 800, fontSize: 13, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {meta.label} Stage
                </span>
              </div>
              <span style={{ fontSize: 11, fontWeight: 800, background: meta.soft, color: meta.color, padding: '3px 10px', borderRadius: 20 }}>
                {items.length} Deployed Staff
              </span>
            </div>

            {/* STAGE STAFF LIST WITH FIXED UNIFORM COLUMNS */}
            {items.length ? (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', fontSize: '12px', textAlign: 'left' }}>
                  <colgroup>
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '24%' }} />
                    <col style={{ width: '22%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '12%' }} />
                    <col style={{ width: '8%' }} />
                  </colgroup>
                  <tbody>
                    {items.map((d) => {
                      const rate = attendanceRate(d);
                      const cd = countdownLabel(d.end);

                      return (
                        <tr
                          key={d.id}
                          style={{ borderBottom: '1px solid var(--border-soft)', cursor: 'pointer', transition: 'background 0.14s ease' }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--secondary)')}
                          onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                          onClick={() => onOpen(d.id)}
                        >
                          {/* EMPLOYEE */}
                          <td style={{ padding: '12px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <PersonAvatar
                              name={d.employee}
                              size="sm"
                              variant="blue"
                            />
                              <div style={{ minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                <div style={{ fontWeight: 800, color: 'var(--text)' }}>{d.employee}</div>
                                <div style={{ fontSize: 10.5, color: 'var(--muted-fg)', fontFamily: 'monospace' }}>{d.id}</div>
                              </div>
                            </div>
                          </td>

                          {/* POSITION & CLIENT */}
                          <td style={{ padding: '12px 18px' }}>
                            <div style={{ fontWeight: 700, color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.position}</div>
                            <div style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 800, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.client}</div>
                          </td>

                          {/* SITE */}
                          <td style={{ padding: '12px 18px', color: 'var(--muted-fg)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {d.site}
                          </td>

                          {/* RENEWAL BADGE */}
                          <td style={{ padding: '12px 18px' }}>
                            <span style={{ fontSize: 10.5, fontWeight: 800, background: cd.soft, color: cd.color, padding: '3px 10px', borderRadius: 20, display: 'inline-block' }}>
                              {cd.text}
                            </span>
                          </td>

                          {/* ATTENDANCE */}
                          <td style={{ padding: '12px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 90 }}>
                              <div style={{ flex: 1, height: 5, borderRadius: 3, background: 'var(--bg)', overflow: 'hidden' }}>
                                <div style={{ width: `${rate}%`, height: '100%', background: meta.color, borderRadius: 3 }}></div>
                              </div>
                              <span style={{ fontWeight: 800, fontSize: 11 }}>{rate}%</span>
                            </div>
                          </td>

                          {/* ACTION BUTTON */}
                          <td style={{ padding: '12px 18px', textAlign: 'right' }}>
                            <button
                              className="btn"
                              style={{ padding: '5px 12px', fontSize: 11, fontWeight: 700 }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onOpen(d.id);
                              }}
                            >
                              Manage Record
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={{ padding: '20px 18px', textAlign: 'center', color: 'var(--muted-fg)', fontSize: 11.5 }}>
                No staff currently in {meta.label.toLowerCase()} stage matching your filters.
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
