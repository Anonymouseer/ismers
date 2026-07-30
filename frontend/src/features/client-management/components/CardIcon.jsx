import { iconFor } from '../utils/clientDisplay';

export default function CardIcon({ name, className = 'icon' }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      dangerouslySetInnerHTML={{ __html: iconFor(name) }}
    />
  );
}