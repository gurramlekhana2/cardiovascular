"""
Feature Engineering Module for Cardiovascular Disease Prediction System.

This module provides functions to create domain-justified physiological features
from raw clinical measurements (age, height, weight, blood pressure) without target leakage.
"""

import numpy as np
import pandas as pd


def add_engineered_features(df: pd.DataFrame) -> pd.DataFrame:
    """
    Computes domain-specific physiological features for CVD risk analysis.

    Parameters:
    -----------
    df : pd.DataFrame
        DataFrame containing original health features:
        'age' (days), 'height' (cm), 'weight' (kg), 'ap_hi' (mmHg), 'ap_lo' (mmHg).

    Returns:
    --------
    pd.DataFrame
        DataFrame augmented with engineered features.
    """
    df = df.copy()

    # 1. Convert Age from days to years
    if 'age_years' not in df.columns:
        df['age_years'] = (df['age'] / 365.25).round(2)

    # 2. Body Mass Index (BMI = kg / m^2)
    height_m = df['height'] / 100.0
    df['bmi'] = (df['weight'] / (height_m ** 2)).round(2)

    # 3. Pulse Pressure (PP = Systolic - Diastolic)
    df['pulse_pressure'] = df['ap_hi'] - df['ap_lo']

    # 4. Mean Arterial Pressure (MAP = Diastolic + (Pulse Pressure / 3))
    df['map'] = (df['ap_lo'] + (df['pulse_pressure'] / 3.0)).round(2)

    # 5. AHA Blood Pressure Categorization
    def categorize_bp(row):
        sys, dia = row['ap_hi'], row['ap_lo']
        if sys > 180 or dia > 120:
            return 4  # Hypertensive Crisis
        elif sys >= 140 or dia >= 90:
            return 3  # Stage 2 Hypertension
        elif (130 <= sys < 140) or (80 <= dia < 90):
            return 2  # Stage 1 Hypertension
        elif (120 <= sys < 130) and dia < 80:
            return 1  # Elevated BP
        else:
            return 0  # Normal BP

    df['bp_category'] = df.apply(categorize_bp, axis=1)

    # 6. WHO BMI Categorization
    def categorize_bmi(bmi_val):
        if bmi_val < 18.5:
            return 0  # Underweight
        elif 18.5 <= bmi_val < 25.0:
            return 1  # Normal weight
        elif 25.0 <= bmi_val < 30.0:
            return 2  # Overweight
        else:
            return 3  # Obese

    df['bmi_category'] = df['bmi'].apply(categorize_bmi)

    # 7. Domain Risk Interactions
    # Arterial stiffness risk: older age combined with high MAP
    df['age_map_interaction'] = (df['age_years'] * (df['map'] / 100.0)).round(2)

    # Metabolic risk score: combined cholesterol and glucose elevations
    if 'cholesterol' in df.columns and 'gluc' in df.columns:
        df['chol_gluc_interaction'] = df['cholesterol'] * df['gluc']
    else:
        df['chol_gluc_interaction'] = 1

    # Composite lifestyle penalty: (0 to 3 scale)
    if 'smoke' in df.columns and 'active' in df.columns and 'alco' in df.columns:
        df['lifestyle_risk'] = df['smoke'] + (1 - df['active']) + df['alco']
    else:
        df['lifestyle_risk'] = 0

    return df


if __name__ == "__main__":
    # Test feature engineering
    sample_df = pd.DataFrame({
        'age': [18393, 20228],
        'height': [168, 156],
        'weight': [62.0, 85.0],
        'ap_hi': [110, 140],
        'ap_lo': [80, 90]
    })
    res = add_engineered_features(sample_df)
    print("Feature Engineering Test Success:")
    print(res[['age_years', 'bmi', 'pulse_pressure', 'map', 'bp_category', 'bmi_category']])
