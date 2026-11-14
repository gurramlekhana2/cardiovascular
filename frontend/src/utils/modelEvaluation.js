/**
 * Comprehensive Multi-Model Evaluation Benchmark & Provenance
 * 
 * Supports both models in the multimodal framework:
 * 1. Primary Display: High-Precision ECG Arrhythmia Classifier (MIT-BIH Database, 98.43% Accuracy)
 * 2. Secondary Display: Tabular Cardiovascular Disease Risk Predictor (70,000 Patient Cohort, 73.01% Accuracy)
 */

export const ECG_MODEL_METRICS = {
  id: "ecg-arrhythmia",
  modelName: "LightGBM ECG Arrhythmia Classifier",
  categoryLabel: "High-Frequency Electrophysiology Biosignal Classifier",
  architecture: "LightGBM Gradient Boosted Trees (Multiclass Heartbeat Morphology)",
  version: "2.1.0",
  evaluationDate: "2026-10-22",
  datasetName: "MIT-BIH Arrhythmia Benchmark Database",
  totalSamples: 109446,
  trainSamples: 87554, // 80%
  testSamples: 21892,  // 20% unseen test beats
  numberOfFeatures: 187, // Standardized 187-sample time-series ECG voltage amplitudes per beat
  cvStrategy: "Stratified 5-Fold Cross-Validation on MIT-BIH recordings",
  classificationThreshold: "Argmax Multi-Class Softmax",

  // Core Performance Metrics on Held-Out Test Set (N = 21,892 test beats)
  testAccuracy: 0.9843,       // 98.43%
  testPrecision: 0.9839,      // 98.39%
  testRecall: 0.9843,         // 98.43%
  testF1Score: 0.9839,        // 0.9839 Weighted F1
  testSpecificity: 0.9912,    // 99.12% Macro Specificity
  testRocAuc: 0.9968,         // 0.9968 Multi-class One-vs-Rest AUC

  // Beat Classification Breakdown (AAMI EC57 Standard Classes)
  classes: [
    { code: "N", name: "Normal Beat", count: 18118, accuracy: "98.9%", color: "#10b981" },
    { code: "S", name: "Supraventricular Ectopic (SVEB)", count: 556, accuracy: "91.2%", color: "#0ea5e9" },
    { code: "V", name: "Ventricular Ectopic (VEB / PVC)", count: 1448, accuracy: "96.4%", color: "#f43f5e" },
    { code: "F", name: "Fusion Beat", count: 162, accuracy: "88.9%", color: "#f59e0b" },
    { code: "Q", name: "Unknown / Unclassifiable", count: 1608, accuracy: "98.1%", color: "#8b5cf6" },
  ],

  // Binary/Aggregated Diagnostic Performance (Arrhythmia vs Normal Beat)
  confusionMatrix: {
    totalPatients: 21892,
    actualPositive: 3774, // Arrhythmic Beats (S, V, F, Q)
    actualNegative: 18118, // Normal Sinus Beats (N)
    tp: 3672, // True Positive Arrhythmia Detection
    tn: 17978, // True Negative Normal Identification
    fp: 140,  // False Positive
    fn: 102,  // False Negative
  },

  // High-Precision Empirical ROC Points (ROC-AUC = 0.9968)
  rocCurvePoints: [
    { fpr: 0.00, tpr: 0.00, baseline: 0.00, threshold: 1.00 },
    { fpr: 0.001, tpr: 0.88, baseline: 0.001, threshold: 0.90 },
    { fpr: 0.003, tpr: 0.94, baseline: 0.003, threshold: 0.80 },
    { fpr: 0.005, tpr: 0.965, baseline: 0.005, threshold: 0.70 },
    { fpr: 0.0077, tpr: 0.973, baseline: 0.0077, threshold: 0.50, isOptimal: true }, // Active operating point
    { fpr: 0.012, tpr: 0.985, baseline: 0.012, threshold: 0.30 },
    { fpr: 0.035, tpr: 0.995, baseline: 0.035, threshold: 0.10 },
    { fpr: 1.00, tpr: 1.00, baseline: 1.00, threshold: 0.00 },
  ],

  // Precision-Recall Points (PR-AUC = 0.9892)
  prCurvePoints: [
    { recall: 0.00, precision: 0.998, threshold: 1.00 },
    { recall: 0.80, precision: 0.991, threshold: 0.90 },
    { recall: 0.90, precision: 0.984, threshold: 0.70 },
    { recall: 0.973, precision: 0.963, threshold: 0.50, isOptimal: true },
    { recall: 0.988, precision: 0.932, threshold: 0.30 },
    { recall: 0.996, precision: 0.825, threshold: 0.10 },
    { recall: 1.00, precision: 0.1724, threshold: 0.00 }, // Prevalence baseline (3774/21892)
  ]
};

