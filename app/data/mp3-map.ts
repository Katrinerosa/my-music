type TrackLookup = {
  name: string;
  artist: string;
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const buildKey = (track: TrackLookup) =>
  `${normalize(track.name)}|${normalize(track.artist)}`;

const mp3ByTrack: Record<string, string> = {
  "blues for leo|amos ever hadani": "/music/Amos Ever Hadani - Blues for Leo.mp3",
};

export const DEFAULT_MP3_PATH =
  "/music/Amos Ever Hadani - Blues for Leo.mp3";

export const getMp3Path = (track?: TrackLookup) => {
  if (!track) return undefined;
  return mp3ByTrack[buildKey(track)];
};
