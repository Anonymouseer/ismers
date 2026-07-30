import Ticket from './Ticket';
import { STATUS_META, STATUS_ORDER, stageToStatus } from '../services/DeploymentAssignmentService';

export default function Board({ deployments, activeStatus, onOpen }) {
  return (
    <div className="board">
      {STATUS_ORDER.map((status) => {
        const meta = STATUS_META[status];
        const hidden = activeStatus !== 'all' && activeStatus !== status;
        const items = deployments.filter((d) => stageToStatus(d.stage) === status);
        return (
          <div
            key={status}
            className={`board-col${hidden ? ' col-hidden' : ''}`}
            style={{ '--col-color': meta.color }}
          >
            <div className="board-col-head">
              <div className="board-col-title"><span className="dot"></span>{meta.label}</div>
              <div className="board-col-count">{items.length}</div>
            </div>
            <div className="board-col-list">
              {items.length ? (
                items.map((d) => <Ticket key={d.id} deployment={d} onOpen={onOpen} />)
              ) : (
                <div className="board-empty">No {meta.label.toLowerCase()} deployments match your filters.</div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
