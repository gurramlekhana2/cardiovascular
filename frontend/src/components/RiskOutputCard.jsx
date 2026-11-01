import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  AlertTriangle,
  CheckCircle,
  TrendingUp,
  Activity,
  ShieldAlert,
  AlertCircle,
  Bug,
  Zap,
  Download
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

// ─── Animated number counter hook ──────────────────────────────────────────
function useCountUp(target, duration = 900) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(target);
  const animFrameRef = useRef(null);

  useEffect(() => {
    const startVal = prevTarget.current;
    prevTarget.current = target;
    const startTime = performance.now();

    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(startVal + (target - startVal) * eased));
      if (progress < 1) {
        animFrameRef.current = requestAnimationFrame(animate);
      }
    };

    animFrameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animFrameRef.current);
  }, [target, duration]);

  return count;
}

export default function RiskOutputCard({ result, isCalculating, isLive, onPrintReport }) {
  if (isCalculating) {
    return (
      <div className="flex flex-col items-center justify-center p-12 min-h-[460px] text-center">
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.8, 1, 0.8] }}
          transition={{ repeat: Infinity, duration: 1.1, ease: "easeInOut" }}
          className="w-20 h-20 rounded-full bg-rose-50 dark:bg-rose-900/30 text-rose-500 flex items-center justify-center shadow-lg shadow-rose-500/20 mb-6"
        >
          <Heart className="w-10 h-10 fill-current" />
        </motion.div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-1">
          Evaluating Multi-Parametric Inference...
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm">
          Calculating hemodynamic variables, physiological ratios, and machine learning risk probabilities.
        </p>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="flex flex-col items-center justify-center p-8 sm:p-12 min-h-[460px] text-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500/10 to-blue-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center mb-5 shadow-sm">
          <Activity className="w-8 h-8" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold text-sky-700 bg-sky-50 dark:text-sky-300 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800 mb-3">
          <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
          Ready for Assessment
        </div>
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-2">
          No Analysis Generated Yet
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs leading-relaxed mb-6">
          Enter or adjust patient biomarkers in the assessment wizard, then click <strong className="text-sky-600 dark:text-sky-400 font-semibold">"Calculate CVD Risk Score"</strong> to generate your risk analysis, radar chart, and SHAP factor breakdown.
        </p>
        <div className="w-full max-w-xs p-3.5 rounded-xl bg-slate-50/80 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700/80 text-left">
          <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-500" /> Quick Start
          </div>
          <p className="text-[10px] text-slate-500 dark:text-slate-400">
            Step 1: Demographics & Anthropometrics<br/>
            Step 2: Hemodynamics & Vitals<br/>
            Step 3: Laboratory & Lifestyle Flags
          </p>
        </div>
      </div>
    );
  }

  const { probabilityPct, riskLevel, riskColor, riskSummary, featureContributions, recommendations } = result;

  const colorStyles = {
    emerald: {
      text: 'text-emerald-600',
      bgLight: 'bg-emerald-50 dark:bg-emerald-900/20',
      border: 'border-emerald-200 dark:border-emerald-700',
      stroke: '#059669',
      badge: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-800/30 dark:text-emerald-300 dark:border-emerald-700',
      icon: CheckCircle
    },
    amber: {
      text: 'text-amber-600',
      bgLight: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-700',
      stroke: '#d97706',
      badge: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-800/30 dark:text-amber-300 dark:border-amber-700',
      icon: AlertTriangle
    },
    rose: {
      text: 'text-rose-600',
      bgLight: 'bg-rose-50 dark:bg-rose-900/20',
      border: 'border-rose-200 dark:border-rose-700',
      stroke: '#e11d48',
      badge: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-800/30 dark:text-rose-300 dark:border-rose-700',
      icon: ShieldAlert
    }
  }[riskColor] || {
    text: 'text-sky-600',
    bgLight: 'bg-sky-50 dark:bg-sky-900/20',
    border: 'border-sky-200 dark:border-sky-700',
    stroke: '#0284c7',
    badge: 'bg-sky-100 text-sky-800 border-sky-200',
    icon: Activity
  };

  const StatusIcon = colorStyles.icon;

  // Circular gauge SVG
  const radius = 64;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (probabilityPct / 100) * circumference;

  // Animated counter
  const animatedPct = useCountUp(probabilityPct);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.35 }}
      className="space-y-5"
    >
      {/* Live indicator badge */}
      {isLive && (
        <div className="flex items-center gap-1.5 justify-end">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Live Preview</span>
        </div>
      )}

      {/* Top Main Risk Card */}
      <div className={`p-5 rounded-2xl ${colorStyles.bgLight} border ${colorStyles.border} transition-all duration-500`}>
        <div className="flex flex-col sm:flex-row items-center gap-5">
          {/* Animated Circular Gauge */}
          <div className="relative flex items-center justify-center shrink-0">
            <svg className="w-36 h-36 -rotate-90 transform">
              <circle cx="72" cy="72" r={radius} stroke="#e2e8f0" strokeWidth="11" fill="transparent" />
              <motion.circle
                cx="72" cy="72" r={radius}
                stroke={colorStyles.stroke}
                strokeWidth="11"
                strokeDasharray={circumference}
                initial={{ strokeDashoffset: circumference }}
                animate={{ strokeDashoffset }}
                transition={{ duration: 1.0, ease: "easeOut" }}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className={`text-3xl font-extrabold ${colorStyles.text} tracking-tight tabular-nums`}>
                {animatedPct}%
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400">
                Probability
              </span>
            </div>
          </div>

          {/* Risk Level Info */}
          <div className="text-center sm:text-left flex-1">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border mb-2 uppercase tracking-wider ${colorStyles.badge}`}>
              <StatusIcon className="w-3.5 h-3.5" />
              <span>{riskLevel}</span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 leading-tight">
              {riskLevel === "Low Risk" ? "Favorable Vascular Profile"
                : riskLevel === "Moderate Risk" ? "Borderline Hemodynamic Risk"
                : "Elevated Risk Stratification"}
            </h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 leading-relaxed">{riskSummary}</p>

            <div className="mt-3 flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 dark:text-slate-400">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> &lt;30% Low</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> 30-60% Moderate</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500" /> &gt;60% High</span>
            </div>
          </div>
        </div>
      </div>

      {/* SHAP Feature Contribution Chart */}
      <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 shadow-xs">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              Feature Contribution Analysis (SHAP)
              <TrendingUp className="w-4 h-4 text-sky-500" />
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">Relative biomarker contribution to CVD probability.</p>
          </div>
          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">XAI</span>
        </div>
        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart layout="vertical" data={featureContributions} margin={{ top: 4, right: 18, left: 8, bottom: 4 }}>
              <XAxis type="number" domain={[-15, 25]} tick={{ fontSize: 10, fill: '#64748b' }} unit="%" />
              <YAxis type="category" dataKey="feature" tick={{ fontSize: 9.5, fill: '#334155' }} width={145} />
              <Tooltip
                formatter={(val) => [`${val > 0 ? '+' : ''}${val}% impact`, 'Risk Attribution']}
                contentStyle={{ backgroundColor: '#0f172a', color: '#fff', borderRadius: '8px', fontSize: '11px', border: 'none' }}
              />
              <ReferenceLine x={0} stroke="#94a3b8" strokeDasharray="3 3" />
              <Bar dataKey="impact" radius={[4, 4, 4, 4]}>
                {featureContributions.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={entry.impact > 0 ? '#f43f5e' : '#10b981'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Actionable Insights */}
      <div className="p-4 rounded-2xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/90 dark:border-slate-700 shadow-xs">
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 mb-3">Actionable Guidance & Preventive Protocol</h4>
        <div className="space-y-2">
          {recommendations.map((rec, idx) => (
            <div key={idx} className="p-2.5 rounded-xl bg-slate-50/80 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 flex items-start gap-3 text-xs">
              <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${rec.type === 'critical' ? 'bg-rose-500' : rec.type === 'warning' ? 'bg-amber-500' : 'bg-sky-500'}`} />
              <div>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{rec.title}: </span>
                <span className="text-slate-600 dark:text-slate-400">{rec.desc}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Print / Export Report Button */}
      {onPrintReport && (
        <button
          type="button"
          onClick={onPrintReport}
          className="w-full py-3 px-4 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 bg-gradient-to-r from-sky-600 to-blue-600 hover:from-sky-500 hover:to-blue-500 text-white shadow-md shadow-sky-500/25 transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-sky-100" />
          <span>Download Clinical PDF Report</span>
        </button>
      )}
    </motion.div>
  );
}
