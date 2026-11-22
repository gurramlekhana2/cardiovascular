import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  XCircle,
  Sparkles,
  Info,
  ChevronRight,
  Database,
  ArrowRight
} from 'lucide-react';

export default function ECGDemonstrationMode({
  demoSamples = [],
  onSelectSample,
  activeSampleId = null,
  onAnalyzeActiveSample,
  prediction = null,
  isAnalyzing = false
}) {
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  const filteredSamples = selectedFilter === 'ALL'
    ? demoSamples
    : demoSamples.filter((s) => s.class_code === selectedFilter);

  const activeSample = demoSamples.find((s) => s.id === activeSampleId) || demoSamples[0];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-5 rounded-2xl bg-gradient-to-r from-sky-950/40 via-blue-950/30 to-indigo-950/20 border border-sky-800/40">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-400">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Interactive Academic Demonstration Mode
            </span>
          </div>
          <h3 className="text-lg font-bold text-slate-100 mt-1">
            MIT-BIH Arrhythmia Database Ground-Truth Verification
          </h3>
          <p className="text-xs text-slate-400 mt-0.5 max-w-2xl">
            Select authentic, untouched test heartbeats from the 21,892 test samples. Verify waveform morphology, execute the trained LightGBM model, and directly compare the predicted label against ground truth.
          </p>
        </div>

        {/* Demo Execution Pipeline Badge */}
        <div className="hidden lg:flex items-center gap-2 text-[10px] font-mono bg-slate-900/90 p-2.5 rounded-xl border border-slate-800 text-slate-400">
          <span className="text-sky-400">MIT-BIH Beat</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="text-cyan-400">Waveform</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="text-indigo-400">LightGBM</span>
          <ArrowRight className="w-3 h-3 text-slate-600" />
          <span className="text-emerald-400">Actual vs Pred</span>
        </div>
      </div>

      {/* Class Filter Pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1.5">
          <Database className="w-3.5 h-3.5" />
          Filter Samples:
        </span>
        {['ALL', 'N', 'S', 'V', 'F', 'Q'].map((code) => (
          <button
            key={code}
            onClick={() => setSelectedFilter(code)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
              selectedFilter === code
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-800/70 hover:bg-slate-700 text-slate-300'
            }`}
          >
            {code === 'ALL' ? 'All 5 Classes (11 Samples)' : `Class ${code}`}
          </button>
        ))}
      </div>

      {/* Sample Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filteredSamples.map((sample) => {
          const isSelected = sample.id === activeSampleId;
          const badgeColor =
            sample.class_code === 'N' ? 'text-emerald-400 border-emerald-800 bg-emerald-950/60' :
            sample.class_code === 'S' ? 'text-amber-400 border-amber-800 bg-amber-950/60' :
            sample.class_code === 'V' ? 'text-rose-400 border-rose-800 bg-rose-950/60' :
            sample.class_code === 'F' ? 'text-purple-400 border-purple-800 bg-purple-950/60' :
            'text-sky-400 border-sky-800 bg-sky-950/60';

          return (
            <div
              key={sample.id}
              onClick={() => onSelectSample(sample)}
              className={`p-4 rounded-xl border transition-all cursor-pointer text-left flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800/90 border-sky-500 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-2 py-0.5 rounded-md text-[11px] font-bold font-mono border ${badgeColor}`}>
                      {sample.class_code}
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {sample.label}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-slate-500">
                    Row #{sample.row_in_test}
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {sample.description}
                </p>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-slate-500">
                  Ground Truth: <strong className="text-slate-300">Class {sample.class_code}</strong>
                </span>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectSample(sample);
                    if (onAnalyzeActiveSample) {
                      onAnalyzeActiveSample(sample);
                    }
                  }}
                  disabled={isAnalyzing}
                  className="px-2.5 py-1 rounded-lg bg-sky-500/20 hover:bg-sky-500 text-sky-400 hover:text-white transition font-semibold text-[11px] flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Test Beat</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Ground Truth vs Actual Prediction Audit Card */}
      {activeSample && prediction && (
        <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <Info className="w-4 h-4 text-sky-400" />
              Faculty Demonstration Evaluation: Ground-Truth vs Model Prediction
            </h4>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 1. Actual Label */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                1. Dataset Ground-Truth Label
              </span>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-sm text-slate-200 font-mono">
                  {activeSample.class_code}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{activeSample.label}</p>
                  <p className="text-[10px] text-slate-500">MIT-BIH Test Split (Row #{activeSample.row_in_test})</p>
                </div>
              </div>
            </div>

            {/* 2. Model Prediction */}
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800">
              <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">
                2. LightGBM Model Output
              </span>
              <div className="flex items-center gap-2 mt-2">
                <span className="w-8 h-8 rounded-lg bg-sky-950 text-sky-400 border border-sky-800 flex items-center justify-center font-bold text-sm font-mono">
                  {prediction.predicted_class_code}
                </span>
                <div>
                  <p className="text-xs font-semibold text-slate-200">{prediction.predicted_class_name}</p>
                  <p className="text-[10px] text-slate-500">Confidence: {prediction.confidence_pct}%</p>
                </div>
              </div>
            </div>

            {/* 3. Match Verification */}
            {(() => {
              const isMatch = activeSample.class_code === prediction.predicted_class_code;
              return (
                <div className={`p-4 rounded-xl border ${isMatch ? 'bg-emerald-950/30 border-emerald-800/60' : 'bg-amber-950/30 border-amber-800/60'}`}>
                  <span className="text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                    3. Academic Match Result
                  </span>
                  <div className="flex items-center gap-2 mt-2">
                    {isMatch ? (
                      <>
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-emerald-300">Exact Prediction Match</p>
                          <p className="text-[10px] text-emerald-400/80">Trained LightGBM model correctly classified beat.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <XCircle className="w-6 h-6 text-amber-400 shrink-0" />
                        <div>
                          <p className="text-xs font-bold text-amber-300">Misclassification Discrepancy</p>
                          <p className="text-[10px] text-amber-400/80">Reflects real test error (1.57% test error rate).</p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}
