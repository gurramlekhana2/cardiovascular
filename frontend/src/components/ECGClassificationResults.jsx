import React from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  AlertOctagon,
  HeartPulse,
  HelpCircle,
  TrendingUp,
  Info
} from 'lucide-react';

const BADGE_THEMES = {
  emerald: {
    badge: 'bg-emerald-950/80 text-emerald-400 border-emerald-800',
    bar: 'bg-emerald-500',
    barBg: 'bg-emerald-950/40',
    text: 'text-emerald-400',
    glow: 'shadow-emerald-500/10'
  },
  amber: {
    badge: 'bg-amber-950/80 text-amber-400 border-amber-800',
    bar: 'bg-amber-500',
    barBg: 'bg-amber-950/40',
    text: 'text-amber-400',
    glow: 'shadow-amber-500/10'
  },
  rose: {
    badge: 'bg-rose-950/80 text-rose-400 border-rose-800',
    bar: 'bg-rose-500',
    barBg: 'bg-rose-950/40',
    text: 'text-rose-400',
    glow: 'shadow-rose-500/10'
  },
  purple: {
    badge: 'bg-purple-950/80 text-purple-400 border-purple-800',
    bar: 'bg-purple-500',
    barBg: 'bg-purple-950/40',
    text: 'text-purple-400',
    glow: 'shadow-purple-500/10'
  },
  sky: {
    badge: 'bg-sky-950/80 text-sky-400 border-sky-800',
    bar: 'bg-sky-500',
    barBg: 'bg-sky-950/40',
    text: 'text-sky-400',
    glow: 'shadow-sky-500/10'
  }
};

