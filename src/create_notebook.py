"""
Script to create notebooks/cardiovascular_analysis.ipynb
"""

import os
import nbformat as nbf

def generate_notebook():
    nb = nbf.v4.new_notebook()

    nb.cells = [
        nbf.v4.new_markdown_cell("""# Machine Learning Based Cardiovascular Disease Prediction System
## Academic Research & Decision-Support System

**Author**: Senior Machine Learning Project Team  
**Dataset**: Kaggle / UCI Cardiovascular Disease Dataset (70,000 Patient Records)  
**Task**: Binary Classification (`cardio`: 0 = No CVD, 1 = CVD Present)  

---

> ⚠️ **IMPORTANT ACADEMIC DISCLAIMER**:  
> This system is strictly an **academic machine learning decision-support research project**. It is **NOT** a medical diagnostic tool or a clinical medical device, and must **NEVER** replace professional medical advice, physician evaluation, or clinical diagnosis.
"""),

        nbf.v4.new_markdown_cell("""## 1. Project Setup & Library Imports"""),

        nbf.v4.new_code_cell("""import os
import sys
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns
import joblib

# Add project root to sys.path
sys.path.insert(0, os.path.abspath(".."))

from src.data_preprocessing import load_raw_data, clean_dataset, split_data, get_preprocessing_pipeline
from src.feature_engineering import add_engineered_features
from src.train import tune_models
from src.evaluate import evaluate_all_models
from src.explainability import generate_explainability_analysis

plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
%matplotlib inline
print("Setup completed successfully.")
"""),

        nbf.v4.new_markdown_cell("""## 2. Dataset Loading & Exploratory Inspection"""),

        nbf.v4.new_code_cell("""df_raw = load_raw_data("../data/raw/cardio_train.csv")
print("Raw Dataset Shape:", df_raw.shape)
display(df_raw.head())
print("\nDataset Info:")
df_raw.info()
"""),

        nbf.v4.new_markdown_cell("""## 3. Data Preprocessing & Physiological Cleaning

Physiological Outlier Criteria:
- **Systolic BP (`ap_hi`)**: $50 \le \text{ap\_hi} \le 250$ mmHg
- **Diastolic BP (`ap_lo`)**: $40 \le \text{ap\_lo} \le 150$ mmHg
- **Inverted BP**: $\text{ap\_hi} \ge \text{ap\_lo}$
- **Height**: $100 \le \text{height} \le 220$ cm
- **Weight**: $35 \le \text{weight} \le 200$ kg
- **Duplicates**: Remove feature-duplicate rows (ignoring `id`)
"""),

        nbf.v4.new_code_cell("""df_cleaned = clean_dataset(df_raw, verbose=True)
"""),

        nbf.v4.new_markdown_cell("""## 4. Stratified Data Splitting & Leakage Prevention

Splitting data (80% Train, 20% Test) **before** feature scaling and preprocessor fitting to strictly eliminate data leakage.
"""),

        nbf.v4.new_code_cell("""X_train, X_test, y_train, y_test = split_data(df_cleaned, test_size=0.2, random_state=42)
print(f"Training Set Shape: {X_train.shape}, Test Set Shape: {X_test.shape}")
print(f"Target Distribution in Training Set:\n{y_train.value_counts(normalize=True)}")
"""),

        nbf.v4.new_markdown_cell("""## 5. Exploratory Data Analysis (EDA)"""),

        nbf.v4.new_code_cell("""fig, axes = plt.subplots(1, 2, figsize=(14, 5))

# Age distribution by target
sns.kdeplot(data=df_cleaned, x='age_years', hue='cardio', fill=True, palette=['#2b5c8f', '#d95f02'], ax=axes[0])
axes[0].set_title("Age Distribution by CVD Status")

# BMI distribution by target
sns.kdeplot(data=df_cleaned, x='bmi', hue='cardio', fill=True, palette=['#2b5c8f', '#d95f02'], ax=axes[1])
axes[1].set_xlim(15, 50)
axes[1].set_title("BMI Distribution by CVD Status")

plt.tight_layout()
plt.show()
"""),

        nbf.v4.new_markdown_cell("""## 6. Multi-Model Training, 5-Fold Stratified Cross-Validation & Tuning

Training and evaluating 5 classification algorithms:
1. Logistic Regression
2. K-Nearest Neighbors (KNN)
3. Decision Tree Classifier
4. Random Forest Classifier
5. Support Vector Machine (SVM)
"""),

        nbf.v4.new_code_cell("""num_cols = ['age_years', 'height', 'weight', 'ap_hi', 'ap_lo', 'bmi', 'pulse_pressure', 'map']
cat_cols = ['gender', 'cholesterol', 'gluc', 'smoke', 'alco', 'active', 'bp_category', 'bmi_category']

best_estimators, cv_summary = tune_models(X_train, y_train, num_cols, cat_cols)
"""),

        nbf.v4.new_markdown_cell("""## 7. Model Evaluation & Systematic Comparison on Held-Out Test Set"""),

        nbf.v4.new_code_cell("""results_df, best_model_name = evaluate_all_models(best_estimators, X_test, y_test, cv_summary)
display(results_df)
"""),

        nbf.v4.new_markdown_cell("""## 8. Explainable AI (XAI) & Feature Importance"""),

        nbf.v4.new_code_cell("""all_feature_names = num_cols + cat_cols
final_model = best_estimators[best_model_name]
imp_df = generate_explainability_analysis(final_model, X_train, X_test, all_feature_names, best_model_name)
"""),

        nbf.v4.new_markdown_cell("""## 9. Conclusion & Final Model Persistence"""),

        nbf.v4.new_code_cell("""os.makedirs("../models", exist_ok=True)
joblib.dump(final_model, "../models/final_model.pkl")
joblib.dump(final_model.named_steps['preprocessor'], "../models/preprocessing_pipeline.pkl")
print(f"Selected top model ({best_model_name}) saved to ../models/final_model.pkl")
""")
    ]

    nb_path = "notebooks/cardiovascular_analysis.ipynb"
    with open(nb_path, "w", encoding="utf-8") as f:
        nbf.write(nb, f)
    print(f"Jupyter Notebook successfully written to {nb_path}")

if __name__ == "__main__":
    generate_notebook()
