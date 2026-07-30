import { useState } from 'react';
import JobOrderTicket from './JobOrderTicket';

export default function JobOrderBoard({ columns, selectMode, selectedRefs, onOpen, onToggleSelect, onMoveToStatus }) {
  const [draggingRef, setDraggingRef] = useState(null);
  const [dragOverStatus, setDragOverStatus] = useState(null);

  const handleDragStart = (e, ref) => { setDraggingRef(ref); e.dataTransfer.effectAllowed = 'move'; };
  const handleDragEnd = () => setDraggingRef(null);
  const handleDragOver = (e, status) => { e.preventDefault(); setDragOverStatus(status); };
  const handleDragLeave = () => setDragOverStatus(null);
  const handleDrop = (e, status) => {
    e.preventDefault();
    setDragOverStatus(null);
    if (draggingRef) onMoveToStatus(draggingRef, status);
    setDraggingRef(null);
  };

  return (
    <div className="board">
      {columns.map(({ status, meta, items, hidden }) => (
        <div key={status} className={`board-col${hidden ? ' col-hidden' : ''}`} style={{ '--col-color': meta.color }}>
          <div className="board-col-head">
            <div className="board-col-title"><span className="dot" />{meta.label}</div>
            <div className="board-col-count">{items.length}</div>
          </div>
          <div
            className={`board-col-list${dragOverStatus === status ? ' drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, status)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, status)}
          >
            {items.length ? (
              items.map((job) => (
                <JobOrderTicket
                  key={job.ref}
                  job={job}
                  selectMode={selectMode}
                  isSelected={selectedRefs.has(job.ref)}
                  onOpen={onOpen}
                  onToggleSelect={onToggleSelect}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              ))
            ) : (
              <div className="board-empty">No {meta.label.toLowerCase()} job orders match your filters.</div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}