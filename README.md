# Machine Learning Based Cardiovascular Disease Prediction & Decision Support System

An end-to-end, leak-free, multimodal academic machine learning framework combining **tabular physical examination biomarker modeling** (70,000 patient records) and **high-resolution ECG arrhythmia classification** (MIT-BIH Database, 109,446 beats).

> ⚠️ **IMPORTANT ACADEMIC & MEDICAL DISCLAIMER**:  
> This software and prediction system are developed strictly as an **academic machine learning decision-support research project**. It is **NOT** a medical diagnostic tool or a clinical medical device. Model predictions must **NEVER** replace professional medical advice, clinical evaluation, or physician consultation.

---

## 🌟 Key Project Strengths & Architectural Highlights

1. **Rigorous Data Hygiene & Leakage Prevention**:
   - Strict separation between train/test splits (80% train / 20% test) **before** fitting scikit-learn transformers (`StandardScaler`, `ColumnTransformer`), guaranteeing zero data leakage.
   - Outlier filtering detects physiological and data entry anomalies (e.g. blood pressure $16020$ or $-150\text{ mmHg}$, inverted systolic/diastolic values, anthropometric extremes), retaining **68,600 valid records (98.00% dataset retention)**.
   - Cross-validation uses 5-Fold Stratified K-Fold where preprocessors fit strictly on each fold's training slice.

2. **Physiological & Clinical Feature Engineering**:
   - Computes clinically validated cardiovascular indices:
     - **Body Mass Index (BMI)**: $\text{weight (kg)} / (\text{height (m)})^2$ and WHO categorization.
     - **Pulse Pressure**: $ap\_hi - ap\_lo$ (arterial stiffness indicator).
     - **Mean Arterial Pressure (MAP)**: $ap\_lo + \frac{\text{Pulse Pressure}}{3}$ (perfusion pressure).
     - **AHA Blood Pressure Stages**: Normal, Elevated, Stage 1 HTN, Stage 2 HTN, and Hypertensive Crisis.
     - Non-linear interaction terms: Age-MAP interaction, Cholesterol-Glucose risk tier, and Lifestyle composite risk score.

3. **Multimodal Diagnostics (Tabular Biomarkers + Electrocardiogram)**:
   - **Clinical Biomarker Pipeline**: 7 tuned classification models (LightGBM, Soft-Voting Ensemble, Random Forest, Logistic Regression, Decision Tree, Support Vector Machine, and KNN).
   - **ECG Arrhythmia Classifier**: High-precision LightGBM classifier trained on the MIT-BIH Arrhythmia Database, evaluating 21,892 test beats with **98.43% accuracy** across 5 beat types (Normal, SVEB, VEB/PVC, Fusion, and Unknown).

4. **Explainable AI (XAI)**:
   - Integrates **SHAP (SHapley Additive exPlanations)** based on cooperative game theory.
   - Generates both global feature attribution rankings and patient-specific waterfall breakdowns for interpretable clinical decision support.

5. **Dual User Interfaces**:
   - **Python Streamlit Dashboard (`app/app.py`)**: Real-time parameter entry, calibrated risk probability scoring, counterfactual what-if simulation, and automated multi-page clinical PDF report export (`app/pdf_report.py`).
   - **Modern React & Tailwind Web Application (`frontend/`)**: High-performance, responsive UI with interactive AHA/WHO reference gauges, risk calculators, and patient comparison modes.

---

## 📂 Project Directory Structure

