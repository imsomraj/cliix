import { NextResponse } from "next/server";

import { getPublicProfileByUsername } from "@/lib/public-profile";

type RouteContext = {
  params: {
    username: string;
  };
};

export async function GET(_request: Request, { params }: RouteContext) {
  const username = decodeURIComponent(params.username).trim();

  if (!username) {
    return NextResponse.json({ error: "username is required" }, { status: 400 });
  }

  const profile = getPublicProfileByUsername(username);

  if (!profile) {
    return NextResponse.json({ error: "profile not found" }, { status: 404 });
  }

  return NextResponse.json(profile);
}
