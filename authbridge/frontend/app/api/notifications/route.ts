import { NextRequest, NextResponse } from "next/server";
import { listNotifications, markAllRead } from "@/lib/store";

export const dynamic = "force-dynamic";

// GET /api/notifications?role=PROVIDER — list notifications for a role.
export async function GET(req: NextRequest) {
  const role = req.nextUrl.searchParams.get("role") ?? undefined;
  const rows = listNotifications(role);
  return NextResponse.json({ data: rows, unread: rows.filter((n) => !n.read).length });
}

// POST /api/notifications — { action: "markAllRead", role }
export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === "markAllRead" && body.role) markAllRead(body.role);
  const rows = listNotifications(body.role);
  return NextResponse.json({ data: rows, unread: rows.filter((n) => !n.read).length });
}
