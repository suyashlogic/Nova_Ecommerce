import Icon from './Icon';

const FLOW = [
  ['pending', 'Pending'],
  ['confirmed', 'Confirmed'],
  ['processing', 'Processing'],
  ['shipped', 'Shipped'],
  ['delivered', 'Delivered'],
];

// Shows how far an order has progressed. A cancelled order gets a notice instead.
export default function OrderTimeline({ status }) {
  if (status === 'cancelled') {
    return <div className="alert alert-danger mb-0" role="status">This order was cancelled. Any items were returned to stock.</div>;
  }
  const current = FLOW.findIndex(([key]) => key === status);
  return (
    <ol className="timeline" aria-label="Order progress">
      {FLOW.map(([key, label], index) => {
        const done = index < current || status === 'delivered';
        const active = index === current && status !== 'delivered';
        return (
          <li key={key} className={done ? 'done' : active ? 'current' : ''} aria-current={active ? 'step' : undefined}>
            <span className="timeline-dot">{done && <Icon name="check" size={14} />}</span>
            <span className="timeline-label">{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
