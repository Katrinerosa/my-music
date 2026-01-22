import crypto from "node:crypto";
import { NextResponse } from "next/server";

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";

const createApiSignature = (
  params: Record<string, string>,
  secret: string
) => {
  const sorted = Object.keys(params)
    .sort()
    .map((key) => `${key}${params[key]}`)
    .join("");

  return crypto.createHash("md5").update(`${sorted}${secret}`).digest("hex");
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Missing token" }, { status: 400 });
  }

  const apiKey = process.env.LASTFM_API_KEY;
  const apiSecret = process.env.LASTFM_API_SECRET;

  if (!apiKey || !apiSecret) {
    return NextResponse.json(
      { error: "Missing LASTFM_API_KEY or LASTFM_API_SECRET" },
      { status: 500 }
    );
  }

  const params = {
    api_key: apiKey,
    method: "auth.getSession",
    token,
  };

  const apiSig = createApiSignature(params, apiSecret);

  const url = new URL(LASTFM_API_URL);
  url.searchParams.set("method", "auth.getSession");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("token", token);
  url.searchParams.set("api_sig", apiSig);
  url.searchParams.set("format", "json");

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Last.fm session" },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as {
    session?: { key: string; name: string };
  };

  if (!payload.session?.key) {
    return NextResponse.json(
      { error: "Invalid session response from Last.fm" },
      { status: 502 }
    );
  }

  const redirectUrl = new URL("/", request.url);
  const responseWithCookie = NextResponse.redirect(redirectUrl.toString());
  responseWithCookie.cookies.set("lastfm_session", payload.session.key, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });
  responseWithCookie.cookies.set("lastfm_user", payload.session.name, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
  });

  return responseWithCookie;
}
