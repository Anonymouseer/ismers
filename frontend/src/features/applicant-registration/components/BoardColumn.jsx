import CandidateCard from './CandidateCard';

export default function BoardColumn({ meta, candidates, onOpen }) {
  return (
    <div className="board-col" style={{ '--col-color': meta.color }}>
      <div className="board-col-head">
        <div className="board-col-title">
          <span className="dot" />
          {meta.label}
        </div>
        <div className="board-col-count">{candidates.length}</div>
      </div>
      <div className="board-col-list">
        {candidates.length === 0 ? (
          <div className="board-empty">No applicants here.</div>
        ) : (
          candidates.map((c) => <CandidateCard key={c.regId} candidate={c} onOpen={onOpen} />)
        )}
      </div>
    </div>
  );
}
