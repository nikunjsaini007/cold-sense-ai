export default function Header({ title, subtitle }) {
  return <header className="topbar"><div><h1>{title}</h1><p>{subtitle}</p></div><div className="top-actions"><span className="date-chip">● Simulation active</span><div className="avatar">H</div></div></header>;
}
