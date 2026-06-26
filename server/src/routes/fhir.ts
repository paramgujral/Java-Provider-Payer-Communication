import { Router } from 'express';
import {
  getAllClaims,
  getClaimById,
  getClaimsForPayer,
  getClaimsForProvider,
  getUserById,
} from '../services/claimsService.js';
import {
  getCapabilityStatement,
  toFhirBundle,
  toFhirClaim,
  toFhirClaimResponse,
  toFhirCoverage,
  toFhirPatient,
} from '../fhir/mappers.js';
import type { FhirOperationOutcome } from '../fhir/types.js';
import type { Claim } from '../types.js';

const router = Router();

function outcome(severity: 'error' | 'warning', code: string, diagnostics: string, status = 404) {
  const body: FhirOperationOutcome = {
    resourceType: 'OperationOutcome',
    issue: [{ severity, code, diagnostics }],
  };
  return { status, body };
}

function usersForClaim(claim: Claim) {
  return {
    provider: getUserById(claim.provider_id),
    payer: claim.payer_id ? getUserById(claim.payer_id) : undefined,
  };
}

router.get('/metadata', (_req, res) => {
  res.json(getCapabilityStatement());
});

router.get('/Patient/:id', (req, res) => {
  const claim = findClaimByPatientId(req.params.id);
  if (!claim) {
    const { status, body } = outcome('error', 'not-found', `Patient/${req.params.id} not found`);
    return res.status(status).json(body);
  }
  res.json(toFhirPatient(claim));
});

router.get('/Coverage/:id', (req, res) => {
  const claim = findClaimByCoverageId(req.params.id);
  if (!claim) {
    const { status, body } = outcome('error', 'not-found', `Coverage/${req.params.id} not found`);
    return res.status(status).json(body);
  }
  const { payer } = usersForClaim(claim);
  res.json(toFhirCoverage(claim, payer));
});

router.get('/Claim/:id', (req, res) => {
  const claim = getClaimById(req.params.id);
  if (!claim) {
    const { status, body } = outcome('error', 'not-found', `Claim/${req.params.id} not found`);
    return res.status(status).json(body);
  }
  const { provider, payer } = usersForClaim(claim);
  res.json(toFhirClaim(claim, provider, payer));
});

router.get('/ClaimResponse/:id', (req, res) => {
  const claimId = req.params.id.replace(/-response$/, '');
  const claim = getClaimById(claimId);
  if (!claim) {
    const { status, body } = outcome('error', 'not-found', `ClaimResponse/${req.params.id} not found`);
    return res.status(status).json(body);
  }
  const { provider, payer } = usersForClaim(claim);
  const response = toFhirClaimResponse(claim, provider, payer);
  if (!response) {
    const { status, body } = outcome('error', 'not-found', 'No response available for draft authorization');
    return res.status(status).json(body);
  }
  res.json(response);
});

router.get('/AuthorizationRequest/:id/_bundle', (req, res) => {
  const claim = getClaimById(req.params.id);
  if (!claim) {
    const { status, body } = outcome('error', 'not-found', `AuthorizationRequest/${req.params.id} not found`);
    return res.status(status).json(body);
  }
  const { provider, payer } = usersForClaim(claim);
  res.json(toFhirBundle(claim, provider, payer));
});

router.get('/Claim', (req, res) => {
  const use = req.query.use as string | undefined;
  const providerId = req.query.provider as string | undefined;
  const payerId = req.query.payer as string | undefined;

  let claims: Claim[] = [];
  if (providerId) claims = getClaimsForProvider(providerId);
  else if (payerId) claims = getClaimsForPayer(payerId);
  else {
    const { status, body } = outcome('error', 'required', 'Provide provider or payer search parameter');
    return res.status(400).json(body);
  }

  if (use === 'preauthorization') {
    claims = claims.filter((c) => c.status !== 'draft' || providerId);
  }

  const bundle = {
    resourceType: 'Bundle' as const,
    id: 'claim-search',
    type: 'searchset' as const,
    total: claims.length,
    entry: claims.map((c) => {
      const { provider, payer } = usersForClaim(c);
      const resource = toFhirClaim(c, provider, payer);
      return { fullUrl: `Claim/${resource.id}`, resource };
    }),
  };
  res.json(bundle);
});

function findClaimByPatientId(patientRefId: string): Claim | undefined {
  const all = getAllClaimsUnique();
  return all.find((c) => {
    const pid = c.patient_id.replace(/[^a-zA-Z0-9-]/g, '-').toLowerCase();
    return pid === patientRefId.toLowerCase() || c.patient_id === patientRefId;
  });
}

function findClaimByCoverageId(coverageRefId: string): Claim | undefined {
  const all = getAllClaimsUnique();
  return all.find((c) => {
    const cid = c.insurance_policy_number.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
    return cid === coverageRefId.toLowerCase();
  });
}

function getAllClaimsUnique(): Claim[] {
  return getAllClaims();
}

export default router;
