import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const SPOTIFY_API_BASE = "https://api.spotify.com/v1";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";

type SpotifyImage = {
  url: string;
  width?: number;
  height?: number;
};

type SpotifyTrack = {
  name: string;
  duration_ms: number;
  external_urls?: { spotify?: string };
  artists?: { name: string }[];
  album?: { images?: SpotifyImage[] };
  preview_url?: string | null;
};

const getAccessToken = async () => {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("spotify_access_token")?.value ?? null,
    refreshToken: cookieStore.get("spotify_refresh_token")?.value ?? null,
  };
};

const refreshAccessToken = async (refreshToken: string) => {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return null;
  }

  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString(
    "base64",
  );

  const body = new URLSearchParams();
  body.set("grant_type", "refresh_token");
  body.set("refresh_token", refreshToken);

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basicAuth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as {
    access_token: string;
    expires_in: number;
  };

  return payload;
};

const mapTrack = (track: SpotifyTrack) => ({
  name: track.name,
  artist: track.artists?.[0]?.name ?? "Unknown artist",
  duration: Math.round(track.duration_ms / 1000),
  url: track.external_urls?.spotify,
  image: track.album?.images?.[0]?.url,
  previewUrl: track.preview_url ?? null,
});

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("query") ?? searchParams.get("q");
  const limit = searchParams.get("limit") ?? "20";

  if (!query) {
    return NextResponse.json(
      { error: "Missing query parameter" },
      { status: 400 },
    );
  }

  let { accessToken, refreshToken } = await getAccessToken();
  let refreshedAccessToken: { value: string; expiresIn: number } | null = null;

  if (!accessToken && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed?.access_token) {
      accessToken = refreshed.access_token;
      refreshedAccessToken = {
        value: refreshed.access_token,
        expiresIn: refreshed.expires_in,
      };
    }
  }

  if (!accessToken) {
    return NextResponse.json(
      { error: "Missing Spotify access token. Connect Spotify first." },
      { status: 401 },
    );
  }

  const url = new URL(`${SPOTIFY_API_BASE}/search`);
  url.searchParams.set("type", "track");
  url.searchParams.set("q", query);
  url.searchParams.set("limit", limit);

  let response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: "no-store",
  });

  if (response.status === 401 && refreshToken) {
    const refreshed = await refreshAccessToken(refreshToken);
    if (refreshed?.access_token) {
      accessToken = refreshed.access_token;
      refreshedAccessToken = {
        value: refreshed.access_token,
        expiresIn: refreshed.expires_in,
      };
      response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        cache: "no-store",
      });
    }
  }

  if (!response.ok) {
    let details: unknown = null;
    try {
      details = await response.json();
    } catch {
      details = null;
    }
    const message =
      (details as { error?: { message?: string } })?.error?.message ??
      "Failed to fetch Spotify tracks";
    return NextResponse.json(
      { error: message, status: response.status, details },
      { status: response.status },
    );
  }

  const payload = (await response.json()) as {
    tracks?: { items?: SpotifyTrack[] };
  };

  const tracks = payload.tracks?.items?.map(mapTrack) ?? [];

  const responseWithBody = NextResponse.json({ tracks });
  if (refreshedAccessToken) {
    responseWithBody.cookies.set(
      "spotify_access_token",
      refreshedAccessToken.value,
      {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        path: "/",
        sameSite: "lax",
        maxAge: refreshedAccessToken.expiresIn,
      },
    );
  }

  return responseWithBody;
}
