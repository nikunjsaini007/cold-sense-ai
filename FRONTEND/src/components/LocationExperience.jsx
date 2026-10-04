import { useState } from 'react';
import { ArrowLeft, MapPinned, X } from 'lucide-react';
import EmbeddedLocationMap from './EmbeddedLocationMap.jsx';

export default function LocationExperience() {
  const [open, setOpen] = useState(false);
  return <>
    <button className="location-nav-button" onClick={() => setOpen(true)}><MapPinned size={16} /><span>Rider Location</span></button>
    {open && <div className="location-page-overlay"><header><button onClick={() => setOpen(false)}><ArrowLeft size={17} /> Back to dashboard</button><button className="location-page-close" onClick={() => setOpen(false)} aria-label="Close rider location"><X size={18} /></button></header><main><span className="api-kicker">Cold-chain movement</span><h1>Rider Location</h1><p className="location-page-subtitle">View the embedded Google Maps location for this delivery.</p><EmbeddedLocationMap /></main></div>}
  </>;
}
