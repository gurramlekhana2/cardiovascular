import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, AlertTriangle, XCircle, Info, ShieldCheck } from 'lucide-react';

const STATUS_CONFIG = {
  normal: {
    dot: 'bg-emerald-500',
    text: 'text-emerald-700 dark:text-emerald-400',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-700',
    icon: CheckCircle2,
    label: 'Normal',
  },
  warning: {
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-400',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    border: 'border-amber-200 dark:border-amber-700',
    icon: AlertTriangle,
    label: 'Borderline',
  },
  critical: {
    dot: 'bg-rose-500',
    text: 'text-rose-700 dark:text-rose-400',
    bg: 'bg-rose-50 dark:bg-rose-900/20',
    border: 'border-rose-200 dark:border-rose-700',
    icon: XCircle,
    label: 'Elevated',
  },
};

export default function ReferenceRangesPanel({ ranges }) {
  if (!ranges || ranges.length === 0) return null;

  const normalCount = ranges.filter(r => r.status === 'normal').length;
  const warnCount = ranges.filter(r => r.status === 'warning').length;
  const critCount = ranges.filter(r => r.status === 'critical').length;

  return (
    <div className="h-full flex flex-col">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-200/80 dark:border-slate-700">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-sky-500" />
            WHO / AHA Reference Ranges
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time clinical guideline comparison
          </p>
        </div>
        {/* Summary Badges */}
        <div className="flex items-center gap-1.5 text-[10px] font-bold">
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400">
            ✓ {normalCount}
          </span>
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400">
            ⚠ {warnCount}
          </span>
          <span className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400">
            ✕ {critCount}
          </span>
        </div>
      </div>

      {/* Parameter Rows */}
      <div className="flex-1 space-y-2 overflow-y-auto pr-1 scrollbar-thin">
        {ranges.map((item, idx) => {
          const cfg = STATUS_CONFIG[item.status] || STATUS_CONFIG.normal;
          const StatusIcon = cfg.icon;
          return (
            <motion.div
              key={item.label}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03, duration: 0.2 }}
              className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all duration-300 ${cfg.bg} ${cfg.border}`}
            >
              {/* Left: Status icon + label */}
              <div className="flex items-center gap-2 min-w-0">
                <StatusIcon className={`w-3.5 h-3.5 shrink-0 ${cfg.text}`} />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 truncate">{item.label}</p>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{item.range}</p>
                </div>
              </div>

              {/* Right: value + badge */}
              <div className="flex flex-col items-end shrink-0 ml-2 text-right">
                <span className={`text-xs font-bold ${cfg.text}`}>{item.value}</span>
                <span className={`text-[9px] font-semibold uppercase tracking-wide ${cfg.text} opacity-80`}>
                  {cfg.label}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Source footnote */}
      <div className="mt-3 pt-2.5 border-t border-slate-200/80 dark:border-slate-700">
        <p className="text-[10px] text-slate-400 dark:text-slate-500 leading-relaxed">
          Guidelines: AHA 2023 · WHO 2022 · NCEP ATP III · ADA 2023 · ESC 2021 · Framingham Study. Values are academic reference brackets, not diagnostic criteria.
        </p>
      </div>
    </div>
  );
}
