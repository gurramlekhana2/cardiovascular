import React, { useState } from 'react';
import ModelSelectorCards from './ModelSelectorCards';
import PerformanceMetricCards from './PerformanceMetricCards';
import ConfusionMatrix from './ConfusionMatrix';
import ROCCurve from './ROCCurve';
import PrecisionRecallCurve from './PrecisionRecallCurve';
import ModelEvaluationSummary from './ModelEvaluationSummary';
import ModelInformation from './ModelInformation';
import { ECG_MODEL_METRICS, CVD_MODEL_METRICS } from '../utils/modelEvaluation';
import { ShieldCheck, ArrowLeft } from 'lucide-react';

export default function ModelPerformanceDashboard({ onBackToHome }) {
  // Default to the 98.43% ECG Arrhythmia Classifier as requested
  const [selectedModelId, setSelectedModelId] = useState(ECG_MODEL_METRICS.id);

  const activeMetrics = selectedModelId === ECG_MODEL_METRICS.id ? ECG_MODEL_METRICS : CVD_MODEL_METRICS;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <button
            onClick={onBackToHome}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline mb-2 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to Clinical Assessment</span>
          </button>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2.5">
            Model Performance & Validation
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {activeMetrics.modelName}
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-3xl">
            Multimodal evaluation framework: select between the high-precision <strong>ECG Arrhythmia Classifier (98.43%)</strong> and the clinical <strong>Cardiovascular Risk Model (73.01%)</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="px-3 py-1.5 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4" />
            <span>Verified Test Results</span>
          </div>
        </div>
      </div>

      {/* 1. Model Selector Section with Two Separate Cards */}
      <ModelSelectorCards
        selectedModelId={selectedModelId}
        onSelectModel={setSelectedModelId}
      />

      {/* 2. Core Performance Metric Cards for the Selected Model */}
      <PerformanceMetricCards metrics={activeMetrics} />

      {/* 3. Confusion Matrix Heatmap for the Selected Model */}
      <ConfusionMatrix metrics={activeMetrics} />

      {/* 4. ROC Curve & Precision-Recall Curve Side by Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ROCCurve metrics={activeMetrics} />
        <PrecisionRecallCurve metrics={activeMetrics} />
      </div>

      {/* 5. Model Evaluation Summary & Clinical Scope */}
      <ModelEvaluationSummary metrics={activeMetrics} />

      {/* 6. Dataset & Model Provenance */}
      <ModelInformation metrics={activeMetrics} />
    </div>
  );
}
