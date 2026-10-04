export default function RiskRing({ score }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);
  return <div className="risk-ring"><svg viewBox="0 0 120 120"><circle className="ring-bg" cx="60" cy="60" r={radius} /><circle className="ring-value" cx="60" cy="60" r={radius} strokeDasharray={circumference} strokeDashoffset={offset} /></svg><div className="ring-center"><strong>{score}</strong><span>/100</span></div></div>;
}
