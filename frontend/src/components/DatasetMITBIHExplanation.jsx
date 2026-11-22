import React from 'react';
import {
  GitMerge,
  ArrowDown,
  Layers,
  Database,
  CheckCircle2,
  Cpu,
  Activity,
  FileCheck2,
  TableProperties
} from 'lucide-react';

export default function DatasetMITBIHExplanation() {
  const workflowSteps = [
    {
      num: "01",
      title: "MIT-BIH Arrhythmia Database",
      subtitle: "PhysioNet Clinical Corpus",
      desc: "48 half-hour two-channel ambulatory ECG recordings obtained from 47 subjects studied by the BIH Arrhythmia Laboratory between 1975 and 1979.",
      icon: <Database className="w-5 h-5 text-sky-400" />
    },
    {
      num: "02",
      title: "Signal Preprocessing & Resampling",
      subtitle: "Anti-Aliasing & Resampling to 125 Hz",
      desc: "Raw analog signals digitized at 360 Hz per channel are resampled to a standardized frequency of 125 Hz to reduce dimensionality while preserving diagnostic QRS morphology.",
      icon: <Activity className="w-5 h-5 text-cyan-400" />
    },
    {
      num: "03",
      title: "R-Peak Detection & Segmentation",
      subtitle: "Fixed-Length Heartbeat Extraction",
      desc: "Each heartbeat is segmented around its annotated R-peak into a uniform window of exactly 187 amplitude samples, capturing the complete P-QRS-T sequence.",
      icon: <Layers className="w-5 h-5 text-indigo-400" />
    },
    {
      num: "04",
      title: "Amplitude Normalization",
      subtitle: "Min-Max Scaling to [0.0, 1.0]",
      desc: "Individual heartbeat segments undergo patient-independent min-max normalization, removing baseline wander, skin impedance variations, and DC offsets.",
      icon: <FileCheck2 className="w-5 h-5 text-blue-400" />
    },
    {
      num: "05",
      title: "Stratified Train / Test Partition",
      subtitle: "87,554 Train / 21,892 Test Samples",
      desc: "Rigorous benchmark split ensuring zero data leakage: 87,554 training heartbeats and 21,892 untouched test beats across 5 AAMI standard classes.",
      icon: <GitMerge className="w-5 h-5 text-purple-400" />
    },
    {
      num: "06",
      title: "LightGBM Gradient Boosting",
      subtitle: "Multiclass Decision Tree Ensemble",
      desc: "Trained using multi-class objective (`multiclass`) with 187 input features, achieving 98.43% test accuracy and 0.9839 weighted F1-score.",
      icon: <Cpu className="w-5 h-5 text-emerald-400" />
    }
  ];

  return (
    <div className="space-y-8">
      {/* Section Header */}
      <div className="text-left space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800">
          <Database className="w-3.5 h-3.5" />
          <span>Academic Methodology & Evaluation Reference</span>
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-slate-100">
          Understanding the MIT-BIH Arrhythmia Database
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          The MIT-BIH Arrhythmia Database is the international gold standard for automated heartbeat classification. Below is the verified end-to-end signal processing and machine learning workflow implemented in this project.
        </p>
      </div>

      {/* Step-by-Step Workflow Diagram */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {workflowSteps.map((step, idx) => (
          <div
            key={step.num}
            className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-md relative overflow-hidden flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-mono font-bold text-xs text-sky-400">
                  {step.num}
                </span>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  {step.icon}
                </div>
              </div>

              <h4 className="text-sm font-bold text-slate-200">{step.title}</h4>
              <p className="text-[11px] font-mono text-sky-400 mt-0.5">{step.subtitle}</p>
              <p className="text-xs text-slate-400 mt-2.5 leading-relaxed">{step.desc}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
              <span>Stage {idx + 1} of 6</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Verified in Code
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Dataset 1 vs Dataset 2 Side-by-Side Architectural Comparison Table */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <TableProperties className="w-4 h-4 text-sky-400" />
              Dataset 1 vs Dataset 2: Independent Multimodal Architecture
            </h4>
            <p className="text-xs text-slate-400 mt-1">
              Both machine learning models are trained independently on distinct medical modalities and integrated into CardioSense AI.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="p-3">Architectural Parameter</th>
                <th className="p-3 text-sky-400">Module 1: Cardiovascular Disease</th>
                <th className="p-3 text-cyan-400">Module 2: ECG Arrhythmia Detection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
              <tr>
                <td className="p-3 font-semibold text-slate-300 font-sans">Corpus Source</td>
                <td className="p-3 text-slate-300">Cardiovascular Disease (70,000 Examination Records)</td>
                <td className="p-3 text-slate-300">MIT-BIH Arrhythmia Database (PhysioNet)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-300 font-sans">Input Modality</td>
                <td className="p-3 text-slate-300">Tabular physiological vitals & biomarkers (13 features)</td>
                <td className="p-3 text-slate-300">Continuous digital ECG waveform (187 points / beat)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-300 font-sans">Clinical Objective</td>
                <td className="p-3 text-slate-300">Long-term atherosclerotic CVD risk screening</td>
                <td className="p-3 text-slate-300">Real-time acute heartbeat arrhythmia categorization</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-300 font-sans">Dataset Size</td>
                <td className="p-3 text-slate-300">68,600 cleaned (54,880 train / 13,720 test)</td>
                <td className="p-3 text-slate-300">109,446 beats (87,554 train / 21,892 test)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-300 font-sans">Classification Taxonomy</td>
                <td className="p-3 text-slate-300">Binary (0: Low Risk, 1: Elevated CVD Risk)</td>
                <td className="p-3 text-slate-300">5 AAMI Classes: N, S, V, F, Q</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-300 font-sans">Selected Production Model</td>
                <td className="p-3 text-sky-400 font-bold">LightGBM (final_model.pkl)</td>
                <td className="p-3 text-cyan-400 font-bold">LightGBM (ecg_model_98acc.pkl)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-300 font-sans">Held-Out Test Accuracy</td>
                <td className="p-3 text-emerald-400 font-bold">73.01% (ROC-AUC 0.7997)</td>
                <td className="p-3 text-emerald-400 font-bold">98.43% (Weighted F1 0.9839)</td>
              </tr>
              <tr>
                <td className="p-3 font-semibold text-slate-300 font-sans">Clinical Decision Logic</td>
                <td className="p-3 text-slate-300">Calibrated OOF threshold (0.4839)</td>
                <td className="p-3 text-slate-300">Multi-class Argmax / Softmax probability vector</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs text-slate-400 leading-relaxed font-sans">
          <strong className="text-slate-200">Independent Integration Note:</strong> Tabular physical parameters and electrophysiological signals represent orthogonal clinical dimensions. They operate as independent, specialized machine learning pipelines to give comprehensive diagnostic support.
        </div>
      </div>
    </div>
  );
}
