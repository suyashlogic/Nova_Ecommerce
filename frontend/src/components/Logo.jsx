import { Link } from 'react-router-dom';

export default function Logo({ onClick }) {
  return (
    <Link to="/" className="nova-logo" onClick={onClick} aria-label="NOVA home">
      NOVA<span className="nova-logo-dot" />
    </Link>
  );
}
