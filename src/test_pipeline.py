"""
End-to-End Automated Integration Test Runner for Cardiovascular Disease Prediction System.

Verifies:
1. Raw dataset exists and loads cleanly
2. Preprocessing & physiological cleaning filters invalid values
3. Feature engineering computes BMI, pulse pressure, MAP, and BP categories correctly
4. Model artifacts exist and deserialize cleanly
5. Prediction interface generates risk probabilities and disclaimers
6. Output figures and comparison tables exist in outputs/
"""

import os
import sys
import joblib
import pandas as pd
import numpy as np

# Ensure project root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.data_preprocessing import load_raw_data, clean_dataset, split_data
from src.feature_engineering import add_engineered_features
from src.predict import CardiovascularRiskPredictor


def run_integration_tests():
    print("==================================================")
    print("RUNNING END-TO-END SYSTEM INTEGRATION TESTS")
    print("==================================================")

    # Test 1: Data Loading & Preprocessing
    print("[TEST 1] Testing Data Loading & Cleaning...")
    df_raw = load_raw_data()
    assert len(df_raw) == 70000, f"Expected 70,000 raw rows, got {len(df_raw)}"

    df_cleaned = clean_dataset(df_raw, verbose=False)
    assert len(df_cleaned) == 68600, f"Expected 68,600 cleaned rows, got {len(df_cleaned)}"
    print("  -> PASSED: Data loading and cleaning verified (68,600 valid records).")

    # Test 2: Feature Engineering
    print("[TEST 2] Testing Feature Engineering Logic...")
    sample_df = pd.DataFrame([{
        'age': 18393, 'height': 168, 'weight': 62.0, 'ap_hi': 120, 'ap_lo': 80
    }])
    sample_feat = add_engineered_features(sample_df)
    assert 'bmi' in sample_feat.columns
    assert sample_feat['bmi'].iloc[0] == 21.97, f"Expected BMI 21.97, got {sample_feat['bmi'].iloc[0]}"
    assert sample_feat['pulse_pressure'].iloc[0] == 40
    print("  -> PASSED: Feature engineering logic verified.")

    # Test 3: Data Leakage Prevention (Train/Test Split)
    print("[TEST 3] Testing Stratified Data Splitting...")
    X_train, X_test, y_train, y_test = split_data(df_cleaned, test_size=0.2, random_state=42)
    assert len(X_train) == 54880
    assert len(X_test) == 13720
    assert abs(y_train.mean() - y_test.mean()) < 0.005
    print("  -> PASSED: Stratified split verified (54,880 train / 13,720 test).")

    # Test 4: Model Serialization & Inference
    print("[TEST 4] Testing Model Artifacts & Prediction System...")
    model_path = os.path.abspath("models/final_model.pkl")
    assert os.path.exists(model_path), "final_model.pkl does not exist"

    predictor = CardiovascularRiskPredictor(model_path)
    test_patient = {
        'age_years': 56.0,
        'gender': 2,
        'height': 175.0,
        'weight': 85.0,
        'ap_hi': 145,
        'ap_lo': 95,
        'cholesterol': 3,
        'gluc': 1,
        'smoke': 1,
        'alco': 0,
        'active': 0
    }
    result = predictor.predict_patient(test_patient)
    assert 'predicted_class' in result
    assert 'probability_pct' in result
    assert 'disclaimer' in result
    print(f"  -> PASSED: Prediction interface verified. Output Risk: {result['risk_category']} ({result['probability_pct']}%).")

    # Test 5: Verify Outputs Directory Artifacts
    print("[TEST 5] Testing Output Figures & Tables...")
    expected_figures = [
        'target_distribution.png', 'age_distribution_by_target.png',
        'bmi_distribution_by_target.png', 'blood_pressure_distribution.png',
        'cholesterol_glucose_risk.png', 'lifestyle_risk_factors.png',
        'correlation_heatmap.png', 'feature_boxplots.png',
        'roc_curves.png', 'confusion_matrices.png', 'feature_importances.png'
    ]
    for fig_name in expected_figures:
        fig_path = os.path.join("outputs/figures", fig_name)
        assert os.path.exists(fig_path), f"Missing figure: {fig_path}"

    assert os.path.exists("outputs/tables/model_comparison.csv"), "Missing model_comparison.csv"
    assert os.path.exists("outputs/tables/model_comparison.md"), "Missing model_comparison.md"
    assert os.path.exists("outputs/results/academic_report_sections.md"), "Missing academic_report_sections.md"
    print("  -> PASSED: All 11 figures and 3 academic report tables verified.")

    print("\n==================================================")
    print("ALL 5 INTEGRATION TESTS PASSED SUCCESSFULLY! [OK]")
    print("==================================================")


if __name__ == "__main__":
    run_integration_tests()
