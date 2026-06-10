import { NextRequest, NextResponse } from "next/server";
import { assignReviewer, getRequest, transition, updateRequest } from "@/lib/store";
import type { RequestStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/requests/:id — fetch a single request (by id or reference no).
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const r = getRequest(params.id);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: r });
}

// PUT /api/requests/:id — update editable fields (provider edit before resubmit).
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();
  const r = updateRequest(params.id, body);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: r });
}

// PATCH /api/requests/:id — workflow actions: status transition or assignment.
// Body: { action: "transition" | "assign", to?, note?, actor?, reviewer? }
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const body = await req.json();

  if (body.action === "assign") {
    const r = assignReviewer(params.id, body.reviewer);
    if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ data: r });
  }

  const to = body.to as RequestStatus;
  const actor = body.actor ?? { name: "User", role: "PROVIDER" };
  const r = transition(params.id, to, actor, body.note);
  if (!r) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ data: r });
}
