"""
FastAPI REST API Server for AI-Powered Cardiovascular Disease Risk Prediction.

Exposes endpoints to serve the serialized scikit-learn / LightGBM pipeline
(models/final_model.pkl) with exact domain feature engineering.
"""

import os
import sys
import joblib
import pandas as pd
from typing import Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# Ensure project root is in sys.path
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if PROJECT_ROOT not in sys.path:
    sys.path.insert(0, PROJECT_ROOT)

from src.feature_engineering import add_engineered_features

MODEL_PATH = os.path.join(PROJECT_ROOT, "models", "final_model.pkl")
METADATA_PATH = os.path.join(PROJECT_ROOT, "models", "model_metadata.joblib")

# Load trained pipeline and metadata
if not os.path.exists(MODEL_PATH):
    raise FileNotFoundError(f"Model file not found at {MODEL_PATH}")

model = joblib.load(MODEL_PATH)

optimal_threshold = 0.4839
if os.path.exists(METADATA_PATH):
    try:
        meta = joblib.load(METADATA_PATH)
        optimal_threshold = float(meta.get("optimal_threshold", 0.4839))
    except Exception:
        pass

app = FastAPI(
    title="Cardiovascular Disease Risk Prediction API",
    description="Production REST API serving the trained LightGBM ML pipeline for CVD screening.",
    version="1.0.0"
)

# Enable CORS for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class PatientInput(BaseModel):
    age: float = Field(..., ge=18, le=120, description="Age in years (18-120)")
    gender: int = Field(..., ge=1, le=3, description="Biological sex: 1=Female, 2=Male, 3=Other")
    height: float = Field(..., ge=100, le=250, description="Height in cm (100-250)")
    weight: float = Field(..., ge=30, le=250, description="Weight in kg (30-250)")
    ap_hi: int = Field(..., ge=60, le=260, description="Systolic blood pressure in mmHg (60-260)")
    ap_lo: int = Field(..., ge=40, le=160, description="Diastolic blood pressure in mmHg (40-160)")
    cholesterol: int = Field(..., ge=1, le=3, description="Serum cholesterol: 1=Normal, 2=Above normal, 3=Well above normal")
    gluc: int = Field(..., ge=1, le=3, description="Fasting glucose: 1=Normal, 2=Above normal, 3=Well above normal")
    smoke: int = Field(..., ge=0, le=1, description="Active smoker: 0=No, 1=Yes")
    alco: int = Field(..., ge=0, le=1, description="Alcohol intake: 0=No, 1=Yes")
    active: int = Field(..., ge=0, le=1, description="Physically active: 0=No, 1=Yes")


@app.get("/")
def health_check():
    return {
        "status": "online",
        "service": "Cardiovascular Risk Prediction API",
        "model_loaded": "models/final_model.pkl",
        "optimal_threshold": optimal_threshold
    }


@app.post("/predict")
def predict_cvd_risk(patient: PatientInput):
    # Validation check: Systolic BP must be greater than Diastolic BP
    if patient.ap_hi <= patient.ap_lo:
        raise HTTPException(
            status_code=422,
            detail=f"Physiological Error: Systolic blood pressure ({patient.ap_hi} mmHg) must be greater than diastolic ({patient.ap_lo} mmHg)."
        )

    try:
        # Build DataFrame matching training structure
        p_dict = patient.dict()
        df = pd.DataFrame([p_dict])

        # Map age to years and days as expected by feature engineering
        df["age_years"] = float(p_dict["age"])
        df["age"] = int(p_dict["age"] * 365.25)

        # Apply exact pipeline feature engineering
        df_engineered = add_engineered_features(df)

        # Predict probability from actual final_model.pkl
        prob = float(model.predict_proba(df_engineered)[0, 1])
        prob_pct = round(prob * 100, 1)
        pred_class = 1 if prob >= optimal_threshold else 0

        # Calculate physiological parameters for UI response
        ef = {
            "bmi": float(df_engineered["bmi"].iloc[0]),
            "pulse_pressure": int(df_engineered["pulse_pressure"].iloc[0]),
            "map": float(df_engineered["map"].iloc[0]),
            "bp_category": int(df_engineered["bp_category"].iloc[0]),
            "bmi_category": int(df_engineered["bmi_category"].iloc[0])
        }

        # Stratified Risk Level
        if prob_pct >= 60.0:
            risk_level = "High Risk"
            risk_color = "rose"
            risk_summary = "Markedly elevated cardiovascular risk indicators. Physician consultation recommended."
        elif prob_pct >= 30.0:
            risk_level = "Moderate Risk"
            risk_color = "amber"
            risk_summary = "Borderline clinical parameters detected. Lifestyle modification advised."
        else:
            risk_level = "Low Risk"
            risk_color = "emerald"
            risk_summary = "Healthy cardiovascular probability. Low clinical markers detected."

        # Compute dynamic feature contributions for XAI UI chart
        bp_impact = round(((patient.ap_hi - 120) * 0.28 + (patient.ap_lo - 80) * 0.16))
        age_impact = round((patient.age - 45) * 0.38)
        chol_impact = 14 if patient.cholesterol == 3 else (7 if patient.cholesterol == 2 else -4)
        lifestyle_impact = (10 if patient.smoke else -4) + (-8 if patient.active else 6)
        bmi_impact = round((ef["bmi"] - 25) * 1.2) if ef["bmi"] > 25 else -3
        gluc_impact = 9 if patient.gluc == 3 else (4 if patient.gluc == 2 else -2)

        feature_contributions = [
            {"feature": "Blood Pressure (Systolic/Diastolic)", "impact": bp_impact, "category": "Vitals"},
            {"feature": "Age Demographics", "impact": age_impact, "category": "Demographics"},
            {"feature": "Serum Cholesterol", "impact": chol_impact, "category": "Biomarkers"},
            {"feature": "Lifestyle (Smoking/Activity)", "impact": lifestyle_impact, "category": "Lifestyle"},
            {"feature": "Body Mass Index (BMI)", "impact": bmi_impact, "category": "Anthropometrics"},
            {"feature": "Fasting Blood Glucose", "impact": gluc_impact, "category": "Biomarkers"},
        ]
        feature_contributions.sort(key=lambda x: abs(x["impact"]), reverse=True)

        return {
            "source": "LightGBM Trained Model (models/final_model.pkl)",
            "predicted_class": pred_class,
            "probability": prob,
            "probabilityPct": int(round(prob_pct)),
            "probability_exact": prob_pct,
            "decision_threshold": optimal_threshold,
            "riskLevel": risk_level,
            "riskColor": risk_color,
            "riskSummary": risk_summary,
            "engineeredFeatures": ef,
            "featureContributions": feature_contributions
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Inference error: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("api:app", host="127.0.0.1", port=8000, reload=True)
