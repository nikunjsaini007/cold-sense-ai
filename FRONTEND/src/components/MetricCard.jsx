export default function MetricCard({ icon, label, value, unit, tone = '' }) {
  return <div className="metric-card"><div className={`metric-icon ${tone}`}>{icon}</div><div className="metric-copy"><span>{label}</span><strong>{value}<small>{unit}</small></strong></div></div>;
}
