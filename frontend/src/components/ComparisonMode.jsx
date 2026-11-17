import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeftRight,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Minus,
  CheckCircle2,
  Lock,
  Unlock,
  RotateCcw,
  Sliders
} from 'lucide-react';
import { fetchModelPrediction } from '../modelUtils';

export default function ComparisonMode({ currentInputs, onApplyScenario }) {
  const [isOpen, setIsOpen] = useState(false);
  const [baselineInputs, setBaselineInputs] = useState(null);
  const [scenarioInputs, setScenarioInputs] = useState(null);
  const [baseResult, setBaseResult] = useState(null);
  const [scenResult, setScenResult] = useState(null);
  const [isComparing, setIsComparing] = useState(false);

  // Initialize or lock baseline
  const handleLockBaseline = async () => {
    setBaselineInputs({ ...currentInputs });
    setScenarioInputs({ ...currentInputs });
    setIsComparing(true);
    try {
      const res = await fetchModelPrediction(currentInputs);
      setBaseResult(res);
      setScenResult(res);
    } catch (err) {
      console.error('Comparison baseline prediction error:', err);
    } finally {
      setIsComparing(false);
    }
  };

  const handleResetComparison = async () => {
    setScenarioInputs({ ...currentInputs });
    setIsComparing(true);
    try {
      const res = await fetchModelPrediction(currentInputs);
      setScenResult(res);
    } catch (err) {
      console.error('Reset scenario prediction error:', err);
    } finally {
      setIsComparing(false);
    }
  };

  // Preset quick intervention triggers
  const handlePreset = async (changes) => {
    const updated = scenarioInputs ? { ...scenarioInputs, ...changes } : { ...currentInputs, ...changes };
    if (!baselineInputs) {
      setBaselineInputs({ ...currentInputs });
    }
    setScenarioInputs(updated);
    setIsComparing(true);
    try {
      const [resBase, resScen] = await Promise.all([
        baseResult ? Promise.resolve(baseResult) : fetchModelPrediction(currentInputs),
        fetchModelPrediction(updated)
      ]);
      setBaseResult(resBase);
      setScenResult(resScen);
    } catch (err) {
      console.error('Scenario preset prediction error:', err);
    } finally {
      setIsComparing(false);
    }
  };

  const deltaPct = baseResult && scenResult ? scenResult.probabilityPct - baseResult.probabilityPct : 0;

  return (
    <div className="mt-8 rounded-3xl overflow-hidden border border-sky-100 dark:border-slate-800 bg-gradient-to-r from-sky-500/5 via-indigo-500/5 to-purple-500/5 dark:from-slate-900/60 dark:to-slate-900/60 p-5 sm:p-6 transition-all">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
            <ArrowLeftRight className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              Clinical What-If / Scenario Comparison Mode
              <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-indigo-100 text-indigo-700 dark:bg-indigo-900/50 dark:text-indigo-300">
                Interactive
              </span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Lock the current patient profile as baseline and simulate lifestyle or therapeutic interventions.
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (!isOpen && !baselineInputs) {
              handleLockBaseline();
            }
            setIsOpen(prev => !prev);
          }}
          className="px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-500/20 shrink-0"
        >
          <Sliders className="w-3.5 h-3.5" />
          {isOpen ? 'Close What-If Studio' : 'Launch What-If Comparison'}
        </button>
      </div>

      <AnimatePresence>
        {isOpen && baselineInputs && scenarioInputs && baseResult && scenResult && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.35, ease: 'easeInOut' }}
            className="mt-6 pt-6 border-t border-slate-200/80 dark:border-slate-800 space-y-6"
          >
            {/* Quick intervention presets */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mr-1">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                Simulate Habit & Factor Changes:
              </span>
              <button
                type="button"
                onClick={() => handlePreset({ smoke: 1 })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  scenarioInputs.smoke === 1
                    ? 'bg-rose-500 text-white border-rose-500 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-rose-200 dark:border-rose-900/60 hover:border-rose-500 text-rose-600 dark:text-rose-400'
                }`}
              >
                🚬 Start / Increase Smoking
              </button>
              <button
                type="button"
                onClick={() => handlePreset({ smoke: 0 })}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  scenarioInputs.smoke === 0
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-emerald-500 text-slate-700 dark:text-slate-200'
                }`}
              >
                🚭 Smoking Cessation
              </button>
              <button
                type="button"
                onClick={() => handlePreset({ active: 1 })}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-500 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                🏃 Physical Activity
              </button>
              <button
                type="button"
                onClick={() => handlePreset({ ap_hi: Math.min(scenarioInputs.ap_hi, 120), ap_lo: Math.min(scenarioInputs.ap_lo, 80) })}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-500 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                🩺 Normalize BP (&le;120/80)
              </button>
              <button
                type="button"
                onClick={() => handlePreset({ ap_hi: Math.max(scenarioInputs.ap_hi, 145), ap_lo: Math.max(scenarioInputs.ap_lo, 95) })}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-white dark:bg-slate-800 border-amber-200 dark:border-amber-900/50 hover:border-amber-500 text-amber-600 dark:text-amber-400 transition-all cursor-pointer"
              >
                ⚠️ Escalate to Hypertension
              </button>
              <button
                type="button"
                onClick={() => handlePreset({ cholesterol: 1, gluc: 1 })}
                className="px-3 py-1.5 rounded-lg text-xs font-medium border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-sky-500 text-slate-700 dark:text-slate-200 transition-all cursor-pointer"
              >
                🥗 Optimize Biomarkers
              </button>
              <button
                type="button"
                onClick={handleResetComparison}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 transition-all cursor-pointer flex items-center gap-1 ml-auto"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Scenario
              </button>
            </div>

            {/* Comparison Cards: Baseline vs Scenario vs Delta */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Baseline Card */}
              <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Lock className="w-3 h-3" /> Baseline Profile
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    baseResult.riskColor === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                    baseResult.riskColor === 'amber' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                  }`}>
                    {baseResult.riskLevel}
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-white tabular-nums">
                  {baseResult.probabilityPct}%
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  BP: {baselineInputs.ap_hi}/{baselineInputs.ap_lo} mmHg &bull; BMI: {(baselineInputs.weight / ((baselineInputs.height / 100) ** 2)).toFixed(1)} &bull; Smoker: {baselineInputs.smoke ? 'Yes' : 'No'}
                </p>
              </div>

              {/* Scenario Card */}
              <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-indigo-200 dark:border-indigo-800 shadow-sm shadow-indigo-500/10">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
                    <Unlock className="w-3 h-3" /> Simulated Scenario
                  </span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                    scenResult.riskColor === 'emerald' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' :
                    scenResult.riskColor === 'amber' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300' :
                    'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-300'
                  }`}>
                    {scenResult.riskLevel}
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400 tabular-nums">
                  {scenResult.probabilityPct}%
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  BP: {scenarioInputs.ap_hi}/{scenarioInputs.ap_lo} mmHg &bull; BMI: {(scenarioInputs.weight / ((scenarioInputs.height / 100) ** 2)).toFixed(1)} &bull; Smoker: {scenarioInputs.smoke ? 'Yes' : 'No'}
                </p>
              </div>

              {/* Delta Card */}
              <div className={`p-4 rounded-2xl border flex flex-col justify-between ${
                deltaPct < 0
                  ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200'
                  : deltaPct > 0
                  ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200'
                  : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider block mb-1">
                    Risk Probability Shift (&Delta;)
                  </span>
                  <div className="flex items-center gap-2">
                    {deltaPct < 0 ? (
                      <TrendingDown className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                    ) : deltaPct > 0 ? (
                      <TrendingUp className="w-7 h-7 text-rose-600 dark:text-rose-400" />
                    ) : (
                      <Minus className="w-7 h-7 text-slate-500" />
                    )}
                    <span className="text-3xl font-extrabold tabular-nums">
                      {deltaPct > 0 ? `+${deltaPct}%` : `${deltaPct}%`}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-xs font-semibold">
                  {deltaPct < 0 ? (
                    <span className="text-emerald-700 dark:text-emerald-300">
                      ✓ Risk reduced by {Math.abs(deltaPct)}% with proposed interventions.
                    </span>
                  ) : deltaPct > 0 ? (
                    <span className="text-rose-700 dark:text-rose-300">
                      ⚠ Risk increases by {deltaPct}% under these conditions.
                    </span>
                  ) : (
                    <span>No net delta from baseline.</span>
                  )}
                </div>
              </div>
            </div>

            {/* Interactive sliders for fine-grained scenario tweaking */}
            <div className="bg-white/80 dark:bg-slate-800/80 p-4 rounded-2xl border border-slate-200/90 dark:border-slate-700">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-3">
                Fine-tune What-If Parameters
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                {/* Systolic BP */}
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Systolic BP:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{scenarioInputs.ap_hi} mmHg</span>
                  </div>
                  <input
                    type="range"
                    min="90"
                    max="200"
                    value={scenarioInputs.ap_hi}
                    onChange={(e) => setScenarioInputs(prev => ({ ...prev, ap_hi: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Diastolic BP */}
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Diastolic BP:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{scenarioInputs.ap_lo} mmHg</span>
                  </div>
                  <input
                    type="range"
                    min="60"
                    max="130"
                    value={scenarioInputs.ap_lo}
                    onChange={(e) => setScenarioInputs(prev => ({ ...prev, ap_lo: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Weight */}
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Weight:</span>
                    <span className="font-bold text-slate-900 dark:text-white">{scenarioInputs.weight} kg</span>
                  </div>
                  <input
                    type="range"
                    min="45"
                    max="140"
                    value={scenarioInputs.weight}
                    onChange={(e) => setScenarioInputs(prev => ({ ...prev, weight: Number(e.target.value) }))}
                    className="w-full"
                  />
                </div>

                {/* Smoking Habit Toggle */}
                <div>
                  <div className="flex justify-between font-medium mb-1">
                    <span className="text-slate-600 dark:text-slate-400">Smoking Habit:</span>
                    <span className={`font-bold ${scenarioInputs.smoke ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {scenarioInputs.smoke ? 'Active Smoker' : 'Non-Smoker'}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setScenarioInputs(prev => ({ ...prev, smoke: prev.smoke === 1 ? 0 : 1 }))}
                    className={`w-full py-1.5 px-3 rounded-lg border font-semibold text-xs transition-all cursor-pointer ${
                      scenarioInputs.smoke === 1
                        ? 'bg-rose-500 text-white border-rose-500'
                        : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300'
                    }`}
                  >
                    {scenarioInputs.smoke === 1 ? '🚬 Active Smoker (Click to Stop)' : '🚭 Non-Smoker (Click to Start)'}
                  </button>
                </div>

                {/* Multi-Horizon Risk Comparison (5-Yr, 10-Yr, 30-Yr) */}
                <div className="sm:col-span-2 lg:col-span-4 mt-2 p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700">
                  <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 uppercase tracking-wider flex items-center justify-between">
                    <span>Dynamic Multi-Horizon Impact Projection</span>
                    <span className="text-[10px] lowercase text-slate-400">5-yr vs 10-yr vs 30-yr</span>
                  </div>
                  <div className="grid grid-cols-3 gap-3 text-center">
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500">5-Year Risk</div>
                      <div className="text-xs font-semibold text-slate-400 line-through">
                        {Math.max(1, Math.round(baseResult.probabilityPct * 0.48))}%
                      </div>
                      <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                        {Math.max(1, Math.round(scenResult.probabilityPct * 0.48))}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500">10-Year Risk</div>
                      <div className="text-xs font-semibold text-slate-400 line-through">
                        {baseResult.probabilityPct}%
                      </div>
                      <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                        {scenResult.probabilityPct}%
                      </div>
                    </div>
                    <div className="p-2 rounded-lg bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
                      <div className="text-[10px] text-slate-500">30-Year Risk</div>
                      <div className="text-xs font-semibold text-slate-400 line-through">
                        {Math.min(99, Math.round(baseResult.probabilityPct * 2.3 + 4))}%
                      </div>
                      <div className="text-sm font-extrabold text-indigo-600 dark:text-indigo-400">
                        {Math.min(99, Math.round(scenResult.probabilityPct * 2.3 + 4))}%
                      </div>
                    </div>
                  </div>
                </div>

                {/* Apply button */}
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() => onApplyScenario?.(scenarioInputs)}
                    className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white rounded-xl font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 shadow-sm text-xs"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Apply to Main Assessment
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
