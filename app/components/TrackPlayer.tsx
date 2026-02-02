"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { DEFAULT_MP3_PATH, getMp3Path } from "@/data/mp3-map";
import { getYoutubeId } from "@/data/youtube-map";

type Track = {
  name: string;
  duration?: number;
  artist: string;
  image?: string;
  url?: string;
  previewUrl?: string | null;
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

export default function TrackPlayer({ tracks }: { tracks: Track[] }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeTrack = tracks[activeIndex] ?? tracks[0];
  const mp3Path = useMemo(() => getMp3Path(activeTrack), [activeTrack]);
  const query = useMemo(
    () =>
      activeTrack ? [activeTrack.name, activeTrack.artist].join(" ") : "",
    [activeTrack]
  );
  const youtubeId = useMemo(() => getYoutubeId(activeTrack), [activeTrack]);
  const audioSrc =
    mp3Path ?? activeTrack?.previewUrl ?? DEFAULT_MP3_PATH ?? null;
  const embedSrc = youtubeId
    ? `https://www.youtube.com/embed/${youtubeId}`
    : query
      ? `https://www.youtube.com/embed?listType=search&list=${encodeURIComponent(
          query
        )}`
      : "";
  const hasAudio = Boolean(audioSrc);
  const audioLabel = mp3Path
    ? "Lokal MP3"
    : activeTrack?.previewUrl
      ? "Spotify preview (30 sek.)"
      : "Lokal MP3 (fallback)";
  const autoplaySrc = embedSrc
    ? embedSrc.includes("?")
      ? `${embedSrc}&autoplay=1`
      : `${embedSrc}?autoplay=1`
    : "";

  if (!tracks.length) return null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.pause();
    setIsPlaying(false);
    if (audioSrc) {
      audio.src = audioSrc;
      audio.load();
    } else {
      audio.removeAttribute("src");
      audio.load();
    }
  }, [audioSrc]);

  useEffect(() => {
    setIsVideoPlaying(false);
  }, [activeTrack?.name, activeTrack?.artist]);

  const handleSelect = async (index: number) => {
    setActiveIndex(index);
    const track = tracks[index];
    const audio = audioRef.current;
    const nextMp3Path = getMp3Path(track);
    const nextAudioSrc =
      nextMp3Path ?? track?.previewUrl ?? DEFAULT_MP3_PATH ?? null;
    if (!audio || !nextAudioSrc) {
      setIsPlaying(false);
      setIsVideoPlaying(Boolean(track));
      return;
    }
    if (audio.src !== nextAudioSrc) {
      audio.src = nextAudioSrc;
    }
    try {
      await audio.play();
      setIsPlaying(true);
      setIsVideoPlaying(false);
    } catch {
      setIsPlaying(false);
    }
  };

  const togglePlay = async () => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    if (audio.src !== audioSrc) {
      audio.src = audioSrc;
    }
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  const toggleVideo = () => {
    setIsVideoPlaying((current) => !current);
  };

  return (
    <section className="space-y-4">
      <div className="rounded-2xl bg-white/90 p-3 shadow-sm dark:bg-white/10">
        {hasAudio ? (
          <>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-black/60 dark:text-white/70">
              {audioLabel}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={togglePlay}
                className="rounded-full bg-black px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition"
              >
                {isPlaying ? "Pause" : "Play"}
              </button>
              <div className="text-[13px] text-black/60 dark:text-white/70">
                Klar til: {activeTrack?.name} · {activeTrack?.artist}
              </div>
            </div>
            <audio
              ref={audioRef}
              onEnded={() => setIsPlaying(false)}
              className="hidden"
            />
          </>
        ) : (
          <>
            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-black/60 dark:text-white/70">
              {youtubeId
                ? "Afspil via YouTube (video-ID)"
                : "Afspil via YouTube (søgning)"}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={toggleVideo}
                className="rounded-full bg-black px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white transition"
              >
                {isVideoPlaying ? "Stop video" : "Play video"}
              </button>
              <div className="text-[13px] text-black/60 dark:text-white/70">
                {activeTrack
                  ? `Video for: ${activeTrack.name} · ${activeTrack.artist}`
                  : "Ingen video"}
              </div>
            </div>
            <div className="mt-3 aspect-video w-full overflow-hidden rounded-xl bg-black/10 dark:bg-white/5">
              {isVideoPlaying && autoplaySrc ? (
                <iframe
                  className="h-full w-full"
                  src={autoplaySrc}
                  title={`${activeTrack?.name ?? "Track"} player`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              ) : null}
            </div>
          </>
        )}
      </div>

      <div className="space-y-4">
        {tracks.map((track, index) => {
          const artSrc =
            track.image || fallbackCovers[index % fallbackCovers.length];
          const isActive = index === activeIndex;
          return (
            <button
              key={`${track.name}-${track.artist}-${index}`}
              type="button"
              onClick={() => handleSelect(index)}
              className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left shadow-sm transition ${
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
            <div className="flex items-center gap-3">
              <div
                className={`text-[12px] ${
                  isActive ? "text-white/70" : "text-black/50 dark:text-white/60"
                }`}
              >
                {typeof track.duration === "number"
                  ? formatDuration(track.duration)
                  : "--:--"}
              </div>
              <span
                className={`grid h-8 w-8 place-items-center rounded-full border text-[12px] font-semibold transition ${
                  isActive
                    ? "border-white/40 text-white"
                    : "border-black/10 text-black/60 group-hover:border-black/40 group-hover:text-black dark:border-white/15 dark:text-white/60 dark:group-hover:border-white/50 dark:group-hover:text-white"
                }`}
              >
                ▶
              </span>
            </div>
          </button>
        );
      })}
      </div>
    </section>
  );
}
