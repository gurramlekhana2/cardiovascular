"""
PDF Report Generator for Cardiovascular Disease Risk Assessment.

Uses fpdf2 to create a clean, formatted, in-memory PDF report.
No external system binaries required. All output is returned as bytes.
"""

import io
from datetime import datetime
from fpdf import FPDF


# ─────────────────────── colour palette ───────────────────────
NAVY        = (30,  58, 138)
DARK_GREY   = (45,  55,  72)
MID_GREY    = (113, 128, 150)
LIGHT_BG    = (245, 247, 250)
WHITE       = (255, 255, 255)
RED_HIGH    = (197,  48,  48)
GREEN_LOW   = (39,  103,  73)
RED_LIGHT   = (254, 242, 242)
GREEN_LIGHT = (240, 255, 244)
ORANGE      = (194, 120,   0)


# ─────────────────────── helper mappings ──────────────────────
CHOL_MAP   = {1: "Normal", 2: "Above Normal", 3: "Well Above Normal"}
GLUC_MAP   = {1: "Normal", 2: "Above Normal", 3: "Well Above Normal"}
GENDER_MAP = {1: "Female", 2: "Male"}
BP_CAT_MAP = {
    0: "Normal",
    1: "Elevated",
    2: "Hypertension Stage 1",
    3: "Hypertension Stage 2",
    4: "Hypertensive Crisis",
}
BMI_CAT_MAP = {
    0: "Underweight",
    1: "Normal weight",
    2: "Overweight",
    3: "Obese",
}


def _draw_header(pdf: FPDF, generated_at: str) -> None:
    """Blue banner with title and generation timestamp."""
    pdf.set_fill_color(*NAVY)
    pdf.rect(0, 0, 210, 24, style="F")
    pdf.set_y(4)
    pdf.set_font("Helvetica", "B", 15)
    pdf.set_text_color(*WHITE)
    pdf.cell(0, 7, "Cardiovascular Risk Assessment Report", align="C", ln=True)
    pdf.set_font("Helvetica", "", 8)
    pdf.cell(0, 5, f"Generated on: {generated_at}", align="C", ln=True)
    pdf.set_text_color(*DARK_GREY)
    pdf.ln(5)


def _section_title(pdf: FPDF, title: str) -> None:
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 6, title, ln=True)
    pdf.set_draw_color(*NAVY)
    pdf.set_line_width(0.3)
    pdf.line(pdf.get_x(), pdf.get_y(), pdf.get_x() + 190, pdf.get_y())
    pdf.ln(1)
    pdf.set_text_color(*DARK_GREY)


def _kv_row(pdf: FPDF, label: str, value: str, shade: bool = False) -> None:
    row_h = 5.8
    if shade:
        pdf.set_fill_color(*LIGHT_BG)
        pdf.rect(pdf.get_x(), pdf.get_y(), 190, row_h, style="F")
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(*MID_GREY)
    pdf.cell(85, row_h, f"  {label}", ln=False)
    pdf.set_font("Helvetica", "B", 8.5)
    pdf.set_text_color(*DARK_GREY)
    pdf.cell(105, row_h, value, ln=True)


def _risk_banner(pdf: FPDF, risk_category: str, probability_pct: float, is_high: bool) -> None:
    bg   = RED_LIGHT  if is_high else GREEN_LIGHT
    fg   = RED_HIGH   if is_high else GREEN_LOW
    icon = "[HIGH RISK]" if is_high else "[LOW RISK]"

    pdf.set_fill_color(*bg)
    pdf.set_draw_color(*fg)
    pdf.set_line_width(0.5)
    x, y = pdf.get_x(), pdf.get_y()
    pdf.rect(x, y, 190, 22, style="FD")

    pdf.set_font("Helvetica", "B", 11)
    pdf.set_text_color(*fg)
    pdf.set_y(y + 2)
    pdf.cell(0, 6, f"{icon}  {risk_category}", align="C", ln=True)

    pdf.set_font("Helvetica", "B", 15)
    pdf.cell(0, 9, f"CVD Risk Score: {probability_pct}%", align="C", ln=True)
    pdf.set_text_color(*DARK_GREY)
    pdf.ln(3)


def _disclaimer_box(pdf: FPDF, disclaimer_text: str) -> None:
    pdf.set_fill_color(*RED_LIGHT)
    pdf.set_draw_color(*RED_HIGH)
    pdf.set_line_width(0.4)
    x, y = pdf.get_x(), pdf.get_y()

    pdf.set_font("Helvetica", "", 7.5)
    lines = pdf.multi_cell(182, 4.2, disclaimer_text, split_only=True)
    box_h = len(lines) * 4.2 + 9

    pdf.rect(x, y, 190, box_h, style="FD")
    pdf.set_y(y + 2)
    pdf.set_font("Helvetica", "B", 8)
    pdf.set_text_color(*ORANGE)
    pdf.cell(0, 4, "  ACADEMIC DISCLAIMER", ln=True)
    pdf.set_font("Helvetica", "", 7.5)
    pdf.set_text_color(*DARK_GREY)
    pdf.set_x(14)
    pdf.multi_cell(182, 4.2, disclaimer_text)


