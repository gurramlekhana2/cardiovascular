import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ChevronUp, Activity, Heart, ShieldAlert, CheckCircle, AlertTriangle } from 'lucide-react';
import RiskOutputCard from './RiskOutputCard';

export default function MobileBottomSheet({
  isOpen,
  onClose,
  result,
  isCalculating,
  isLive,
  onOpen,
  onPrint
}) {
  if (!result) return null;

  const { probabilityPct, riskLevel, riskColor } = result;

  const badgeBg =
    riskColor === 'emerald'
      ? 'bg-emerald-500 text-white'
      : riskColor === 'amber'
      ? 'bg-amber-500 text-white'
      : 'bg-rose-500 text-white';

  return (
    <>
      {/* Floating Bottom Bar on Mobile/Tablet (< lg) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 p-3 px-4 shadow-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shadow-sm ${badgeBg}`}>
            {probabilityPct}%
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-white">{riskLevel}</span>
              {isLive && (
                <span className="inline-flex items-center gap-1 text-[9px] font-medium text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Live
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Tap to inspect full clinical readout</p>
          </div>
        </div>

        <button
          onClick={onOpen}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-sky-500/20 cursor-pointer"
        >
          <span>View Report</span>
          <ChevronUp className="w-4 h-4" />
        </button>
      </div>

      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="lg:hidden fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-50 cursor-pointer"
          />
        )}
      </AnimatePresence>

      {/* Slide-up Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 220 }}
            className="lg:hidden fixed inset-x-0 bottom-0 max-h-[88vh] z-50 bg-white dark:bg-slate-900 rounded-t-3xl shadow-2xl flex flex-col border-t border-slate-200 dark:border-slate-800"
          >
            {/* Grab Handle Header */}
            <div className="px-5 pt-3 pb-2 flex flex-col items-center border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div className="w-12 h-1.5 bg-slate-300 dark:bg-slate-700 rounded-full mb-3" />
              <div className="w-full flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Heart className="w-4 h-4 text-sky-500" />
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    Clinical Stratification Report
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {onPrint && (
                    <button
                      onClick={onPrint}
                      className="text-xs px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                    >
                      Print
                    </button>
                  )}
                  <button
                    onClick={onClose}
                    className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 overflow-y-auto scrollbar-thin space-y-4">
              <RiskOutputCard
                result={result}
                isCalculating={isCalculating}
                isLive={isLive}
                onPrintReport={onPrint}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
