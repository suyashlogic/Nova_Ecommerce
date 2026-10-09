import Icon from './Icon';

export default function StatCard({ icon, label, value, hint, tone = '' }) {
  return (
    <div className="stat-card">
      <div className={`stat-icon ${tone}`}><Icon name={icon} size={22} /></div>
      <div>
        <div className="stat-label">{label}</div>
        <div className="stat-value">{value}</div>
        {hint && <div className="stat-hint">{hint}</div>}
      </div>
    </div>
  );
}