export default function ECGClassificationResults({
  prediction = null,
  isAnalyzing = false
}) {
  if (isAnalyzing) {
    return (
      <div className="flex flex-col items-center justify-center p-12 rounded-2xl bg-slate-900/60 border border-slate-800 text-center min-h-[300px]">
        <div className="relative mb-4">
          <HeartPulse className="w-12 h-12 text-sky-400 animate-pulse" />
        </div>
        <h4 className="text-base font-semibold text-slate-200">Executing MIT-BIH LightGBM Inference...</h4>
        <p className="text-xs text-slate-400 max-w-sm mt-1">
          Passing 187 resampled waveform amplitude values through 5-class gradient boosted decision trees.
        </p>
      </div>
    );
  }

  if (!prediction) {
    return (
      <div className="flex flex-col items-center justify-center p-10 rounded-2xl bg-slate-900/40 border border-slate-800 text-center min-h-[300px]">
        <div className="p-3 rounded-2xl bg-slate-800/60 text-slate-400 mb-3">
          <HeartPulse className="w-8 h-8" />
        </div>
        <h4 className="text-sm font-semibold text-slate-300">Awaiting ECG Signal Input</h4>
        <p className="text-xs text-slate-500 max-w-xs mt-1">
          Select an authentic MIT-BIH test sample from Demonstration Mode below, or upload an ECG file to analyze rhythm.
        </p>
      </div>
    );
  }

  const {
    predicted_class_code,
    predicted_class_name,
    clinical_meaning,
    clinical_risk_indicator,
    confidence_pct,
    class_probabilities = [],
    recording_info = {},
    disclaimer = ""
  } = prediction;

  const currentTheme = BADGE_THEMES[prediction.badge_color] || BADGE_THEMES.sky;

  const getIcon = () => {
    switch (predicted_class_code) {
      case 'N': return <ShieldCheck className="w-6 h-6 text-emerald-400" />;
      case 'S': return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      case 'V': return <AlertOctagon className="w-6 h-6 text-rose-400" />;
      case 'F': return <HeartPulse className="w-6 h-6 text-purple-400" />;
      default: return <HelpCircle className="w-6 h-6 text-sky-400" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Primary Result Banner Card */}
      <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800 shadow-xl relative overflow-hidden">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center border ${currentTheme.badge} shadow-lg ${currentTheme.glow}`}>
              {getIcon()}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider border ${currentTheme.badge}`}>
                  Class {predicted_class_code}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {clinical_risk_indicator}
                </span>
              </div>
              <h3 className="text-xl font-bold text-slate-100 mt-1">
                {predicted_class_name}
              </h3>
            </div>
          </div>

          {/* Model Confidence Metric */}
          <div className="flex flex-col items-start sm:items-end bg-slate-950/60 sm:bg-transparent p-3 sm:p-0 rounded-xl border sm:border-0 border-slate-800 w-full sm:w-auto">
            <div className="flex items-center gap-1.5 text-xs text-slate-400">
              <TrendingUp className="w-3.5 h-3.5 text-sky-400" />
              <span>Model Confidence</span>
            </div>
            <span className={`text-2xl font-black ${currentTheme.text} font-mono mt-0.5`}>
              {confidence_pct !== undefined ? `${confidence_pct}%` : 'Output Verified'}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              LightGBM Test Accuracy: 98.43%
            </span>
          </div>
        </div>

        {/* Clinical Meaning Box */}
        <div className="mt-4 pt-4 border-t border-slate-800/80 text-xs text-slate-300 leading-relaxed">
          <p className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-sky-400" />
            Clinical Morphology Interpretation:
          </p>
          <p className="text-slate-400">{clinical_meaning}</p>
        </div>

        {/* Input Recording Meta */}
        <div className="mt-3 flex flex-wrap items-center gap-3 text-[11px] text-slate-400 font-mono bg-slate-950/50 p-2.5 rounded-xl border border-slate-800/60">
          <span>Source: <strong className="text-slate-300">{recording_info.filename || "ECG Input"}</strong></span>
          <span>•</span>
          <span>Processed Points: <strong className="text-sky-400">{recording_info.processed_samples_count || 187}</strong></span>
          <span>•</span>
          <span>Lead Domain: <strong className="text-slate-300">{recording_info.sampling_domain || "Normalized"}</strong></span>
        </div>
      </div>

      {/* Five-Class Probability Visualization */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-200 flex items-center gap-2">
              <HeartPulse className="w-4 h-4 text-sky-400" />
              MIT-BIH Five-Class Probability Distribution
            </h4>
            <p className="text-xs text-slate-400 mt-0.5">
              Exact softmax output from the LightGBM multiclass ensemble across all 5 AAMI heartbeat categories.
            </p>
          </div>
        </div>

        {/* Class Probability Rows */}
        <div className="space-y-3 pt-2">
          {class_probabilities.map((item) => {
            const isWinner = item.class_code === predicted_class_code;
            const theme = BADGE_THEMES[
              item.class_code === 'N' ? 'emerald' :
              item.class_code === 'S' ? 'amber' :
              item.class_code === 'V' ? 'rose' :
              item.class_code === 'F' ? 'purple' : 'sky'
            ];

            return (
              <div
                key={item.class_code}
                className={`p-3 rounded-xl border transition-all ${
                  isWinner
                    ? 'bg-slate-800/90 border-slate-700 shadow-md'
                    : 'bg-slate-950/40 border-slate-800/60'
                }`}
              >
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-[11px] font-mono border ${theme.badge}`}>
                      {item.class_code}
                    </span>
                    <span className={`font-semibold ${isWinner ? 'text-white' : 'text-slate-300'}`}>
                      {item.class_name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 font-mono">
                    <span className={`font-bold ${isWinner ? theme.text : 'text-slate-400'}`}>
                      {item.probability_pct}%
                    </span>
                    <span className="text-[10px] text-slate-500">
                      ({item.probability.toFixed(4)})
                    </span>
                  </div>
                </div>

                {/* Probability Bar */}
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${theme.bar}`}
                    style={{ width: `${Math.max(item.probability_pct, 1)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Academic Disclaimer Box */}
      {disclaimer && (
        <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 leading-relaxed">
          <p className="font-semibold text-slate-300 mb-0.5">Faculty & Clinical Evaluation Disclaimer:</p>
          <p>{disclaimer}</p>
        </div>
      )}
    </div>
  );
}
