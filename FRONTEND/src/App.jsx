import { useEffect, useMemo, useState } from "react";
import "./styles.css";
import { routeHash, routeNameFromHash } from "./routes/routes.js";
import MetricCard from "./components/MetricCard.jsx";
import Header from "./components/Header.jsx";
import RiskRing from "./components/RiskRing.jsx";
import TemperatureChart from "./components/TemperatureChart.jsx";

const NAV = [
  ["Overview", "⌂"],
  ["Live Monitoring", "◉"],
  ["AI Risk Analysis", "✦"],
  ["Energy System", "⚡"],
  ["Delivery / Trip", "⌁"],
  ["Reports", "▤"],
  ["Settings", "⚙"],
];

const baseHistory = [4.4, 4.5, 4.6, 4.5, 4.7, 4.6, 4.5, 4.6, 4.7, 4.6, 4.5, 4.6];

function clamp(v, min, max) {
  return Math.min(max, Math.max(min, v));
}

function LegacyMetricCard({ icon, label, value, unit, tone = "" }) {
  return (
    <div className="metric-card">
      <div className={`metric-icon ${tone}`}>{icon}</div>
      <div className="metric-copy">
        <span>{label}</span>
        <strong>{value}<small>{unit}</small></strong>
      </div>
    </div>
  );
}

