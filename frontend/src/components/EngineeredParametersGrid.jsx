import React from 'react';
import { motion } from 'framer-motion';
import { Scale, HeartPulse, Gauge, Info } from 'lucide-react';

export default function EngineeredParametersGrid({ features }) {
  if (!features) return null;

  const { bmi, pulsePressure, map, bpCategory, bpColor, bmiCategory, bmiColor } = features;

  const cards = [
    {
      title: "Body Mass Index (BMI)",
      value: `${bmi}`,
      unit: "kg/m²",
      badge: bmiCategory,
      badgeColor: bmiColor,
      desc: "Anthropometric body composition ratio.",
      icon: Scale,
      normalRange: "18.5 – 24.9 kg/m²",
      ratio: Math.min(100, Math.max(0, ((bmi - 15) / 25) * 100))
    },
    {
      title: "Pulse Pressure (PP)",
      value: `${pulsePressure}`,
      unit: "mmHg",
      badge: pulsePressure > 50 ? "Elevated Stiffening" : "Optimal Elasticity",
      badgeColor: pulsePressure > 50 ? "text-amber-700 bg-amber-50 border-amber-200" : "text-emerald-700 bg-emerald-50 border-emerald-200",
      desc: "Systolic minus diastolic pressure. Reflects arterial compliance.",
      icon: HeartPulse,
      normalRange: "30 – 50 mmHg",
      ratio: Math.min(100, Math.max(0, ((pulsePressure - 20) / 60) * 100))
    },
    {
      title: "Mean Arterial Pressure (MAP)",
      value: `${map}`,
      unit: "mmHg",
      badge: map > 105 ? "High Workload" : (map < 70 ? "Low Perfusion" : "Balanced Perfusion"),
      badgeColor: (map > 105 || map < 70) ? "text-amber-700 bg-amber-50 border-amber-200" : "text-emerald-700 bg-emerald-50 border-emerald-200",
      desc: "Average arterial perfusion pressure during a complete cardiac cycle.",
      icon: Gauge,
      normalRange: "70 – 105 mmHg",
      ratio: Math.min(100, Math.max(0, ((map - 60) / 60) * 100))
    },
    {
      title: "AHA Blood Pressure Staging",
      value: bpCategory,
      unit: "",
      badge: "Clinical Guideline",
      badgeColor: bpColor,
      desc: "American Heart Association categorical hemodynamic classification.",
      icon: HeartPulse,
      normalRange: "Target: < 120/80 mmHg",
      ratio: bpCategory === "Normal" ? 25 : (bpCategory.includes("Stage 1") ? 60 : 90)
    }
  ];

  return (
    <div className="mt-8 pt-8 border-t border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Engineered Physiological Parameters</span>
            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-sky-100 text-sky-800">
              Domain-Specific Features
            </span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time computed hemodynamic indices derived to eliminate target leakage and bolster model fidelity.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={idx}
              whileHover={{ y: -3 }}
              className="p-4 rounded-xl bg-white/90 border border-slate-200/80 shadow-xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-semibold text-slate-600 leading-tight">
                    {card.title}
                  </span>
                  <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 shrink-0">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <div className="flex items-baseline gap-1 my-1">
                  <span className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {card.value}
                  </span>
                  {card.unit && (
                    <span className="text-xs font-medium text-slate-500">{card.unit}</span>
                  )}
                </div>

                <div className="mt-1">
                  <span className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-md border ${card.badgeColor}`}>
                    {card.badge}
                  </span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="w-full bg-slate-100 rounded-full h-1.5 mb-2 overflow-hidden">
                  <div
                    className="bg-sky-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${card.ratio}%` }}
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Norm: {card.normalRange}</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
