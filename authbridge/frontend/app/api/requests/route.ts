import { NextRequest, NextResponse } from "next/server";
import { createRequest, listRequests } from "@/lib/store";
import type { RequestStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

// GET /api/requests?status=APPROVED — list authorization requests.
export async function GET(req: NextRequest) {
  const status = req.nextUrl.searchParams.get("status") as RequestStatus | null;
  const rows = listRequests({ status: status ?? undefined });
  return NextResponse.json({ data: rows, count: rows.length });
}

// POST /api/requests — create a draft or submit a new authorization request.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const created = createRequest(body);
  return NextResponse.json({ data: created }, { status: 201 });
}
