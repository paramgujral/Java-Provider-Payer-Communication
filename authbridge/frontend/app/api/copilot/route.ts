import { NextRequest, NextResponse } from "next/server";
import { reviewWithRules } from "@/lib/copilot";

export const dynamic = "force-dynamic";

// POST /api/copilot — run the AI copilot review over a (possibly partial) request.
//
// Today this uses the deterministic rules engine so the platform runs without
// API keys. To switch to Claude, implement reviewWithLLM in lib/copilot.ts and
// branch on process.env.ANTHROPIC_API_KEY here. The response shape is identical.
export async function POST(req: NextRequest) {
  const body = await req.json();
  const review = reviewWithRules(body);
  return NextResponse.json({ data: review });
}
