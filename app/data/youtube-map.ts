type TrackLookup = {
  name: string;
  artist: string;
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

const buildKey = (track: TrackLookup) =>
  `${normalize(track.name)}|${normalize(track.artist)}`;

const youtubeIdByTrack: Record<string, string> = {
  "fortunate son|creedence clearwater revival": "ZWijx_AgPiA",
  "paint it black|the rolling stones": "O4irXQhgMqg",
  "sympathy for the devil|the rolling stones": "GgnClrx8N2k",
  "all along the watchtower|jimi hendrix": "TLV4_xaYynY",
  "carry on wayward son|kansas": "WZU516GI3Ac",
};

export const getYoutubeId = (track?: TrackLookup) => {
  if (!track) return undefined;
  return youtubeIdByTrack[buildKey(track)];
};
