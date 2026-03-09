import './index.css';
import { useState, useRef, type FormEvent } from 'react';
import { NxPanel, NxStat, NxDivider, NxBadge } from './components/UIComponents';
import { CountryPanel } from './components/CountryPanel';
import { GlobeLayer } from './layers/GlobeLayer';
import { useNexusStore } from './store/nexusStore';
import { useDataStream } from './store/useDataStream';
import { 
  Database, Cpu, 
  Layers, Crosshair 
} from 'lucide-react';
import nexusLogo from './assets/nexus-logo.png';
import type { Flight, DisasterEvent, ISSPosition } from './store/nexusStore';

const GEOCODE_URL = 'https://nominatim.openstreetmap.org/search';

async function geocode(query: string): Promise<{ lon: number; lat: number } | null> {
  try {
    const resp = await fetch(`${GEOCODE_URL}?q=${encodeURIComponent(query)}&format=json&limit=1`);
    const data = await resp.json();
    if (Array.isArray(data) && data.length > 0) {
      return { lon: parseFloat(data[0].lon), lat: parseFloat(data[0].lat) };
    }
  } catch { /* swallow */ }
  return null;
}

function speak(text: string): void {
  if ('speechSynthesis' in window) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1;
    utterance.pitch = 0.8;
    window.speechSynthesis.speak(utterance);
  }
}

