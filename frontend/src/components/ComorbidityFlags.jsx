import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, ShieldAlert, CheckCircle, Zap } from 'lucide-react';

const SEVERITY_CONFIG = {
  critical: {
    bg: 'bg-rose-50 dark:bg-rose-900/25',
    border: 'border-rose-300 dark:border-rose-700',
    title: 'text-rose-800 dark:text-rose-300',
    desc: 'text-rose-700 dark:text-rose-400',
    badge: 'bg-rose-200 dark:bg-rose-800/40 text-rose-800 dark:text-rose-200',
    leftBar: 'bg-rose-500',
    icon: ShieldAlert,
    label: 'CRITICAL',
  },
  high: {
    bg: 'bg-amber-50 dark:bg-amber-900/25',
    border: 'border-amber-300 dark:border-amber-700',
    title: 'text-amber-800 dark:text-amber-300',
    desc: 'text-amber-700 dark:text-amber-400',
    badge: 'bg-amber-200 dark:bg-amber-800/40 text-amber-800 dark:text-amber-200',
    leftBar: 'bg-amber-500',
    icon: AlertTriangle,
    label: 'HIGH',
  },
  clear: {
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    border: 'border-emerald-200 dark:border-emerald-700',
    title: 'text-emerald-800 dark:text-emerald-300',
    desc: 'text-emerald-700 dark:text-emerald-400',
    badge: 'bg-emerald-100 dark:bg-emerald-800/30 text-emerald-700 dark:text-emerald-300',
    leftBar: 'bg-emerald-400',
    icon: CheckCircle,
    label: 'CLEAR',
  },
};

export default function ComorbidityFlags({ flags }) {
  if (!flags || flags.length === 0) return null;

  const criticalCount = flags.filter(f => f.severity === 'critical').length;
  const highCount = flags.filter(f => f.severity === 'high').length;
  const isClear = flags.length === 1 && flags[0].severity === 'clear';

  return (
    <div className="mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-700">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
              Comorbidity Cluster Detection
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Auto-detected clinically significant parameter interaction patterns.
            </p>
          </div>
        </div>

        {/* Summary pill */}
        {!isClear && (
          <div className="flex items-center gap-1.5 text-[11px] font-bold shrink-0">
            {criticalCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-700">
                {criticalCount} Critical
              </span>
            )}
            {highCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-700">
                {highCount} High
              </span>
            )}
          </div>
        )}
      </div>

      {/* Flag Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <AnimatePresence>
          {flags.map((flag, idx) => {
            const cfg = SEVERITY_CONFIG[flag.severity] || SEVERITY_CONFIG.high;
            const FlagIcon = cfg.icon;
            return (
              <motion.div
                key={flag.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ delay: idx * 0.06, duration: 0.25 }}
                className={`relative flex items-start gap-3 px-4 py-3.5 rounded-2xl border ${cfg.bg} ${cfg.border} overflow-hidden`}
              >
                {/* Left severity bar */}
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.leftBar} rounded-l-2xl`} />

                {/* Emoji + Icon */}
                <div className="flex flex-col items-center gap-1 shrink-0 pt-0.5">
                  <span className="text-lg leading-none">{flag.icon}</span>
                </div>

                {/* Content */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <h4 className={`text-xs font-bold leading-tight ${cfg.title}`}>{flag.title}</h4>
                    <span className={`text-[9px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded ${cfg.badge}`}>
                      {cfg.label}
                    </span>
                  </div>
                  <p className={`text-[11px] leading-relaxed ${cfg.desc}`}>{flag.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
