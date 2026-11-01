import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, HeartPulse, Activity, HelpCircle,
  ChevronRight, ChevronLeft, CheckCircle2, Sparkles, RotateCcw, BookOpen
} from 'lucide-react';
import ReferenceRangesPanel from './ReferenceRangesPanel';

export default function AssessmentWizard({ inputs, setInputs, onCalculate, isCalculating, referenceRanges }) {
  const [currentStep, setCurrentStep] = useState(1);
  const [hoveredTooltip, setHoveredTooltip] = useState(null);
  const [showRanges, setShowRanges] = useState(false);

  const totalSteps = 3;

  const updateInput = (key, value) => setInputs(prev => ({ ...prev, [key]: value }));
  const handleNext = () => { if (currentStep < totalSteps) setCurrentStep(currentStep + 1); };
  const handleBack = () => { if (currentStep > 1) setCurrentStep(currentStep - 1); };

  const resetForm = () => {
    setInputs({ age: 52, gender: 2, height: 168, weight: 74, ap_hi: 130, ap_lo: 85, cholesterol: 2, gluc: 1, smoke: 0, alco: 0, active: 1 });
    setCurrentStep(1);
  };

  const Tooltip = ({ id, text, children }) => (
    <div className="relative inline-flex">
      <div
        onMouseEnter={() => setHoveredTooltip(id)}
        onMouseLeave={() => setHoveredTooltip(null)}
        className="cursor-pointer"
      >
        {children}
      </div>
      <AnimatePresence>
        {hoveredTooltip === id && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            className="absolute left-6 -top-1 z-30 w-56 p-2.5 text-xs bg-slate-900 dark:bg-slate-700 text-white rounded-xl shadow-xl pointer-events-none"
          >
            {text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  const SliderInput = ({ id, label, tooltip, value, min, max, unit, onChange, color, markers }) => (
    <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">{label}</label>
          {tooltip && (
            <Tooltip id={id} text={tooltip}>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400 hover:text-sky-600" />
            </Tooltip>
          )}
        </div>
        <div>
          <span className={`text-base font-bold ${color || 'text-sky-600'}`}>{value}</span>
          {unit && <span className="text-xs text-slate-500 dark:text-slate-400 ml-1">{unit}</span>}
        </div>
      </div>
      <input
        type="range" min={min} max={max} value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 bg-slate-200 dark:bg-slate-600 rounded-lg cursor-pointer accent-sky-500"
      />
      {markers && (
        <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-500 mt-1">
          {markers.map((m, i) => <span key={i}>{m}</span>)}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full">
      {/* Header + Stepper Tabs */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200/80 dark:border-slate-700">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-sky-500" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Clinical Parameter Assessment
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Step {currentStep} of {totalSteps} — Structured physiological intake
          </p>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          {[
            { step: 1, label: "Demographics", icon: User },
            { step: 2, label: "Hemodynamics", icon: HeartPulse },
            { step: 3, label: "Lifestyle & Bio", icon: Activity },
          ].map(({ step, label, icon: Icon }) => {
            const isActive = currentStep === step;
            const isCompleted = currentStep > step;
            return (
              <button
                key={step}
                onClick={() => setCurrentStep(step)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive ? 'bg-sky-600 text-white shadow-md shadow-sky-500/20'
                  : isCompleted ? 'bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300 hover:bg-sky-100'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-200/70'
                }`}
              >
                {isCompleted
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  : <Icon className="w-3.5 h-3.5" />}
                <span className="hidden md:inline">{label}</span>
                <span className="md:hidden">{step}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Step Content */}
      <AnimatePresence mode="wait">
        {/* ── STEP 1: DEMOGRAPHICS ── */}
        {currentStep === 1 && (
          <motion.div key="step1" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.22 }} className="space-y-5">
            <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-300 flex items-center justify-between">
              <span>Demographics establish baseline metabolic & anthropometric expectations.</span>
              <span className="font-bold text-sky-700 dark:text-sky-400">1 / 3</span>
            </div>

            {/* Age Slider */}
            <SliderInput
              id="age" label="Age"
              tooltip="Chronological age in completed years. Primary predictor of arterial stiffening and CVD event probability."
              value={inputs.age} min={18} max={90} unit="years"
              onChange={(v) => updateInput('age', v)}
              markers={['18 yrs', '54 yrs', '90 yrs']}
            />

            {/* Gender — 3-option selector (Female / Male / Other) */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-semibold text-slate-800 dark:text-slate-200">Biological Sex / Gender</label>
                <span className="text-[10px] px-1.5 py-0.5 bg-sky-50 dark:bg-sky-900/30 text-sky-700 dark:text-sky-400 rounded font-medium border border-sky-200 dark:border-sky-800">Dataset Class</span>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 1, label: "Female", emoji: "♀" },
                  { val: 2, label: "Male",   emoji: "♂" },
                  { val: 3, label: "Other",  emoji: "⚧" },
                ].map(item => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => updateInput('gender', item.val)}
                    className={`py-2.5 px-3 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                      inputs.gender === item.val
                        ? 'bg-sky-500 text-white border-sky-500 shadow-md shadow-sky-500/20'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span className="text-base leading-none">{item.emoji}</span>
                    <span>{item.label}</span>
                  </button>
                ))}
              </div>
              {inputs.gender === 3 && (
                <p className="mt-2 text-[10px] text-slate-500 dark:text-slate-400 italic">
                  Note: Model uses female-equivalent baseline for 'Other' gender classification.
                </p>
              )}
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SliderInput
                id="height" label="Height" value={inputs.height} min={130} max={210} unit="cm"
                onChange={(v) => updateInput('height', v)}
                markers={['130 cm', '170 cm', '210 cm']}
              />
              <SliderInput
                id="weight" label="Weight" value={inputs.weight} min={40} max={160} unit="kg"
                onChange={(v) => updateInput('weight', v)}
                markers={['40 kg', '100 kg', '160 kg']}
              />
            </div>
          </motion.div>
        )}

        {/* ── STEP 2: HEMODYNAMICS ── */}
        {currentStep === 2 && (
          <motion.div key="step2" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.22 }} className="space-y-5">
            <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-300 flex items-center justify-between">
              <span>Arterial hemodynamics are the highest-impact CVD risk indicators.</span>
              <span className="font-bold text-sky-700 dark:text-sky-400">2 / 3</span>
            </div>

            <SliderInput
              id="ap_hi" label="Systolic Blood Pressure (ap_hi)"
              tooltip="Peak arterial pressure during cardiac contraction (systole). Normal is < 120 mmHg. Values ≥ 130 indicate elevated risk."
              value={inputs.ap_hi} min={80} max={200} unit="mmHg"
              color={inputs.ap_hi >= 140 ? 'text-rose-600' : inputs.ap_hi >= 130 ? 'text-amber-600' : 'text-sky-600'}
              onChange={(v) => updateInput('ap_hi', v)}
              markers={['80 (Low)', '120 (Normal)', '140 (HTN)', '200 mmHg']}
            />

            <SliderInput
              id="ap_lo" label="Diastolic Blood Pressure (ap_lo)"
              tooltip="Minimum arterial pressure between heartbeats (diastole). Normal is < 80 mmHg. Values ≥ 90 indicate Stage 2 Hypertension."
              value={inputs.ap_lo} min={50} max={130} unit="mmHg"
              color={inputs.ap_lo >= 90 ? 'text-rose-600' : inputs.ap_lo >= 80 ? 'text-amber-600' : 'text-sky-600'}
              onChange={(v) => updateInput('ap_lo', v)}
              markers={['50 mmHg', '80 (Normal)', '90 (Stage 2)', '130 mmHg']}
            />

            {inputs.ap_hi <= inputs.ap_lo && (
              <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-900/25 border border-rose-200 dark:border-rose-700 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                ⚠️ Systolic BP must be greater than Diastolic BP.
              </div>
            )}

            {/* Live BP Classification badge */}
            {inputs.ap_hi > inputs.ap_lo && (
              <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-600 dark:text-slate-400 font-medium">Current AHA Classification:</span>
                <span className={`font-bold ${
                  inputs.ap_hi > 180 || inputs.ap_lo > 120 ? 'text-rose-700' :
                  inputs.ap_hi >= 140 || inputs.ap_lo >= 90 ? 'text-rose-600' :
                  inputs.ap_hi >= 130 || inputs.ap_lo >= 80 ? 'text-amber-600' :
                  inputs.ap_hi >= 120 ? 'text-sky-600' : 'text-emerald-600'
                }`}>
                  {inputs.ap_hi > 180 || inputs.ap_lo > 120 ? '🔴 Hypertensive Crisis' :
                   inputs.ap_hi >= 140 || inputs.ap_lo >= 90 ? '🔴 Stage 2 Hypertension' :
                   inputs.ap_hi >= 130 || inputs.ap_lo >= 80 ? '🟡 Stage 1 Hypertension' :
                   inputs.ap_hi >= 120 ? '🔵 Elevated BP' : '🟢 Normal'}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* ── STEP 3: LIFESTYLE & BIO ── */}
        {currentStep === 3 && (
          <motion.div key="step3" initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 15 }} transition={{ duration: 0.22 }} className="space-y-5">
            <div className="p-3.5 rounded-xl bg-sky-50/70 dark:bg-sky-900/20 border border-sky-100 dark:border-sky-800 text-xs text-sky-900 dark:text-sky-300 flex items-center justify-between">
              <span>Metabolic biomarkers & lifestyle habits calibrate individual risk trajectories.</span>
              <span className="font-bold text-sky-700 dark:text-sky-400">3 / 3</span>
            </div>

            {/* Cholesterol */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 block mb-2.5">Cholesterol Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 1, label: "Normal", desc: "< 200 mg/dL", color: 'emerald' },
                  { val: 2, label: "Above Normal", desc: "200–239", color: 'amber' },
                  { val: 3, label: "Well Above", desc: "≥ 240 mg/dL", color: 'rose' },
                ].map(item => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => updateInput('cholesterol', item.val)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      inputs.cholesterol === item.val
                        ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Glucose */}
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700">
              <label className="text-sm font-semibold text-slate-800 dark:text-slate-200 block mb-2.5">Fasting Glucose Level</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { val: 1, label: "Normal", desc: "< 100 mg/dL" },
                  { val: 2, label: "Above Normal", desc: "100–125" },
                  { val: 3, label: "Well Above", desc: "≥ 126 mg/dL" },
                ].map(item => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => updateInput('gluc', item.val)}
                    className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                      inputs.gluc === item.val
                        ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-600'
                    }`}
                  >
                    <div className="text-xs font-semibold">{item.label}</div>
                    <div className="text-[10px] opacity-70 mt-0.5">{item.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Lifestyle Toggles */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { key: 'smoke', label: 'Smoking', on: 'Smoker', off: 'Non-Smoker', onColor: 'bg-rose-500', offColor: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-700' },
                { key: 'alco', label: 'Alcohol', on: 'Regular', off: 'Minimal / No', onColor: 'bg-amber-500', offColor: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600' },
                { key: 'active', label: 'Physical Activity', on: 'Active', off: 'Sedentary', onColor: 'bg-emerald-600', offColor: 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-600' },
              ].map(({ key, label, on, off, onColor, offColor }) => (
                <div key={key} className="p-3 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/80 dark:border-slate-700 flex flex-col gap-2">
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">{label}</span>
                  <button
                    type="button"
                    onClick={() => updateInput(key, inputs[key] === 1 ? 0 : 1)}
                    className={`py-2 px-2 rounded-lg text-xs font-semibold transition-all cursor-pointer border flex items-center justify-center gap-1.5 ${
                      inputs[key] === 1 ? `${onColor} text-white border-transparent` : offColor
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${inputs[key] === 1 ? 'bg-white' : 'bg-current opacity-60'}`} />
                    {inputs[key] === 1 ? on : off}
                  </button>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Navigation Buttons ── */}
      <div className="mt-7 pt-5 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {currentStep > 1 && (
            <button type="button" onClick={handleBack}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 cursor-pointer transition-all"
            >
              <ChevronLeft className="w-4 h-4" /> Previous
            </button>
          )}
          <button type="button" onClick={resetForm}
            title="Reset to clinical defaults"
            className="p-2.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 cursor-pointer transition-all"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Reference Ranges Toggle */}
          <button type="button" onClick={() => setShowRanges(v => !v)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer ${showRanges ? 'bg-sky-100 dark:bg-sky-900/40 text-sky-700 dark:text-sky-300' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}`}
            title="Toggle WHO/AHA Reference Ranges"
          >
            <BookOpen className="w-4 h-4" />
          </button>
        </div>

        <div>
          {currentStep < totalSteps ? (
            <button type="button" onClick={handleNext}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 shadow-md shadow-sky-500/20 cursor-pointer transition-all"
            >
              Next Step <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              id="calculate-risk-btn"
              type="button"
              disabled={isCalculating || inputs.ap_hi <= inputs.ap_lo}
              onClick={onCalculate}
              className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white transition-all cursor-pointer ${
                isCalculating ? 'bg-sky-400 cursor-wait'
                : inputs.ap_hi <= inputs.ap_lo ? 'bg-slate-300 cursor-not-allowed'
                : 'bg-gradient-to-r from-sky-600 via-sky-500 to-blue-600 hover:from-sky-500 hover:to-blue-500 shadow-lg shadow-sky-500/30 hover:scale-[1.02]'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              {isCalculating ? 'Computing Risk Score...' : 'Calculate CVD Risk Score'}
            </button>
          )}
        </div>
      </div>

      {/* ── Reference Ranges Slide-down Panel ── */}
      <AnimatePresence>
        {showRanges && referenceRanges && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.28 }}
            className="overflow-hidden"
          >
            <div className="mt-5 pt-5 border-t border-slate-200/80 dark:border-slate-700">
              <ReferenceRangesPanel ranges={referenceRanges} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