function App() {
  useDataStream();
  const {
    flights, disasters, iss,
    hoverInfo, wsConnected, alerts,
    flyTo, searchQuery, setSearchQuery,
    selectedCountry
  } = useNexusStore();

  const [searching, setSearching] = useState(false);
  const lastSpokenId = useRef<string>('');

  const highAlerts = alerts.filter((a) => a.severity === 'HIGH');
  if (highAlerts.length > 0 && highAlerts[0].id !== lastSpokenId.current) {
    lastSpokenId.current = highAlerts[0].id;
    speak(highAlerts[0].text);
  }

  const handleSearch = async (e: FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setSearching(true);
    const result = await geocode(searchQuery);
    if (result) flyTo(result.lon, result.lat, 5);
    setSearching(false);
  };

  const hoverObject = hoverInfo?.object as (Flight & DisasterEvent & ISSPosition) | undefined;

  const tickerText = [
    ...alerts.map((a) => a.text),
    'SYSTEM NOMINAL — MONITORING GLOBAL GEOLOGICAL VIBRATIONS — AIR TRAFFIC CHANNELS ENCRYPTED — SATELLITE HANDSHAKE COMPLETE',
  ].join('   ///   ');

  return (
    <div className="w-screen h-screen overflow-hidden relative nx-grid-bg flex flex-col">
      
      {/* ── TOP HEADER (Maker Style) ── */}
      <header className="h-14 border-b border-nx-border flex items-center px-6 relative z-50 bg-nx-void/80 backdrop-blur-md">
        <div className="flex items-center gap-3 group">
          <img src={nexusLogo} alt="Nexus Logo" className="w-8 h-8 object-contain" />
          <div className="flex items-baseline gap-2">
            <span className="font-display text-2xl font-black text-nx-text tracking-tighter">Nexus</span>
            <span className="nx-panel-id text-nx-cyan">v2.0.4-B</span>
          </div>
        </div>
        
        <div className="mx-auto flex items-center gap-12">
            <div className="hidden lg:flex gap-8">
               <div className="flex flex-col">
                  <span className="nx-label">SPECTRO UNIT X-1</span>
                  <span className="nx-value text-[9px]">NORMALIZED / NOISE-FILTERED</span>
               </div>
               <div className="flex flex-col">
                  <span className="nx-label">SIGNAL STRENGTH</span>
                  <span className="nx-value text-[9px] text-nx-cyan">94.82% STABLE</span>
               </div>
            </div>

            {/* Global Search */}
            <form onSubmit={handleSearch} className="relative w-80">
              <input 
                type="text"
                placeholder="ENTRY: TARGET COORDINATES / SECTOR..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="nx-search w-full py-1.5 pl-3 pr-10"
              />
              <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 text-nx-muted hover:text-nx-cyan">
                {searching ? <div className="w-3 h-3 border border-nx-cyan border-t-transparent rounded-full animate-spin" /> : <Crosshair size={14} />}
              </button>
            </form>
        </div>

        <div className="flex items-center gap-6">
           <div className="flex items-center gap-2">
              <span className="nx-label">LATENCY</span>
              <span className="nx-value text-[9px] text-nx-amber">0.035s</span>
           </div>
           <div className="flex items-center gap-3 text-nx-muted">
              <Database size={14} />
              <Cpu size={14} />
              <Layers size={14} />
              <div className={wsConnected ? 'nx-dot-live' : 'nx-dot-off'} />
           </div>
        </div>
      </header>

      {/* ── MAIN WORKSPACE ── */}
      <main className="flex-1 relative flex overflow-hidden">
        
        {/* Map Layer */}
        <GlobeLayer />

        {/* ── DATA PANEL LEFT ( Maker parametric layout ) ── */}
        <aside className="absolute top-6 left-6 w-80 space-y-6 z-40 pointer-events-none">
          
          <NxPanel title="Geological survey" id="B7-90542" className="pointer-events-auto">
             <div className="flex flex-col gap-1">
                <span className="nx-value-xl uppercase tracking-tighter">Physical</span>
                <span className="nx-label">SATELLITE SPECTRAL ANALYSIS OF GEO-ACOUSTIC INPUT</span>
             </div>
             
             <NxDivider />

             <div className="space-y-4">
                <div className="grid grid-cols-2 gap-2">
                   <NxStat label="THREAT COUNT" value={disasters.length} size="lg" color="#FF2D55" />
                   <NxStat label="SYSTEM STATE" value={wsConnected ? "ACTIVE" : "OFFLINE"} color={wsConnected ? "#CCFF00" : "#FF2D55"} />
                </div>
                
                <div className="space-y-1.5">
                   <span className="nx-label">THREAT MATRIX FEED [TOP 3]</span>
                   <div className="space-y-1">
                      {disasters.slice(0, 3).map(d => (
                        <div key={d.id} className="flex justify-between items-center text-[9px] font-mono border-b border-nx-border/30 pb-1">
                           <span className="truncate w-40">{d.title}</span>
                           <NxBadge severity={d.severity} text={d.magnitude.toFixed(1)} />
                        </div>
                      ))}
                      {disasters.length === 0 && <span className="nx-label opacity-40 italic">Awaiting events...</span>}
                   </div>
                </div>
             </div>
          </NxPanel>

          <NxPanel title="Traffic monitoring" id="T-440HZ" className="pointer-events-auto">
             <div className="grid grid-cols-1 gap-4">
                <NxStat label="INBOUND AIRCRAFT" value={flights.length} subValue="SCANNING SECTOR" size="xl" />
                <div className="flex gap-4">
                   <NxStat label="ISS LAT" value={iss?.lat.toFixed(4) || "—"} />
                   <NxStat label="ISS LON" value={iss?.lon.toFixed(4) || "—"} color="#00E5FF" />
                </div>
             </div>
          </NxPanel>

        </aside>

        {/* ── DATA PANEL RIGHT ( Country Info ) ── */}
        <aside className="absolute top-6 right-6 w-96 bottom-12 z-40 pointer-events-none">
           <CountryPanel />
           
           {!selectedCountry && (
             <NxPanel title="Regional telemetry" id="P-39.41-3" className="pointer-events-auto">
                {hoverObject ? (
                  <div className="space-y-4">
                     <NxStat label="TAG IDENTIFIER" value={hoverInfo?.layer === 'flight' ? (hoverObject as Flight).callsign : (hoverObject as DisasterEvent).title} size="lg" color="#CCFF00" />
                     <div className="grid grid-cols-2 gap-y-3">
                        <NxStat label="LATITUDE" value={hoverObject.lat.toFixed(5)} />
                        <NxStat label="LONGITUDE" value={hoverObject.lon.toFixed(5)} />
                        <NxStat label="ELEVATION/ALT" value={hoverInfo?.layer === 'flight' ? `${Math.round((hoverObject as Flight).altitude)}m` : hoverInfo?.layer === 'iss' ? `${(hoverObject as ISSPosition).altitude}km` : 'GROUND'} />
                        <NxStat label="VELOCITY" value={hoverInfo?.layer === 'flight' ? `${Math.round((hoverObject as Flight).velocity)}m/s` : '—'} />
                     </div>
                  </div>
                ) : (
                  <div className="h-40 flex flex-col items-center justify-center border border-dashed border-nx-border text-nx-muted">
                     <div className="flex gap-2 items-baseline mb-2">
                        <span className="nx-value-lg">48</span>
                        <span className="nx-label text-nx-cyan">°</span>
                     </div>
                     <span className="nx-label">CLICK COUNTRY FOR FIELD INTEL</span>
                  </div>
                )}
             </NxPanel>
           )}
        </aside>

      </main>

      {/* ── BOTTOM TICKER ── */}
      <footer className="h-8 border-t border-nx-border bg-nx-void flex items-center overflow-hidden z-50">
         <div className="h-full px-4 flex items-center bg-nx-cyan text-nx-void font-bold text-[9px] tracking-widest shrink-0">
            SYSTEM.STATUS::SYNC
         </div>
         <div className="flex-1 overflow-hidden">
            <div className="nx-ticker-track">
               <span className="nx-value text-[10px] uppercase font-bold text-nx-cyan mx-8">{tickerText}</span>
               <span className="nx-value text-[10px] uppercase font-bold text-nx-cyan mx-8">{tickerText}</span>
            </div>
         </div>
      </footer>
    </div>
  );
}

export default App;
