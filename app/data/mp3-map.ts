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
  "fortunate son|creedence clearwater revival":
    "/music/Creedence Clearwater Revival - Fortunate Son.mp3",
  "jaguar tornado|viva vertigo": "/music/Viva Vertigo - Jaguar Tornado.mp3",
};

export const DEFAULT_MP3_PATH =
  "/music/Amos Ever Hadani - Blues for Leo.mp3";
  // "/music/Creedence Clearwater Revival - Fortunate Son.mp3";
  //  "/music/Viva Vertigo - Jaguar Tornado.mp3";

export const getMp3Path = (track?: TrackLookup) => {
  if (!track) return undefined;
  return mp3ByTrack[buildKey(track)];
};