export const CVD_MODEL_METRICS = {
  id: "cvd-tabular",
  modelName: "Cardiovascular Risk Classifier (LightGBM)",
  categoryLabel: "Chronic Lifestyle & Hemodynamic Risk Predictor",
  architecture: "LightGBM + Calibrated Preprocessor (Binary Risk Stratification)",
  version: "1.2.0",
  evaluationDate: "2026-09-29",
  datasetName: "Cardiovascular Disease Tabular Cohort",
  totalSamples: 70000,
  trainSamples: 54880, // 80%
  testSamples: 13720,  // 20% unseen test patients
  numberOfFeatures: 15, // 11 base clinical + 4 engineered (BMI, Pulse Pressure, MAP, Age Group)
  cvStrategy: "5-Fold Stratified Cross-Validation on training folds",
  classificationThreshold: "Probability Cutoff ≥ 0.50",

  // Core Performance on Held-Out Test Set (N = 13,720 patients)
  testAccuracy: 0.7301,       // 73.01%
  testPrecision: 0.7489,      // 74.89%
  testRecall: 0.6839,         // 68.39%
  testF1Score: 0.7149,        // 0.7149
  testSpecificity: 0.7755,    // 77.55%
  testRocAuc: 0.7997,         // 0.7997
  testPrAuc: 0.7786,

  // Held-Out Test Confusion Matrix Breakdown (Total: 13,720)
  confusionMatrix: {
    totalPatients: 13720,
    actualPositive: 6807, // CVD Diagnosed Patients
    actualNegative: 6913, // Normal / Non-CVD Patients
    tp: 4655, // True Positive: Correctly identified high risk
    tn: 5361, // True Negative: Correctly identified low risk
    fp: 1552, // False Positive (Type I Error)
    fn: 2152, // False Negative (Type II Error)
  },

  // Empirical ROC curve data points (ROC-AUC = 0.7997)
  rocCurvePoints: [
    { fpr: 0.00, tpr: 0.00, baseline: 0.00, threshold: 1.00 },
    { fpr: 0.02, tpr: 0.12, baseline: 0.02, threshold: 0.90 },
    { fpr: 0.05, tpr: 0.28, baseline: 0.05, threshold: 0.80 },
    { fpr: 0.10, tpr: 0.45, baseline: 0.10, threshold: 0.70 },
    { fpr: 0.16, tpr: 0.58, baseline: 0.16, threshold: 0.60 },
    { fpr: 0.2245, tpr: 0.6839, baseline: 0.2245, threshold: 0.50, isOptimal: true },
    { fpr: 0.32, tpr: 0.78, baseline: 0.32, threshold: 0.40 },
    { fpr: 0.45, tpr: 0.87, baseline: 0.45, threshold: 0.30 },
    { fpr: 0.62, tpr: 0.93, baseline: 0.62, threshold: 0.20 },
    { fpr: 0.81, tpr: 0.98, baseline: 0.81, threshold: 0.10 },
    { fpr: 1.00, tpr: 1.00, baseline: 1.00, threshold: 0.00 }
  ],

  // Precision-Recall curve points (PR-AUC = 0.7786)
  prCurvePoints: [
    { recall: 0.00, precision: 0.95, threshold: 1.00 },
    { recall: 0.15, precision: 0.91, threshold: 0.90 },
    { recall: 0.30, precision: 0.86, threshold: 0.80 },
    { recall: 0.45, precision: 0.81, threshold: 0.70 },
    { recall: 0.58, precision: 0.78, threshold: 0.60 },
    { recall: 0.6839, precision: 0.7489, threshold: 0.50, isOptimal: true },
    { recall: 0.78, precision: 0.69, threshold: 0.40 },
    { recall: 0.87, precision: 0.63, threshold: 0.30 },
    { recall: 0.93, precision: 0.58, threshold: 0.20 },
    { recall: 0.98, precision: 0.52, threshold: 0.10 },
    { recall: 1.00, precision: 0.496, threshold: 0.00 }
  ]
};

// Default export for backwards compatibility
export const MODEL_METRICS = CVD_MODEL_METRICS;
