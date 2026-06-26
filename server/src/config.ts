import 'dotenv/config';

function envBool(key: string, defaultValue: boolean): boolean {
  const v = process.env[key];
  if (v === undefined) return defaultValue;
  return v === 'true' || v === '1';
}

export const config = {
  port: parseInt(process.env.PORT || '3001', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
    timeoutMs: parseInt(process.env.OPENAI_TIMEOUT_MS || '15000', 10),
  },
  ai: {
    llmEnabled: envBool('AI_LLM_ENABLED', true),
    /** Rules always gate submit; LLM enriches recommendations only */
    rulesGateSubmit: true,
  },
};

export function isLlmConfigured(): boolean {
  return config.ai.llmEnabled && Boolean(config.openai.apiKey);
}