function Sparkline({ values, warning = false }) {
  const min = Math.min(...values) - 0.2;
  const max = Math.max(...values) + 0.2;
  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * 100;
    const y = 100 - ((v - min) / (max - min)) * 78 - 10;
    return `${x},${y}`;
  }).join(" ");

  return (
    <svg className="sparkline" viewBox="0 0 100 100" preserveAspectRatio="none">
      <defs>
        <linearGradient id="area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={warning ? "#f59e0b" : "#2f80ed"} stopOpacity=".28" />
          <stop offset="100%" stopColor={warning ? "#f59e0b" : "#2f80ed"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={`0,100 ${points} 100,100`} fill="url(#area)" stroke="none" />
      <polyline points={points} fill="none" stroke={warning ? "#f59e0b" : "#2f80ed"} strokeWidth="2.5" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function LegacyTemperatureChart({ history }) {
  return (
    <div className="temperature-chart">
      <div className="chart-grid">
        <span>8°C</span><span>6°C</span><span>4°C</span><span>2°C</span>
      </div>
      <Sparkline values={history} />
      <div className="chart-axis">
        <span>60m ago</span><span>45m</span><span>30m</span><span>15m</span><span>Now</span>
      </div>
    </div>
  );
}

function LegacyRiskRing({ score }) {
  const radius = 46;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - score / 100);

  return (
    <div className="risk-ring">
      <svg viewBox="0 0 120 120">
        <circle className="ring-bg" cx="60" cy="60" r={radius} />
        <circle
          className="ring-value"
          cx="60" cy="60" r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="ring-center">
        <strong>{score}</strong>
        <span>/100</span>
      </div>
    </div>
  );
}

function Overview({ data, history, onScenario }) {
  const riskLabel = data.riskScore < 30 ? "LOW RISK" : data.riskScore < 60 ? "MODERATE" : "HIGH RISK";

  return (
    <>
      <Header title="Overview" subtitle="Cold-chain intelligence at a glance" />
      <div className="metrics-row">
        <MetricCard icon="❄" label="Temperature" value={data.temperature.toFixed(1)} unit="°C" tone="blue" />
        <MetricCard icon="🔋" label="Battery" value={Math.round(data.battery)} unit="%" tone="green" />
        <MetricCard icon="✦" label="AI Risk" value={riskLabel} unit="" tone={data.riskScore < 30 ? "green" : "amber"} />
        <MetricCard icon="◉" label="Cooling" value={data.cooling} unit="" tone="blue" />
      </div>

      <div className="dashboard-grid">
        <section className="card chart-card">
          <div className="card-head">
            <div>
              <h3>Temperature Stability</h3>
              <p>Live simulated sensor stream · DS18B20</p>
            </div>
            <span className="live-tag"><i /> LIVE</span>
          </div>
          <TemperatureChart history={history} />
          <div className="chart-footer">
            <div><span className="dot blue-dot" />Current <b>{data.temperature.toFixed(1)}°C</b></div>
            <div>Safe range <b>2–8°C</b></div>
            <div>Stability <b>98.4%</b></div>
          </div>
        </section>

        <section className="card risk-card-main">
          <div className="card-head">
            <div>
              <h3>ColdSense AI Risk Engine</h3>
              <p>Predictive cold-chain assessment</p>
            </div>
            <span className="ai-chip">AI</span>
          </div>
          <div className="risk-main">
            <RiskRing score={data.riskScore} />
            <div className="risk-copy">
              <strong>{riskLabel}</strong>
              <p>{data.riskScore < 30
                ? "All critical parameters are within safe limits."
                : data.riskScore < 60
                ? "Small deviation detected. Continue monitoring."
                : "Potential excursion detected. Immediate attention recommended."
              }</p>
              <div className="confidence"><span>Prediction confidence</span><b>94%</b></div>
              <div className="progress"><i style={{ width: "94%" }} /></div>
            </div>
          </div>
          <div className="risk-factors">
            <span>Temperature <b>Normal</b></span>
            <span>Battery <b>Stable</b></span>
            <span>Cooling <b>Active</b></span>
          </div>
        </section>

        <section className="card system-card">
          <div className="card-head"><div><h3>Virtual Cold Box</h3><p>Software representation of hardware</p></div><span className="online">ONLINE</span></div>
          <div className="coldbox">
            <div className="coldbox-glow" />
            <div className="coldbox-top">COLD BOX</div>
            <div className="coldbox-inner">
              <div className="cold-sensor s1">T1<br/><b>{data.temperature.toFixed(1)}°</b></div>
              <div className="medicine">MEDICINE<br/><b>SAFE</b></div>
              <div className="cold-sensor s2">T2<br/><b>4.5°</b></div>
            </div>
            <div className="coldbox-bottom"><span>PCM 72%</span><span>PELTIER ON</span></div>
          </div>
          <div className="health-list">
            <div><span>Temperature sensors</span><b className="ok">● 2 / 2</b></div>
            <div><span>Cooling module</span><b className="ok">● ACTIVE</b></div>
            <div><span>Emergency cutoff</span><b className="ok">● READY</b></div>
          </div>
        </section>

        <section className="card energy-card">
          <div className="card-head"><div><h3>Energy Flow</h3><p>Hybrid power management</p></div><span className="power-badge">420 W</span></div>
          <div className="energy-flow">
            <div className="energy-node"><span>☀</span><b>Solar</b><small>420 W</small></div>
            <div className="energy-arrow">→</div>
            <div className="energy-node"><span>🔋</span><b>Battery</b><small>{Math.round(data.battery)}%</small></div>
            <div className="energy-arrow">→</div>
            <div className="energy-node"><span>❄</span><b>Cooling</b><small>180 W</small></div>
          </div>
          <div className="battery-track"><i style={{ width: `${data.battery}%` }} /></div>
          <div className="battery-labels"><span>Battery reserve</span><b>{Math.round(data.battery)}%</b></div>
        </section>
      </div>

      <section className="card quick-card">
        <div className="quick-title">
          <div><h3>Simulation Controls</h3><p>Demonstrate the software response during your hackathon presentation</p></div>
          <span>DEMO MODE</span>
        </div>
        <div className="scenario-buttons">
          <button onClick={() => onScenario("normal")} className="scenario normal">● Normal</button>
          <button onClick={() => onScenario("warning")} className="scenario warning">▲ Warning</button>
          <button onClick={() => onScenario("failure")} className="scenario failure">✕ Failure</button>
        </div>
      </section>
    </>
  );
}

function LegacyHeader({ title, subtitle }) {
  return (
    <header className="topbar">
      <div>
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      <div className="top-actions">
        <span className="date-chip">● Simulation active</span>
        <div className="avatar">H</div>
      </div>
    </header>
  );
}

function LiveMonitoring({ data, history }) {
  return (
    <>
      <Header title="Live Monitoring" subtitle="Real-time simulated cold-chain parameters" />
      <div className="metrics-row">
        <MetricCard icon="❄" label="Temperature" value={data.temperature.toFixed(1)} unit="°C" tone="blue" />
        <MetricCard icon="💧" label="Humidity" value="62" unit="%" tone="blue" />
        <MetricCard icon="⚡" label="Cooling Power" value="180" unit="W" tone="amber" />
        <MetricCard icon="🔋" label="Battery" value={Math.round(data.battery)} unit="%" tone="green" />
      </div>
      <section className="card large-card">
        <div className="card-head"><div><h3>Live Temperature Trend</h3><p>Simulated sensor updates every few seconds</p></div><span className="live-tag"><i /> LIVE</span></div>
        <TemperatureChart history={history} />
      </section>
      <div className="three-grid">
        <InfoCard title="Sensor T1" value={`${data.temperature.toFixed(1)}°C`} status="NORMAL" />
        <InfoCard title="Sensor T2" value="4.5°C" status="NORMAL" />
        <InfoCard title="Door / Lid" value="CLOSED" status="SECURE" />
      </div>
    </>
  );
}

function InfoCard({ title, value, status }) {
  return <div className="card info-card"><span>{title}</span><strong>{value}</strong><b className="ok">{status}</b></div>;
}

function RiskPage({ data }) {
  const factors = [
    ["Temperature deviation", data.temperature > 8 ? "High" : "Low", data.temperature > 8 ? 82 : 12],
    ["Battery depletion", data.battery < 30 ? "High" : "Low", data.battery < 30 ? 78 : 10],
    ["Cooling performance", data.cooling === "ALERT" ? "High" : "Low", data.cooling === "ALERT" ? 74 : 8],
    ["Trip exposure", "Low", 14],
  ];
  return (
    <>
      <Header title="AI Risk Analysis" subtitle="Predictive intelligence before a cold-chain excursion" />
      <div className="ai-banner">
        <div className="ai-banner-icon">✦</div>
        <div><span>ColdSense AI Risk Engine</span><h2>{data.riskScore < 30 ? "SAFE TO CONTINUE DELIVERY" : "ATTENTION REQUIRED"}</h2><p>Risk score is calculated from temperature stability, energy reserve, cooling response and trip exposure.</p></div>
        <RiskRing score={data.riskScore} />
      </div>
      <div className="dashboard-grid">
        <section className="card">
          <div className="card-head"><div><h3>Risk Factors</h3><p>Current contribution to predicted risk</p></div></div>
          <div className="factor-list">
            {factors.map(([name, level, value]) => (
              <div className="factor" key={name}>
                <div><span>{name}</span><b>{level}</b></div>
                <div className="factor-bar"><i style={{ width: `${value}%` }} /></div>
              </div>
            ))}
          </div>
        </section>
        <section className="card prediction-card">
          <div className="card-head"><div><h3>AI Recommendation</h3><p>Action generated from current simulation</p></div></div>
          <div className="recommendation"><span>✓</span><div><b>Maintain current cooling</b><p>Temperature is stable and energy reserve is sufficient. Continue monitoring during transit.</p></div></div>
          <div className="recommendation"><span>↗</span><div><b>Next prediction window: 15 min</b><p>System will reassess excursion probability using the latest sensor trend.</p></div></div>
        </section>
      </div>
    </>
  );
}

function EnergyPage({ data }) {
  return (
    <>
      <Header title="Energy System" subtitle="Hybrid solar + battery + cooling power management" />
      <div className="metrics-row">
        <MetricCard icon="☀" label="Solar Input" value="420" unit="W" tone="amber" />
        <MetricCard icon="🔋" label="Battery" value={Math.round(data.battery)} unit="%" tone="green" />
        <MetricCard icon="⚡" label="Current Load" value="180" unit="W" tone="blue" />
        <MetricCard icon="◷" label="Estimated Reserve" value="6.4" unit="h" tone="blue" />
      </div>
      <section className="card large-energy">
        <div className="card-head"><div><h3>Power Flow</h3><p>Simulated energy routing for the cold-delivery unit</p></div></div>
        <div className="energy-map">
          <div className="source-node"><span>☀</span><b>Solar Panel</b><small>420 W input</small></div>
          <div className="flow-line">→</div>
          <div className="source-node"><span>⚡</span><b>MPPT Controller</b><small>94% efficiency</small></div>
          <div className="flow-line">→</div>
          <div className="source-node"><span>🔋</span><b>Battery</b><small>{Math.round(data.battery)}% SOC</small></div>
          <div className="flow-line">→</div>
          <div className="source-node"><span>❄</span><b>Peltier</b><small>180 W load</small></div>
        </div>
      </section>
    </>
  );
}

function TripPage() {
  return (
    <>
      <Header title="Delivery / Trip" subtitle="Track mission status and remaining cold-chain exposure" />
      <div className="metrics-row">
        <MetricCard icon="→" label="Trip Status" value="IN TRANSIT" unit="" tone="green" />
        <MetricCard icon="⌁" label="Distance Covered" value="68" unit="km" tone="blue" />
        <MetricCard icon="↗" label="Remaining" value="32" unit="km" tone="blue" />
        <MetricCard icon="◷" label="ETA" value="42" unit="min" tone="amber" />
      </div>
      <section className="card route-card">
        <div className="card-head"><div><h3>Delivery Route</h3><p>Simulated healthcare cold-chain trip</p></div><span className="online">IN TRANSIT</span></div>
        <div className="route-map">
          <div className="route-point"><i className="start" /><div><b>Cold Storage Facility</b><span>Origin · 68 km completed</span></div></div>
          <div className="route-progress"><i /></div>
          <div className="route-point"><i className="end" /><div><b>Healthcare Distribution Centre</b><span>Destination · 32 km remaining</span></div></div>
        </div>
      </section>
    </>
  );
}

function ReportsPage() {
  return (
    <>
      <Header title="Reports" subtitle="Performance evidence for your cold-chain mission" />
      <div className="three-grid">
        <div className="card report-stat"><span>24h</span><b>Temperature stability</b><strong>98.4%</strong><small>Within 2–8°C range</small></div>
        <div className="card report-stat"><span>7D</span><b>Successful deliveries</b><strong>96%</strong><small>Simulated mission history</small></div>
        <div className="card report-stat"><span>AI</span><b>Early warnings detected</b><strong>03</strong><small>Before critical excursion</small></div>
      </div>
      <section className="card report-table">
        <div className="card-head"><div><h3>Recent Mission Logs</h3><p>Software-generated demonstration data</p></div></div>
        <div className="table">
          <div className="tr th"><span>Mission</span><span>Duration</span><span>Temp.</span><span>Status</span></div>
          <div className="tr"><span>CS-1042</span><span>02h 18m</span><span>4.6°C</span><b className="ok">SAFE</b></div>
          <div className="tr"><span>CS-1041</span><span>03h 06m</span><span>5.1°C</span><b className="ok">SAFE</b></div>
          <div className="tr"><span>CS-1040</span><span>01h 54m</span><span>7.2°C</span><b className="warn">WATCH</b></div>
        </div>
      </section>
    </>
  );
}

function SettingsPage() {
  return (
    <>
      <Header title="Settings" subtitle="Configure the ColdSense.ai software simulation" />
      <section className="card settings-card">
        <Setting title="Software Simulation" text="Use virtual sensor values instead of physical hardware." />
        <Setting title="AI Risk Engine" text="Predictive risk scoring is enabled for the demonstration." />
        <Setting title="Emergency Protection" text="Simulated cutoff activates when temperature becomes critical." />
        <Setting title="Data Logging" text="Mission events are stored locally for the dashboard session." />
      </section>
    </>
  );
}

function Setting({ title, text }) {
  return <div className="setting-row"><div><b>{title}</b><p>{text}</p></div><span>ENABLED</span></div>;
}

function App() {
  const [page, setPage] = useState(() => routeNameFromHash());
  const [temperature, setTemperature] = useState(4.6);
  const [battery, setBattery] = useState(85);
  const [history, setHistory] = useState(baseHistory);

  useEffect(() => {
    const syncRoute = () => setPage(routeNameFromHash());
    window.addEventListener("hashchange", syncRoute);
    return () => window.removeEventListener("hashchange", syncRoute);
  }, []);

  function navigate(nextPage) {
    window.location.hash = routeHash(nextPage);
    setPage(nextPage);
  }

  const riskScore = useMemo(() => {
    const tempRisk = temperature <= 8 ? Math.max(0, Math.abs(temperature - 5) * 5) : 65 + (temperature - 8) * 8;
    const batteryRisk = battery < 30 ? 30 : battery < 50 ? 12 : 3;
    return Math.round(clamp(tempRisk + batteryRisk, 8, 96));
  }, [temperature, battery]);

  const data = {
    temperature,
    battery,
    riskScore,
    cooling: temperature <= 8 ? "ACTIVE" : "ALERT",
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setTemperature((old) => Number(clamp(old + (Math.random() - 0.5) * 0.16, 3.8, 5.2).toFixed(1)));
      setBattery((old) => Math.max(0, old - 0.01));
      setHistory((old) => [...old.slice(-11), temperature]);
    }, 3500);
    return () => clearInterval(timer);
  }, [temperature]);

  function scenario(type) {
    if (type === "normal") {
      setTemperature(4.6);
      setBattery(85);
    }
    if (type === "warning") {
      setTemperature(7.4);
      setBattery(68);
    }
    if (type === "failure") {
      setTemperature(10.8);
      setBattery(24);
    }
  }

  let content;
  if (page === "Overview") content = <Overview data={data} history={history} onScenario={scenario} />;
  if (page === "Live Monitoring") content = <LiveMonitoring data={data} history={history} />;
  if (page === "AI Risk Analysis") content = <RiskPage data={data} />;
  if (page === "Energy System") content = <EnergyPage data={data} />;
  if (page === "Delivery / Trip") content = <TripPage />;
  if (page === "Reports") content = <ReportsPage />;
  if (page === "Settings") content = <SettingsPage />;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-logo">C</div>
          <div><strong>ColdSense<span>.ai</span></strong><small>COLD-CHAIN INTELLIGENCE</small></div>
        </div>

        <div className="nav-label">PLATFORM</div>
        <nav>
          {NAV.map(([name, icon]) => (
            <button key={name} className={page === name ? "nav-btn active" : "nav-btn"} onClick={() => navigate(name)}>
              <span>{icon}</span>{name}
            </button>
          ))}
        </nav>

        <div className="sidebar-bottom">
          <div className="mini-status"><i /> <div><b>System Online</b><span>Demo environment</span></div></div>
          <div className="version">ColdSense.ai v1.0</div>
        </div>
      </aside>

      <main className="content">
        {content}
      </main>
    </div>
  );
}

export default App;
