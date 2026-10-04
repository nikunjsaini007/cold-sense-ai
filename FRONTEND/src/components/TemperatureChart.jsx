function Sparkline({ values, warning = false }) {
  const min = Math.min(...values) - 0.2;
  const max = Math.max(...values) + 0.2;
  const points = values.map((value, index) => `${(index / (values.length - 1)) * 100},${100 - ((value - min) / (max - min)) * 78 - 10}`).join(' ');
  const color = warning ? '#f59e0b' : '#2f80ed';
  return <svg className="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none"><defs><linearGradient id="area-component" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={color} stopOpacity=".28" /><stop offset="100%" stopColor={color} stopOpacity="0" /></linearGradient></defs><polyline points={`0,100 ${points} 100,100`} fill="url(#area-component)" /><polyline points={points} fill="none" stroke={color} strokeWidth="2.5" vectorEffect="non-scaling-stroke" /></svg>;
}

export default function TemperatureChart({ history }) {
  return <div className="temperature-chart"><div className="chart-grid"><span>8°C</span><span>6°C</span><span>4°C</span><span>2°C</span></div><Sparkline values={history} /><div className="chart-axis"><span>60m ago</span><span>45m</span><span>30m</span><span>15m</span><span>Now</span></div></div>;
}
