import React from 'react';
import { Activity, ShieldCheck, Zap, Sparkles, ChevronDown } from 'lucide-react';
import { motion } from 'framer-motion';

export default function HeroSection({ onStartAssessment }) {
  return (
    <section id="hero-section" className="relative overflow-hidden pt-8 pb-16 md:pt-14 md:pb-24 border-b border-sky-100/50 dark:border-slate-800/80 bg-gradient-to-b from-white/30 via-white/10 to-transparent dark:from-slate-950/40 dark:to-transparent backdrop-blur-[2px]">
      {/* Background Subtle ECG / Heartbeat Glow Lines */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg
          className="w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 1440 320"
          preserveAspectRatio="none"
        >
          <path
            className="animate-ecg stroke-sky-400/50 fill-none"
            strokeWidth="2"
            d="M0,160 L350,160 L370,160 L385,120 L400,210 L415,80 L430,230 L445,150 L460,160 L800,160 L815,130 L830,200 L845,90 L860,220 L875,160 L1440,160"
          />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Top Trust Banner */}
        <div className="flex justify-center mb-6">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-medium text-sky-800 bg-sky-100/70 border border-sky-200 shadow-xs backdrop-blur-xs"
          >
            <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span>Academic Clinical Decision Support</span>
            <span className="text-sky-300">•</span>
            <span className="text-slate-600 font-normal">Zero Authentication Required</span>
          </motion.div>
        </div>

        {/* Hero Headline & Subheadline */}
        <div className="text-center max-w-4xl mx-auto mb-10">
          <motion.h1
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]"
          >
            Advanced Cardiovascular <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-sky-600 via-cyan-600 to-blue-700 bg-clip-text text-transparent">
              Risk Stratification AI
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="mt-5 text-base sm:text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Instant machine learning predictions engineered for clinical decision support.
            Evaluate physiological markers, hemodynamic parameters, and lifestyle factors with transparent explainability.
          </motion.p>

          {/* Glowing CTA Button & Trust Indicator */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button
              id="cta-start-assessment-btn"
              onClick={onStartAssessment}
              className="group relative inline-flex items-center justify-center gap-3 px-8 py-4 rounded-xl font-semibold text-white bg-gradient-to-r from-sky-500 via-sky-600 to-blue-600 hover:from-sky-400 hover:via-sky-500 hover:to-blue-500 shadow-lg shadow-sky-500/25 hover:shadow-sky-500/40 transition-all duration-300 hover:-translate-y-0.5 cursor-pointer text-base"
            >
              <Activity className="w-5 h-5 text-sky-100 group-hover:scale-110 transition-transform" />
              <span>Start Risk Assessment</span>
              <ChevronDown className="w-4 h-4 text-sky-200 group-hover:translate-y-0.5 transition-transform" />
            </button>

            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>100% Anonymous • No signup required</span>
            </div>
          </motion.div>
        </div>

        {/* Feature Highlights: 3 Sleek Glass Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12 max-w-5xl mx-auto">
          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl glass-panel border border-white/80 transition-all duration-300 relative group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/10 to-sky-500/20 text-sky-600 flex items-center justify-center mb-4 group-hover:bg-sky-500 group-hover:text-white transition-colors duration-300">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Instant ML Predictions</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Real-time inference calculating probability scores within milliseconds based on validated multi-parametric clinical cohorts.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl glass-panel border border-white/80 transition-all duration-300 relative group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/10 to-emerald-500/20 text-emerald-600 flex items-center justify-center mb-4 group-hover:bg-emerald-500 group-hover:text-white transition-colors duration-300">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Clinical Parameter Analysis</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Auto-computes essential hemodynamic metrics including Pulse Pressure, Mean Arterial Pressure (MAP), and WHO BMI categories.
            </p>
          </motion.div>

          <motion.div
            whileHover={{ y: -4 }}
            className="p-6 rounded-2xl glass-panel border border-white/80 transition-all duration-300 relative group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/10 to-blue-500/20 text-blue-600 flex items-center justify-center mb-4 group-hover:bg-blue-500 group-hover:text-white transition-colors duration-300">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Academic Decision Support</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Transparent, explainable AI with feature contribution breakdowns designed specifically for academic research and triage assistance.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
