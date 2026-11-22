import React, { useState, useEffect } from 'react';
import {
  Activity,
  HeartPulse,
  UploadCloud,
  Sparkles,
  BarChart3,
  BookOpen,
  Info,
  ShieldAlert,
  Database
} from 'lucide-react';

import ECGWaveformCanvas from './ECGWaveformCanvas';
import ECGRecordingUpload from './ECGRecordingUpload';
import ECGClassificationResults from './ECGClassificationResults';
import ECGDemonstrationMode from './ECGDemonstrationMode';
import ECGModelPerformanceDashboard from './ECGModelPerformanceDashboard';
import DatasetMITBIHExplanation from './DatasetMITBIHExplanation';

import {
  fetchECGMetrics,
  fetchECGDemoSamples,
  analyzeECGSignal,
  uploadAndAnalyzeECGFile
} from '../modelUtils';

export default function ECGArrhythmiaStudio() {
  const [activeTab, setActiveTab] = useState('demo'); // 'demo' | 'upload' | 'performance' | 'methodology'

  // Data states
  const [demoSamples, setDemoSamples] = useState([]);
  const [activeSample, setActiveSample] = useState(null);
  const [metrics, setMetrics] = useState(null);

  // Analysis & Display states
  const [activeSignal, setActiveSignal] = useState([]);
  const [waveformTitle, setWaveformTitle] = useState("MIT-BIH Electrocardiogram Waveform");
  const [prediction, setPrediction] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState(null);

  // Load demo samples and metrics on mount
  useEffect(() => {
    async function loadInitialECGData() {
      try {
        const [demoData, metricsData] = await Promise.all([
          fetchECGDemoSamples().catch((e) => {
            console.warn("Demo samples error:", e);
            return { samples: [] };
          }),
          fetchECGMetrics().catch((e) => {
            console.warn("Metrics error:", e);
            return null;
          })
        ]);

        if (demoData?.samples?.length > 0) {
          setDemoSamples(demoData.samples);
          const firstSample = demoData.samples[0];
          setActiveSample(firstSample);
          setActiveSignal(firstSample.signal);
          setWaveformTitle(`Sample #${firstSample.row_in_test}: ${firstSample.label}`);

          // Trigger initial automated inference on first sample
          handleAnalyzeSignal(firstSample.signal, `MIT-BIH Test Sample #${firstSample.row_in_test}`);
        }

        if (metricsData) {
          setMetrics(metricsData);
        }
      } catch (err) {
        console.error("ECG Studio initialization error:", err);
      }
    }

    loadInitialECGData();
  }, []);

  // Analyze arbitrary signal array
  const handleAnalyzeSignal = async (signalArr, sampleId) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await analyzeECGSignal(signalArr, sampleId);
      setPrediction(res);
      if (res.processed_waveform) {
        setActiveSignal(res.processed_waveform);
      }
    } catch (err) {
      console.error("ECG analysis failed:", err);
      setError(err.message || "Failed to execute ECG prediction.");
      setPrediction(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Upload file analysis handler
  const handleUploadFile = async (file) => {
    setIsAnalyzing(true);
    setError(null);
    try {
      const res = await uploadAndAnalyzeECGFile(file);
      setPrediction(res);
      setWaveformTitle(`Uploaded File: ${file.name}`);
      if (res.processed_waveform) {
        setActiveSignal(res.processed_waveform);
      }
    } catch (err) {
      console.error("ECG upload failed:", err);
      setError(err.message || "Failed to analyze uploaded ECG file.");
      setPrediction(null);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Select a sample from the demo grid
  const handleSelectSample = (sample) => {
    setActiveSample(sample);
    setActiveSignal(sample.signal);
    setWaveformTitle(`MIT-BIH Sample #${sample.row_in_test}: ${sample.label}`);
    handleAnalyzeSignal(sample.signal, `MIT-BIH Row #${sample.row_in_test} (${sample.class_code})`);
  };

  return (
    <section id="ecg-module" className="mt-16 space-y-8 scroll-mt-20">
      {/* ── Section Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-cyan-400 bg-cyan-950/60 border border-cyan-800 mb-2">
            <HeartPulse className="w-3.5 h-3.5" />
            <span>MODULE 2: MIT-BIH ARRHYTHMIA DATABASE (109,446 BEATS)</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
            AI-Powered ECG Arrhythmia Detection Studio
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 max-w-2xl">
            Real-time electrophysiological heartbeat categorization powered by an authentic LightGBM gradient boosted model evaluated on 21,892 unseen MIT-BIH test heartbeats with <strong className="text-cyan-400">98.43% test accuracy</strong>.
          </p>
        </div>

        {/* Verified Performance Pill */}
        <div className="flex items-center gap-3 font-mono text-xs">
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Accuracy</span>
            <span className="text-emerald-400 font-bold text-base">98.43%</span>
          </div>
          <div className="px-3.5 py-2 rounded-xl bg-slate-900 border border-slate-800">
            <span className="text-slate-400 block text-[10px] uppercase">Weighted F1</span>
            <span className="text-sky-400 font-bold text-base">0.9839</span>
          </div>
        </div>
      </div>

      {/* ── Sub-Navigation Tabs ── */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-slate-800 w-fit">
        <button
          onClick={() => setActiveTab('demo')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'demo'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Interactive Demonstration</span>
        </button>

        <button
          onClick={() => setActiveTab('upload')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'upload'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Upload ECG Recording</span>
        </button>

        <button
          onClick={() => setActiveTab('performance')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'performance'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BarChart3 className="w-3.5 h-3.5" />
          <span>Model Performance & Confusion Matrix</span>
        </button>

        <button
          onClick={() => setActiveTab('methodology')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold transition ${
            activeTab === 'methodology'
              ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>MIT-BIH Dataset & Methodology</span>
        </button>
      </div>

      {/* ── Tab Content Areas ── */}

      {/* TAB 1: INTERACTIVE DEMONSTRATION MODE */}
      {activeTab === 'demo' && (
        <div className="space-y-8">
          {/* Main Visual & Inference Studio: 2 Columns */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Signal Visualizer Canvas */}
            <div className="lg:col-span-7 space-y-4">
              <ECGWaveformCanvas
                signal={activeSignal}
                title={waveformTitle}
                height={260}
                badge={prediction ? `Class ${prediction.predicted_class_code}` : null}
              />

              {/* Quick Signal Diagnostics Pill */}
              <div className="grid grid-cols-3 gap-3 text-center text-xs font-mono">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Sample Dimension</span>
                  <span className="text-slate-300 font-bold">{activeSignal.length} points</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Sampling Rate</span>
                  <span className="text-sky-400 font-bold">125 Hz Standard</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase block">Lead Type</span>
                  <span className="text-slate-300 font-bold">Modified Lead II</span>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Prediction & Class Breakdown */}
            <div className="lg:col-span-5">
              <ECGClassificationResults
                prediction={prediction}
                isAnalyzing={isAnalyzing}
              />
            </div>
          </div>

          {/* Demonstration Mode Selection Grid */}
          <ECGDemonstrationMode
            demoSamples={demoSamples}
            onSelectSample={handleSelectSample}
            activeSampleId={activeSample?.id}
            onAnalyzeActiveSample={(s) => handleAnalyzeSignal(s.signal, `MIT-BIH Row #${s.row_in_test}`)}
            prediction={prediction}
            isAnalyzing={isAnalyzing}
          />
        </div>
      )}

      {/* TAB 2: UPLOAD ECG RECORDING */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-6">
            <ECGRecordingUpload
              onAnalyzeFile={handleUploadFile}
              isAnalyzing={isAnalyzing}
              error={error}
              onClear={() => {
                setPrediction(null);
                setError(null);
              }}
            />

            {/* Render Waveform from Uploaded Recording */}
            {activeSignal && activeSignal.length > 0 && (
              <ECGWaveformCanvas
                signal={activeSignal}
                title={waveformTitle}
                height={260}
                badge="Uploaded File"
              />
            )}
          </div>

          <div className="lg:col-span-5">
            <ECGClassificationResults
              prediction={prediction}
              isAnalyzing={isAnalyzing}
            />
          </div>
        </div>
      )}

      {/* TAB 3: MODEL PERFORMANCE & CONFUSION MATRIX */}
      {activeTab === 'performance' && (
        <ECGModelPerformanceDashboard metrics={metrics} />
      )}

      {/* TAB 4: MIT-BIH DATASET EXPLANATION & ARCHITECTURAL COMPARISON */}
      {activeTab === 'methodology' && (
        <DatasetMITBIHExplanation />
      )}
    </section>
  );
}