```
cardiovascular-disease-ml/
│
├── data/
│   ├── raw/
│   │   └── cardio_train.csv          # 70,000 raw patient records
│   └── processed/
│       ├── train_cleaned.csv         # Cleaned training dataset split (54,880 rows)
│       └── test_cleaned.csv          # Cleaned test dataset split (13,720 rows)
│
├── notebooks/
│   └── cardiovascular_analysis.ipynb # Fully executed end-to-end Jupyter Notebook
│
├── src/
│   ├── inspect_data.py               # Dataset audit & anomaly inspection script
│   ├── data_preprocessing.py         # Outlier filtering & ColumnTransformer builder
│   ├── feature_engineering.py        # BMI, Pulse Pressure, MAP & BP category builder
│   ├── eda.py                        # Automated publication plot generator (8 figures)
│   ├── train.py                      # Multi-model 5-Fold Stratified CV, tuning & calibration
│   ├── evaluate.py                   # Metric calculation, ROC & confusion matrix plots
│   ├── explainability.py             # Feature importance & SHAP explanation module
│   ├── predict.py                    # Inference pipeline wrapper class
│   ├── run_pipeline.py               # Master pipeline orchestrator script
│   └── test_pipeline.py              # Automated 5-step integration test runner
│
├── models/
│   ├── final_model.pkl               # Serialized top model (LightGBM / Random Forest)
│   ├── preprocessing_pipeline.pkl    # Serialized scikit-learn ColumnTransformer
│   ├── model_metadata.joblib         # Optimal threshold, column orders, and metadata
│   ├── ecg_model_98acc.pkl           # MIT-BIH ECG Arrhythmia LightGBM model
│   └── ecg_metadata.joblib           # ECG metrics, class mappings & benchmark data
│
├── outputs/
│   ├── figures/                      # 13 Publication figures (ROC, CM, EDA, SHAP, ECG)
│   ├── tables/                       # Model comparison CSVs & Markdown tables
│   └── results/                      # Report-ready academic report sections
│
├── app/
│   ├── app.py                        # Interactive Streamlit prediction dashboard
│   └── pdf_report.py                 # Automated clinical PDF report generator
│
├── frontend/                         # Modern React (Vite) + Tailwind CSS dashboard
│   ├── src/
│   │   ├── components/               # Risk output, comparison mode, wizard components
│   │   ├── modelUtils.js             # Client-side inference calculation & AHA guidelines
│   │   └── App.jsx                   # Primary dashboard layout
│   └── package.json
│
├── requirements.txt                  # Python dependencies
├── README.md                         # Complete project documentation & Viva guide
└── .gitignore
```

---

## 📊 Comprehensive Model Performance & Benchmark

### 1. Tabular Clinical Risk Models (Held-Out Test Set: $N = 13,720$ patients)

All models were evaluated on the held-out 20% test split after 5-Fold Stratified Cross-Validation:

| Model | CV Mean F1 | CV Mean ROC-AUC | Test Accuracy | Test Precision | Test Recall (Sensitivity) | Test Specificity | Test F1-Score | Test ROC-AUC | Test PR-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **LightGBM (Selected)** | **0.7208** | **0.8018** | **0.7301** | **0.7489** | **0.6839** | **0.7754** | **0.7149** | **0.7997** | **0.7786** |
| **Soft-Voting Ensemble** | 0.7208 | **0.8038** | **0.7315** | 0.7553 | 0.6765 | 0.7853 | 0.7138 | **0.7998** | **0.7812** |
| **Random Forest** | 0.7159 | 0.8008 | 0.7307 | 0.7553 | 0.6742 | 0.7860 | 0.7124 | 0.7981 | 0.7772 |
| **Logistic Regression** | 0.7097 | 0.7960 | 0.7290 | 0.7570 | 0.6662 | 0.7905 | 0.7087 | 0.7950 | 0.7767 |
| **Decision Tree** | 0.7123 | 0.7922 | 0.7277 | 0.7534 | 0.6684 | 0.7857 | 0.7084 | 0.7928 | 0.7655 |
| **Support Vector Machine** | 0.7054 | 0.7949 | 0.7276 | 0.7596 | 0.6577 | 0.7961 | 0.7050 | 0.7937 | 0.7751 |
| **K-Nearest Neighbors** | 0.7005 | 0.7718 | 0.7101 | 0.7162 | 0.6861 | 0.7337 | 0.7008 | 0.7701 | 0.7487 |

---

### 2. High-Precision ECG Arrhythmia Benchmark (MIT-BIH Database)

Evaluated on **21,892 unseen test ECG beats**:

| Model | Training Dataset | Test Split | Accuracy | Precision | Sensitivity (Recall) | Weighted F1 |
| :--- | :--- | :--- | :---: | :---: | :---: | :---: |
| **LightGBM ECG Classifier** | MIT-BIH (87,554 beats) | 21,892 beats | **98.43%** | **98.39%** | **98.43%** | **0.9839** |

