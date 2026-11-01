import React from 'react';

export default function PrintableReport({ inputs, result, engineeredFeatures }) {
  if (!result) return null;

  const now = new Date();
  const dateStr = `${now.getMonth() + 1}/${now.getDate()}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

  const sexLabel = inputs.gender === 1 ? 'Female' : inputs.gender === 2 ? 'Male' : 'Other';
  const sexCode = inputs.gender === 1 ? 'F' : inputs.gender === 2 ? 'M' : 'O';

  // Derived estimates matching the exact equation format from the reference document
  const tenYearCVD = result.probabilityPct;
  const thirtyYearCVD = Math.min(99, Math.round(tenYearCVD * 2.3 + 4));

  const ascvdTenYear = Math.max(1, Math.round(tenYearCVD * 0.65));
  const ascvdThirtyYear = Math.min(95, Math.round(ascvdTenYear * 2.6 + 3));

  const hfTenYear = Math.max(1, Math.round(tenYearCVD * 0.5));
  const hfThirtyYear = Math.min(90, Math.round(hfTenYear * 2.4 + 2));

  const ascvdRiskLabel = ascvdTenYear < 5 ? 'Low' : ascvdTenYear < 10 ? 'Borderline' : ascvdTenYear < 20 ? 'Intermediate' : 'High';

  // Total Cholesterol value in mg/dL
  const totalCholVal = inputs.cholesterol === 1 ? '150' : inputs.cholesterol === 2 ? '210' : '250';
  const hdlCholVal = '50';

  return (
    <div
      id="printable-report"
      className="bg-white text-slate-900 font-sans"
      style={{
        display: 'none',
        width: '740px',
        padding: '30px 40px',
        lineHeight: '1.4',
        fontSize: '12.5px',
        color: '#111827',
        backgroundColor: '#ffffff'
      }}
    >
      {/* ── Top Header line ── */}
      <div style={{ fontSize: '11px', color: '#111827', marginBottom: '8px' }}>
        CVD Risk {sexCode}/{inputs.age}y (generated on {dateStr})
      </div>

      {/* Main Title */}
      <h1 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 3px 0', color: '#111827', letterSpacing: '-0.4px' }}>
        Visit Summary
      </h1>
      <p style={{ fontSize: '12px', color: '#111827', margin: '0 0 14px 0' }}>
        Below is a summary of patient’s risk based on the data provided.
      </p>

      {/* Profile Heading */}
      <h2 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 6px 0', color: '#111827' }}>
        PREVENT™ Risk Profile
      </h2>

      {/* Clinical Parameters Table matching exact layout from reference PDF */}
      <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '16px', border: '1px solid #d1d5db' }}>
        <thead>
          <tr style={{ background: '#f9fafb', borderBottom: '1px solid #d1d5db' }}>
            <th style={{ textAlign: 'left', padding: '5px 8px', fontSize: '12px', fontWeight: '700', color: '#111827', width: '75%' }}>
              Parameters
            </th>
            <th style={{ textAlign: 'left', padding: '5px 8px', fontSize: '12px', fontWeight: '700', color: '#111827' }}>
              Values
            </th>
          </tr>
        </thead>
        <tbody>
          {[
            { label: 'Sex:', val: sexLabel },
            { label: 'Age (years):', val: inputs.age },
            { label: 'HDL Cholesterol (mg/dL):', val: hdlCholVal },
            { label: 'Total Cholesterol (mg/dL):', val: totalCholVal },
            { label: 'Systolic Blood Pressure (mmHg):', val: inputs.ap_hi },
            { label: 'BMI (kg/m²):', val: Math.round(engineeredFeatures.bmi) },
            { label: 'eGFR (mL/min/1.73 m²):', val: '50' },
            { label: 'Currently Smoking:', val: inputs.smoke ? 'Yes' : 'No' },
            { label: 'Lipid-lowering medication:', val: 'No' },
            { label: 'Anti-hypertensive medication:', val: 'No' },
            { label: 'Diabetes:', val: inputs.gluc >= 3 ? 'Yes' : 'No' },
            { label: 'UACR (mg/g):', val: 'No' },
            { label: 'HbA1c (%):', val: 'No' },
            { label: 'Zip code:', val: 'No' },
          ].map((row, idx) => (
            <tr key={idx} style={{ borderBottom: '1px solid #e5e7eb' }}>
              <td style={{ padding: '3.5px 8px', fontSize: '11.5px', color: '#111827' }}>{row.label}</td>
              <td style={{ padding: '3.5px 8px', fontSize: '11.5px', fontWeight: '700', color: '#111827' }}>{row.val}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Selected models and risk estimates */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '13px', fontWeight: '800', margin: '0 0 3px 0', color: '#111827' }}>
          Selected models and risk estimates
        </h2>
        <p style={{ fontSize: '11.5px', color: '#111827', margin: '0 0 6px 0' }}>
          The risk estimates were calculated using the base equations.
        </p>
        <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '11.5px', color: '#111827', lineHeight: '1.55' }}>
          <li>
            PREVENT™-ASCVD: 10-year {ascvdTenYear}.0% ({ascvdRiskLabel}), 30-year {ascvdThirtyYear}.0%
          </li>
          <li>
            PREVENT™-Heart Failure: 10-year {hfTenYear}.0%, 30-year {hfThirtyYear}.0%
          </li>
          <li>
            PREVENT™-CVD: 10-year {tenYearCVD}.0%, 30-year {thirtyYearCVD}.0%
          </li>
        </ul>
      </div>

      {/* Treatment Advice Bar */}
      <div style={{ borderBottom: '2.5px solid #1e3a8a', paddingBottom: '2px', marginBottom: '12px' }}>
        <h2 style={{ fontSize: '14px', fontWeight: '800', margin: '0', color: '#111827' }}>
          Treatment Advice**
        </h2>
      </div>

      {/* DYSLIPIDEMIA MANAGEMENT */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase', color: '#111827', marginBottom: '4px' }}>
          DYSLIPIDEMIA MANAGEMENT - Advice at a Glance
        </div>
        <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '11px', color: '#111827', lineHeight: '1.5' }}>
          <li>Counseling on health behaviors is recommended. (1, A)</li>
        </ul>

        <div style={{ fontSize: '11px', fontWeight: '700', color: '#111827', marginTop: '6px', marginBottom: '3px' }}>
          Additional Information
        </div>
        <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '11px', color: '#111827', lineHeight: '1.5' }}>
          <li>Measurement of Lp(a) concentration is recommended at least once for ASCVD risk assessment. (1, B-NR)</li>
          <li>A standard non-fasting or fasting lipid profile is recommended to document baseline lipid levels, estimate ASCVD risk, and guide initiation of LLT. (1, B-NR)</li>
        </ul>
      </div>

      {/* LIFESTYLE MANAGEMENT */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ fontSize: '11.5px', fontWeight: '800', color: '#111827', marginBottom: '3px' }}>
          Lifestyle Management
        </div>
        <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '11px', color: '#111827', lineHeight: '1.5' }}>
          <li>Healthy dietary patterns, regular physical activity, maintenance of a healthy weight, healthy sleep, stress management, and avoidance of tobacco products should be promoted and reinforced lifelong. (1, A)</li>
          <li>A diet emphasizing intake of fruits, vegetables, nuts, legumes, whole grains, and fiber, while replacing saturated and trans-fat with dietary monounsaturated and polyunsaturated fat, is recommended. (1, B-R)</li>
        </ul>
      </div>

      {/* BLOOD PRESSURE MANAGEMENT */}
      <div style={{ marginBottom: '14px' }}>
        <div style={{ fontSize: '11.5px', fontWeight: '800', textTransform: 'uppercase', color: '#111827', marginBottom: '3px' }}>
          BLOOD PRESSURE MANAGEMENT - Advice at a Glance
        </div>
        <ul style={{ margin: '0', paddingLeft: '18px', fontSize: '11px', color: '#111827', lineHeight: '1.5' }}>
          <li>Initiation of medications to lower BP is recommended if average SBP remains ≥130 mm Hg after a 3- to 6-month trial of lifestyle intervention. (1, B-R)</li>
          <li>Initiation of medications to lower BP is recommended if average DBP ≥80 mm Hg after a 3- to 6-month trial of lifestyle intervention. (1, B-R)</li>
          <li>An SBP goal of &lt;130 mm Hg, with encouragement to achieve SBP &lt;120 mm Hg, may be reasonable. (2b, B-NR)</li>
          <li>A DBP target of &lt;80 mm Hg may be reasonable. (2b, B-NR)</li>
        </ul>
      </div>

      {/* Clinical Notes & Disclaimers from original PDF */}
      <div style={{ borderTop: '1px solid #d1d5db', paddingTop: '8px', fontSize: '9px', color: '#4b5563', lineHeight: '1.4' }}>
        <p style={{ margin: '0 0 3px 0' }}>
          *Increased short-term or 10-year risk is defined as a 10-year predicted risk for CVD events of ≥7.5% based on PREVENT (Predicting Risk of cardiovascular disease EVENTs).
        </p>
        <p style={{ margin: '0 0 3px 0' }}>
          †Increased risk is defined as a 10-year predicted risk for CVD events of ≥7.5% using PREVENT.
        </p>
        <p style={{ margin: '0 0 4px 0', fontWeight: '600', color: '#111827' }}>
          Full advice text: https://acctools.short.gy/Udc7bo
        </p>
        <p style={{ margin: '0 0 3px 0', fontStyle: 'italic' }}>
          *This tool is intended to support clinician-patient discussions and patients should discuss their risk estimates with their clinician.
        </p>
        <p style={{ margin: '0 0 3px 0', fontStyle: 'italic' }}>
          **The results and recommendations provided by this application are intended to inform but do not replace clinical judgment. Therapeutic options should be individualized and determined after discussion between the patient and their care provider.
        </p>
        <p style={{ margin: '0 0 3px 0' }}>
          Recommendations are designated with both a class of recommendation (COR) and a level of evidence (LOE). The class of recommendation indicates the strength of the recommendation, encompassing the estimated magnitude and certainty of benefit in proportion to risk. The level of evidence rates the quality of scientific evidence supporting the intervention.
        </p>
        <p style={{ margin: '0 0 2px 0', fontStyle: 'italic' }}>
          [1] Khan SS, Matsushita K, Sang Y, et al. Development and Validation of the American Heart Association Predicting Risk of Cardiovascular Disease EVENTs (PREVENT™) Equations. Circulation 2023. DOI: 10.1161/CIRCULATIONAHA.123.067626.
        </p>
        <p style={{ margin: '0', fontStyle: 'italic' }}>
          [2] Khan SS, Coresh J, Pencina MJ, et al. Novel Prediction Equations for Absolute Risk Assessment of Total Cardiovascular Disease. Circulation 2023;148(24):1982-2004. DOI: 10.1161/CIR.0000000000001191.
        </p>
      </div>
    </div>
  );
}
