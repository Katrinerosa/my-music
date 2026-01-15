import Image from "next/image";
import Link from "next/link";
import { genres as localGenres } from "@/app/data/genres";

type Track = {
  id: number;
  title: string;
  duration: number;
  artist: {
    name: string;
  };
  album: {
    cover_small: string;
  };
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const fetchTracks = async (query: string) => {
  const response = await fetch(
    `https://api.deezer.com/search?q=${encodeURIComponent(query)}`,
    { cache: "no-store" }
  );

  if (!response.ok) {
    return [] as Track[];
  }

  const payload = (await response.json()) as { data: Track[] };
  return payload.data ?? [];
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
  const tracks = await fetchTracks(`${genreLabel} ${subgenreLabel}`);

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

      <div className="space-y-4">
        {tracks.map((track) => (
          <div
            key={track.id}
            className="flex items-center gap-3 rounded-xl bg-white/90 px-3 py-2 text-[#341931] shadow-sm dark:bg-white/10 dark:text-white"
          >
            <div className="relative h-12 w-12 overflow-hidden rounded-lg">
              <Image
                src={track.album.cover_small}
                alt={`${track.title} cover`}
                fill
                sizes="48px"
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <div className="text-[14px] font-semibold">{track.title}</div>
              <div className="text-[12px] text-black/60 dark:text-white/70">
                {track.artist?.name ?? "Unknown artist"}
              </div>
            </div>
            <div className="text-[12px] text-black/50 dark:text-white/60">
              {formatDuration(track.duration)}
            </div>
          </div>
        ))}
        {!tracks.length ? (
          <div className="rounded-xl bg-white/90 px-4 py-3 text-[13px] text-black/70 dark:bg-white/10 dark:text-white/70">
            No tracks found for this subgenre yet.
          </div>
        ) : null}
      </div>
    </main>
  );
}
