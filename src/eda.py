"""
Exploratory Data Analysis (EDA) Module for Cardiovascular Disease Prediction System.

Generates publication-ready figures for academic reporting:
1. Target Class Distribution
2. Age Distribution by Target Class
3. BMI Distribution by Target Class
4. Systolic & Diastolic Blood Pressure Distributions
5. Cholesterol & Glucose Risk Factors
6. Lifestyle Factors (Smoking, Alcohol, Physical Activity)
7. Feature Correlation Heatmap
8. Boxplots of Key Numerical Features
"""

import os
import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Ensure project root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.data_preprocessing import load_raw_data, clean_dataset

# Set global publication styling
plt.style.use('seaborn-v0_8-whitegrid' if 'seaborn-v0_8-whitegrid' in plt.style.available else 'default')
plt.rcParams['font.family'] = 'sans-serif'
plt.rcParams['font.size'] = 11
plt.rcParams['axes.titlesize'] = 13
plt.rcParams['axes.labelsize'] = 11

FIGURES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../outputs/figures"))
os.makedirs(FIGURES_DIR, exist_ok=True)


def generate_eda_plots(df: pd.DataFrame):
    """
    Generates all EDA plots and saves them to outputs/figures/.
    """
    print("Generating publication EDA plots...")

    # Palette setup
    palette = {0: '#2b5c8f', 1: '#d95f02'}
    target_labels = {0: 'No CVD (Class 0)', 1: 'CVD Present (Class 1)'}
    df_plot = df.copy()
    df_plot['CVD_Label'] = df_plot['cardio'].map(target_labels)

    # 1. Target Class Distribution
    fig, ax = plt.subplots(figsize=(7, 5))
    sns.countplot(x='CVD_Label', data=df_plot, palette=['#2b5c8f', '#d95f02'], ax=ax, hue='CVD_Label', legend=False)
    ax.set_title("Cardiovascular Disease Target Class Distribution", fontweight='bold', pad=15)
    ax.set_xlabel("Cardiovascular Disease Status")
    ax.set_ylabel("Patient Count")
    for p in ax.patches:
        height = p.get_height()
        pct = (height / len(df_plot)) * 100
        ax.annotate(f"{int(height):,}\n({pct:.1f}%)",
                    (p.get_x() + p.get_width() / 2., height / 2),
                    ha='center', va='center', fontsize=11, color='white', fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "target_distribution.png"), dpi=300)
    plt.close()

    # 2. Age Distribution by Target Class
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.kdeplot(data=df_plot, x='age_years', hue='CVD_Label', common_norm=False, fill=True,
                palette=['#2b5c8f', '#d95f02'], alpha=0.4, linewidth=2, ax=ax)
    ax.set_title("Age Distribution by Cardiovascular Disease Status", fontweight='bold', pad=15)
    ax.set_xlabel("Age (Years)")
    ax.set_ylabel("Density")
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "age_distribution_by_target.png"), dpi=300)
    plt.close()

    # 3. BMI Distribution by Target Class
    fig, ax = plt.subplots(figsize=(8, 5))
    sns.kdeplot(data=df_plot, x='bmi', hue='CVD_Label', common_norm=False, fill=True,
                palette=['#2b5c8f', '#d95f02'], alpha=0.4, linewidth=2, ax=ax)
    ax.set_xlim(15, 50)
    ax.set_title("BMI Distribution by Cardiovascular Disease Status", fontweight='bold', pad=15)
    ax.set_xlabel("Body Mass Index (kg/m²)")
    ax.set_ylabel("Density")
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "bmi_distribution_by_target.png"), dpi=300)
    plt.close()

    # 4. Blood Pressure Scatter Plot
    fig, ax = plt.subplots(figsize=(8, 6))
    sns.scatterplot(data=df_plot.sample(5000, random_state=42), x='ap_lo', y='ap_hi', hue='CVD_Label',
                    palette=['#2b5c8f', '#d95f02'], alpha=0.6, s=25, ax=ax)
    ax.set_title("Systolic vs Diastolic Blood Pressure (Sample of 5,000 Patients)", fontweight='bold', pad=15)
    ax.set_xlabel("Diastolic Blood Pressure (ap_lo, mmHg)")
    ax.set_ylabel("Systolic Blood Pressure (ap_hi, mmHg)")
    ax.set_xlim(40, 140)
    ax.set_ylim(60, 220)
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "blood_pressure_distribution.png"), dpi=300)
    plt.close()

    # 5. Cholesterol & Glucose Risk Factors
    fig, axes = plt.subplots(1, 2, figsize=(13, 5))
    chol_map = {1: 'Normal', 2: 'Above Normal', 3: 'Well Above Normal'}
    df_plot['cholesterol_label'] = df_plot['cholesterol'].map(chol_map)
    df_plot['gluc_label'] = df_plot['gluc'].map(chol_map)

    sns.barplot(data=df_plot, x='cholesterol_label', y='cardio', palette='Oranges_r', errorbar=None, ax=axes[0], hue='cholesterol_label', legend=False)
    axes[0].set_title("CVD Prevalence by Cholesterol Level", fontweight='bold')
    axes[0].set_xlabel("Cholesterol Category")
    axes[0].set_ylabel("CVD Prevalence Rate")
    for p in axes[0].patches:
        axes[0].annotate(f"{p.get_height()*100:.1f}%", (p.get_x() + p.get_width() / 2., p.get_height()),
                         ha='center', va='bottom', fontsize=10, fontweight='bold')

    sns.barplot(data=df_plot, x='gluc_label', y='cardio', palette='Blues_r', errorbar=None, ax=axes[1], hue='gluc_label', legend=False)
    axes[1].set_title("CVD Prevalence by Glucose Level", fontweight='bold')
    axes[1].set_xlabel("Glucose Category")
    axes[1].set_ylabel("CVD Prevalence Rate")
    for p in axes[1].patches:
        axes[1].annotate(f"{p.get_height()*100:.1f}%", (p.get_x() + p.get_width() / 2., p.get_height()),
                         ha='center', va='bottom', fontsize=10, fontweight='bold')

    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "cholesterol_glucose_risk.png"), dpi=300)
    plt.close()

    # 6. Lifestyle Risk Factors
    fig, ax = plt.subplots(figsize=(10, 5))
    lifestyle_df = pd.DataFrame([
        {'Factor': 'Smoking', 'Status': 'Non-Smoker', 'Prevalence': df_plot[df_plot['smoke']==0]['cardio'].mean()},
        {'Factor': 'Smoking', 'Status': 'Smoker', 'Prevalence': df_plot[df_plot['smoke']==1]['cardio'].mean()},
        {'Factor': 'Alcohol', 'Status': 'Non-Drinker', 'Prevalence': df_plot[df_plot['alco']==0]['cardio'].mean()},
        {'Factor': 'Alcohol', 'Status': 'Drinker', 'Prevalence': df_plot[df_plot['alco']==1]['cardio'].mean()},
        {'Factor': 'Activity', 'Status': 'Inactive', 'Prevalence': df_plot[df_plot['active']==0]['cardio'].mean()},
        {'Factor': 'Activity', 'Status': 'Active', 'Prevalence': df_plot[df_plot['active']==1]['cardio'].mean()}
    ])
    sns.barplot(data=lifestyle_df, x='Factor', y='Prevalence', hue='Status', palette='Set2', ax=ax)
    ax.set_title("CVD Risk Prevalence across Lifestyle Factors", fontweight='bold', pad=15)
    ax.set_ylabel("CVD Risk Rate")
    for p in ax.patches:
        if p.get_height() > 0:
            ax.annotate(f"{p.get_height()*100:.1f}%", (p.get_x() + p.get_width() / 2., p.get_height()),
                        ha='center', va='bottom', fontsize=10, fontweight='bold')
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "lifestyle_risk_factors.png"), dpi=300)
    plt.close()

    # 7. Correlation Heatmap
    num_cols = ['age_years', 'height', 'weight', 'ap_hi', 'ap_lo', 'bmi', 'pulse_pressure', 'map', 'cholesterol', 'gluc', 'cardio']
    corr = df_plot[num_cols].corr()

    fig, ax = plt.subplots(figsize=(10, 8))
    sns.heatmap(corr, annot=True, fmt=".2f", cmap='coolwarm', vmin=-1, vmax=1, linewidths=0.5, ax=ax)
    ax.set_title("Pearson Correlation Heatmap of Health Features", fontweight='bold', pad=15)
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "correlation_heatmap.png"), dpi=300)
    plt.close()

    # 8. Boxplots of Key Features
    fig, axes = plt.subplots(2, 2, figsize=(12, 10))
    sns.boxplot(data=df_plot, x='CVD_Label', y='age_years', palette=['#2b5c8f', '#d95f02'], ax=axes[0,0], hue='CVD_Label', legend=False)
    axes[0,0].set_title("Age Distribution Boxplot")
    
    sns.boxplot(data=df_plot, x='CVD_Label', y='bmi', palette=['#2b5c8f', '#d95f02'], ax=axes[0,1], hue='CVD_Label', legend=False)
    axes[0,1].set_title("BMI Boxplot")
    axes[0,1].set_ylim(15, 55)

    sns.boxplot(data=df_plot, x='CVD_Label', y='ap_hi', palette=['#2b5c8f', '#d95f02'], ax=axes[1,0], hue='CVD_Label', legend=False)
    axes[1,0].set_title("Systolic Blood Pressure Boxplot")
    axes[1,0].set_ylim(80, 200)

    sns.boxplot(data=df_plot, x='CVD_Label', y='pulse_pressure', palette=['#2b5c8f', '#d95f02'], ax=axes[1,1], hue='CVD_Label', legend=False)
    axes[1,1].set_title("Pulse Pressure Boxplot")
    axes[1,1].set_ylim(10, 100)

    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "feature_boxplots.png"), dpi=300)
    plt.close()

    print(f"All 8 EDA figures successfully saved to {FIGURES_DIR}")


if __name__ == "__main__":
    df_raw = load_raw_data()
    df_cleaned = clean_dataset(df_raw, verbose=False)
    generate_eda_plots(df_cleaned)
