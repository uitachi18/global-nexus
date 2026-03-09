import React from 'react';
import { useNexusStore } from '../store/nexusStore';
import { NxPanel, NxStat, NxDivider } from './UIComponents';
import { Globe, Users, Map as MapIcon, ExternalLink, Newspaper, Info } from 'lucide-react';

export const CountryPanel: React.FC = () => {
  const { selectedCountry, countryNews, countryLoading } = useNexusStore();

  if (!selectedCountry && !countryLoading) return null;

  return (
    <NxPanel 
      title={selectedCountry?.name || 'ANALYZING...'} 
      id="GEO-SURV-X9" 
      className="w-full h-full pointer-events-auto"
    >
      {countryLoading ? (
        <div className="flex flex-col items-center justify-center h-full gap-4">
           <div className="w-12 h-12 border-2 border-nx-cyan border-t-transparent rounded-full animate-spin" />
           <span className="nx-label animate-pulse">RETRIVING SATELLITE DATA...</span>
        </div>
      ) : (
        <div className="flex flex-col h-full overflow-hidden">
          {/* Header with Flag */}
          <div className="flex gap-4 mb-4">
            <img 
              src={selectedCountry?.flag_png} 
              alt={selectedCountry?.flag_alt} 
              className="w-24 h-16 object-cover border border-nx-border"
            />
            <div className="flex flex-col justify-center">
              <span className="nx-label">OFFICIAL NAME</span>
              <span className="nx-value text-xs font-bold leading-tight">{selectedCountry?.official}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <NxStat label="CAPITAL" value={selectedCountry?.capital || '—'} />
            <NxStat label="REGION" value={selectedCountry?.region || '—'} subValue={selectedCountry?.subregion} />
          </div>

          <NxDivider />

          <div className="grid grid-cols-2 gap-4 mb-4">
            <NxStat label="POPULATION" value={selectedCountry?.population.toLocaleString() || '0'} size="lg" />
            <NxStat label="AREA (KM²)" value={selectedCountry?.area.toLocaleString() || '0'} size="lg" color="#00E5FF" />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <NxStat label="CURRENCY" value={selectedCountry?.currencies || '—'} />
            <NxStat label="CALLING CODE" value={selectedCountry?.calling_code || '—'} color="#FFB300" />
          </div>

          <NxDivider />

          {/* News Section */}
          <div className="flex-1 overflow-hidden flex flex-col">
            <div className="flex items-center gap-2 mb-2">
              <Newspaper size={12} className="text-nx-cyan" />
              <span className="nx-label">LIVE INTELLIGENCE FEED</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
              {countryNews.length === 0 ? (
                <span className="nx-label opacity-40 italic">No intelligence reports for this sector.</span>
              ) : (
                countryNews.map((article, idx) => (
                  <div key={idx} className="border-l-2 border-nx-border pl-3 group hover:border-nx-cyan transition-colors">
                    <a href={article.url} target="_blank" rel="noopener noreferrer" className="block">
                      <div className="flex justify-between items-start mb-1">
                        <span className="nx-label text-[8px] text-nx-cyan">{article.source}</span>
                        <ExternalLink size={8} className="text-nx-muted group-hover:text-nx-cyan" />
                      </div>
                      <h4 className="nx-value text-[10px] font-bold leading-tight line-clamp-2 mb-1 group-hover:text-nx-cyan">
                        {article.title}
                      </h4>
                      <p className="nx-label text-[9px] line-clamp-2 lowercase opacity-60">
                        {article.description}
                      </p>
                    </a>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </NxPanel>
  );
};
