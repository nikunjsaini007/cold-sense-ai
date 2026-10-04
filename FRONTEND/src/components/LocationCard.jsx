import { useEffect, useState } from 'react';
import { MapPin, Navigation, RefreshCw } from 'lucide-react';
import { getShipments } from '../services/api.js';
import { getShipmentLocation } from '../services/location.js';

export default function LocationCard() {
  const [shipments, setShipments] = useState([]);
  const [shipmentId, setShipmentId] = useState('');
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const mapKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  useEffect(() => { getShipments().then((result) => { const list = result.shipments || []; setShipments(list); setShipmentId(list[0]?.shipment_id || ''); }).catch(() => setMessage('Unable to load shipments.')); }, []);
  useEffect(() => { if (!shipmentId) return; let active = true; setLoading(true); setMessage(''); getShipmentLocation(shipmentId).then((next) => { if (active) setLocation(next); }).catch(() => { if (active) { setLocation(null); setMessage('Waiting for connected device location.'); } }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [shipmentId]);

  const mapUrl = location && mapKey ? `https://www.google.com/maps/embed/v1/view?key=${encodeURIComponent(mapKey)}&center=${location.latitude},${location.longitude}&zoom=13` : '';
  return <section className="location-card api-panel"><div className="api-panel-head"><div><MapPin size={17} /><h2>Rider location</h2></div><Navigation size={16} /></div><div className="location-toolbar"><select value={shipmentId} onChange={(event) => setShipmentId(event.target.value)}>{shipments.map((item) => <option key={item.shipment_id} value={item.shipment_id}>{item.shipment_id}</option>)}</select>{loading && <RefreshCw className="api-spin" size={14} />}</div>{location && mapKey ? <iframe className="location-map" title={`Location for ${shipmentId}`} src={mapUrl} loading="lazy" referrerPolicy="no-referrer-when-downgrade" /> : <div className="location-empty"><MapPin size={24} /><strong>{message || (mapKey ? 'Waiting for connected device…' : 'Google Maps is not configured')}</strong><span>{location ? `${location.latitude}, ${location.longitude}` : 'Location comes from shipment telemetry, not the rider browser.'}</span></div>}{location && <footer className="location-meta">Last updated {location.updatedAt ? new Date(location.updatedAt).toLocaleString() : 'unknown'}</footer>}</section>;
}
