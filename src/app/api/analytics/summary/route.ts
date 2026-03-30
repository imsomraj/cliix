import { NextResponse } from "next/server";

import { getAnalyticsSummary } from "@/lib/analyticsStore";

export async function GET() {
  const summary = getAnalyticsSummary();

  return NextResponse.json(summary);
}
