import { Router } from 'express';
import {
  createClaim,
  getClaimById,
  getClaimEvents,
  getClaimsForPayer,
  getClaimsForProvider,
  getDashboardStats,
  getFhirBundleForClaim,
  getNotifications,
  getUnreadCount,
  getUserById,
  getUsers,
  loginUser,
  markAllNotificationsRead,
  markNotificationRead,
  payerReviewClaim,
  submitClaim,
  updateClaim,
} from '../services/claimsService.js';
import { reviewClaimForPayer, validateClaimForm } from '../services/aiCopilot.js';
import { getAiEngineStatus } from '../services/llmService.js';
import type { ClaimFormData } from '../types.js';

const router = Router();

router.get('/ai/status', (_req, res) => {
  res.json(getAiEngineStatus());
});

router.post('/ai/validate', async (req, res) => {
  try {
    const data = req.body as ClaimFormData;
    res.json(await validateClaimForm(data));
  } catch (e) {
    console.error('[AI] validate error:', e);
    res.status(500).json({ error: 'AI validation failed' });
  }
});

router.post('/ai/review', async (req, res) => {
  try {
    const data = req.body as ClaimFormData;
    res.json(await reviewClaimForPayer(data));
  } catch (e) {
    console.error('[AI] review error:', e);
    res.status(500).json({ error: 'AI review failed' });
  }
});

router.post('/auth/login', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: 'Email is required' });
  const user = loginUser(email);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

router.get('/users', (req, res) => {
  const role = req.query.role as string | undefined;
  res.json(getUsers(role));
});

router.get('/users/:id', (req, res) => {
  const user = getUserById(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

router.get('/claims/provider/:providerId', (req, res) => {
  res.json(getClaimsForProvider(req.params.providerId));
});

router.get('/claims/payer/:payerId', (req, res) => {
  res.json(getClaimsForPayer(req.params.payerId));
});

router.get('/claims/:id/fhir/bundle', (req, res) => {
  const bundle = getFhirBundleForClaim(req.params.id);
  if (!bundle) return res.status(404).json({ error: 'Authorization request not found' });
  res.json(bundle);
});

router.get('/claims/:id/events', (req, res) => {
  res.json(getClaimEvents(req.params.id));
});

router.get('/claims/:id', (req, res) => {
  const claim = getClaimById(req.params.id);
  if (!claim) return res.status(404).json({ error: 'Authorization request not found' });
  res.json(claim);
});

router.post('/claims', (req, res) => {
  const { providerId, ...data } = req.body;
  if (!providerId) return res.status(400).json({ error: 'providerId is required' });
  const claim = createClaim(providerId, data as ClaimFormData);
  res.status(201).json(claim);
});

router.put('/claims/:id', (req, res) => {
  const { providerId, ...data } = req.body;
  const claim = updateClaim(req.params.id, providerId, data as ClaimFormData);
  if (!claim) return res.status(400).json({ error: 'Cannot update claim' });
  res.json(claim);
});

router.post('/claims/:id/submit', (req, res) => {
  const { providerId } = req.body;
  const claim = submitClaim(req.params.id, providerId);
  if (!claim) {
    return res.status(400).json({
      error: 'Cannot submit claim. Ensure all required fields are filled, AI validation passes, and a payer is selected.',
    });
  }
  res.json(claim);
});

router.post('/claims/:id/review', (req, res) => {
  const { payerId, action, notes, applyCorrections } = req.body;
  const claim = payerReviewClaim(req.params.id, payerId, action, notes, applyCorrections);
  if (!claim) return res.status(400).json({ error: 'Cannot perform this action on claim' });
  res.json(claim);
});

router.get('/dashboard/:userId', (req, res) => {
  const user = getUserById(req.params.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(getDashboardStats(req.params.userId, user.role));
});

router.get('/notifications/:userId', (req, res) => {
  res.json(getNotifications(req.params.userId));
});

router.get('/notifications/:userId/unread-count', (req, res) => {
  res.json({ count: getUnreadCount(req.params.userId) });
});

router.patch('/notifications/:id/read', (req, res) => {
  const { userId } = req.body;
  markNotificationRead(req.params.id, userId);
  res.json({ success: true });
});

router.patch('/notifications/:userId/read-all', (req, res) => {
  markAllNotificationsRead(req.params.userId);
  res.json({ success: true });
});

export default router;
