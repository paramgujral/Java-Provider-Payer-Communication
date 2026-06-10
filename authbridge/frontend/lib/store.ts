import type { AuthRequest, Notification, RequestStatus, TimelineEvent } from "./types";
import { reviewWithRules } from "./copilot";

// ─────────────────────────────────────────────────────────────────────────────
// In-memory data store. This makes the website fully runnable with zero infra.
// In production these reads/writes are served by the Spring Boot backend over
// REST (see ARCHITECTURE.md). The store is a process-level singleton so it
// survives across API route invocations in a single `next dev`/`next start`.
// ─────────────────────────────────────────────────────────────────────────────

interface DB {
  requests: AuthRequest[];
  notifications: Notification[];
  seq: number;
}

const globalForDb = globalThis as unknown as { __authbridgeDb?: DB };

function uid(prefix: string): string {
  const n = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${n}`;
}

function ref(seq: number): string {
  return `PA-2026-${String(seq).padStart(5, "0")}`;
}

function event(
  partial: Omit<TimelineEvent, "id" | "at"> & { at?: string },
): TimelineEvent {
  return { id: uid("ev"), at: partial.at ?? new Date().toISOString(), ...partial };
}

function seed(): DB {
  const now = Date.now();
  const iso = (minsAgo: number) => new Date(now - minsAgo * 60_000).toISOString();

  const base = (over: Partial<AuthRequest>, seq: number): AuthRequest => {
    const r: AuthRequest = {
      id: uid("req"),
      referenceNo: ref(seq),
      status: "SUBMITTED",
      priority: "ROUTINE",
      providerOrg: "Riverside General Hospital",
      payerOrg: "Meridian Health Plan",
      submittedBy: "Dr. Alan Grant",
      patientName: "Jordan T.",
      patientDob: "1979-04-12",
      memberId: "MRD-8841290",
      serviceRequested: "MRI lumbar spine without contrast",
      cptCodes: ["72148"],
      icd10Codes: ["M54.16"],
      placeOfService: "Outpatient Hospital",
      requestedUnits: 1,
      clinicalJustification:
        "Patient reports 10 weeks of radicular low back pain unresponsive to 6 weeks of physical therapy and NSAIDs. Progressive left-leg weakness on exam. MRI requested to evaluate for disc herniation prior to surgical consult.",
      documents: [
        { id: uid("doc"), name: "clinical-notes.pdf", type: "Clinical Notes", sizeKb: 412, uploadedAt: iso(120) },
        { id: uid("doc"), name: "pt-summary.pdf", type: "Therapy Summary", sizeKb: 188, uploadedAt: iso(120) },
      ],
      timeline: [],
      createdAt: iso(130),
      updatedAt: iso(15),
      ...over,
    };
    r.copilot = reviewWithRules(r);
    return r;
  };

  const r1 = base({}, 1);
  r1.timeline = [
    event({ at: iso(130), actor: "Dr. Alan Grant · Riverside General", role: "PROVIDER", action: "Created draft" }),
    event({ at: iso(128), actor: "AuthBridge Copilot", role: "COPILOT", action: "Pre-submission review", note: "Completeness 92% · Approval likelihood 84%" }),
    event({ at: iso(125), actor: "Dr. Alan Grant · Riverside General", role: "PROVIDER", action: "Submitted to payer", fromStatus: "DRAFT", toStatus: "SUBMITTED" }),
    event({ at: iso(40), actor: "Meridian Health Plan", role: "PAYER", action: "Assigned to reviewer", note: "Nurse reviewer: P. Sattler" }),
  ];
  r1.status = "IN_REVIEW";
  r1.assignedReviewer = "P. Sattler";

  const r2 = base(
    {
      priority: "URGENT",
      serviceRequested: "CT angiography chest",
      cptCodes: ["71275"],
      icd10Codes: ["R07.9"],
      patientName: "Maria S.",
      memberId: "MRD-2207781",
      clinicalJustification: "Acute chest pain, rule out PE.",
      documents: [],
    },
    2,
  );
  r2.status = "INFO_REQUESTED";
  r2.decisionNote = "Please attach D-dimer result and ECG before review can continue.";
  r2.timeline = [
    event({ at: iso(300), actor: "Dr. Ellie Sattler · Riverside General", role: "PROVIDER", action: "Submitted to payer", toStatus: "SUBMITTED" }),
    event({ at: iso(200), actor: "Meridian Health Plan", role: "PAYER", action: "Requested additional information", fromStatus: "IN_REVIEW", toStatus: "INFO_REQUESTED", note: "Missing D-dimer and ECG." }),
  ];

  const r3 = base(
    {
      serviceRequested: "Total knee arthroplasty",
      cptCodes: ["27447"],
      icd10Codes: ["M17.11"],
      patientName: "Robert M.",
      memberId: "MRD-5519034",
      clinicalJustification:
        "Severe right-knee osteoarthritis. Failed 9 months of conservative management including PT, NSAIDs, and intra-articular injections. Weight-bearing radiographs show bone-on-bone changes. TKA recommended.",
    },
    3,
  );
  r3.status = "APPROVED";
  r3.decisionNote = "Approved. Authorization valid 90 days. Auth #MER-77120.";
  r3.timeline = [
    event({ at: iso(1400), actor: "Dr. Alan Grant · Riverside General", role: "PROVIDER", action: "Submitted to payer", toStatus: "SUBMITTED" }),
    event({ at: iso(1200), actor: "Meridian Health Plan", role: "PAYER", action: "Approved", fromStatus: "IN_REVIEW", toStatus: "APPROVED", note: "Meets policy MED-ORTHO-22." }),
  ];

  const r4 = base(
    {
      serviceRequested: "Bariatric surgery (sleeve gastrectomy)",
      cptCodes: ["43775"],
      icd10Codes: ["E66.01"],
      patientName: "Dana W.",
      memberId: "MRD-9930122",
      clinicalJustification: "BMI 41. Requesting sleeve gastrectomy.",
      documents: [],
    },
    4,
  );
  r4.status = "DENIED";
  r4.decisionNote =
    "Denied — policy requires documented 6-month supervised weight-management program. Eligible for resubmission with documentation.";
  r4.timeline = [
    event({ at: iso(2000), actor: "Dr. Ellie Sattler · Riverside General", role: "PROVIDER", action: "Submitted to payer", toStatus: "SUBMITTED" }),
    event({ at: iso(1800), actor: "Meridian Health Plan", role: "PAYER", action: "Denied", fromStatus: "IN_REVIEW", toStatus: "DENIED", note: "Policy MED-BAR-09 not met." }),
  ];

  const r5 = base(
    {
      status: "DRAFT",
      serviceRequested: "Sleep study (polysomnography)",
      cptCodes: ["95810"],
      icd10Codes: ["G47.33"],
      patientName: "Kevin P.",
      memberId: "MRD-1144556",
      clinicalJustification: "Suspected obstructive sleep apnea.",
      documents: [],
      submittedBy: undefined,
    },
    5,
  );
  r5.timeline = [event({ at: iso(20), actor: "Dr. Alan Grant · Riverside General", role: "PROVIDER", action: "Created draft" })];

  const requests = [r1, r2, r3, r4, r5];

  const notifications: Notification[] = [
    { id: uid("ntf"), role: "PROVIDER", requestId: r3.id, referenceNo: r3.referenceNo, title: "Request approved", body: "Total knee arthroplasty approved by Meridian Health Plan.", channel: "IN_APP", read: false, createdAt: iso(1200) },
    { id: uid("ntf"), role: "PROVIDER", requestId: r2.id, referenceNo: r2.referenceNo, title: "Additional info requested", body: "Meridian needs D-dimer and ECG for CT angiography.", channel: "EMAIL", read: false, createdAt: iso(200) },
    { id: uid("ntf"), role: "PROVIDER", requestId: r4.id, referenceNo: r4.referenceNo, title: "Request denied", body: "Bariatric surgery denied — eligible for resubmission.", channel: "IN_APP", read: true, createdAt: iso(1800) },
    { id: uid("ntf"), role: "PAYER", requestId: r1.id, referenceNo: r1.referenceNo, title: "New request assigned", body: "MRI lumbar spine assigned to P. Sattler.", channel: "IN_APP", read: false, createdAt: iso(40) },
    { id: uid("ntf"), role: "PAYER", requestId: r2.id, referenceNo: r2.referenceNo, title: "Awaiting provider response", body: "CT angiography pending additional information.", channel: "IN_APP", read: false, createdAt: iso(200) },
  ];

  return { requests, notifications, seq: 5 };
}

function db(): DB {
  if (!globalForDb.__authbridgeDb) {
    globalForDb.__authbridgeDb = seed();
  }
  return globalForDb.__authbridgeDb;
}

// ─── Query / command API used by the route handlers ─────────────────────────

export function listRequests(filter?: { status?: RequestStatus; role?: string }): AuthRequest[] {
  let rows = [...db().requests];
  if (filter?.status) rows = rows.filter((r) => r.status === filter.status);
  return rows.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getRequest(id: string): AuthRequest | undefined {
  return db().requests.find((r) => r.id === id || r.referenceNo === id);
}

export function createRequest(input: Partial<AuthRequest>): AuthRequest {
  const d = db();
  d.seq += 1;
  const nowIso = new Date().toISOString();
  const r: AuthRequest = {
    id: uid("req"),
    referenceNo: ref(d.seq),
    status: input.status === "SUBMITTED" ? "SUBMITTED" : "DRAFT",
    priority: input.priority ?? "ROUTINE",
    providerOrg: input.providerOrg ?? "Riverside General Hospital",
    payerOrg: input.payerOrg ?? "Meridian Health Plan",
    submittedBy: input.submittedBy,
    assignedReviewer: undefined,
    patientName: input.patientName ?? "",
    patientDob: input.patientDob ?? "",
    memberId: input.memberId ?? "",
    serviceRequested: input.serviceRequested ?? "",
    cptCodes: input.cptCodes ?? [],
    icd10Codes: input.icd10Codes ?? [],
    placeOfService: input.placeOfService ?? "Outpatient Hospital",
    requestedUnits: input.requestedUnits ?? 1,
    clinicalJustification: input.clinicalJustification ?? "",
    documents: input.documents ?? [],
    timeline: [],
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  r.copilot = reviewWithRules(r);
  r.timeline.push(event({ actor: r.submittedBy ?? "Provider", role: "PROVIDER", action: "Created draft" }));
  if (r.status === "SUBMITTED") {
    r.timeline.push(event({ actor: r.submittedBy ?? "Provider", role: "PROVIDER", action: "Submitted to payer", toStatus: "SUBMITTED" }));
    pushNotification({ role: "PAYER", requestId: r.id, referenceNo: r.referenceNo, title: "New authorization request", body: `${r.serviceRequested} submitted by ${r.providerOrg}.`, channel: "IN_APP" });
  }
  d.requests.push(r);
  return r;
}

// Update editable clinical/coverage fields on a request (provider edit flow).
// Re-runs the copilot review and appends an "Edited request" audit event.
export function updateRequest(id: string, patch: Partial<AuthRequest> & { editor?: string }): AuthRequest | undefined {
  const r = getRequest(id);
  if (!r) return undefined;

  const editable: (keyof AuthRequest)[] = [
    "serviceRequested", "cptCodes", "icd10Codes", "priority", "placeOfService",
    "requestedUnits", "patientName", "patientDob", "memberId", "payerOrg",
    "clinicalJustification", "documents",
  ];
  for (const k of editable) {
    if (patch[k] !== undefined) (r as any)[k] = patch[k];
  }

  r.updatedAt = new Date().toISOString();
  r.copilot = reviewWithRules(r);
  r.timeline.push(
    event({ actor: patch.editor ?? r.submittedBy ?? "Provider", role: "PROVIDER", action: "Edited request" }),
  );
  return r;
}

export function transition(
  id: string,
  to: RequestStatus,
  actor: { name: string; role: "PROVIDER" | "PAYER" },
  note?: string,
): AuthRequest | undefined {
  const r = getRequest(id);
  if (!r) return undefined;
  const from = r.status;
  r.status = to;
  r.updatedAt = new Date().toISOString();
  if (note) r.decisionNote = note;

  const actionMap: Record<RequestStatus, string> = {
    DRAFT: "Reverted to draft",
    SUBMITTED: "Submitted to payer",
    IN_REVIEW: "Started review",
    INFO_REQUESTED: "Requested additional information",
    APPROVED: "Approved",
    DENIED: "Denied",
    RESUBMITTED: "Resubmitted",
  };
  r.timeline.push(
    event({ actor: actor.name, role: actor.role, action: actionMap[to], fromStatus: from, toStatus: to, note }),
  );

  // Notify the counterparty.
  const targetRole = actor.role === "PAYER" ? "PROVIDER" : "PAYER";
  const titleMap: Partial<Record<RequestStatus, string>> = {
    APPROVED: "Request approved",
    DENIED: "Request denied",
    INFO_REQUESTED: "Additional information requested",
    IN_REVIEW: "Request under review",
    SUBMITTED: "New authorization request",
    RESUBMITTED: "Request resubmitted",
  };
  pushNotification({
    role: targetRole,
    requestId: r.id,
    referenceNo: r.referenceNo,
    title: titleMap[to] ?? "Request updated",
    body: note ?? `${r.serviceRequested} is now ${to.replace("_", " ").toLowerCase()}.`,
    channel: "IN_APP",
  });
  return r;
}

export function assignReviewer(id: string, reviewer: string): AuthRequest | undefined {
  const r = getRequest(id);
  if (!r) return undefined;
  r.assignedReviewer = reviewer;
  r.updatedAt = new Date().toISOString();
  r.timeline.push(event({ actor: r.payerOrg, role: "PAYER", action: "Assigned to reviewer", note: reviewer }));
  return r;
}

export function listNotifications(role?: string): Notification[] {
  let rows = [...db().notifications];
  if (role === "PROVIDER" || role === "PAYER") rows = rows.filter((n) => n.role === role);
  return rows.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function markAllRead(role: string): void {
  db().notifications.forEach((n) => {
    if (n.role === role) n.read = true;
  });
}

export function pushNotification(n: Omit<Notification, "id" | "read" | "createdAt">): Notification {
  const ntf: Notification = { id: uid("ntf"), read: false, createdAt: new Date().toISOString(), ...n };
  db().notifications.push(ntf);
  return ntf;
}