# ─────────────────────── public API ───────────────────────────

class CVDReportPDF(FPDF):
    def footer(self):
        self.set_y(-10)
        self.set_font("Helvetica", "I", 7.5)
        self.set_text_color(*MID_GREY)
        self.cell(
            0, 5,
            "Cardiovascular Disease Prediction System  |  Academic Decision-Support Tool  |  Not for Clinical Use",
            align="C",
        )


def generate_pdf_report(patient_data: dict, result: dict) -> bytes:
    """
    Build a formatted CVD risk PDF report in memory and return raw bytes.
    """
    generated_at = datetime.now().strftime("%Y-%m-%d  %H:%M")
    ef       = result["engineered_features"]
    is_high  = result["predicted_class"] == 1
    prob_pct = result["probability_pct"]
    risk_cat = result["risk_category"]
    disclaimer = result["disclaimer"]

    gender_str = GENDER_MAP.get(int(patient_data.get("gender", 1)), "Unknown")
    chol_str   = CHOL_MAP.get(int(patient_data.get("cholesterol", 1)), "Unknown")
    gluc_str   = GLUC_MAP.get(int(patient_data.get("gluc", 1)), "Unknown")
    smoke_str  = "Smoker"   if patient_data.get("smoke")  == 1 else "Non-Smoker"
    alco_str   = "Yes"      if patient_data.get("alco")   == 1 else "No"
    active_str = "Active"   if patient_data.get("active") == 1 else "Inactive"
    bp_str     = BP_CAT_MAP.get(int(ef.get("bp_category",  0)), "Unknown")
    bmi_str    = BMI_CAT_MAP.get(int(ef.get("bmi_category", 1)), "Unknown")

    pdf = CVDReportPDF()
    pdf.set_auto_page_break(auto=True, margin=12)
    pdf.add_page()
    pdf.set_margins(10, 10, 10)

    _draw_header(pdf, generated_at)

    # ── Visit summary ─────────────────────────────────────────
    pdf.set_font("Helvetica", "B", 10)
    pdf.set_text_color(*NAVY)
    pdf.cell(0, 6, "Visit Summary", ln=True)
    pdf.set_font("Helvetica", "", 8.5)
    pdf.set_text_color(*MID_GREY)
    pdf.cell(0, 4.5, "Below is a summary of the patient's risk based on the data provided.", ln=True)
    pdf.ln(3)

    # ── Risk result banner ────────────────────────────────────
    _risk_banner(pdf, risk_cat, prob_pct, is_high)

    # ── Patient clinical data table ───────────────────────────
    _section_title(pdf, "Patient Clinical Data")
    rows = [
        ("Age",                   f"{patient_data.get('age_years', '--')} years"),
        ("Gender",                gender_str),
        ("Height",                f"{patient_data.get('height', '--')} cm"),
        ("Weight",                f"{patient_data.get('weight', '--')} kg"),
        ("Systolic BP (ap_hi)",   f"{patient_data.get('ap_hi', '--')} mmHg"),
        ("Diastolic BP (ap_lo)",  f"{patient_data.get('ap_lo', '--')} mmHg"),
        ("Cholesterol",           chol_str),
        ("Glucose",               gluc_str),
        ("Smoking Status",        smoke_str),
        ("Alcohol Intake",        alco_str),
        ("Physical Activity",     active_str),
    ]
    for i, (lbl, val) in enumerate(rows):
        _kv_row(pdf, lbl, val, shade=(i % 2 == 0))
    pdf.ln(3)

    # ── Engineered physiological parameters ───────────────────
    _section_title(pdf, "Engineered Physiological Parameters")
    eng_rows = [
        ("Body Mass Index (BMI)",         f"{ef.get('bmi', '--')} kg/m2  ({bmi_str})"),
        ("Pulse Pressure",                f"{ef.get('pulse_pressure', '--')} mmHg"),
        ("Mean Arterial Pressure (MAP)",  f"{ef.get('map', '--')} mmHg"),
        ("Blood Pressure Category",       bp_str),
    ]
    for i, (lbl, val) in enumerate(eng_rows):
        _kv_row(pdf, lbl, val, shade=(i % 2 == 0))
    pdf.ln(4)

    # ── Disclaimer ────────────────────────────────────────────
    _disclaimer_box(pdf, disclaimer)

    return bytes(pdf.output())
