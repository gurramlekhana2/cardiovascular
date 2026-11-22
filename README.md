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

### 4. Launch FastAPI Prediction Server
The modern React application connects to a high-performance FastAPI backend supporting both tabular CVD risk predictions and ECG arrhythmia analysis:
```bash
# In the project root directory
uvicorn app.api:app --reload --port 8000
```
API documentation and interactive Swagger UI are automatically served at `http://localhost:8000/docs`.

### 5. Launch Modern React Web Dashboard (Local Dev)
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:5173` to access the full application.

---

## 🌐 Full-Stack Cloud Deployment Guide (Vercel + Render)

When deploying this project to production, the architecture separates the **React Frontend** and the **FastAPI Machine Learning Backend**:

```
[User Browser]
      │
      ├── (HTML / React UI) ───────────► [Vercel Hosting]
      │                                       │
      │                                       ▼ (VITE_API_URL env variable)
      └── (REST API Requests / Inference) ──► [Render / Cloud Python Backend]
                                              - uvicorn app.api:app
                                              - LightGBM & Preprocessing Models
```

### Step 1: Deploy Backend to Render (Free)
1. Go to [Render.com](https://render.com) and create an account.
2. Click **New +** ➔ **Web Service**.
3. Connect your GitHub repository (`cardiovascular`).
4. Configure the service:
   - **Environment:** `Python 3`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `uvicorn app.api:app --host 0.0.0.0 --port $PORT`
5. Click **Create Web Service**. Render will assign a live URL, e.g.:
   `https://cardiovascular-backend.onrender.com`

### Step 2: Deploy Frontend to Vercel
1. Go to [Vercel.com](https://vercel.com) and import the `frontend/` folder.
2. Under **Environment Variables**, add:
   - **Name:** `VITE_API_URL`
   - **Value:** `https://your-backend.onrender.com` *(your live Render backend URL, without a trailing slash)*
3. Deploy! Vercel will now route all `/predict`, `/ecg/predict`, and `/ecg/upload` calls to your cloud backend seamlessly.

---

## 📈 ECG Arrhythmia Studio: Supported Formats & Testing

The ECG studio accepts real ambulatory ECG signals in multiple formats:
- **Formats:** `.csv`, `.txt`, `.json`, `.dat`
- **Supported Layouts:**
  - Single column vertical float series with or without column headers (e.g., `"heart"`, `"V5_lead"`, `"MLII"`).
  - Row arrays of 187 sample points (resampled automatically via linear interpolation and normalized to $[0, 1]$).
  - 188-column MIT-BIH benchmark rows (the trailing label column is automatically detected and stripped).
- **Test Files Provided:**
  Pre-generated ready-to-test authentic MIT-BIH sample files are included in `data/demo_upload_files/` and `frontend/public/mitbih_102_single_lead.csv`.



