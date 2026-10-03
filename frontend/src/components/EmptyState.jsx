import { Link } from 'react-router-dom';
import Icon from './Icon';

// Shown when a request worked but there is nothing to display ("Your cart is empty.")
export default function EmptyState({ icon = 'package', title, message, action }) {
  return (
    <div className="state-box">
      <div className="state-icon"><Icon name={icon} size={28} /></div>
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action && <Link to={action.to} className="btn btn-nova-dark">{action.label}</Link>}
    </div>
  );
}
