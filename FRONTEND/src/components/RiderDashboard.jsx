import { useEffect, useState } from 'react';
import { AlertTriangle, LogOut, Package, RefreshCw, ShieldCheck, Thermometer } from 'lucide-react';
import { getAlerts, getRisk } from '../services/api.js';

export default function RiderDashboard({ user, onSignOut }) {
  const shipmentId = user?.user_metadata?.shipment_id || '';
  const [risk, setRisk] = useState(null);
  const [alerts, setAlerts] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(Boolean(shipmentId));

  const load = async () => {
    if (!shipmentId) return;
    setLoading(true); setError('');
    try { const [nextRisk, nextAlerts] = await Promise.all([getRisk(shipmentId), getAlerts(shipmentId)]); setRisk(nextRisk); setAlerts(Array.isArray(nextAlerts.alerts) ? nextAlerts.alerts : []); }
    catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to load assigned shipment.'); }
    finally { setLoading(false); }
  };
  useEffect(() => { void load(); }, []);

  const shipment = risk?.shipment;
  return <main className="rider-shell"><header className="rider-header"><div className="auth-brand"><span className="auth-mark"><ShieldCheck size={21} /></span><div><strong>ColdSense<span>.ai</span></strong><small>Rider workspace</small></div></div><button className="rider-signout" onClick={onSignOut}><LogOut size={15} /> Sign out</button></header><section className="rider-content"><span className="auth-kicker">Assigned shipment</span><h1>Keep your delivery moving safely.</h1>{!shipmentId && <div className="rider-empty"><Package size={24} /><h2>No shipment assigned</h2><p>Your provider has not assigned a shipment to this rider account yet.</p></div>}{loading && <div className="rider-empty"><RefreshCw className="api-spin" size={22} /><p>Loading shipment status…</p></div>}{error && <div className="rider-empty rider-error"><AlertTriangle size={22} /><p>{error}</p><button onClick={() => void load()}>Retry</button></div>}{shipment && <><div className="rider-route"><div><small>Shipment</small><strong>{shipment.shipmentId}</strong><span>{shipment.productName}</span></div><div><small>Route</small><strong>{shipment.origin || 'Origin'} → {shipment.destination || 'Destination'}</strong></div><span className={`rider-status ${risk.risk?.status?.toLowerCase()}`}>{risk.risk?.status || 'WAITING'}</span></div><div className="rider-metrics"><div><Thermometer size={19} /><small>Temperature</small><strong>{risk.risk?.currentTemperature ?? '—'}°C</strong></div><div><ShieldCheck size={19} /><small>Risk score</small><strong>{risk.risk?.riskScore ?? '—'}/100</strong></div><div><AlertTriangle size={19} /><small>Warnings</small><strong>{alerts.filter((item) => item.status === 'ACTIVE').length}</strong></div></div><section className="rider-card"><h2>Operator instructions</h2><p>{risk.recommendation || 'Keep the shipment closed, connected, and within its safe temperature range.'}</p></section></>}</section></main>;
}
