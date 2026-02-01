import { cookies } from "next/headers";
import { NextResponse } from "next/server";

type LastFmImage = {
  "#text": string;
  size: string;
};

type LovedTrack = {
  name: string;
  artist?: { name?: string };
  image?: LastFmImage[];
  url?: string;
  duration?: string;
};

type TopTrack = {
  name: string;
  artist?: { name?: string } | string;
  image?: LastFmImage[];
  url?: string;
  duration?: string;
};

const LASTFM_API_URL = "https://ws.audioscrobbler.com/2.0/";

const pickImage = (images?: LastFmImage[]) => {
  if (!images?.length) return undefined;
  const preferred =
    images.find((img) => img.size === "medium") ??
    images.find((img) => img.size === "small") ??
    images[images.length - 1];
  return preferred?.["#text"] || undefined;
};

const mapTrack = (track: LovedTrack | TopTrack) => ({
  name: track.name,
  artist:
    typeof track.artist === "string"
      ? track.artist
      : track.artist?.name ?? "Unknown artist",
  duration: track.duration ? Number(track.duration) : undefined,
  url: track.url,
  image: pickImage(track.image),
});

export async function GET(request: Request) {
  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing LASTFM_API_KEY" },
      { status: 500 }
    );
  }

  const cookieStore = await cookies();
  const { searchParams } = new URL(request.url);
  const cookieUser = cookieStore.get("lastfm_user")?.value;
  const requestedUser = searchParams.get("user") ?? undefined;
  const user = requestedUser || cookieUser;
  const tag = searchParams.get("tag");
  const limit = searchParams.get("limit") ?? "20";

  const url = new URL(LASTFM_API_URL);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", limit);

  if (user) {
    url.searchParams.set("method", "user.getLovedTracks");
    url.searchParams.set("user", user);
  } else if (tag) {
    url.searchParams.set("method", "tag.getTopTracks");
    url.searchParams.set("tag", tag);
  } else {
    return NextResponse.json(
      { error: "Missing tag parameter" },
      { status: 400 }
    );
  }

  const response = await fetch(url.toString(), { cache: "no-store" });
  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Last.fm tracks" },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as {
    lovedtracks?: { track?: LovedTrack[] };
    toptracks?: { track?: TopTrack[] };
  };

  const tracks = user
    ? payload.lovedtracks?.track?.map(mapTrack) ?? []
    : payload.toptracks?.track?.map(mapTrack) ?? [];

  return NextResponse.json({ tracks, source: user ? "user" : "tag" });
}
