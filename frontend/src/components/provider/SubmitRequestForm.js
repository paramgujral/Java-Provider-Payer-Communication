import React, { useState } from "react";
import { reviewRequest, submitRequest } from "../../services/api";

const initialForm = {
  patientName: "",
  diagnosis: "",
  procedureName: "",
  clinicalNotes: "",
  serviceStartDate: "",
  serviceEndDate: "",
  providerId: 1,
  payerId: 1,
};

export default function SubmitRequestForm({ onSubmitted }) {
  const [form, setForm] = useState(initialForm);
  const [aiResult, setAiResult] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    // Reset AI result if form changes
    setAiResult(null);
    setError("");
  };

  const handleAIReview = async () => {
    setAiLoading(true);
    setAiResult(null);
    setError("");
    try {
      const res = await reviewRequest(form);
      setAiResult(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "AI review failed. Please try again.");
    } finally {
      setAiLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!aiResult?.passed || !aiResult?.reviewToken) {
      setError("Please complete AI review before submitting.");
      return;
    }
    setSubmitLoading(true);
    setError("");
    try {
      await submitRequest({ ...form, aiReviewToken: aiResult.reviewToken });
      setSuccess("Request submitted successfully!");
      setForm(initialForm);
      setAiResult(null);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      setError(err.response?.data?.message || "Submission failed.");
    } finally {
      setSubmitLoading(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "9px 12px", borderRadius: "6px",
    border: "1px solid #d1d5db", fontSize: "14px",
    boxSizing: "border-box", outline: "none",
  };

  const labelStyle = { fontSize: "13px", fontWeight: 600, color: "#374151", marginBottom: "4px", display: "block" };

  return (
    <div style={{ maxWidth: "600px" }}>
      <h3 style={{ margin: "0 0 20px", color: "#1e293b" }}>New Authorization Request</h3>

      {/* Form fields */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
        {[
          { name: "patientName",    label: "Patient Name",     span: 2 },
          { name: "diagnosis",      label: "Diagnosis",        span: 2 },
          { name: "procedureName",  label: "Procedure Name",   span: 2 },
          { name: "serviceStartDate", label: "Service Start Date", type: "date", span: 1 },
          { name: "serviceEndDate",   label: "Service End Date",   type: "date", span: 1 },
        ].map(({ name, label, type = "text", span }) => (
          <div key={name} style={{ gridColumn: `span ${span}` }}>
            <label style={labelStyle}>{label}</label>
            <input
              name={name} type={type} value={form[name]}
              onChange={handleChange} style={inputStyle}
              placeholder={label}
            />
          </div>
        ))}

        <div style={{ gridColumn: "span 2" }}>
          <label style={labelStyle}>Clinical Notes</label>
          <textarea
            name="clinicalNotes" value={form.clinicalNotes}
            onChange={handleChange} rows={3}
            placeholder="Describe medical necessity..."
            style={{ ...inputStyle, resize: "vertical" }}
          />
        </div>
      </div>

      {/* AI Review Button */}
      <button
        onClick={handleAIReview}
        disabled={aiLoading || !form.patientName || !form.diagnosis || !form.procedureName}
        style={{
          marginTop: "18px", padding: "10px 20px",
          backgroundColor: "#7c3aed", color: "white",
          border: "none", borderRadius: "6px", cursor: "pointer",
          fontWeight: 600, fontSize: "14px", width: "100%",
          opacity: aiLoading ? 0.7 : 1,
        }}
      >
        {aiLoading ? "🤖 Reviewing..." : "🤖 Run AI Review"}
      </button>

      {/* AI Result */}
      {aiResult && (
        <div style={{
          marginTop: "16px", padding: "14px", borderRadius: "8px",
          backgroundColor: aiResult.passed ? "#f0fdf4" : "#fef2f2",
          border: `1px solid ${aiResult.passed ? "#86efac" : "#fca5a5"}`,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span style={{ fontSize: "18px" }}>{aiResult.passed ? "✅" : "❌"}</span>
            <strong style={{ color: aiResult.passed ? "#15803d" : "#dc2626" }}>
              {aiResult.passed ? "AI Review Passed" : "AI Review Failed"}
            </strong>
            <span style={{
              marginLeft: "auto", fontSize: "12px", fontWeight: 600,
              color: aiResult.passed ? "#15803d" : "#dc2626",
            }}>
              Score: {aiResult.confidenceScore}/100
            </span>
          </div>

          <p style={{ margin: "0 0 8px", fontSize: "13px", color: "#374151" }}>{aiResult.summary}</p>

          {aiResult.issues?.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              <strong style={{ fontSize: "12px", color: "#dc2626" }}>Issues:</strong>
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                {aiResult.issues.map((i, idx) => (
                  <li key={idx} style={{ fontSize: "13px", color: "#7f1d1d" }}>{i}</li>
                ))}
              </ul>
            </div>
          )}

          {aiResult.suggestions?.length > 0 && (
            <div>
              <strong style={{ fontSize: "12px", color: "#1d4ed8" }}>Suggestions:</strong>
              <ul style={{ margin: "4px 0 0 16px", padding: 0 }}>
                {aiResult.suggestions.map((r, idx) => (
                  <li key={idx} style={{ fontSize: "13px", color: "#1e3a8a" }}>{r}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Error / Success */}
      {error && (
        <div style={{ marginTop: "12px", padding: "10px 14px", backgroundColor: "#fef2f2",
          border: "1px solid #fca5a5", borderRadius: "6px", color: "#dc2626", fontSize: "13px" }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ marginTop: "12px", padding: "10px 14px", backgroundColor: "#f0fdf4",
          border: "1px solid #86efac", borderRadius: "6px", color: "#15803d", fontSize: "13px" }}>
          {success}
        </div>
      )}

      {/* Submit Button — only enabled when AI passed */}
      <button
        onClick={handleSubmit}
        disabled={!aiResult?.passed || submitLoading}
        style={{
          marginTop: "14px", padding: "10px 20px",
          backgroundColor: aiResult?.passed ? "#1e40af" : "#94a3b8",
          color: "white", border: "none", borderRadius: "6px",
          cursor: aiResult?.passed ? "pointer" : "not-allowed",
          fontWeight: 600, fontSize: "14px", width: "100%",
          opacity: submitLoading ? 0.7 : 1,
        }}
      >
        {submitLoading ? "Submitting..." : "Submit Request"}
      </button>
      {!aiResult?.passed && (
        <p style={{ fontSize: "12px", color: "#94a3b8", textAlign: "center", marginTop: "6px" }}>
          Run AI Review first to enable submission
        </p>
      )}
    </div>
  );
}