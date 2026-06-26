import { useState, useEffect, useCallback } from 'react';
import { AlertCircle, AlertTriangle, Bot, CheckCircle, Info, Sparkles } from 'lucide-react';
import { api } from '../api';
import type { AIValidationResult, AiEngineStatus, ClaimFormData } from '../types';
import { FIELD_LABELS } from './ui';

interface AICopilotPanelProps {
  formData: ClaimFormData;
  onApplyRecommendation: (field: string, value: string) => void;
}

export function AICopilotPanel({ formData, onApplyRecommendation }: AICopilotPanelProps) {
  const [validation, setValidation] = useState<AIValidationResult | null>(null);
  const [aiStatus, setAiStatus] = useState<AiEngineStatus | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getAiStatus().then(setAiStatus).catch(() => null);
  }, []);

  const validate = useCallback(async () => {
    setLoading(true);
    try {
      const result = await api.validateClaim(formData);
      setValidation(result);
    } catch {
      /* ignore */
    } finally {
      setLoading(false);
    }
  }, [formData]);

  useEffect(() => {
    const timer = setTimeout(validate, 500);
    return () => clearTimeout(timer);
  }, [validate]);

  const severityIcon = {
    error: <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />,
    warning: <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />,
    info: <Info className="w-4 h-4 text-blue-500 shrink-0" />,
  };

  const scoreColor =
    !validation || validation.score >= 80
      ? 'text-emerald-600'
      : validation.score >= 60
        ? 'text-amber-600'
        : 'text-red-600';

  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden sticky top-6">
      <div className="bg-gradient-to-r from-brand-600 to-violet-600 px-4 py-3">
        <div className="flex items-center gap-2 text-white">
          <Bot className="w-5 h-5" />
          <h3 className="font-semibold">AI Co-pilot</h3>
          <Sparkles className="w-4 h-4 ml-auto opacity-75" />
        </div>
        <p className="text-brand-100 text-xs mt-0.5">
          {aiStatus?.mode === 'hybrid'
            ? `Hybrid AI · ${aiStatus.model}`
            : 'Rules engine · add OPENAI_API_KEY for LLM'}
        </p>
      </div>

      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <span className="text-sm text-slate-600">Quality Score</span>
          <div className="flex items-center gap-2">
            {loading && <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />}
            <span className={`text-2xl font-bold ${scoreColor}`}>
              {validation?.score ?? '—'}
            </span>
            <span className="text-slate-400 text-sm">/100</span>
          </div>
        </div>

        {validation && (
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                validation.score >= 80 ? 'bg-emerald-500' : validation.score >= 60 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              style={{ width: `${validation.score}%` }}
            />
          </div>
        )}

        {validation?.valid && (
          <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-lg text-emerald-700 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            Ready to submit — all critical checks passed
            {validation.engine === 'hybrid' && (
              <span className="ml-auto text-xs bg-emerald-100 px-2 py-0.5 rounded-full">GPT enhanced</span>
            )}
          </div>
        )}

        {validation?.llmInsight && (
          <div className="p-3 bg-violet-50 rounded-lg text-sm border border-violet-100">
            <p className="text-xs font-semibold text-violet-700 uppercase tracking-wide mb-1">LLM Clinical Insight</p>
            <p className="text-slate-700">{validation.llmInsight}</p>
          </div>
        )}

        {validation && validation.issues.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Issues</h4>
            <div className="space-y-2">
              {validation.issues.map((issue, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  {severityIcon[issue.severity]}
                  <div>
                    <span className="font-medium text-slate-700">{FIELD_LABELS[issue.field] || issue.field}: </span>
                    <span className="text-slate-600">{issue.message}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {validation && validation.recommendations.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Recommendations</h4>
            <div className="space-y-2">
              {validation.recommendations.map((rec, i) => (
                <div key={i} className="p-3 bg-brand-50 rounded-lg text-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="font-medium text-brand-700">{FIELD_LABELS[rec.field] || rec.field}</span>
                      <p className="text-slate-600 mt-0.5">{rec.reason}</p>
                    </div>
                    <button
                      onClick={() => onApplyRecommendation(rec.field, rec.suggestion)}
                      className="shrink-0 px-2.5 py-1 bg-brand-600 text-white text-xs rounded-md hover:bg-brand-700 transition-colors"
                    >
                      Apply
                    </button>
                  </div>
                  <p className="text-brand-600 font-mono text-xs mt-1.5">→ {rec.suggestion}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!validation && !loading && (
          <p className="text-sm text-slate-500 text-center py-4">
            Start filling the form to get AI validation
          </p>
        )}
      </div>
    </div>
  );
}
