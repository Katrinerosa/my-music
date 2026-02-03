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

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const buildKey = (track: Track) =>
  `${normalize(track.name)}|${normalize(track.artist)}`;

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

export default function TrackPlayer({
  tracks,
  variant = "default",
}: {
  tracks: Track[];
  variant?: "default" | "playlist";
}) {
  const isPlaylist = variant === "playlist";
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [lovedKeys, setLovedKeys] = useState<string[]>([]);
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
    const raw =
      typeof window !== "undefined"
        ? window.localStorage.getItem("ipm_loved_tracks")
        : null;
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setLovedKeys(parsed.filter((item) => typeof item === "string"));
      }
    } catch {
      // Ignore invalid localStorage data.
    }
  }, []);

  const updateLovedKeys = (next: string[]) => {
    setLovedKeys(next);
    if (typeof window !== "undefined") {
      window.localStorage.setItem("ipm_loved_tracks", JSON.stringify(next));
    }
  };

  const toggleLoved = (track: Track) => {
    const key = buildKey(track);
    const nextSet = new Set(lovedKeys);
    if (nextSet.has(key)) {
      nextSet.delete(key);
    } else {
      nextSet.add(key);
    }
    updateLovedKeys(Array.from(nextSet));
  };

  const lovedSet = useMemo(() => new Set(lovedKeys), [lovedKeys]);
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

  // Jeg vælger en tilfældig track, men aldrig den der allerede spiller.
  const pickRandomIndex = () => {
    if (tracks.length <= 1) return activeIndex;
    let nextIndex = activeIndex;
    while (nextIndex === activeIndex) {
      nextIndex = Math.floor(Math.random() * tracks.length);
    }
    return nextIndex;
  };

  // Jeg bruger Shuffle til at hoppe til den nye tilfældige track og starte afspilning.
  const handleShuffle = async () => {
    const nextIndex = pickRandomIndex();
    if (nextIndex === activeIndex) return;
    await handleSelect(nextIndex);
  };

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

  const handleListenAll = async () => {
    if (isPlaying) {
      await togglePlay();
      return;
    }
    await handleSelect(0);
  };

  return (
    <section className="space-y-4">
      {isPlaylist ? null : (
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
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="rounded-full border border-black/20 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-black/70 transition hover:border-black/50 hover:text-black dark:border-white/30 dark:text-white/70 dark:hover:border-white/70 dark:hover:text-white"
                  aria-label="Shuffle track"
                >
                  Shuffle
                </button>
                <div className="text-[13px] text-black/60 dark:text-white/70">
                  Klar til: {activeTrack?.name} · {activeTrack?.artist}
                </div>
              </div>
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
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="rounded-full border border-black/20 px-4 py-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-black/70 transition hover:border-black/50 hover:text-black dark:border-white/30 dark:text-white/70 dark:hover:border-white/70 dark:hover:text-white"
                  aria-label="Shuffle track"
                >
                  Shuffle
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
      )}

      <div className={isPlaylist ? "space-y-2" : "space-y-4"}>
        {tracks.map((track, index) => {
          const artSrc =
            track.image || fallbackCovers[index % fallbackCovers.length];
          const isActive = index === activeIndex;
          const isLoved = lovedSet.has(buildKey(track));
          const indexLabel = String(index + 1).padStart(2, "0");
          return isPlaylist ? (
            <div
              key={`${track.name}-${track.artist}-${index}`}
              onClick={() => handleSelect(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleSelect(index);
                }
              }}
              role="button"
              tabIndex={0}
              className={`flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition ${
                isActive ? "bg-white/15" : "bg-white/5 hover:bg-white/10"
              }`}
              aria-pressed={isActive}
            >
              <span className="grid h-9 w-9 place-items-center rounded-full bg-white/10 text-[11px] font-semibold text-white/70">
                {indexLabel}
              </span>
              <div className="flex-1">
                <div className="flex items-center gap-2 text-[13px] font-semibold text-white">
                  <span>{track.name}</span>
                  {isActive ? (
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-gradient-to-r from-[#FF2D7A] to-[#FF9A2F]" />
                  ) : null}
                </div>
                <div className="text-[11px] text-white/55">
                  {track.artist}
                </div>
              </div>
              <div className="text-[11px] text-white/45">
                {typeof track.duration === "number"
                  ? formatDuration(track.duration)
                  : "--:--"}
              </div>
            </div>
          ) : (
            <div
              key={`${track.name}-${track.artist}-${index}`}
              onClick={() => handleSelect(index)}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  handleSelect(index);
                }
              }}
              role="button"
              tabIndex={0}
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
                    isActive
                      ? "text-white/70"
                      : "text-black/60 dark:text-white/70"
                  }`}
                >
                  {track.artist}
                </div>
              </div>
              <div className="flex items-center gap-3">
                {/* Jeg bruger stjernen til at gemme/afgemme tracket lokalt. */}
                {/* Jeg holder stjernen lille og diskret med dæmpede farver. */}
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    toggleLoved(track);
                  }}
                  className={`text-[16px] transition ${
                    isActive
                      ? "text-white/80"
                      : "text-black/60 dark:text-white/70"
                  }`}
                  aria-label={
                    isLoved ? "Fjern fra Most loved" : "Tilføj til Most loved"
                  }
                  aria-pressed={isLoved}
                >
                  {isLoved ? "★" : "☆"}
                </button>
                <div
                  className={`text-[12px] ${
                    isActive
                      ? "text-white/70"
                      : "text-black/50 dark:text-white/60"
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
            </div>
          );
        })}
      </div>

      {isPlaylist ? (
        <button
          type="button"
          onClick={handleListenAll}
          className="mt-2 w-full rounded-full border border-[#FF2D7A]/70 px-4 py-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-white/90 transition hover:border-[#FF9A2F] hover:text-white"
        >
          {isPlaying ? "Pause" : "Listen all"}
        </button>
      ) : null}

      <audio
        ref={audioRef}
        onEnded={() => setIsPlaying(false)}
        className="hidden"
      />
    </section>
  );
}
