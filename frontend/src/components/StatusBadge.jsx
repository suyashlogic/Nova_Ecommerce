const STATUS = {
  pending: { label: 'Pending', tone: 'warning' },
  confirmed: { label: 'Confirmed', tone: 'accent' },
  processing: { label: 'Processing', tone: 'accent' },
  shipped: { label: 'Shipped', tone: 'accent' },
  delivered: { label: 'Delivered', tone: 'success' },
  cancelled: { label: 'Cancelled', tone: 'danger' },
};

export default function StatusBadge({ status }) {
  const { label, tone } = STATUS[status] ?? { label: status, tone: '' };
  return <span className={`badge-nova ${tone}`}>{label}</span>;
}
