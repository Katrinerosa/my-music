import { NextResponse } from "next/server";

type LastFmImage = {
  "#text": string;
  size: string;
};

type LastFmTrack = {
  name: string;
  duration?: string;
  url?: string;
  artist?: { name?: string } | string;
  image?: LastFmImage[];
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

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tag = searchParams.get("tag");
  const limit = searchParams.get("limit") ?? "20";

  if (!tag) {
    return NextResponse.json(
      { error: "Missing tag parameter" },
      { status: 400 }
    );
  }

  const apiKey = process.env.LASTFM_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing LASTFM_API_KEY" },
      { status: 500 }
    );
  }

  const url = new URL(LASTFM_API_URL);
  url.searchParams.set("method", "tag.getTopTracks");
  url.searchParams.set("tag", tag);
  url.searchParams.set("api_key", apiKey);
  url.searchParams.set("format", "json");
  url.searchParams.set("limit", limit);

  const response = await fetch(url.toString(), { next: { revalidate: 300 } });
  if (!response.ok) {
    return NextResponse.json(
      { error: "Failed to fetch Last.fm tracks" },
      { status: 502 }
    );
  }

  const payload = (await response.json()) as {
    toptracks?: { track?: LastFmTrack[] };
  };

  const tracks =
    payload.toptracks?.track?.map((track) => ({
      name: track.name,
      artist:
        typeof track.artist === "string"
          ? track.artist
          : track.artist?.name ?? "Unknown artist",
      duration: track.duration ? Number(track.duration) : undefined,
      url: track.url,
      image: pickImage(track.image),
    })) ?? [];

  return NextResponse.json({ tracks });
}
