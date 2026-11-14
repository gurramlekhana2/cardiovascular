import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Info, CheckCircle2, Activity } from 'lucide-react';

export default function ConfusionMatrix({ metrics }) {
  const isEcg = metrics.id === "ecg-arrhythmia";
  const { tp, tn, fp, fn, totalPatients, actualPositive, actualNegative } = metrics.confusionMatrix;
  const [activeCell, setActiveCell] = useState(null);

  const cellDetails = {
    tp: {
      title: isEcg ? "True Positive (Arrhythmia Detected)" : "True Positive (TP)",
      count: tp.toLocaleString(),
      pct: `${((tp / actualPositive) * 100).toFixed(2)}% of actual events`,
      interpretation: isEcg
        ? "Correctly Identified Arrhythmic Beats: Heartbeats with true electrophysiological abnormalities (PVC, SVEB, Fusion) accurately caught by the model."
        : "Correctly Identified High Risk: Patients with confirmed cardiovascular disease that the model accurately detected and stratified.",
      color: "bg-emerald-500/15 border-emerald-500/40 text-emerald-800 dark:text-emerald-300",
      type: "True Detection"
    },
    tn: {
      title: isEcg ? "True Negative (Normal Sinus Rhythm)" : "True Negative (TN)",
      count: tn.toLocaleString(),
      pct: `${((tn / actualNegative) * 100).toFixed(2)}% of normal baseline`,
      interpretation: isEcg
        ? "Correctly Identified Normal Beats: Regular sinus rhythm beats recognized without false alarms."
        : "Correctly Identified Low Risk: Clinically normal individuals without CVD that the model accurately preserved as low risk.",
      color: "bg-teal-500/15 border-teal-500/40 text-teal-800 dark:text-teal-300",
      type: "True Detection"
    },
    fp: {
      title: "False Positive (FP - Type I Error)",
      count: fp.toLocaleString(),
      pct: `${((fp / actualNegative) * 100).toFixed(2)}% of normal baseline`,
      interpretation: isEcg
        ? "Artifact / False Alarm: Normal heartbeat classified as an arrhythmia. At 140 out of 18,118 beats (<0.8%), the model maintains extremely low false alarm rates."
        : "False Alarm: Healthy patients predicted as high risk. Leads to cautionary lifestyle recommendations and secondary testing.",
      color: "bg-amber-500/15 border-amber-500/40 text-amber-800 dark:text-amber-300",
      type: "Type I Error"
    },
    fn: {
      title: "False Negative (FN - Type II Error)",
      count: fn.toLocaleString(),
      pct: `${((fn / actualPositive) * 100).toFixed(2)}% of actual events`,
      interpretation: isEcg
        ? "Missed Arrhythmia: Abnormal rhythm beat misclassified as normal. Only 102 beats missed out of 3,774 actual events."
        : "Missed Risk: CVD patients classified as low risk. The clinical priority is driving this number down through threshold optimization.",
      color: "bg-rose-500/15 border-rose-500/40 text-rose-800 dark:text-rose-300",
      type: "Type II Error"
    }
  };

  return (
    <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Confusion Matrix (Held-Out Test Set)
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              N = {totalPatients.toLocaleString()} {isEcg ? "Beats" : "Patients"}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEcg
              ? "Multi-class diagnostic cross-tabulation for heartbeat morphology classification on the MIT-BIH test partition."
              : "Diagnostic cross-tabulation comparing actual clinical patient diagnoses vs. model predictions."}
          </p>
        </div>
        <span className="text-xs font-medium text-slate-400">Decision Threshold: 0.50</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
        {/* Heatmap Matrix Display */}
        <div className="lg:col-span-7">
          <div className="relative pt-6 pl-14 pr-2 pb-2">
            {/* Top Header: Predicted */}
            <div className="text-center font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 mb-2">
              Predicted {isEcg ? "Rhythm Class" : "Risk Class"}
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              <span>Predicted {isEcg ? "Normal (N)" : "Healthy (0)"}</span>
              <span>Predicted {isEcg ? "Arrhythmia" : "CVD (1)"}</span>
            </div>

            {/* Left Header: Actual */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 -rotate-90 text-center font-bold text-xs uppercase tracking-wider text-slate-600 dark:text-slate-300 w-28 -ml-6">
              Actual Class
            </div>

            {/* Matrix Rows */}
            <div className="space-y-2">
              {/* Row 1: Actual Normal */}
              <div className="flex items-center gap-2">
                <span className="w-16 text-[11px] font-semibold text-slate-500 text-right">
                  {isEcg ? "Normal (N)" : "Healthy"}
                </span>
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {/* True Negative */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveCell('tn')}
                    className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${cellDetails.tn.color} ${activeCell === 'tn' ? 'ring-2 ring-teal-500' : ''}`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider">True Negative</div>
                    <div className="text-2xl font-black mt-1">{tn.toLocaleString()}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{((tn / totalPatients) * 100).toFixed(2)}% of test set</div>
                  </motion.div>

                  {/* False Positive */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveCell('fp')}
                    className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${cellDetails.fp.color} ${activeCell === 'fp' ? 'ring-2 ring-amber-500' : ''}`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider">False Positive</div>
                    <div className="text-2xl font-black mt-1">{fp.toLocaleString()}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{((fp / totalPatients) * 100).toFixed(2)}% of test set</div>
                  </motion.div>
                </div>
              </div>

              {/* Row 2: Actual Abnormal */}
              <div className="flex items-center gap-2">
                <span className="w-16 text-[11px] font-semibold text-slate-500 text-right">
                  {isEcg ? "Arrhythmia" : "CVD High"}
                </span>
                <div className="grid grid-cols-2 gap-2 flex-1">
                  {/* False Negative */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveCell('fn')}
                    className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${cellDetails.fn.color} ${activeCell === 'fn' ? 'ring-2 ring-rose-500' : ''}`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider">False Negative</div>
                    <div className="text-2xl font-black mt-1">{fn.toLocaleString()}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{((fn / totalPatients) * 100).toFixed(2)}% of test set</div>
                  </motion.div>

                  {/* True Positive */}
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setActiveCell('tp')}
                    className={`p-4 rounded-xl border text-center cursor-pointer transition-all ${cellDetails.tp.color} ${activeCell === 'tp' ? 'ring-2 ring-emerald-500' : ''}`}
                  >
                    <div className="text-[11px] font-bold uppercase tracking-wider">True Positive</div>
                    <div className="text-2xl font-black mt-1">{tp.toLocaleString()}</div>
                    <div className="text-[10px] opacity-80 mt-0.5">{((tp / totalPatients) * 100).toFixed(2)}% of test set</div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>

          {/* If ECG, show morphological class breakdown */}
          {isEcg && metrics.classes && (
            <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/60">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block mb-2">
                AAMI EC57 Morphological Breakdown ({metrics.testSamples.toLocaleString()} Test Beats)
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {metrics.classes.map((c) => (
                  <div key={c.code} className="p-2 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block">{c.name}</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">{c.accuracy}</span>
                    <span className="text-[10px] text-slate-500 block">{c.count.toLocaleString()} beats</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selected Cell Interpretation Box */}
        <div className="lg:col-span-5 p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-700/80">
          {activeCell ? (
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
                  {cellDetails[activeCell].type}
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                  {cellDetails[activeCell].pct}
                </span>
              </div>
              <h4 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {cellDetails[activeCell].title}: {cellDetails[activeCell].count}
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-2 leading-relaxed">
                {cellDetails[activeCell].interpretation}
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                <Info className="w-3.5 h-3.5" />
                <span>Interactive Matrix Inspection</span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Click any cell in the 2×2 matrix (TP, TN, FP, or FN) to examine its exact diagnostic implication, error trade-offs, and percentage proportion.
              </p>
              <div className="mt-3 pt-3 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1">
                <div>• <strong>Sensitivity (Recall)</strong> = TP / (TP + FN) = <strong>{(metrics.testRecall * 100).toFixed(2)}%</strong></div>
                <div>• <strong>Specificity</strong> = TN / (TN + FP) = <strong>{(metrics.testSpecificity * 100).toFixed(2)}%</strong></div>
                <div>• <strong>Precision (PPV)</strong> = TP / (TP + FP) = <strong>{(metrics.testPrecision * 100).toFixed(2)}%</strong></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
