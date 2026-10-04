import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';
import formatCurrency from '../utils/formatCurrency';
import formatDate from '../utils/formatDate';
import imageUrl from '../utils/imageUrl';

const PREVIEW_LINES = 3;

// One order in "My orders": reference, date, status, products with quantities, total.
export default function OrderCard({ order }) {
  const shown = order.items.slice(0, PREVIEW_LINES);
  const hidden = order.items.length - shown.length;
  return (
    <article className="order-card">
      <header className="order-card-head">
        <div>
          <div className="order-ref">{order.orderRef}</div>
          <div className="text-muted-nova small">Placed on {formatDate(order.createdAt)}</div>
        </div>
        <StatusBadge status={order.status} />
      </header>

      <ul className="order-card-items">
        {shown.map((item) => (
          <li key={item.id}>
            <img src={imageUrl(item.imageUrl)} alt="" loading="lazy" />
            <span className="order-card-name">{item.name}</span>
            <span className="text-muted-nova">&times; {item.quantity}</span>
          </li>
        ))}
        {hidden > 0 && <li className="text-muted-nova small">+ {hidden} more {hidden === 1 ? 'item' : 'items'}</li>}
      </ul>

      <footer className="order-card-foot">
        <div><span className="text-muted-nova small">Total</span><div className="fw-semibold">{formatCurrency(order.total)}</div></div>
        <Link to={`/orders/${order.id}`} className="btn btn-nova-outline btn-sm">View details</Link>
      </footer>
    </article>
  );
}
