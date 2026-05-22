import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MetricCard = ({ title, value, icon: Icon, trend, trendType, color = 'emerald' }) => {
  const isUp = trendType === 'up';

  const colorStyles = {
    emerald: {
      glow: 'neon-glow-emerald border-fin-emerald/30 dark:border-fin-emerald/20',
      iconBg: 'bg-fin-emerald/10 text-fin-emerald border-fin-emerald/20',
    },
    violet: {
      glow: 'neon-glow-violet border-fin-violet/30 dark:border-fin-violet/20',
      iconBg: 'bg-fin-violet/10 text-fin-violet border-fin-violet/20',
    },
    rose: {
      glow: 'neon-glow-rose border-fin-rose/30 dark:border-fin-rose/20',
      iconBg: 'bg-fin-rose/10 text-fin-rose border-fin-rose/20',
    },
  };

  const selectedColor = colorStyles[color] || colorStyles.emerald;

  return (
    <div className={`glass-panel rounded-2xl p-6 border ${selectedColor.glow} transition-all duration-300 hover:-translate-y-1`}>
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
            {title}
          </span>
          <h3 className="text-2xl font-black mt-2 text-slate-800 dark:text-slate-100 tracking-tight">
            {value}
          </h3>
        </div>

        <div className={`p-3 rounded-xl border ${selectedColor.iconBg} shadow-sm`}>
          <Icon size={20} className="stroke-[2.2]" />
        </div>
      </div>

      {trend && (
        <div className="flex items-center gap-1 mt-4">
          <span
            className={`flex items-center text-xs font-extrabold ${
              isUp ? 'text-fin-emerald' : 'text-fin-rose'
            }`}
          >
            {isUp ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            {trend}
          </span>
          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold uppercase tracking-wider">
            vs last month
          </span>
        </div>
      )}
    </div>
  );
};

export default MetricCard;
