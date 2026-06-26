import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { initDatabase } from './db.js';
import apiRouter from './routes/api.js';
import fhirRouter from './routes/fhir.js';
import { getAiEngineStatus } from './services/llmService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

initDatabase();

const app = express();
const PORT = config.port;
const aiStatus = getAiEngineStatus();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'Healthcare Connector Platform',
    fhir: 'R4',
    fhirBase: `http://localhost:${PORT}/fhir`,
    ai: aiStatus,
  });
});

app.get('/api', (_req, res) => {
  res.json({
    service: 'Healthcare Connector Platform API',
    status: 'ok',
    fhir: {
      base: `http://localhost:${PORT}/fhir`,
      metadata: `http://localhost:${PORT}/fhir/metadata`,
      resources: ['Patient', 'Coverage', 'Claim', 'ClaimResponse'],
    },
    docs: {
      health: 'GET /api/health',
      login: 'POST /api/auth/login',
      authorizations: 'GET /api/claims/provider/:id | GET /api/claims/payer/:id',
      fhirBundle: 'GET /api/claims/:id/fhir/bundle',
      validate: 'POST /api/ai/validate',
      dashboard: 'GET /api/dashboard/:userId',
      notifications: 'GET /api/notifications/:userId',
    },
    frontend: 'Open http://localhost:5173 for the web app (dev mode)',
  });
});

app.use('/fhir', fhirRouter);

app.use('/api', apiRouter);

app.get('/', (_req, res) => {
  res.json({
    message: 'Healthcare Connector Platform — FHIR R4 Prior Authorization',
    status: 'running',
    api: `http://localhost:${PORT}/api`,
    fhir: `http://localhost:${PORT}/fhir/metadata`,
    health: `http://localhost:${PORT}/api/health`,
    frontend: 'http://localhost:5173',
  });
});

const clientDist = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`Healthcare Insurance API running on http://localhost:${PORT}`);
  console.log(`API docs: http://localhost:${PORT}/api`);
  console.log(`Frontend (dev): http://localhost:5173`);
  console.log(`AI mode: ${aiStatus.mode}${aiStatus.llmConfigured ? ` (${aiStatus.model})` : ' — set OPENAI_API_KEY for LLM'}`);
});

