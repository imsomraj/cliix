import { NextResponse } from "next/server";

import { analyticsService } from "@/lib/services/analytics-service";

export async function GET() {
  const summary = await analyticsService.getSummary();

  return NextResponse.json(summary);
}
