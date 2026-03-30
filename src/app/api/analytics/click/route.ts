import { NextRequest, NextResponse } from "next/server";

import { analyticsService } from "@/lib/services/analytics-service";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  if (!body || typeof body.link_id !== "string" || body.link_id.trim().length === 0) {
    return NextResponse.json(
      { error: "link_id is required" },
      { status: 400 },
    );
  }

  const timestamp =
    typeof body.timestamp === "string" && body.timestamp.trim().length > 0
      ? body.timestamp
      : new Date().toISOString();

  await analyticsService.writeClick({
    linkId: body.link_id,
    userId: typeof body.user_id === "string" ? body.user_id : undefined,
    timestamp,
    referrer:
      typeof body.referrer === "string"
        ? body.referrer
        : request.headers.get("referer") ?? undefined,
    device:
      body.device && typeof body.device === "object"
        ? {
            userAgent:
              typeof body.device.userAgent === "string"
                ? body.device.userAgent
                : request.headers.get("user-agent") ?? undefined,
            platform:
              typeof body.device.platform === "string"
                ? body.device.platform
                : undefined,
          }
        : {
            userAgent: request.headers.get("user-agent") ?? undefined,
          },
  });

  return NextResponse.json({ ok: true });
}
