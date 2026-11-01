"""
Interactive Web Application for Cardiovascular Disease Risk Prediction & Decision Support.

Built using Streamlit.
Provides patient health parameter input form, calibrated risk probability scoring,
local per-patient SHAP explainability waterfall, interactive what-if counterfactual simulation,
and academic decision-support disclaimers.
"""

import os
import sys
import pandas as pd
import streamlit as st
import matplotlib.pyplot as plt
import seaborn as sns

# Ensure project root directory is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from src.predict import CardiovascularRiskPredictor, MODEL_PATH
from pdf_report import generate_pdf_report

# Page Config
st.set_page_config(
    page_title="Cardiovascular Risk Prediction System",
    page_icon="🫀",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom Styling
st.markdown("""
<style>
    .main-header {
        font-size: 2.3rem;
        color: #1E3A8A;
        font-weight: 700;
        text-align: center;
        margin-bottom: 2px;
    }
    .sub-header {
        font-size: 1.05rem;
        color: #4B5563;
        text-align: center;
        margin-bottom: 25px;
    }
    .disclaimer-box {
        background-color: #FEF2F2;
        border-left: 5px solid #EF4444;
        padding: 12px;
        border-radius: 4px;
        margin-top: 15px;
        color: #991B1B;
        font-size: 0.90rem;
    }
    .result-card-high {
        background-color: #FFF5F5;
        border: 2px solid #E53E3E;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
    }
    .result-card-low {
        background-color: #F0FFF4;
        border: 2px solid #38A169;
        padding: 20px;
        border-radius: 10px;
        text-align: center;
    }
</style>
""", unsafe_allow_html=True)


def plot_patient_shap(explanations_df: pd.DataFrame):
    """Renders a clean horizontal bar chart showing top patient-specific risk drivers."""
    fig, ax = plt.subplots(figsize=(7, 3.5))
    colors = ['#E53E3E' if d == 'Increases Risk' else '#38A169' for d in explanations_df['Direction']]
    y_positions = range(len(explanations_df))
    
    ax.barh(y_positions, explanations_df['SHAP_Value'], color=colors, height=0.55)
    ax.set_yticks(y_positions)
    ax.set_yticklabels(explanations_df['Factor'], fontsize=10)
    ax.invert_yaxis()
    ax.axvline(0, color='gray', linestyle='--', linewidth=0.8)
    ax.set_xlabel('Contribution to CVD Risk (SHAP Value)', fontsize=9)
    ax.set_title('Top Driving Factors For This Patient', fontsize=11, fontweight='bold', pad=10)
    
    # Legend
    from matplotlib.patches import Patch
    legend_elements = [
        Patch(facecolor='#E53E3E', label='Increases Risk'),
        Patch(facecolor='#38A169', label='Reduces Risk')
    ]
    ax.legend(handles=legend_elements, loc='lower right', fontsize=8)
    plt.tight_layout()
    return fig


def main():
    st.markdown('<div class="main-header">🫀 Cardiovascular Disease Prediction System</div>', unsafe_allow_html=True)
    st.markdown('<div class="sub-header">Advanced Clinical Decision-Support, LightGBM Ensemble & Explainable AI (XAI)</div>', unsafe_allow_html=True)

    st.markdown("""
    > ⚠️ **Clinical & Academic Decision-Support Disclaimer**:
    > This prediction tool is built as an **academic machine learning project** utilizing calibrated gradient boosted trees.
    > It is **NOT** a standalone medical diagnostic device or replacement for direct clinical consultation.
    """)

    # ── Sidebar Model Performance & Accuracy Inspection ──────────
    with st.sidebar:
        st.header("📈 Model Accuracy & Benchmarks")
        st.markdown("**Evaluated on 13,720 held-out test patients:**")
        st.metric(label="Selected Model", value="LightGBM")
        st.metric(label="Test Accuracy", value="73.01%")
        st.metric(label="ROC-AUC Score", value="0.7997")
        st.metric(label="Precision", value="74.89%")
        st.metric(label="Sensitivity (Recall)", value="68.39%")
        
        st.markdown("---")
        st.header("⚡ ECG Arrhythmia Classifier")
        st.markdown("**Evaluated on 21,892 unseen test ECG beats:**")
        st.metric(label="ECG Test Accuracy", value="98.43%")
        st.metric(label="ECG Weighted F1-Score", value="0.9839")

        st.markdown("---")
        with st.expander("📊 View All Models Benchmark Table"):
            comp_path = os.path.join(os.path.dirname(__file__), "../outputs/tables/model_comparison.csv")
            if os.path.exists(comp_path):
                df_bench = pd.read_csv(comp_path)
                st.dataframe(df_bench[['Model', 'Test Accuracy', 'Test ROC-AUC', 'Test F1-Score']], hide_index=True)
            ecg_bench_path = os.path.join(os.path.dirname(__file__), "../outputs/tables/ecg_model_performance.csv")
            if os.path.exists(ecg_bench_path):
                st.markdown("**MIT-BIH ECG Arrhythmia Benchmark:**")
                st.dataframe(pd.read_csv(ecg_bench_path), hide_index=True)
            else:
                st.info("Run `src/run_pipeline.py` to view full comparison.")


    col_input, col_results = st.columns([1.1, 1.1])

    with col_input:
        st.subheader("📋 Patient Clinical Measurements")
        with st.form("patient_form"):
            col1, col2 = st.columns(2)
            with col1:
                age_years = st.number_input("Age (Years)", min_value=18, max_value=100, value=52, step=1)
                gender_str = st.selectbox("Biological Sex", ["Female (1)", "Male (2)"])
                height = st.number_input("Height (cm)", min_value=120.0, max_value=210.0, value=165.0, step=0.5)
                weight = st.number_input("Weight (kg)", min_value=35.0, max_value=180.0, value=75.0, step=0.5)
                smoke_str = st.selectbox("Smoking Status", ["Non-Smoker", "Smoker"])

            with col2:
                ap_hi = st.number_input("Systolic Blood Pressure (ap_hi, mmHg)", min_value=70, max_value=240, value=135, step=1)
                ap_lo = st.number_input("Diastolic Blood Pressure (ap_lo, mmHg)", min_value=40, max_value=140, value=85, step=1)
                chol_str = st.selectbox("Cholesterol Level", ["Normal", "Above Normal", "Well Above Normal"])
                gluc_str = st.selectbox("Glucose Level", ["Normal", "Above Normal", "Well Above Normal"])
                alco_str = st.selectbox("Alcohol Intake", ["No", "Yes"])
                active_str = st.selectbox("Physical Activity", ["Active", "Inactive"])

            # Clinical threshold slider
            st.markdown("---")
            screening_mode = st.radio(
                "Clinical Decision Sensitivity",
                ["Balanced Decision Threshold (0.50)", "High-Sensitivity Early Screening (0.45)"],
                index=1
            )
            threshold_val = 0.45 if "0.45" in screening_mode else 0.50

            submit_btn = st.form_submit_button("🔍 Calculate CVD Risk Score", use_container_width=True)

    with col_results:
        st.subheader("📊 Risk Assessment Output")

        if submit_btn:
            if ap_hi <= ap_lo:
                st.error("⚠️ Invalid Blood Pressure: Systolic BP (ap_hi) must be strictly greater than Diastolic BP (ap_lo).")
                return

            gender_val = 1 if "Female" in gender_str else 2
            chol_val = 1 if chol_str == "Normal" else (2 if chol_str == "Above Normal" else 3)
            gluc_val = 1 if gluc_str == "Normal" else (2 if gluc_str == "Above Normal" else 3)
            smoke_val = 1 if smoke_str == "Smoker" else 0
            alco_val = 1 if alco_str == "Yes" else 0
            active_val = 1 if active_str == "Active" else 0

            patient_dict = {
                'age_years': float(age_years),
                'gender': gender_val,
                'height': float(height),
                'weight': float(weight),
                'ap_hi': int(ap_hi),
                'ap_lo': int(ap_lo),
                'cholesterol': chol_val,
                'gluc': gluc_val,
                'smoke': smoke_val,
                'alco': alco_val,
                'active': active_val
            }

            try:
                predictor = CardiovascularRiskPredictor()
                result = predictor.predict_patient(patient_dict, threshold_override=threshold_val)

                prob_pct = result['probability_pct']
                risk_cat = result['risk_category']

                if result['predicted_class'] == 1:
                    st.markdown(f"""
                    <div class="result-card-high">
                        <h2 style="color: #C53030; margin:0;">⚠️ {risk_cat}</h2>
                        <h1 style="font-size: 3.2rem; color: #9B2C2C; margin:8px 0;">{prob_pct}%</h1>
                        <p style="color: #742A2A; font-weight: 500;">Calibrated ML Risk Score (Cutoff: {threshold_val:.2f})</p>
                    </div>
                    """, unsafe_allow_html=True)
                else:
                    st.markdown(f"""
                    <div class="result-card-low">
                        <h2 style="color: #276749; margin:0;">✅ {risk_cat}</h2>
                        <h1 style="font-size: 3.2rem; color: #22543D; margin:8px 0;">{prob_pct}%</h1>
                        <p style="color: #1C4532; font-weight: 500;">Calibrated ML Risk Score (Cutoff: {threshold_val:.2f})</p>
                    </div>
                    """, unsafe_allow_html=True)

                st.progress(float(result['probability']))

                # Physiological metrics
                st.markdown("#### 📐 Calculated Physiological Indicators")
                ef = result['engineered_features']
                m1, m2, m3, m4 = st.columns(4)
                m1.metric("Body Mass Index", f"{ef['bmi']} kg/m²")
                m2.metric("Pulse Pressure", f"{ef['pulse_pressure']} mmHg")
                m3.metric("MAP", f"{ef['map']} mmHg")
                m4.metric("Lifestyle Penalty", f"{ef['lifestyle_risk']} / 3")

                # Local SHAP Explainability Plot
                st.markdown("#### 🔬 Real-Time Local Explainability (SHAP)")
                if 'explanations' in result and isinstance(result['explanations'], pd.DataFrame):
                    shap_fig = plot_patient_shap(result['explanations'])
                    st.pyplot(shap_fig)

                # What-If Interactive Counterfactual Simulation
                st.markdown("#### 💡 Interactive 'What-If' Lifestyle Simulation")
                with st.expander("Explore how lifestyle interventions impact this patient's risk:"):
                    sim_col1, sim_col2 = st.columns(2)
                    with sim_col1:
                        sim_smoke = st.selectbox("Simulate Smoking Cessation", ["Keep Current", "Non-Smoker" if smoke_val == 1 else "Already Non-Smoker"])
                        sim_active = st.selectbox("Simulate Regular Exercise", ["Keep Current", "Active" if active_val == 0 else "Already Active"])
                    with sim_col2:
                        bp_reduction = st.slider("Simulate Systolic BP Reduction (mmHg)", min_value=0, max_value=30, value=10, step=5)
                    
                    # Compute simulated patient
                    sim_patient = patient_dict.copy()
                    if sim_smoke == "Non-Smoker":
                        sim_patient['smoke'] = 0
                    if sim_active == "Active":
                        sim_patient['active'] = 1
                    sim_patient['ap_hi'] = max(90, int(sim_patient['ap_hi'] - bp_reduction))
                    
                    sim_result = predictor.predict_patient(sim_patient, threshold_override=threshold_val)
                    diff = round(result['probability_pct'] - sim_result['probability_pct'], 1)
                    
                    if diff > 0:
                        st.success(f"🎉 Interventions reduce predicted risk from **{result['probability_pct']}%** down to **{sim_result['probability_pct']}%** (Risk reduction of **-{diff}%**!)")
                    else:
                        st.info(f"Simulated Risk: **{sim_result['probability_pct']}%**")

                st.markdown(f"""
                <div class="disclaimer-box">
                    <strong>Medical & Research Disclaimer:</strong><br>
                    {result['disclaimer']}
                </div>
                """, unsafe_allow_html=True)

                # PDF Download
                st.markdown("---")
                try:
                    pdf_bytes = generate_pdf_report(patient_dict, result)
                    st.download_button(
                        label="📥 Download Clinical Summary PDF Report",
                        data=pdf_bytes,
                        file_name="cvd_risk_assessment_report.pdf",
                        mime="application/pdf",
                        use_container_width=True,
                    )
                except Exception as pdf_err:
                    st.warning(f"PDF generation note: {pdf_err}")

            except Exception as e:
                st.error(f"Error executing prediction: {e}")
        else:
            st.info("👈 Enter patient clinical measurements on the left and click **Calculate CVD Risk Score** to perform risk evaluation.")


if __name__ == "__main__":
    main()
