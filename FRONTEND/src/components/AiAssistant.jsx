import { useEffect, useState } from 'react';
import { Bot, ChevronDown, LoaderCircle, Send, Sparkles, X } from 'lucide-react';
import { getAiRecommendation, getRisk, getShipments } from '../services/api.js';

export default function AiAssistant() {
  const [open, setOpen] = useState(false);
  const [shipments, setShipments] = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [risk, setRisk] = useState(null);
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    getShipments().then((result) => {
      if (!active) return;
      const list = Array.isArray(result.shipments) ? result.shipments : [];
      setShipments(list);
      setSelectedId(list[0]?.shipment_id || '');
    }).catch(() => { if (active) setError('Could not load shipments.'); });
    return () => { active = false; };
  }, []);

  const ask = async () => {
    const shipment = shipments.find((item) => item.shipment_id === selectedId);
    if (!shipment) return;
    setLoading(true); setLoadingData(true); setError(''); setAnswer('');
    try {
      const liveRisk = await getRisk(selectedId);
      setRisk(liveRisk);
      if (liveRisk.telemetryAvailable === false || !liveRisk.risk || liveRisk.telemetry?.readingsAnalyzed === 0) {
        setAnswer('There is not enough telemetry yet. Send at least one sensor reading, then ask again.');
        return;
      }
      const result = await getAiRecommendation({
        shipmentId: shipment.shipment_id, productName: shipment.product_name, productType: shipment.product_type || 'OTHER',
        currentTemperature: liveRisk.risk.currentTemperature, minTemperature: liveRisk.safeRange.min, maxTemperature: liveRisk.safeRange.max,
        trend: liveRisk.risk.trend, rateOfChange: liveRisk.risk.rateOfChange, riskScore: liveRisk.risk.riskScore, status: liveRisk.risk.status,
        predictedMinutes: liveRisk.risk.predictedMinutes, telemetry: liveRisk.telemetry.history,
      });
      setAnswer(result.recommendation || 'No recommendation was returned.');
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'AI request failed.'); }
    finally { setLoading(false); setLoadingData(false); }
  };

  return <>
    {!open && <button className="ai-fab" onClick={() => setOpen(true)} aria-label="Open Coldy AI assistant"><Sparkles size={18} /><span>Ask Coldy AI</span></button>}
    {open && <aside className="ai-assistant" aria-label="Coldy assistant">
      <header><div className="ai-assistant-title"><span><Bot size={19} /></span><div><strong>Coldy AI assistant</strong><small>Live cold-chain assessment</small></div></div><button className="ai-close" onClick={() => setOpen(false)} aria-label="Close assistant"><X size={17} /></button></header>
      <div className="ai-assistant-body"><label>Shipment<select value={selectedId} onChange={(event) => setSelectedId(event.target.value)}><option value="">Choose a shipment</option>{shipments.map((shipment) => <option key={shipment.shipment_id} value={shipment.shipment_id}>{shipment.shipment_id} · {shipment.product_name}</option>)}</select><ChevronDown size={14} /></label>
        {loadingData && <div className="ai-context"><LoaderCircle className="ai-spin" size={15} /> Reading live telemetry…</div>}
        {risk?.risk && <div className="ai-context"><b>{risk.risk.status}</b><span>{risk.risk.currentTemperature}°C · score {risk.risk.riskScore}/100</span></div>}
        {answer && <div className="ai-answer"><div><Sparkles size={15} /><b>AI response</b></div><p>{answer}</p></div>}
        {error && <p className="ai-error-text">{error}</p>}
        <button className="ai-ask" onClick={ask} disabled={loading || !selectedId}>{loading ? <><LoaderCircle className="ai-spin" size={16} /> Analysing sample…</> : <><Send size={16} /> Ask about this sample</>}</button>
        <small className="ai-disclaimer">Uses the selected shipment’s live risk sample. Keep operational decisions under human review.</small>
      </div>
    </aside>}
  </>;
}
