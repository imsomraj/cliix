import { NextRequest, NextResponse } from "next/server";

import { writePageView } from "@/lib/analyticsStore";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);

  const page =
    body && typeof body.page === "string" && body.page.trim().length > 0
      ? body.page
      : request.nextUrl.pathname;

  writePageView({
    page,
    userId: body && typeof body.user_id === "string" ? body.user_id : undefined,
    timestamp:
      body && typeof body.timestamp === "string" && body.timestamp.trim().length > 0
        ? body.timestamp
        : new Date().toISOString(),
    referrer:
      body && typeof body.referrer === "string"
        ? body.referrer
        : request.headers.get("referer") ?? undefined,
    device:
      body && body.device && typeof body.device === "object"
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
