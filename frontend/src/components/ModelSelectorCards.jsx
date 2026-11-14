import React from 'react';
import { motion } from 'framer-motion';
import { Activity, Heart, ShieldCheck, CheckCircle2, ChevronRight, Sparkles } from 'lucide-react';
import { ECG_MODEL_METRICS, CVD_MODEL_METRICS } from '../utils/modelEvaluation';

export default function ModelSelectorCards({ selectedModelId, onSelectModel }) {
  const models = [
    {
      id: ECG_MODEL_METRICS.id,
      title: "ECG Arrhythmia Classifier",
      badge: "Primary Diagnostic Model",
      badgeColor: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border-emerald-500/30",
      accuracy: `${(ECG_MODEL_METRICS.testAccuracy * 100).toFixed(2)}%`,
      accuracyLabel: "Test Accuracy",
      domain: "Electrophysiology / Signal AI",
      dataset: "MIT-BIH Arrhythmia Database",
      testSamples: `${ECG_MODEL_METRICS.testSamples.toLocaleString()} test beats`,
      icon: Activity,
      accentBorder: "border-emerald-500/40 hover:border-emerald-500",
      activeRing: "ring-2 ring-emerald-500 shadow-lg shadow-emerald-500/10",
      description: "Classifies single-lead ECG wave morphologies (Normal, PVC, Fusion, Supraventricular) with state-of-the-art 98.43% precision.",
      highlight: "High-Precision Signal Model"
    },
    {
      id: CVD_MODEL_METRICS.id,
      title: "Cardiovascular Risk Classifier",
      badge: "Lifestyle & Biomarker Model",
      badgeColor: "bg-sky-500/15 text-sky-700 dark:text-sky-300 border-sky-500/30",
      accuracy: `${(CVD_MODEL_METRICS.testAccuracy * 100).toFixed(2)}%`,
      accuracyLabel: "Test Accuracy",
      domain: "Tabular Clinical Risk Scoring",
      dataset: "Cardiovascular 70k Cohort",
      testSamples: `${CVD_MODEL_METRICS.testSamples.toLocaleString()} test patients`,
      icon: Heart,
      accentBorder: "border-sky-500/40 hover:border-sky-500",
      activeRing: "ring-2 ring-sky-500 shadow-lg shadow-sky-500/10",
      description: "Predicts 5-yr, 10-yr, and 30-yr risk from patient biomarkers (BP, Age, BMI, Cholesterol) with 0.80 ROC-AUC.",
      highlight: "Clinical Population Model"
    }
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Select Evaluation Target
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          Switch models to inspect respective confusion matrices & ROC curves
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {models.map((m) => {
          const isSelected = selectedModelId === m.id;
          const Icon = m.icon;
          return (
            <motion.div
              key={m.id}
              whileHover={{ y: -2 }}
              onClick={() => onSelectModel(m.id)}
              className={`p-5 rounded-2xl cursor-pointer transition-all border bg-white/90 dark:bg-slate-800/80 ${
                isSelected
                  ? `${m.activeRing} ${m.accentBorder} bg-gradient-to-br from-white to-slate-50 dark:from-slate-800 dark:to-slate-850`
                  : 'border-slate-200/90 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl border ${
                    m.id === ECG_MODEL_METRICS.id 
                      ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' 
                      : 'bg-sky-500/10 text-sky-600 border-sky-500/20'
                  }`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                      {m.title}
                      {isSelected && (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                      )}
                    </h3>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {m.domain}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-2xl font-black text-slate-900 dark:text-slate-100">
                    {m.accuracy}
                  </div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                    {m.accuracyLabel}
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-4">
                {m.description}
              </p>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-700/60 flex items-center justify-between text-xs">
                <span className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${m.badgeColor}`}>
                  {m.badge}
                </span>
                <span className="font-mono text-[11px] text-slate-500 dark:text-slate-400">
                  {m.testSamples}
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
