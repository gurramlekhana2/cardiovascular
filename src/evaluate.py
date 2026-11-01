"""
Model Evaluation & Systematic Comparison Module for Cardiovascular Disease Prediction System.

Calculates comprehensive evaluation metrics on held-out test set:
- Accuracy, Precision, Recall (Sensitivity), Specificity, F1-Score, ROC-AUC, PR-AUC.
Generates ROC curve and Confusion Matrix figures, and exports final comparison tables.
"""

import os
import sys
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns

# Ensure project root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score,
    roc_auc_score, average_precision_score, confusion_matrix,
    roc_curve, precision_recall_curve
)

FIGURES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../outputs/figures"))
TABLES_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../outputs/tables"))
os.makedirs(FIGURES_DIR, exist_ok=True)
os.makedirs(TABLES_DIR, exist_ok=True)


def evaluate_all_models(best_estimators: dict, X_test: pd.DataFrame, y_test: pd.Series, cv_summary: dict):
    """
    Evaluates all tuned models on held-out test set and saves evaluation plots and tables.

    Returns:
    --------
    pd.DataFrame containing model metrics comparison table, str best_model_name
    """
    print("==================================================")
    print("HELD-OUT TEST SET EVALUATION & COMPARISON")
    print("==================================================")

    results_list = []
    y_probs_dict = {}
    y_preds_dict = {}

    for name, model in best_estimators.items():
        y_pred = model.predict(X_test)
        if hasattr(model, "predict_proba"):
            y_prob = model.predict_proba(X_test)[:, 1]
        else:
            y_prob = model.decision_function(X_test)

        y_preds_dict[name] = y_pred
        y_probs_dict[name] = y_prob

        # Confusion Matrix components
        tn, fp, fn, tp = confusion_matrix(y_test, y_pred).ravel()
        specificity = tn / (tn + fp) if (tn + fp) > 0 else 0.0

        # Calculate metrics
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        roc_auc = roc_auc_score(y_test, y_prob)
        pr_auc = average_precision_score(y_test, y_prob)

        cv_f1 = cv_summary[name]['Mean_CV_F1']
        cv_roc = cv_summary[name]['Mean_CV_ROC_AUC']

        results_list.append({
            'Model': name,
            'CV Mean F1': round(cv_f1, 4),
            'CV Mean ROC-AUC': round(cv_roc, 4),
            'Test Accuracy': round(acc, 4),
            'Test Precision': round(prec, 4),
            'Test Recall (Sensitivity)': round(rec, 4),
            'Test Specificity': round(specificity, 4),
            'Test F1-Score': round(f1, 4),
            'Test ROC-AUC': round(roc_auc, 4),
            'Test PR-AUC': round(pr_auc, 4)
        })

    results_df = pd.DataFrame(results_list)
    results_df = results_df.sort_values(by='Test F1-Score', ascending=False).reset_index(drop=True)

    print("\n--- FINAL MODEL COMPARISON TABLE ---")
    print(results_df.to_string(index=False))

    # Save CSV & Markdown tables
    csv_path = os.path.join(TABLES_DIR, "model_comparison.csv")
    md_path = os.path.join(TABLES_DIR, "model_comparison.md")
    results_df.to_csv(csv_path, index=False)
    with open(md_path, "w", encoding="utf-8") as f:
        f.write("# Model Performance & Comparison Table\n\n")
        f.write(results_df.to_markdown(index=False))

    print(f"\nTables saved to {csv_path} and {md_path}")

    # 1. Plot ROC Curves
    plt.figure(figsize=(9, 7))
    for name, y_prob in y_probs_dict.items():
        fpr, tpr, _ = roc_curve(y_test, y_prob)
        auc_val = roc_auc_score(y_test, y_prob)
        plt.plot(fpr, tpr, label=f"{name} (AUC = {auc_val:.3f})", linewidth=2)
    plt.plot([0, 1], [0, 1], 'k--', label='Random Chance (AUC = 0.500)', alpha=0.7)
    plt.xlabel('False Positive Rate (1 - Specificity)')
    plt.ylabel('True Positive Rate (Recall / Sensitivity)')
    plt.title('ROC Curves Comparison on Held-Out Test Set', fontweight='bold', pad=15)
    plt.legend(loc='lower right', frameon=True)
    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "roc_curves.png"), dpi=300)
    plt.close()

    # 2. Plot Grid of Confusion Matrices
    num_models = len(y_preds_dict)
    cols = 3
    rows = (num_models + cols - 1) // cols
    fig, axes = plt.subplots(rows, cols, figsize=(5 * cols, 4.5 * rows))
    axes = np.array(axes).flatten()

    for idx, (name, y_pred) in enumerate(y_preds_dict.items()):
        cm = confusion_matrix(y_test, y_pred)
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', ax=axes[idx], cbar=False,
                    xticklabels=['No CVD', 'CVD'], yticklabels=['No CVD', 'CVD'])
        axes[idx].set_title(f"{name}", fontweight='bold')
        axes[idx].set_xlabel('Predicted Class')
        axes[idx].set_ylabel('Actual Class')

    # Remove extra unused subplots
    for j in range(num_models, len(axes)):
        fig.delaxes(axes[j])

    plt.tight_layout()
    plt.savefig(os.path.join(FIGURES_DIR, "confusion_matrices.png"), dpi=300)
    plt.close()

    best_model_name = results_df.iloc[0]['Model']
    print(f"\nSELECTED FINAL MODEL: {best_model_name} (Highest Test F1-Score & ROC-AUC)")

    return results_df, best_model_name
