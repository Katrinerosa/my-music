import { NextResponse } from "next/server";

export async function GET() {
  const apiKey = process.env.LASTFM_API_KEY;
  const callbackUrl = process.env.LASTFM_CALLBACK_URL;

  if (!apiKey || !callbackUrl) {
    return NextResponse.json(
      { error: "Missing LASTFM_API_KEY or LASTFM_CALLBACK_URL" },
      { status: 500 }
    );
  }

  const url = new URL("https://www.last.fm/api/auth/");
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("cb", callbackUrl);

  return NextResponse.redirect(url.toString());
}
