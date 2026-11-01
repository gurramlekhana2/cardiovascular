"""
Master Pipeline Orchestrator for Cardiovascular Disease Prediction System.

Executes all project phases end-to-end:
1. Data loading, cleaning & physiological outlier filtering
2. Stratified train/test data splitting
3. EDA figure generation
4. 5-Fold Stratified Cross-Validation & Hyperparameter Tuning (5 models)
5. Test set evaluation & systematic model comparison
6. Model selection and artifact serialization (.pkl)
7. Explainable AI & SHAP feature importance analysis
8. Inference verification
"""

import os
import sys
import joblib
import pandas as pd
import numpy as np

# Ensure project root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.data_preprocessing import load_raw_data, clean_dataset, split_data, get_preprocessing_pipeline
from src.eda import generate_eda_plots
from src.train import tune_models
from src.evaluate import evaluate_all_models
from src.explainability import generate_explainability_analysis
from src.predict import CardiovascularRiskPredictor

MODELS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../models"))
PROCESSED_DATA_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../data/processed"))
RESULTS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../outputs/results"))

os.makedirs(MODELS_DIR, exist_ok=True)
os.makedirs(PROCESSED_DATA_DIR, exist_ok=True)
os.makedirs(RESULTS_DIR, exist_ok=True)


def execute_full_pipeline():
    print("\n==================================================")
    print("CARDIOVASCULAR DISEASE ML PROJECT - PIPELINE EXECUTION")
    print("==================================================\n")

    # STEP 1: Load and Clean Data
    print("--- PHASE 1 & 2: DATA CLEANING & PREPROCESSING ---")
    df_raw = load_raw_data()
    df_cleaned = clean_dataset(df_raw, verbose=True)

    # STEP 2: Train/Test Split (Prevent Data Leakage)
    print("\n--- PHASE 3: STRATIFIED TRAIN/TEST SPLITTING ---")
    X_train, X_test, y_train, y_test = split_data(df_cleaned, test_size=0.2, random_state=42)

    # Save processed splits
    train_df = pd.concat([X_train, y_train], axis=1)
    test_df = pd.concat([X_test, y_test], axis=1)
    train_df.to_csv(os.path.join(PROCESSED_DATA_DIR, "train_cleaned.csv"), index=False)
    test_df.to_csv(os.path.join(PROCESSED_DATA_DIR, "test_cleaned.csv"), index=False)
    print(f"Processed splits saved to {PROCESSED_DATA_DIR}")

    # STEP 3: Exploratory Data Analysis Plots
    print("\n--- PHASE 4: EXPLORATORY DATA ANALYSIS (EDA) ---")
    generate_eda_plots(df_cleaned)

    # STEP 4: Feature Definitions & Model Training
    print("\n--- PHASE 5: MODEL TRAINING & HYPERPARAMETER TUNING ---")
    num_cols = ['age_years', 'height', 'weight', 'ap_hi', 'ap_lo', 'bmi', 'pulse_pressure', 'map', 'age_map_interaction']
    cat_cols = ['gender', 'cholesterol', 'gluc', 'smoke', 'alco', 'active', 'bp_category', 'bmi_category', 'chol_gluc_interaction', 'lifestyle_risk']

    best_estimators, cv_summary = tune_models(X_train, y_train, num_cols, cat_cols)

    # STEP 5: Held-Out Test Set Evaluation
    print("\n--- PHASE 6: MODEL EVALUATION & COMPARISON ---")
    results_df, best_model_name = evaluate_all_models(best_estimators, X_test, y_test, cv_summary)

    # STEP 6: Save Selected Final Model & Optimized Threshold Metadata
    print(f"\n--- PHASE 7: SERIALIZING FINAL MODEL ({best_model_name}) ---")
    final_model = best_estimators[best_model_name]

    # Calculate optimal threshold on test/val set
    if hasattr(final_model, "predict_proba"):
        y_test_probs = final_model.predict_proba(X_test)[:, 1]
    else:
        y_test_probs = final_model.decision_function(X_test)
    from src.train import compute_optimal_threshold
    optimal_threshold = compute_optimal_threshold(y_test, y_test_probs)
    print(f"Computed Clinical Optimal Threshold (Youden's J): {optimal_threshold:.3f}")

    model_save_path = os.path.join(MODELS_DIR, "final_model.pkl")
    metadata_save_path = os.path.join(MODELS_DIR, "model_metadata.joblib")
    pipeline_save_path = os.path.join(MODELS_DIR, "preprocessing_pipeline.pkl")

    joblib.dump(final_model, model_save_path)
    joblib.dump({
        'model_name': best_model_name,
        'optimal_threshold': optimal_threshold,
        'num_cols': num_cols,
        'cat_cols': cat_cols
    }, metadata_save_path)

    if hasattr(final_model, 'named_steps') and 'preprocessor' in final_model.named_steps:
        joblib.dump(final_model.named_steps['preprocessor'], pipeline_save_path)
    elif hasattr(final_model, 'estimators_'):
        joblib.dump(final_model.estimators_[0].named_steps['preprocessor'], pipeline_save_path)
    print(f"Final model saved to {model_save_path}")
    print(f"Model metadata saved to {metadata_save_path}")

    # STEP 7: Explainable AI & SHAP
    print("\n--- PHASE 8: EXPLAINABLE AI & FEATURE IMPORTANCE ---")
    generate_explainability_analysis(final_model, X_train, X_test, num_cols + cat_cols, best_model_name)

    # STEP 8: Predictor Interface Verification
    print("\n--- PHASE 9: INFERENCE SYSTEM VERIFICATION ---")
    predictor = CardiovascularRiskPredictor(model_save_path)

    sample_patient = {
        'age_years': 55.0,
        'gender': 2,
        'height': 170.0,
        'weight': 80.0,
        'ap_hi': 140,
        'ap_lo': 90,
        'cholesterol': 2,
        'gluc': 1,
        'smoke': 0,
        'alco': 0,
        'active': 1
    }
    pred_res = predictor.predict_patient(sample_patient)
    print("Sample Patient Prediction Verification:")
    print(f"  Risk Category: {pred_res['risk_category']}")
    print(f"  Probability: {pred_res['probability_pct']}%")
    print(f"  Engineered BMI: {pred_res['engineered_features']['bmi']}")
    print(f"  Engineered MAP: {pred_res['engineered_features']['map']}")

    print("\n==================================================")
    print("FULL PIPELINE EXECUTION COMPLETED SUCCESSFULLY!")
    print("==================================================")


if __name__ == "__main__":
    execute_full_pipeline()
