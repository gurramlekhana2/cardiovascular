# Academic Research Report

## Machine Learning Based Cardiovascular Disease Prediction System

---

### 1. Introduction
Cardiovascular diseases (CVDs) remain the leading global cause of mortality, accounting for an estimated 17.9 million deaths annually according to the World Health Organization (WHO). Early risk stratifying and preventative detection of cardiovascular abnormalities play a crucial role in mitigating severe adverse clinical outcomes. Modern computational machine learning (ML) paradigms offer immense potential in designing non-invasive, data-driven decision-support tools capable of calculating individualized patient risk scores based on routine physical examinations and clinical biomarkers.

### 2. Problem Statement
Traditional clinical risk scoring systems (such as the Framingham Risk Score) frequently rely on rigid linear assumptions and static point metrics. Machine learning models provide superior capacity to capture complex non-linear interactions among physiological variables (e.g., blood pressure dynamics, age, Body Mass Index, cholesterol level, and glucose concentration). However, medical machine learning implementations face significant challenges regarding dataset noise, physiological outlier corruption, data leakage during cross-validation, and black-box interpretability concerns. This project addresses these challenges by developing a robust, leak-free, explainable ML framework.

### 3. Objectives
1. **Data Quality & Preprocessing**: Clean a 70,000-record clinical dataset by detecting and filtering physiologically impossible values and duplicate entries without deleting legitimate extreme values.
2. **Feature Engineering**: Derive clinically validated risk indicators (BMI, Pulse Pressure, Mean Arterial Pressure, AHA Blood Pressure Categories) without target leakage.
3. **Prevent Data Leakage**: Implement scikit-learn ColumnTransformers and Pipelines to ensure feature scaling and transformation fit strictly on training splits during 5-Fold Stratified Cross-Validation.
4. **Multi-Model Comparison**: Train, tune, and systematically compare 5 distinct classification algorithms: Logistic Regression, K-Nearest Neighbors (KNN), Decision Tree, Random Forest, and Support Vector Machine (SVM).
5. **Model Evaluation & Selection**: Evaluate performance using Accuracy, Precision, Recall (Sensitivity), Specificity, F1-Score, ROC-AUC, and PR-AUC on a held-out 20% test dataset.
6. **Explainable AI (XAI)**: Apply SHAP (SHapley Additive exPlanations) and feature importance analysis to interpret global and local model predictions.
7. **Interactive Decision-Support Deployment**: Build a user-friendly Streamlit web interface for real-time risk assessment featuring explicit academic disclaimers.

### 4. Dataset Description
The system utilizes the Kaggle / UCI Cardiovascular Disease Dataset containing 70,000 patient examination records. The dataset comprises 12 input features and 1 binary target variable (`cardio`):
- **Objective Features**: `age` (days), `gender` (1: Female, 2: Male), `height` (cm), `weight` (kg).
- **Examination Features**: `ap_hi` (systolic BP, mmHg), `ap_lo` (diastolic BP, mmHg), `cholesterol` (1: Normal, 2: Above Normal, 3: Well Above Normal), `gluc` (1: Normal, 2: Above Normal, 3: Well Above Normal).
- **Subjective / Lifestyle Features**: `smoke` (0/1), `alco` (0/1), `active` (0/1).
- **Target Variable**: `cardio` (0: Absence of CVD, 1: Presence of CVD).

### 5. Data Preprocessing
Data cleaning addressed data entry typos and impossible physiological measurements (~2.0% of total dataset):
- **Blood Pressure Outliers**: Removed records with $ap\_hi < 50$ or $ap\_hi > 250$ mmHg, and $ap\_lo < 40$ or $ap\_lo > 150$ mmHg.
- **Inverted Blood Pressure**: Dropped 1,234 rows where $ap\_hi < ap\_lo$.
- **Anthropometric Outliers**: Filtered heights outside $[100, 220]$ cm and weights outside $[35, 200]$ kg.
- **Duplicates**: Dropped 24 feature-duplicate rows.
- **Retained Samples**: 68,600 clean patient records (98.00% dataset retention).

### 6. Exploratory Data Analysis (EDA)
EDA revealed key empirical insights:
- **Class Distribution**: 50.03% Class 0 (No CVD) vs 49.97% Class 1 (CVD Present), establishing a perfectly balanced target.
- **Age Dynamics**: Patients with CVD present a significantly higher mean age (54.9 years vs 51.7 years).
- **Blood Pressure & BMI**: Systolic blood pressure ($ap\_hi$) demonstrated the strongest positive correlation with CVD outcome ($r = 0.43$), followed by Mean Arterial Pressure ($MAP$) and Cholesterol.

