import React from 'react';
import { motion } from 'framer-motion';
import { Target, CheckCircle2, AlertCircle, ShieldCheck, Award, Zap } from 'lucide-react';

export default function PerformanceMetricCards({ metrics }) {
  const isEcg = metrics.id === "ecg-arrhythmia";

  const cards = [
    {
      title: "Test Accuracy",
      score: `${(metrics.testAccuracy * 100).toFixed(2)}%`,
      decimal: metrics.testAccuracy.toFixed(4),
      description: isEcg
        ? "Percentage of individual cardiac cycles (N=21,892 test beats) correctly classified across 5 AAMI morphology types."
        : "Overall proportion of correct risk stratifications across healthy and high-risk patients on unseen data.",
      icon: Target,
      lightBg: "bg-emerald-500/10 border-emerald-500/20 text-emerald-600 dark:text-emerald-400",
      subLabel: isEcg ? "MIT-BIH Arrhythmia Benchmark" : "Tabular Clinical Benchmark"
    },
    {
      title: "Precision (PPV)",
      score: `${(metrics.testPrecision * 100).toFixed(2)}%`,
      decimal: metrics.testPrecision.toFixed(4),
      description: isEcg
        ? "When an arrhythmia (PVC/SVEB/Fusion) is flagged on the ECG, it is genuine in over 98.3% of detections."
        : "When the model flags a patient as high CVD risk, it is correct nearly 75% of the time.",
      icon: Award,
      lightBg: "bg-sky-500/10 border-sky-500/20 text-sky-600 dark:text-sky-400",
      subLabel: "Minimizes false alarms"
    },
    {
      title: "Recall / Sensitivity",
      score: `${(metrics.testRecall * 100).toFixed(2)}%`,
      decimal: metrics.testRecall.toFixed(4),
      description: isEcg
        ? "Proportion of all abnormal ECG beats successfully captured without letting critical arrhythmias go undetected."
        : "Proportion of all actual CVD patients identified, minimizing missed clinical diagnoses.",
      icon: CheckCircle2,
      lightBg: "bg-teal-500/10 border-teal-500/20 text-teal-600 dark:text-teal-400",
      subLabel: "True Positive detection rate"
    },
    {
      title: "Specificity (TNR)",
      score: `${(metrics.testSpecificity * 100).toFixed(2)}%`,
      decimal: metrics.testSpecificity.toFixed(4),
      description: isEcg
        ? "Ability to distinguish healthy normal sinus rhythm beats without triggering erroneous alarms."
        : "Proportion of healthy patients correctly classified as low risk without unnecessary anxiety.",
      icon: ShieldCheck,
      lightBg: "bg-indigo-500/10 border-indigo-500/20 text-indigo-600 dark:text-indigo-400",
      subLabel: "True Negative recognition"
    },
    {
      title: isEcg ? "Weighted F1-Score" : "F1-Score",
      score: `${(metrics.testF1Score * 100).toFixed(2)}%`,
      decimal: metrics.testF1Score.toFixed(4),
      description: "Harmonic mean of Precision and Recall, proving balanced performance across all target classes.",
      icon: Zap,
      lightBg: "bg-violet-500/10 border-violet-500/20 text-violet-600 dark:text-violet-400",
      subLabel: "Harmonic balanced metric"
    },
    {
      title: "ROC-AUC Score",
      score: metrics.testRocAuc.toFixed(4),
      decimal: `${(metrics.testRocAuc * 100).toFixed(1)}% AUC`,
      description: isEcg
        ? "Area Under the ROC Curve for multi-class ECG classification across varying decision thresholds."
        : "Discriminative ability to differentiate between high-risk and low-risk cardiovascular patients.",
      icon: AlertCircle,
      lightBg: "bg-rose-500/10 border-rose-500/20 text-rose-600 dark:text-rose-400",
      subLabel: "Threshold-independent power"
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.title}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.05 }}
            className="p-5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.lightBg}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>

              <div className="flex items-baseline gap-2 mb-2">
                <span className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
                  {card.score}
                </span>
                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                  ({card.decimal})
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                {card.description}
              </p>
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
              <span className="font-medium">{card.subLabel}</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-700/60 font-mono">
                N={metrics.testSamples.toLocaleString()}
              </span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
