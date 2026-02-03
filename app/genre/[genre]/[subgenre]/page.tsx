import Link from "next/link";
import { headers } from "next/headers";
import TrackPlayer from "@/components/TrackPlayer";
import { genres as localGenres } from "@/data/genres";

type Track = {
  name: string;
  duration?: number;
  artist: string;
  image?: string;
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const tagOverrides: Record<string, string> = {
  "acoustic-blues": "blues",
  "blues-rock": "blues rock",
  "canadian-blues": "blues",
  "jazz-blues": "jazz",
  "piano-blues": "blues",
  "soul-blues": "soul",
  "swamp-blues": "blues",
  "classic-rock": "classic rock",
  "alternative-rock": "alternative rock",
  "post-punk": "post-punk",
  grunge: "grunge",
  baroque: "baroque",
  romantic: "romantic classical",
  modern: "contemporary classical",
  chamber: "chamber music",
  "outlaw-country": "outlaw country",
  "country-pop": "country pop",
  bluegrass: "bluegrass",
  house: "house",
  techno: "techno",
  trance: "trance",
  ambient: "ambient",
  synthwave: "synthwave",
  idm: "idm",
  hiit: "workout",
  running: "running",
  cycling: "cycling",
  "boom-bap": "boom bap",
  trap: "trap",
  conscious: "conscious hip hop",
  ebm: "ebm",
  "industrial-rock": "industrial rock",
  "electro-industrial": "industrial",
};

const resolveTag = (rawSubgenre: string, fallback: string) => {
  if (tagOverrides[rawSubgenre]) {
    return tagOverrides[rawSubgenre];
  }
  const normalized = rawSubgenre.replace(/-/g, " ").trim();
  return normalized || fallback.toLowerCase();
};

const fetchApi = async (path: string) => {
  const headerList = await headers();
 const host = headerList.get("host") ?? "127.0.0.1:3000";
  const cookie = headerList.get("cookie");
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;
  const response = await fetch(`${baseUrl}${path}`, {
    next: { revalidate: 300 },
    headers: cookie ? { cookie } : undefined,
  });

  if (!response.ok) {
    try {
      const payload = (await response.json()) as { error?: string };
      if (payload?.error) {
        return { tracks: [] as Track[], error: payload.error };
      }
    } catch {
      // Ignore parse errors.
    }
    return {
      tracks: [] as Track[],
      error: `Failed to fetch tracks (${response.status})`,
    };
  }

  const payload = (await response.json()) as {
    tracks?: Track[];
    error?: string;
  };
  if (payload.error) {
    return { tracks: [] as Track[], error: payload.error };
  }
  return { tracks: payload.tracks ?? [], error: null };
};

const fetchTracks = async (query: string) =>
  fetchApi(`/api/spotify/tracks?query=${encodeURIComponent(query)}`);

const fetchTracksWithFallback = async (
  primaryTag: string,
  fallbackTag?: string
) => {
  const primary = await fetchTracks(primaryTag);
  if (primary.tracks.length) {
    return { ...primary, usedTag: primaryTag, isFallback: false };
  }

  if (fallbackTag) {
    const fallback = await fetchTracks(fallbackTag);
    if (fallback.tracks.length) {
      return { ...fallback, usedTag: fallbackTag, isFallback: true };
    }
    return {
      tracks: [],
      error: primary.error ?? fallback.error,
      usedTag: fallbackTag,
      isFallback: true,
    };
  }

  return {
    tracks: [],
    error: primary.error ?? null,
    usedTag: primaryTag,
    isFallback: false,
  };
};

export default async function SubgenrePage({
  params,
}: {
  params:
    | { genre: string; subgenre: string }
    | Promise<{ genre: string; subgenre: string }>;
}) {
  const resolvedParams = await Promise.resolve(params);
  const rawGenre = resolvedParams.genre ?? "";
  const rawSubgenre = resolvedParams.subgenre ?? "";
  const matchedGenre = localGenres.find(
    (genre) => toSlug(genre.name) === rawGenre
  );
  const matchedSubgenre = matchedGenre?.subgenres?.find(
    (subgenre) => toSlug(subgenre) === rawSubgenre
  );

  const fallbackLabel = (value: string) =>
    value.replace(/-/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

  const genreLabel = matchedGenre?.name ?? fallbackLabel(rawGenre);
  const subgenreLabel = matchedSubgenre ?? fallbackLabel(rawSubgenre);
  const resolvedTag = resolveTag(rawSubgenre, subgenreLabel);
  const { tracks, isFallback, error } = await fetchTracksWithFallback(
    resolvedTag,
    genreLabel.toLowerCase()
  );

  return (
    <main className="mx-auto flex min-h-[1173px] w-full max-w-[600px] flex-col px-6 pb-10 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <Link
          href="/"
          aria-label="Back"
          className="grid h-8 w-8 place-items-center text-black/70 transition hover:text-black dark:text-white/80 dark:hover:text-white"
        >
          ←
        </Link>
        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/70 dark:text-white/70">
          Music
        </div>
        <button
          type="button"
          aria-label="Search"
          className="grid h-8 w-8 place-items-center text-black/70 transition hover:text-black dark:text-white/80 dark:hover:text-white"
        >
          🔍
        </button>
      </div>

      <div className="mb-[25px]">
        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/70 dark:text-white/70">
          {genreLabel}
        </div>
        <h1 className="bg-gradient-to-r from-[#EE0979] to-[#FF6A00] bg-clip-text text-[32px] font-bold text-transparent">
          {subgenreLabel}
        </h1>
      </div>

      {resolvedTag !== subgenreLabel ? (
        <div className="mb-2 rounded-xl bg-white/90 px-4 py-2 text-[12px] text-black/70 dark:bg-white/10 dark:text-white/70">
          Subgenre-navne matcher ikke altid Spotify-søgning. Vi bruger derfor
          et hardcoded map til at finde relevante tracks.
        </div>
      ) : null}

      {isFallback && tracks.length ? (
        <div className="mb-4 rounded-xl bg-white/90 px-4 py-2 text-[13px] text-black/70 dark:bg-white/10 dark:text-white/70">
          No tracks found for {subgenreLabel}. Showing top tracks for{" "}
          {genreLabel}.
        </div>
      ) : null}

      {error ? (
        <div className="mb-4 rounded-xl bg-white/90 px-4 py-3 text-[13px] text-black/70 dark:bg-white/10 dark:text-white/70">
          Spotify fejl: {error}
        </div>
      ) : null}

      {tracks.length ? (
        <TrackPlayer tracks={tracks} />
      ) : !error ? (
        <div className="rounded-xl bg-white/90 px-4 py-3 text-[13px] text-black/70 dark:bg-white/10 dark:text-white/70">
          No tracks found for this search yet.
        </div>
      ) : null}
    </main>
  );
}
