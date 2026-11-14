import React from 'react';
import { Cpu, Database, GitBranch, Calendar, Filter, Layers, CheckCircle2 } from 'lucide-react';

export default function ModelInformation({ metrics }) {
  const isEcg = metrics.id === "ecg-arrhythmia";

  const specs = [
    { label: "Core Model Algorithm", value: metrics.modelName, icon: Cpu },
    { label: "Architecture", value: metrics.architecture, icon: Layers },
    { label: "Dataset Benchmark", value: metrics.datasetName, icon: Database },
    { label: "Training Split", value: `${metrics.trainSamples.toLocaleString()} samples (80%)`, icon: GitBranch },
    { label: "Held-Out Test Split", value: `${metrics.testSamples.toLocaleString()} samples (20%)`, icon: GitBranch },
    { label: "Validation Strategy", value: metrics.cvStrategy, icon: CheckCircle2 },
    { label: "Input Dimensionality", value: `${metrics.numberOfFeatures} ${isEcg ? 'Time-Series Wave Samples' : 'Biomarkers & Engineered Ratios'}`, icon: Filter },
    { label: "Decision Threshold", value: metrics.classificationThreshold, icon: Filter },
    { label: "Model Artifact & Version", value: `v${metrics.version} (${metrics.evaluationDate})`, icon: Calendar },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 shadow-xs">
      <div className="mb-4">
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          Model Specifications & Provenance
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Architecture, dataset splits, and validation strategy loaded from model artifacts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {specs.map((spec) => {
          const Icon = spec.icon;
          return (
            <div
              key={spec.label}
              className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-700/60 flex items-start gap-3"
            >
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-600 dark:text-sky-400 mt-0.5">
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <span className="text-[11px] font-medium text-slate-400 block truncate">
                  {spec.label}
                </span>
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block break-words mt-0.5">
                  {spec.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
