package com.healthconn.healthcare_connector.provider.service;

/**
 * LLM prompts — missing + warnings only (no suggestions, no optional fields).
 */
public final class AiPrompts {

    private AiPrompts() {
    }

    public static final String AI_REVIEW = ""
            + "You are the ONLY validator for a hospital Prior Authorization form.\n"
            + "Apply ALL rules below. (blank) means empty.\n\n"
            + "REQUIRED FIELDS ONLY:\n"
            + "1) Patient Name — required, prefer first+last\n"
            + "2) Patient ID — alphanumeric 4-12\n"
            + "3) Insurance ID — letters/numbers/hyphens 5-20\n"
            + "4) Diagnosis ICD-10 — valid ICD-10 shape\n"
            + "5) Procedure CPT — exactly 5 digits\n"
            + "6) Treatment Description — clinical text preferably 20+ chars\n"
            + "7) Admission Date — required date\n"
            + "8) Priority — NORMAL, URGENT, or EMERGENCY\n\n"
            + "DO NOT report optional fields at all:\n"
            + "- Expected Discharge Date, Patient Age, Gender, Clinical Notes\n\n"
            + "STRICT BUCKET RULES (very important):\n"
            + "- missing: ONLY when the field value is blank/empty/(blank). "
            + "Issue text should be like \"Required field is blank\".\n"
            + "- warnings: when the field HAS a value but it is incomplete, wrong format, or weak quality. "
            + "Examples: incomplete name without surname, short patient ID, bad ICD-10, CPT not 5 digits, "
            + "treatment under 20 chars, URGENT/EMERGENCY documentation notes.\n"
            + "- NEVER put a non-blank field into missing. Incomplete Patient Name must go in warnings, not missing.\n"
            + "- For EVERY missing and warning item, also return expected with a concrete example the user can type.\n"
            + "  Patient Name expected example: James Carter\n"
            + "  Patient ID expected example: PT2048\n"
            + "  Insurance ID expected example: BCBS71628163\n"
            + "  Diagnosis ICD-10 expected example: E11.9\n"
            + "  Procedure CPT expected example: 99213\n"
            + "  Treatment Description expected example: Outpatient knee arthroscopy after failed therapy\n"
            + "  Admission Date expected example: 2026-08-01\n"
            + "  Priority expected example: NORMAL\n\n"
            + "Do NOT return a suggestions array.\n"
            + "ready=true only if missing and warnings are empty AND score >= 80.\n\n"
            + "Return ONLY JSON:\n"
            + "{\n"
            + "  \"score\": 0,\n"
            + "  \"ready\": false,\n"
            + "  \"missing\": [\n"
            + "    {\"field\":\"Patient ID\",\"issue\":\"Required field is blank\",\"expected\":\"Enter ID like PT2048\"}\n"
            + "  ],\n"
            + "  \"warnings\": [\n"
            + "    {\"field\":\"Patient Name\",\"issue\":\"Name is incomplete (prefer first+last)\",\"expected\":\"Enter full name, e.g. James Carter\"}\n"
            + "  ]\n"
            + "}\n\n"
            + "PRIOR AUTHORIZATION PACKET:\n"
            + "Patient Name: {{patientName}}\n"
            + "Patient ID: {{patientId}}\n"
            + "Insurance ID: {{insuranceId}}\n"
            + "Priority: {{priority}}\n"
            + "Diagnosis / ICD-10: {{diagnosis}}\n"
            + "Procedure / CPT: {{procedureCode}}\n"
            + "Treatment Description: {{treatmentDescription}}\n"
            + "Admission / Treatment Date: {{admissionDate}}\n"
            + "Expected Discharge Date: {{expectedDischargeDate}}\n"
            + "Patient Age: {{patientAge}}\n"
            + "Gender: {{gender}}\n"
            + "Clinical Notes: {{clinicalNotes}}\n";

    public static final String FIELD_SUGGESTION = ""
            + "You are a healthcare form assistant. ONE short line.\n"
            + "Field: {{fieldName}}\n"
            + "Value: {{fieldValue}}\n"
            + "ICD: {{diagnosisCode}} CPT: {{procedureCode}}\n"
            + "Treatment: {{treatmentDescription}}\n";

    public static String fill(String template, java.util.Map<String, String> values) {
        String result = template;
        for (java.util.Map.Entry<String, String> entry : values.entrySet()) {
            String key = "{{" + entry.getKey() + "}}";
            String value = entry.getValue() == null ? "" : entry.getValue();
            result = result.replace(key, value);
        }
        return result;
    }
}
