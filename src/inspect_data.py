import pandas as pd
import numpy as np

def inspect_dataset(data_path="data/raw/cardio_train.csv"):
    df = pd.read_csv(data_path, sep=";")
    print("==================================================")
    print("CARDIOVASCULAR DISEASE DATASET PRELIMINARY INSPECTION")
    print("==================================================")
    print(f"Total Rows: {df.shape[0]}")
    print(f"Total Columns: {df.shape[1]}")
    print(f"Columns: {list(df.columns)}")
    print("\n--- Data Types & Missing Values ---")
    info_df = pd.DataFrame({
        'Dtype': df.dtypes,
        'Null_Count': df.isnull().sum(),
        'Null_Pct': (df.isnull().sum() / len(df)) * 100,
        'Unique_Values': df.nunique()
    })
    print(info_df)

    print("\n--- Numerical Feature Summary ---")
    df['age_years'] = (df['age'] / 365.25).round(2)
    print(df[['age_years', 'height', 'weight', 'ap_hi', 'ap_lo']].describe().T[['count', 'mean', 'std', 'min', '25%', '50%', '75%', 'max']])

    print("\n--- Categorical & Binary Distributions ---")
    for col in ['gender', 'cholesterol', 'gluc', 'smoke', 'alco', 'active', 'cardio']:
        val_counts = df[col].value_counts().to_dict()
        val_pcts = (df[col].value_counts(normalize=True) * 100).round(2).to_dict()
        print(f"Feature '{col}': Counts = {val_counts}, Pcts (%) = {val_pcts}")

    print("\n--- Data Quality & Physiological Anomaly Detection ---")
    inv_ap_hi = df[(df['ap_hi'] < 50) | (df['ap_hi'] > 250)]
    inv_ap_lo = df[(df['ap_lo'] < 40) | (df['ap_lo'] > 150)]
    inverted_bp = df[df['ap_hi'] < df['ap_lo']]
    inv_height = df[(df['height'] < 100) | (df['height'] > 220)]
    inv_weight = df[(df['weight'] < 35) | (df['weight'] > 200)]
    
    # Duplicate records
    exact_duplicates = df.duplicated().sum()
    feature_duplicates = df.duplicated(subset=[c for c in df.columns if c not in ['id', 'age_years']]).sum()

    print(f"1. Invalid Systolic BP (ap_hi < 50 or > 250 mmHg): {len(inv_ap_hi)} rows ({len(inv_ap_hi)/len(df)*100:.2f}%)")
    print(f"2. Invalid Diastolic BP (ap_lo < 40 or > 150 mmHg): {len(inv_ap_lo)} rows ({len(inv_ap_lo)/len(df)*100:.2f}%)")
    print(f"3. Inverted BP (ap_hi < ap_lo): {len(inverted_bp)} rows ({len(inverted_bp)/len(df)*100:.2f}%)")
    print(f"4. Unusual Height (< 100 cm or > 220 cm): {len(inv_height)} rows ({len(inv_height)/len(df)*100:.2f}%)")
    print(f"5. Unusual Weight (< 35 kg or > 200 kg): {len(inv_weight)} rows ({len(inv_weight)/len(df)*100:.2f}%)")
    print(f"6. Exact Duplicate Rows (all columns): {exact_duplicates}")
    print(f"7. Feature-level Duplicate Rows (excluding 'id'): {feature_duplicates}")

if __name__ == "__main__":
    inspect_dataset()
