"""
Data Preprocessing & Pipeline Module for Cardiovascular Disease Prediction System.

This module handles dataset cleaning, outlier filtering based on physiological sanity boundaries,
duplicate removal, stratified train-test splitting to prevent data leakage, and
building scikit-learn ColumnTransformer / Pipeline objects.
"""

import os
import sys
import pandas as pd
import numpy as np

# Ensure project root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline

from src.feature_engineering import add_engineered_features


def load_raw_data(data_path: str = "data/raw/cardio_train.csv") -> pd.DataFrame:
    """Loads raw cardiovascular dataset from CSV."""
    if not os.path.exists(data_path):
        raise FileNotFoundError(f"Raw data file not found at {data_path}")
    df = pd.read_csv(data_path, sep=";")
    return df


def clean_dataset(df: pd.DataFrame, verbose: bool = True) -> pd.DataFrame:
    """
    Cleans dataset by filtering physiological anomalies, handling duplicates,
    and applying feature engineering.

    Physiological Cleaning Criteria:
    - Systolic BP (ap_hi): 50 mmHg <= ap_hi <= 250 mmHg
    - Diastolic BP (ap_lo): 40 mmHg <= ap_lo <= 150 mmHg
    - Inverted BP: ap_hi >= ap_lo
    - Height: 100 cm <= height <= 220 cm
    - Weight: 35 kg <= weight <= 200 kg

    Parameters:
    -----------
    df : pd.DataFrame
        Raw dataset.
    verbose : bool
        If True, prints detailed summary of dropped records.

    Returns:
    --------
    pd.DataFrame
        Cleaned, feature-engineered dataset.
    """
    initial_rows = len(df)
    df_clean = df.copy()

    # 1. Drop feature-level duplicates (excluding 'id')
    feat_cols = [c for c in df_clean.columns if c != 'id']
    dups = df_clean.duplicated(subset=feat_cols).sum()
    df_clean = df_clean.drop_duplicates(subset=feat_cols).reset_index(drop=True)

    # 2. Filter physiological invalid blood pressures
    valid_bp_mask = (
        (df_clean['ap_hi'] >= 50) & (df_clean['ap_hi'] <= 250) &
        (df_clean['ap_lo'] >= 40) & (df_clean['ap_lo'] <= 150) &
        (df_clean['ap_hi'] >= df_clean['ap_lo'])
    )

    # 3. Filter extreme height and weight outliers
    valid_height_mask = (df_clean['height'] >= 100) & (df_clean['height'] <= 220)
    valid_weight_mask = (df_clean['weight'] >= 35) & (df_clean['weight'] <= 200)

    # Combine all valid masks
    clean_mask = valid_bp_mask & valid_height_mask & valid_weight_mask
    dropped_rows = initial_rows - clean_mask.sum()
    df_clean = df_clean[clean_mask].reset_index(drop=True)

    # 4. Drop 'id' column as it has zero predictive power
    if 'id' in df_clean.columns:
        df_clean = df_clean.drop(columns=['id'])

    # 5. Apply Feature Engineering
    df_clean = add_engineered_features(df_clean)

    if verbose:
        print("==================================================")
        print("PREPROCESSING & PHYSIOLOGICAL CLEANING SUMMARY")
        print("==================================================")
        print(f"Initial Rows: {initial_rows}")
        print(f"Duplicate Feature Rows Removed: {dups}")
        print(f"Physiological Outliers Dropped: {dropped_rows}")
        print(f"Cleaned Rows Retained: {len(df_clean)} ({len(df_clean)/initial_rows*100:.2f}%)")
        print(f"Cleaned Columns: {len(df_clean.columns)}")

    return df_clean


def split_data(
    df: pd.DataFrame,
    target_col: str = "cardio",
    test_size: float = 0.2,
    random_state: int = 42
):
    """
    Splits dataset into stratified train and test sets BEFORE preprocessing transformations
    to strictly prevent data leakage.

    Returns:
    --------
    X_train, X_test, y_train, y_test
    """
    X = df.drop(columns=[target_col])
    y = df[target_col]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=test_size, random_state=random_state, stratify=y
    )
    return X_train, X_test, y_train, y_test


def get_preprocessing_pipeline(numerical_cols: list, categorical_cols: list) -> ColumnTransformer:
    """
    Creates a scikit-learn ColumnTransformer for feature scaling and encoding.
    Uses StandardScaler for numerical features and OneHotEncoder for categoricals.

    Parameters:
    -----------
    numerical_cols : list
        Continuous numerical column names to be standardized via StandardScaler.
    categorical_cols : list
        Categorical column names to be encoded with OneHotEncoder.

    Returns:
    --------
    ColumnTransformer
    """
    num_pipeline = Pipeline(steps=[
        ('scaler', StandardScaler())
    ])

    cat_pipeline = Pipeline(steps=[
        ('encoder', OneHotEncoder(drop='first', sparse_output=False, handle_unknown='ignore'))
    ])

    preprocessor = ColumnTransformer(
        transformers=[
            ('num', num_pipeline, numerical_cols),
            ('cat', cat_pipeline, categorical_cols)
        ]
    )
    return preprocessor



if __name__ == "__main__":
    df_raw = load_raw_data()
    df_cleaned = clean_dataset(df_raw)
    X_train, X_test, y_train, y_test = split_data(df_cleaned)
    print(f"Train Shape: {X_train.shape}, Test Shape: {X_test.shape}")
