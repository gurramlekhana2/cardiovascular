import React, { useState, useRef, useEffect, useCallback } from 'react';
import HeroSection from './components/HeroSection';
import AssessmentWizard from './components/AssessmentWizard';
import RiskOutputCard from './components/RiskOutputCard';
import EngineeredParametersGrid from './components/EngineeredParametersGrid';
import ElegantDisclaimer from './components/ElegantDisclaimer';
import ComorbidityFlags from './components/ComorbidityFlags';
import ComparisonMode from './components/ComparisonMode';
import MobileBottomSheet from './components/MobileBottomSheet';
import PrintableReport from './components/PrintableReport';
import {
  calculatePhysiologicalFeatures,
  computeRiskAssessment,
  getReferenceRanges,
  detectComorbidityFlags,
} from './modelUtils';
import { Activity, ShieldCheck, Heart, Moon, Sun, Printer, Download } from 'lucide-react';

const DEFAULT_INPUTS = {
  age: 52,
  gender: 2,   // 1: Female, 2: Male, 3: Other
  height: 168,
  weight: 74,
  ap_hi: 130,
  ap_lo: 85,
  cholesterol: 2,
  gluc: 1,
  smoke: 0,
  alco: 0,
  active: 1,
};

export default function App() {
  const assessmentRef = useRef(null);

  // ── Persistent dark mode (localStorage) ──────────────────────────────────
  const [darkMode, setDarkMode] = useState(() => {
    try { return localStorage.getItem('cardiosense-dark') === 'true'; }
    catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    try { localStorage.setItem('cardiosense-dark', darkMode); } catch {}
  }, [darkMode]);

  // ── Patient inputs ────────────────────────────────────────────────────────
  const [inputs, setInputs] = useState(DEFAULT_INPUTS);
  const [isCalculating, setIsCalculating] = useState(false);

  // ── Mobile Bottom Sheet state ─────────────────────────────────────────────
  const [isMobileSheetOpen, setIsMobileSheetOpen] = useState(false);

  // ── Assessment results (initially null until the user calculates) ─────────
  const [assessmentResult, setAssessmentResult] = useState(null);

  // Displayed result: only populated after user initiates calculation
  const displayResult = assessmentResult;

  // ── Computed derived data ─────────────────────────────────────────────────
  const engineeredFeatures = calculatePhysiologicalFeatures(inputs);
  const referenceRanges    = getReferenceRanges(inputs);
  const comorbidityFlags   = detectComorbidityFlags(inputs);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleStartAssessment = () => {
    assessmentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleCalculateRisk = () => {
    setIsCalculating(true);
    setTimeout(() => {
      setAssessmentResult(computeRiskAssessment(inputs));
      setIsCalculating(false);
      // Auto open bottom sheet on small screens when user clicks Calculate
      if (window.innerWidth < 1024) {
        setIsMobileSheetOpen(true);
      }
    }, 600);
  };

  // ── Input change: if already calculated, refresh result smoothly or keep current ────
  const handleSetInputs = useCallback((updater) => {
    setInputs(updater);
  }, []);

  // ── Apply Scenario from Comparison Mode ─────────────────────────────────
  const handleApplyScenario = (scenarioInputs) => {
    setInputs(scenarioInputs);
    setAssessmentResult(computeRiskAssessment(scenarioInputs));
    assessmentRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // ── Automatic PDF Download Handler ──────────────────────────────────────
  const [isExportingPDF, setIsExportingPDF] = useState(false);

  const handlePrint = async () => {
    const reportEl = document.getElementById('printable-report');
    if (!reportEl) {
      window.print();
      return;
    }

    setIsExportingPDF(true);

    try {
      // Build an isolated clean container containing ONLY the visit summary
      const printContainer = document.createElement('div');
      printContainer.id = 'clean-pdf-export-container';
      printContainer.style.position = 'fixed';
      printContainer.style.left = '0';
      printContainer.style.top = '0';
      printContainer.style.width = '780px';
      printContainer.style.backgroundColor = '#ffffff';
      printContainer.style.zIndex = '999999';
      printContainer.style.margin = '0';
      printContainer.style.padding = '24px 32px';
      printContainer.innerHTML = reportEl.innerHTML;
      document.body.appendChild(printContainer);

      let exported = false;
      if (typeof window.html2pdf === 'function') {
        try {
          const opt = {
            margin: [8, 6, 8, 6],
            filename: `CVD_Risk_Visit_Summary_${inputs.gender === 1 ? 'F' : 'M'}_${inputs.age}y.pdf`,
            image: { type: 'jpeg', quality: 0.98 },
            html2canvas: { 
              scale: 2, 
              useCORS: true, 
              logging: false, 
              backgroundColor: '#ffffff'
            },
            jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
            pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
          };

          await window.html2pdf().set(opt).from(printContainer).save();
          exported = true;
        } catch (pdfErr) {
          console.warn('html2pdf encountered render issue, executing clean print fallback:', pdfErr);
        }
      }

      if (!exported) {
        // Fallback using clean printable popup window (Save as PDF)
        const printWindow = window.open('', '_blank', 'width=800,height=900');
        if (printWindow) {
          printWindow.document.write(`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <title>CVD Risk Visit Summary</title>
                <style>
                  @page { size: A4; margin: 15mm; }
                  body { 
                    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif; 
                    margin: 0; 
                    padding: 20px; 
                    color: #111827; 
                    background: #ffffff; 
                    line-height: 1.4;
                  }
                  table { width: 100%; border-collapse: collapse; margin-bottom: 16px; border: 1px solid #d1d5db; }
                  th, td { padding: 4px 8px; border-bottom: 1px solid #e5e7eb; font-size: 11.5px; }
                  th { background: #f9fafb; text-align: left; font-weight: 700; }
                  h1 { font-size: 24px; font-weight: 800; margin: 0 0 4px 0; color: #111827; }
                  h2 { font-size: 13px; font-weight: 800; margin: 0 0 6px 0; color: #111827; }
                  ul { margin: 0; padding-left: 18px; font-size: 11px; }
                  li { margin-bottom: 3px; }
                </style>
              </head>
              <body>
                ${reportEl.innerHTML}
                <script>
                  window.onload = function() {
                    window.focus();
                    window.print();
                    setTimeout(function() { window.close(); }, 500);
                  };
                </script>
              </body>
            </html>
          `);
          printWindow.document.close();
        }
      }

      document.body.removeChild(printContainer);
    } catch (err) {
      console.error('PDF export process error:', err);
    } finally {
      setIsExportingPDF(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-sky-500 selection:text-white transition-colors duration-300 ${darkMode ? 'bg-slate-950/75 text-slate-100' : 'bg-white/40 text-slate-800'}`}>

      {/* ── Top Navigation Bar ── */}
      <header className={`sticky top-0 z-40 backdrop-blur-md border-b transition-colors duration-300 ${darkMode ? 'bg-slate-900/90 border-slate-700/70' : 'bg-white/80 border-slate-200/70'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-blue-600 flex items-center justify-center text-white shadow-md shadow-sky-500/20">
              <Heart className="w-5 h-5 fill-current" />
            </div>
            <div>
              <span className={`text-base font-extrabold tracking-tight flex items-center gap-1.5 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                CardioSense <span className="text-sky-500">AI</span>
              </span>
              <span className={`block text-[10px] font-medium ${darkMode ? 'text-slate-400' : 'text-slate-400'}`}>
                Clinical ML Decision Support
              </span>
            </div>
          </div>

          {/* Right nav items */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className={`hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${darkMode ? 'text-emerald-300 bg-emerald-900/30 border-emerald-700' : 'text-emerald-700 bg-emerald-50 border-emerald-200/80'}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>No Login Required</span>
            </div>

            {/* Print / Download PDF button in header */}
            <button
              onClick={handlePrint}
              disabled={isExportingPDF}
              title="Download Clinical PDF Summary"
              className={`p-2.5 rounded-xl transition-all cursor-pointer border flex items-center gap-1.5 ${
                darkMode
                  ? 'bg-slate-800 border-slate-600 text-slate-200 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <Download className={`w-4 h-4 ${isExportingPDF ? 'animate-bounce text-sky-500' : ''}`} />
              <span className="hidden md:inline text-xs font-semibold">
                {isExportingPDF ? 'Downloading...' : 'PDF'}
              </span>
            </button>

            {/* Dark Mode Toggle */}
            <button
              id="dark-mode-toggle"
              onClick={() => setDarkMode(d => !d)}
              title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
                darkMode
                  ? 'bg-slate-800 border-slate-600 text-amber-300 hover:bg-slate-700'
                  : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            <button
              onClick={handleStartAssessment}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-sky-600 hover:bg-sky-500 transition-all cursor-pointer shadow-sm shadow-sky-500/20"
            >
              Assessment
            </button>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="flex-1 pb-16 lg:pb-0">
        {/* 1. Hero / Landing */}
        <HeroSection onStartAssessment={handleStartAssessment} />

        {/* 2. Assessment & Results Studio */}
        <section
          ref={assessmentRef}
          id="assessment-section"
          className="py-12 md:py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8"
        >
          <div className="mb-8 text-center sm:text-left">
            <h2 className={`text-2xl sm:text-3xl font-extrabold tracking-tight ${darkMode ? 'text-slate-100' : 'text-slate-900'}`}>
              Cardiovascular Risk Evaluation Studio
            </h2>
            <p className={`text-xs sm:text-sm mt-1 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              3-step wizard with real-time live preview, WHO/AHA reference ranges, comorbidity cluster detection, and scenario simulation.
            </p>
          </div>

          {/* ── Split Screen: Wizard Left, Output Right ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Assessment Wizard */}
            <div className="lg:col-span-7 glass-panel-elevated p-6 sm:p-8 rounded-3xl border border-white shadow-xl">
              <AssessmentWizard
                inputs={inputs}
                setInputs={handleSetInputs}
                onCalculate={handleCalculateRisk}
                isCalculating={isCalculating}
                referenceRanges={referenceRanges}
              />
            </div>

            {/* Right: Risk Output (sticky on desktop) */}
            <div className="lg:col-span-5 glass-panel p-6 sm:p-7 rounded-3xl border border-white shadow-lg sticky top-24">
              <RiskOutputCard
                result={displayResult}
                isCalculating={isCalculating}
                isLive={false}
                onPrintReport={handlePrint}
              />
            </div>
          </div>

          {/* 3. Scenario Comparison / What-If Mode */}
          <ComparisonMode
            currentInputs={inputs}
            onApplyScenario={handleApplyScenario}
          />

          {/* 4. Engineered Physiological Parameters */}
          <EngineeredParametersGrid features={engineeredFeatures} />

          {/* 5. Comorbidity Cluster Detection */}
          <ComorbidityFlags flags={comorbidityFlags} />
        </section>
      </main>

      {/* 6. Mobile Bottom Sheet Drawer (< lg screens) */}
      <MobileBottomSheet
        isOpen={isMobileSheetOpen}
        onClose={() => setIsMobileSheetOpen(false)}
        onOpen={() => setIsMobileSheetOpen(true)}
        result={displayResult}
        isCalculating={isCalculating}
        isLive={false}
        onPrint={handlePrint}
      />

      {/* 7. Hidden Clinical Printable PDF Document (revealed on window.print()) */}
      <PrintableReport
        inputs={inputs}
        result={displayResult}
        engineeredFeatures={engineeredFeatures}
        comorbidityFlags={comorbidityFlags}
      />

      {/* 8. Elegant Disclaimer Footer */}
      <ElegantDisclaimer />
    </div>
  );
}
