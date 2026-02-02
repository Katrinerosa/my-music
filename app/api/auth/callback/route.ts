import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const clientId = process.env.SPOTIFY_CLIENT_ID;
const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url); // FIXED!
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  if (!code || !state) {
    return NextResponse.json(
      { error: "Missing code or state" },
      { status: 400 },
    );
  }

  if (!clientId || !clientSecret || !redirectUri) {
    return NextResponse.json(
      {
        error:
          "Missing SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET, or SPOTIFY_REDIRECT_URI",
      },
      { status: 500 },
    );
  }

  const storedState = request.headers
    .get("cookie")
    ?.split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith("spotify_auth_state="))
    ?.split("=")[1];

  if (!storedState || storedState !== state) {
    return NextResponse.json({ error: "Invalid state" }, { status: 400 });
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const body = new URLSearchParams();
  body.set("grant_type", "authorization_code");
  body.set("code", code);
  body.set("redirect_uri", redirectUri);

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to exchange code for token" },
      { status: 502 },
    );
  }

  const payload = (await response.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  // Get user ID for playlist creation
  const userRes = await fetch("https://api.spotify.com/v1/me", {
    headers: {
      Authorization: `Bearer ${payload.access_token}`,
    },
  });

  if (!userRes.ok) {
    return NextResponse.json(
      { error: "Failed to fetch user profile" },
      { status: 502 },
    );
  }

  const user = await userRes.json();
  console.log("Spotify user ID:", user.id);

  const redirectUrl = redirectUri ? new URL(redirectUri) : new URL(request.url);
  redirectUrl.pathname = "/";
  redirectUrl.search = "";
  redirectUrl.hash = "";
  const responseWithCookies = NextResponse.redirect(redirectUrl.toString());

  responseWithCookies.cookies.set(
    "spotify_access_token",
    payload.access_token,
    {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
      sameSite: "lax",
      maxAge: payload.expires_in,
    },
  );

  if (payload.refresh_token) {
    responseWithCookies.cookies.set(
      "spotify_refresh_token",
      payload.refresh_token,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30,
      },
    );
  }

  responseWithCookies.cookies.set("spotify_auth_state", "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 0,
  });

  return responseWithCookies;
}
