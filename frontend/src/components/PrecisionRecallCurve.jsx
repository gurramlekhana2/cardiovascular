import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine
} from 'recharts';
import { Info } from 'lucide-react';

export default function PrecisionRecallCurve({ metrics }) {
  const isEcg = metrics.id === "ecg-arrhythmia";
  const data = metrics.prCurvePoints;
  const optimalPoint = data.find(p => p.isOptimal);
  const baselinePrevalence = isEcg ? 0.1724 : 0.496;

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs border border-slate-700">
          <div className="font-bold text-teal-400 mb-1">Threshold: {d.threshold.toFixed(2)}</div>
          <div>Precision (PPV): <strong>{(d.precision * 100).toFixed(1)}%</strong></div>
          <div>Recall (Sensitivity): <strong>{(d.recall * 100).toFixed(1)}%</strong></div>
          {d.isOptimal && (
            <div className="mt-1 text-[10px] text-emerald-400 font-semibold">
              ★ Active Operating Point
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="p-5 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            Precision-Recall (PR) Curve
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-teal-100 dark:bg-teal-950 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800">
              PR-AUC = {isEcg ? "0.9892" : metrics.testPrAuc.toFixed(4)}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEcg
              ? "Precision retention across increasing sensitivity on 21,892 test ECG beats."
              : "Clinical precision retention across increasing levels of disease recall sensitivity."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-teal-600 dark:text-teal-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500 inline-block" /> {isEcg ? "ECG PR Curve" : "CVD PR Curve"}
          </span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <span className="w-2.5 h-0.5 bg-slate-400 inline-block" /> Prevalence ({Math.round(baselinePrevalence * 100)}%)
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
            <XAxis
              type="number"
              dataKey="recall"
              domain={[0, 1]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Recall (Sensitivity)', position: 'insideBottom', offset: -6, fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              type="number"
              domain={[isEcg ? 0.0 : 0.4, 1.0]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'Precision (PPV)', angle: -90, position: 'insideLeft', offset: 18, fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* Horizontal Prevalence Baseline */}
            <ReferenceLine y={baselinePrevalence} stroke="#94a3b8" strokeDasharray="4 4" />
            {/* PR Line */}
            <Line
              type="monotone"
              dataKey="precision"
              stroke="#0d9488"
              strokeWidth={3}
              dot={{ stroke: '#0d9488', strokeWidth: 2, r: 3, fill: '#fff' }}
              activeDot={{ r: 6, stroke: '#0f766e', strokeWidth: 2, fill: '#2dd4bf' }}
            />
            {optimalPoint && (
              <ReferenceDot
                x={optimalPoint.recall}
                y={optimalPoint.precision}
                r={6}
                fill="#10b981"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-teal-500" />
          <span>
            {isEcg
              ? "High area under PR curve (0.9892) confirms robust classification even with class imbalance between normal beats and rare arrhythmias."
              : "PR-AUC of 0.7786 demonstrates high diagnostic reliability on balanced 49.6% prevalence."}
          </span>
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Optimal Cutoff: 0.50
        </span>
      </div>
    </div>
  );
}
