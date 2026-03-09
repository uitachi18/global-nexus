import React, { type ReactNode } from 'react';

interface PanelProps {
  children: ReactNode;
  title?: string;
  id?: string;
  className?: string;
}

export const NxPanel: React.FC<PanelProps> = ({ children, title, id, className = '' }) => (
  <div className={`nx-panel flex flex-col ${className}`}>
    {(title || id) && (
      <div className="nx-panel-header">
        {id && <span className="nx-panel-id">[{id}]</span>}
        {title && <span className="nx-label text-[10px] text-nx-cyan font-bold">{title}</span>}
        <div className="ml-auto flex gap-1 items-center">
             <div className="nx-dot-live h-1.5 w-1.5" />
             <div className="h-1.5 w-1.5 bg-nx-muted rounded-full" />
        </div>
      </div>
    )}
    <div className="p-3 flex-1">
      {children}
    </div>
  </div>
);

interface StatProps {
  label: string;
  value: string | number;
  subValue?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  color?: string;
}

export const NxStat: React.FC<StatProps> = ({ label, value, subValue, size = 'md', color }) => {
  const valueClass = size === 'xl' ? 'nx-value-xl' : size === 'lg' ? 'nx-value-lg' : 'nx-value';
  return (
    <div className="flex flex-col">
      <span className="nx-label mb-1">{label}</span>
      <div className="flex items-baseline gap-2">
        <span className={valueClass} style={color ? { color } : {}}>{value}</span>
        {subValue && <span className="nx-label text-[10px] opacity-60">{subValue}</span>}
      </div>
    </div>
  );
};

export const NxDivider: React.FC = () => <div className="nx-divider" />;

export const NxBadge: React.FC<{ severity: 'HIGH' | 'MEDIUM' | 'LOW'; text: string }> = ({ severity, text }) => {
  const badgeClass = `nx-badge-${severity.toLowerCase()}`;
  return <span className={badgeClass}>[{text}]</span>;
};
