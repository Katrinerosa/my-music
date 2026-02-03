import Image from "next/image";
import Link from "next/link";
import TrackPlayer from "@/components/TrackPlayer";

type Track = {
  name: string;
  duration?: number;
  artist: string;
  image?: string;
  previewUrl?: string | null;
};

const LOCAL_PLAYLIST: Track[] = [
  { name: "Blues for Leo", artist: "Amos Ever Hadani" },
  { name: "Fortunate Son", artist: "Creedence Clearwater Revival" },
  { name: "Jaguar Tornado", artist: "Viva Vertigo" },
  { name: "Paint It Black", artist: "The Rolling Stones" },
  { name: "No Surprises", artist: "Radiohead" },
];

export default async function LovedTracksPage() {
  const tracks = LOCAL_PLAYLIST;

  return (
    <main className="mx-auto flex min-h-[1173px] w-full max-w-[600px] flex-col px-6 pb-10 pt-6">
      <div className="overflow-hidden rounded-[32px] bg-[#0E1120] text-white shadow-[0_24px_60px_-40px_rgba(0,0,0,0.7)]">
        <div className="relative bg-gradient-to-br from-[#FF2D7A] via-[#FF5A2F] to-[#FF9A2F] px-6 pb-10 pt-6">
          <div className="flex items-center justify-between text-white/80">
            <Link
              href="/"
              aria-label="Back"
              className="grid h-8 w-8 place-items-center text-white/80 transition hover:text-white"
            >
              ←
            </Link>
            <div className="text-[11px] font-semibold uppercase tracking-[0.32em]">
              Playlists
            </div>
            <button
              type="button"
              aria-label="Search"
              className="grid h-8 w-8 place-items-center text-white/80 transition hover:text-white"
            >
              🔍
            </button>
          </div>

          <div className="mt-7">
            <div className="text-[12px] font-semibold uppercase tracking-[0.24em] text-white/70">
              Min liste
            </div>
            <h1 className="mt-2 text-[32px] font-bold text-white">
              Playlists
            </h1>
          </div>

          <div className="pointer-events-none absolute right-0 top-0 h-[150px] w-[230px] opacity-90">
            <Image
              src="/sound-wave.svg"
              alt=""
              fill
              sizes="230px"
              className="object-contain"
            />
          </div>
        </div>

        <div className="px-5 pb-6 pt-4">
          <div className="mb-4 flex items-center justify-between text-[11px] font-semibold uppercase tracking-[0.24em] text-white/50">
            <span>Min liste</span>
            <span>{tracks.length} tracks</span>
          </div>

          {tracks.length ? (
            <TrackPlayer tracks={tracks} variant="playlist" />
          ) : (
            <div className="rounded-xl bg-white/10 px-4 py-3 text-[13px] text-white/70">
              Ingen tracks i din liste endnu.
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