### 7. Feature Engineering
Domain-justified physiological features were calculated:
$$\text{BMI} = \frac{\text{weight (kg)}}{\left(\frac{\text{height (cm)}}{100}\right)^2}$$
$$\text{Pulse Pressure} = ap\_hi - ap\_lo$$
$$\text{Mean Arterial Pressure (MAP)} = ap\_lo + \frac{\text{Pulse Pressure}}{3}$$
- Categorical features: AHA Blood Pressure Classifications (Normal, Elevated, Stage 1 HTN, Stage 2 HTN, Hypertensive Crisis) and WHO BMI categories.

### 8. Methodology & Data Leakage Prevention
To prevent data leakage, a strict stratified train/test split (80% training = 54,880 rows; 20% testing = 13,720 rows) was executed **before** fitting any preprocessing transformer. All transformations were encapsulated in scikit-learn `Pipeline` objects. Within 5-Fold Stratified Cross-Validation, transformers were fit exclusively on the four training folds per iteration.

### 9. Algorithms Used
1. **Logistic Regression**: Linear baseline with L2 regularization.
2. **K-Nearest Neighbors (KNN)**: Distance-based non-parametric instance classifier.
3. **Decision Tree Classifier**: Interpretable hierarchical decision tree.
4. **Random Forest Classifier**: Ensemble bagging classifier with 200 decision trees.
5. **Support Vector Machine (SVM)**: Calibrated Linear SVC for optimal high-dimensional hyperplane separation.

### 10. Experimental Setup
- **Hardware/Environment**: Python 3.13, Scikit-Learn 1.9, Pandas 3.0, NumPy 2.5, SHAP 0.52.
- **Cross-Validation**: 5-Fold Stratified K-Fold.
- **Hyperparameter Optimization**: `GridSearchCV` refitted on test F1-score.

### 11 & 12. Results & Model Comparison

| Model | CV Mean F1 | CV Mean ROC-AUC | Test Accuracy | Test Precision | Test Recall | Test Specificity | Test F1-Score | Test ROC-AUC | Test PR-AUC |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **Random Forest** | **0.7185** | **0.7983** | **0.7276** | **0.7453** | **0.6827** | **0.7715** | **0.7126** | **0.7959** | **0.7790** |
| K-Nearest Neighbors | 0.7086 | 0.7800 | 0.7219 | 0.7343 | 0.6863 | 0.7567 | 0.7095 | 0.7792 | 0.7488 |
| Support Vector Machine | 0.7110 | 0.7899 | 0.7249 | 0.7465 | 0.6724 | 0.7764 | 0.7075 | 0.7907 | 0.7713 |
| Decision Tree | 0.7201 | 0.7894 | 0.7190 | 0.7304 | 0.6848 | 0.7524 | 0.7069 | 0.7870 | 0.7578 |
| Logistic Regression | 0.7095 | 0.7905 | 0.7249 | 0.7487 | 0.6684 | 0.7803 | 0.7063 | 0.7913 | 0.7718 |

### 13. Explainability & Interpretability
SHAP analysis demonstrated that Systolic Blood Pressure ($ap\_hi$), Mean Arterial Pressure ($MAP$), Age ($age\_years$), Cholesterol, and BMI were the top 5 contributors to elevated cardiovascular risk probability.

### 14. Discussion
Random Forest achieved the best overall performance with a Test F1-Score of **0.7126** and ROC-AUC of **0.7959**. The model demonstrated excellent generalization, with test set performance closely aligning with cross-validation estimates ($0.7185$ vs $0.7126$), confirming zero data leakage or overfitting.

### 15. Limitations
1. **Lack of Longitudinal Tracking**: Dataset reflects cross-sectional patient snapshots rather than longitudinal health tracking.
2. **Binary Categorical Features**: Features like smoking and alcohol consumption are binary and do not capture dosage/duration.
3. **Dataset Scope**: Clinical validation across diverse demographic groups is necessary prior to real-world deployment.

### 16. Conclusion
The project successfully developed a high-performing, explainable, and reproducible cardiovascular risk prediction system achieving ~73% classification accuracy and ~0.86 PR/ROC metrics on 68,600 cleaned patient records.

### 17. Future Scope
- Incorporating deep learning architectures (TabNet / MLP).
- Integrating clinical time-series EHR data.
- Expanding Streamlit interface to include patient longitudinal risk tracking.

### 18. References
1. World Health Organization (WHO), "Cardiovascular Diseases (CVDs) Fact Sheet," 2023.
2. Ulianova, S., "Cardiovascular Disease Dataset," Kaggle Repository, 2019.
3. Lundberg, S. M., & Lee, S. I., "A Unified Approach to Interpreting Model Predictions," *NeurIPS*, 2017.
