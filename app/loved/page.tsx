import Link from "next/link";
import { headers } from "next/headers";
import TrackPlayer from "@/components/TrackPlayer";

type Track = {
  name: string;
  duration?: number;
  artist: string;
  image?: string;
};

const PUBLIC_LASTFM_USER = "Katrinerosa";

const fetchLovedTracks = async (user: string) => {
  const headerList = await headers();
  const host = headerList.get("host") ?? "localhost:3000";
  const protocol =
    headerList.get("x-forwarded-proto") ??
    (host.startsWith("localhost") ? "http" : "https");
  const baseUrl = `${protocol}://${host}`;
  const response = await fetch(
    `${baseUrl}/api/lastfm/loved-tracks?user=${encodeURIComponent(user)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return { tracks: [] as Track[], error: "Failed to fetch tracks" };
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

export default async function LovedTracksPage() {
  const { tracks, error } = await fetchLovedTracks(PUBLIC_LASTFM_USER);

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
          Katrinerosa
        </div>
        <h1 className="bg-gradient-to-r from-[#EE0979] to-[#FF6A00] bg-clip-text text-[32px] font-bold text-transparent">
          Min liste
        </h1>
      </div>

      <div className="mb-4 rounded-xl bg-white/90 px-4 py-2 text-[12px] text-black/70 dark:bg-white/10 dark:text-white/70">
        Viser Loved tracks direkte fra Last.fm uden login.
      </div>

      {error ? (
        <div className="mb-4 rounded-xl bg-white/90 px-4 py-3 text-[13px] text-black/70 dark:bg-white/10 dark:text-white/70">
          Kunne ikke hente tracks lige nu.
        </div>
      ) : null}

      {tracks.length ? (
        <TrackPlayer tracks={tracks} />
      ) : !error ? (
        <div className="rounded-xl bg-white/90 px-4 py-3 text-[13px] text-black/70 dark:bg-white/10 dark:text-white/70">
          Ingen tracks i din liste endnu.
        </div>
      ) : null}
    </main>
  );
}
