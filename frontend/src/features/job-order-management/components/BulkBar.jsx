export default function BulkBar({ show, count, onApprove, onClose, onDelete, onClear }) {
  return (
    <div className={`bulk-bar${show ? ' show' : ''}`}>
      <span className="count">{count} selected</span>
      <div className="spacer" />
      <button onClick={onApprove}>Approve → Activated</button>
      <button onClick={onClose}>Close as Filled</button>
      <button className="danger" onClick={onDelete}>Delete</button>
      <button onClick={onClear}>Clear</button>
    </div>
  );
}