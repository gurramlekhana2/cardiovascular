import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, ChevronDown, ChevronUp, AlertCircle, FileText, Lock } from 'lucide-react';

export default function ElegantDisclaimer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <footer className="mt-16 border-t border-slate-200/80 bg-white/60 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          {/* Subtle Collapsible Accordion Box */}
          <div className="rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-200">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 rounded-lg bg-sky-100/70 text-sky-700">
                  <Shield className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-800 flex items-center gap-2">
                    Academic Research & Clinical Decision-Support Advisory
                    <span className="text-[10px] font-normal px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
                      Non-Diagnostic
                    </span>
                  </h4>
                  <p className="text-[11px] text-slate-500">
                    Click to review institutional scope, anonymous architecture, and intended use.
                  </p>
                </div>
              </div>

              <div className="text-slate-400 hover:text-slate-600">
                {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </div>
            </button>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="mt-4 pt-4 border-t border-slate-200 text-xs text-slate-600 space-y-2.5 leading-relaxed">
                    <p>
                      <strong>Intended Purpose:</strong> This application serves strictly as an educational and academic decision-support platform designed to demonstrate predictive modeling techniques applied to cardiovascular physiological indicators.
                    </p>
                    <p>
                      <strong>Not a Medical Device:</strong> The risk probabilities and classifications calculated by this model do <em>not</em> constitute a medical diagnosis, clinical prognosis, or prescription. Always consult a licensed cardiologist, physician, or accredited healthcare professional for diagnostic evaluations or therapeutic regimens.
                    </p>
                    <p className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                      <Lock className="w-3.5 h-3.5 text-emerald-600 inline" />
                      <span><strong>Privacy Architecture:</strong> Client-side scoring with no patient authentication, session storage, or persistent database logging.</span>
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Institutional footer links */}
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3 text-center sm:text-left">
            <div>
              <span>CardioSense AI • Academic Machine Learning Platform</span>
            </div>
            <div className="flex items-center gap-4">
              <span>Zero-Storage Anonymous Mode</span>
              <span>•</span>
              <span>AHA & WHO Guideline Baselines</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
