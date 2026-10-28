import React from 'react';

export default function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  badge,
  badgeColor = 'bg-orange-500/10 text-orange-400 border-orange-500/20',
  accentColor = 'from-orange-500 to-amber-500'
}) {
  return (
    <div className="glass-panel glass-panel-hover rounded-xl p-5 relative overflow-hidden">
      {/* Decorative Top Accent Glow */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${accentColor}`} />

      <div className="flex items-start justify-between">
        <div>
          <span className="text-xs font-medium text-slate-400 uppercase tracking-wider block mb-1">
            {title}
          </span>
          <div className="text-2xl font-black text-white tracking-tight">
            {value}
          </div>
        </div>

        {Icon && (
          <div className="w-10 h-10 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center text-slate-300">
            <Icon className="w-5 h-5 text-orange-400" />
          </div>
        )}
      </div>

      {(subtitle || badge) && (
        <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-800/80">
          <span className="text-slate-400 text-[11px] truncate">{subtitle}</span>
          {badge && (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold font-mono border ${badgeColor}`}>
              {badge}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