Classified beat morphologies include:
- `Normal Beat (N)`
- `Supraventricular Ectopic Beat (S)`
- `Ventricular Ectopic Beat (V / PVC)`
- `Fusion Beat (F)`
- `Unknown / Unclassifiable Beat (Q)`

---

## ⚡ Quick Start & Setup Instructions

### 1. Environment Installation
```bash
# Clone or navigate to the workspace
cd cardiovascular-disease-ml

# Create Python virtual environment
python -m venv .venv

# Activate virtual environment
# On Windows (PowerShell):
.\.venv\Scripts\Activate.ps1
# On Linux/macOS:
source .venv/bin/activate

# Install required dependencies
pip install -r requirements.txt
```

### 2. Run Complete ML Pipeline
Executes end-to-end data cleaning, EDA figure rendering, 5-fold cross-validation, model tuning, evaluation tables, SHAP values, and artifact serialization:
```bash
python src/run_pipeline.py
```

### 3. Run Automated Integration Tests
Verifies dataset integrity, cleaning logic, feature engineering formulas, model deserialization, inference outputs, and artifacts:
```bash
python src/test_pipeline.py
```

### 4. Launch Streamlit Interactive Application
```bash
streamlit run app/app.py
```

### 5. Launch Modern React Web Dashboard
```bash
cd frontend
npm install
npm run dev
```

---

## 🎓 Viva & Academic Defense Q&A Guide

### Q1: How did you ensure ZERO Data Leakage during preprocessing?
> **Answer**: We divided the dataset into an 80% training set and a 20% test set **prior** to computing any feature scaling, normalization, or transformation statistics. All scikit-learn transformers (`StandardScaler`, `OneHotEncoder`/`ColumnTransformer`) were fitted strictly on training folds within a 5-Fold Stratified Cross-Validation framework. Test data remained completely unseen until the final evaluation.

### Q2: Why did you filter physiological outliers rather than imputing or clipping them?
> **Answer**: Extreme outliers in blood pressure (e.g. systolic BP values of `16020` or `-150`, and inverted records where $ap\_hi < ap\_lo$) represent manual data-entry typographical errors rather than biological variation. Imputing or winsorizing extreme errors introduces synthetic bias. Removing these corrupted records (~2.0%) cleanly retained 68,600 highly reliable patient records.

### Q3: Why is LightGBM / Soft-Voting Ensemble preferred over single decision trees?
> **Answer**: While individual Decision Trees are susceptible to high variance and overfitting (achieving 0.7084 test F1), LightGBM utilizes histogram-based gradient boosted decision trees that handle non-linear feature interactions efficiently. It achieved a superior Test ROC-AUC of **0.7997** and F1-score of **0.7149**, closely mirroring its cross-validation score (**0.7208**), confirming high generalization stability.

### Q4: How is Explainable AI (XAI) implemented for clinical trust?
> **Answer**: We incorporated TreeSHAP to calculate exact Shapley contributions from cooperative game theory. Rather than providing a black-box probability, the system produces waterfall and summary plots revealing that Systolic Blood Pressure ($ap\_hi$), Mean Arterial Pressure ($MAP$), Age, and Cholesterol are the primary drivers of elevated cardiovascular risk.

### Q5: Why and how did you incorporate ECG-Based Arrhythmia Classification?
> **Answer**: While routine tabular physical examination records (blood pressure, BMI, cholesterol) estimate long-term lifestyle and chronic cardiovascular risk, acute cardiac events are frequently triggered by electrophysiological rhythm disturbances. We integrated an **ECG Arrhythmia Classifier** trained on the internationally recognized **MIT-BIH Arrhythmia Database** (109,446 cardiac beats). Using a gradient-boosted LightGBM architecture, the model classifies individual heartbeat morphology into 5 standard AAMI EC57 classes (`Normal Beat`, `Supraventricular Ectopic`, `Ventricular Ectopic / PVC`, `Fusion Beat`, and `Unknown/Paced Beat`), achieving **98.43% test accuracy** and a **0.9839 weighted F1-score** across 21,892 unseen test beats. This gives our decision-support framework multimodal diagnostic capability spanning chronic risk estimation and acute electrophysiological rhythm screening.

