"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { getYoutubeId } from "@/data/youtube-map";

type Track = {
  name: string;
  duration?: number;
  artist: string;
  image?: string;
  url?: string;
};

const fallbackCovers = [
  "/covers/cover-1.svg",
  "/covers/cover-2.svg",
  "/covers/cover-3.svg",
];

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
};

const buildQuery = (track: Track | undefined) => {
  if (!track) return "";
  return [track.name, track.artist].filter(Boolean).join(" ");
};

export default function TrackPlayer({ tracks }: { tracks: Track[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const activeTrack = tracks[activeIndex] ?? tracks[0];
  const query = useMemo(() => buildQuery(activeTrack), [activeTrack]);
  const youtubeId = useMemo(() => getYoutubeId(activeTrack), [activeTrack]);
  const embedSrc = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}`
    : query
      ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
          query
        )}`
      : "";

  if (!tracks.length) return null;

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-white/90 p-3 shadow-sm dark:bg-white/10">
        <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-black/60 dark:text-white/70">
          {youtubeId
            ? "Afspil via YouTube (video-ID)"
            : "Afspil via YouTube (søgning)"}
        </div>
        <div className="aspect-video w-full overflow-hidden rounded-xl bg-black/10 dark:bg-white/5">
          {embedSrc ? (
            <iframe
              className="h-full w-full"
              src={embedSrc}
              title={`${activeTrack?.name ?? "Track"} player`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          ) : null}
        </div>
        {activeTrack ? (
          <div className="mt-3 text-[13px] text-black/60 dark:text-white/70">
            Spiller: {activeTrack.name} · {activeTrack.artist}
          </div>
        ) : null}
      </div>

      <div className="space-y-4">
        {tracks.map((track, index) => {
          const artSrc =
            track.image || fallbackCovers[index % fallbackCovers.length];
          const isActive = index === activeIndex;
          return (
            <button
              key={`${track.name}-${track.artist}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className={`flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left shadow-sm transition ${
                isActive
                  ? "bg-black text-white"
                  : "bg-white/90 text-[#341931] dark:bg-white/10 dark:text-white"
              }`}
              aria-pressed={isActive}
            >
              <div className="relative h-12 w-12 overflow-hidden rounded-lg">
                <Image
                  src={artSrc}
                  alt={`${track.name} cover`}
                  fill
                  sizes="48px"
                  className="object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="text-[14px] font-semibold">{track.name}</div>
                <div
                  className={`text-[12px] ${
                    isActive ? "text-white/70" : "text-black/60 dark:text-white/70"
                  }`}
                >
                  {track.artist}
                </div>
              </div>
              <div
                className={`text-[12px] ${
                  isActive ? "text-white/70" : "text-black/50 dark:text-white/60"
                }`}
              >
                {typeof track.duration === "number"
                  ? formatDuration(track.duration)
                  : "--:--"}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
