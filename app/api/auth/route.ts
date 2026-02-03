import crypto from "node:crypto"; 
import { NextResponse } from "next/server";

const SPOTIFY_AUTH_URL = "https://accounts.spotify.com/authorize";

const createState = () => crypto.randomBytes(16).toString("hex");

export async function GET() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      { error: "Missing SPOTIFY_CLIENT_ID or SPOTIFY_REDIRECT_URI" },
      { status: 500 }
    );
  }

  const state = createState();
  console.log("[spotify-auth] generated state:", state);
  const url = new URL(SPOTIFY_AUTH_URL);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("state", state);
  url.searchParams.set(
    "scope",
    "user-read-email user-read-private playlist-read-private playlist-read-collaborative user-library-read"
  );

  const response = NextResponse.redirect(url.toString());
  response.cookies.set("spotify_auth_state", state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 10,
  });

  return response;
}
