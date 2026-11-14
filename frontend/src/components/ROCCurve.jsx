import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot
} from 'recharts';
import { Info } from 'lucide-react';

export default function ROCCurve({ metrics }) {
  const isEcg = metrics.id === "ecg-arrhythmia";
  const data = metrics.rocCurvePoints;
  const optimalPoint = data.find(p => p.isOptimal);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const d = payload[0].payload;
      return (
        <div className="p-3 bg-slate-900 text-white rounded-xl shadow-xl text-xs border border-slate-700">
          <div className="font-bold text-sky-400 mb-1">Operating Threshold: {d.threshold.toFixed(2)}</div>
          <div>True Positive Rate (Sensitivity): <strong>{(d.tpr * 100).toFixed(2)}%</strong></div>
          <div>False Positive Rate (1 - Specificity): <strong>{(d.fpr * 100).toFixed(2)}%</strong></div>
          {d.isOptimal && (
            <div className="mt-1 text-[10px] text-emerald-400 font-semibold">
              ★ Active Operating Cutoff
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
            Receiver Operating Characteristic (ROC)
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              ROC-AUC = {metrics.testRocAuc.toFixed(4)}
            </span>
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {isEcg
              ? "Area under ROC curve for MIT-BIH arrhythmia detection vs normal sinus rhythm."
              : "True positive rate versus false positive rate across all discrimination thresholds."}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="flex items-center gap-1 text-sky-600 dark:text-sky-400 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500 inline-block" /> {isEcg ? "ECG Classifier (0.9968)" : "LightGBM (0.7997)"}
          </span>
          <span className="flex items-center gap-1 text-slate-400 font-medium">
            <span className="w-2.5 h-0.5 bg-slate-400 inline-block" /> Chance (0.50)
          </span>
        </div>
      </div>

      <div className="h-64 sm:h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" opacity={0.2} />
            <XAxis
              type="number"
              dataKey="fpr"
              domain={[0, 1]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -6, fontSize: 11, fill: '#64748b' }}
            />
            <YAxis
              type="number"
              domain={[0, 1]}
              tick={{ fontSize: 11, fill: '#64748b' }}
              label={{ value: 'True Positive Rate (Recall)', angle: -90, position: 'insideLeft', offset: 18, fontSize: 11, fill: '#64748b' }}
            />
            <Tooltip content={<CustomTooltip />} />
            {/* 45-degree Chance Line */}
            <Line
              type="monotone"
              dataKey="baseline"
              stroke="#94a3b8"
              strokeDasharray="4 4"
              dot={false}
              isAnimationActive={false}
            />
            {/* Model ROC Line */}
            <Line
              type="monotone"
              dataKey="tpr"
              stroke={isEcg ? "#10b981" : "#0284c7"}
              strokeWidth={3}
              dot={{ stroke: isEcg ? "#10b981" : "#0284c7", strokeWidth: 2, r: 3, fill: '#fff' }}
              activeDot={{ r: 6, stroke: isEcg ? "#059669" : "#0369a1", strokeWidth: 2, fill: '#38bdf8' }}
            />
            {optimalPoint && (
              <ReferenceDot
                x={optimalPoint.fpr}
                y={optimalPoint.tpr}
                r={6}
                fill="#f59e0b"
                stroke="#fff"
                strokeWidth={2}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-700/60 flex flex-wrap items-center justify-between text-xs text-slate-500 gap-2">
        <div className="flex items-center gap-1.5">
          <Info className="w-3.5 h-3.5 text-sky-500" />
          <span>
            {isEcg
              ? "Amber dot indicates active threshold = 0.50 with 97.3% sensitivity and <0.8% false positive rate."
              : "Amber dot indicates active threshold = 0.50 with 68.4% sensitivity and 22.5% false positive rate."}
          </span>
        </div>
        <span className="font-semibold text-slate-700 dark:text-slate-300">
          Target: {metrics.datasetName}
        </span>
      </div>
    </div>
  );
}
