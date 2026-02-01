export type FallbackTrack = {
  name: string;
  artist: string;
  duration?: number;
  image?: string;
};

const fallbackTracksBySubgenre: Record<string, FallbackTrack[]> = {
  "acoustic-blues": [
    {
      name: "Walking Blues",
      artist: "Robert Johnson",
      duration: 170,
    },
    {
      name: "Statesboro Blues",
      artist: "Blind Willie McTell",
      duration: 195,
    },
    {
      name: "Kind Hearted Woman Blues",
      artist: "Robert Johnson",
      duration: 165,
    },
  ],
};

const fallbackTracksByGenre: Record<string, FallbackTrack[]> = {
  "rock-hits": [
    { name: "Back in Black", artist: "AC/DC", duration: 255 },
    { name: "Smells Like Teen Spirit", artist: "Nirvana", duration: 301 },
    { name: "Hotel California", artist: "Eagles", duration: 390 },
  ],
  blues: [
    { name: "The Thrill Is Gone", artist: "B.B. King", duration: 316 },
    { name: "Hoochie Coochie Man", artist: "Muddy Waters", duration: 170 },
    { name: "Cross Road Blues", artist: "Robert Johnson", duration: 149 },
  ],
  classical: [
    { name: "Canon in D", artist: "Pachelbel", duration: 360 },
    { name: "Eine Kleine Nachtmusik", artist: "Mozart", duration: 320 },
    { name: "The Four Seasons: Spring", artist: "Vivaldi", duration: 550 },
  ],
  country: [
    { name: "Ring of Fire", artist: "Johnny Cash", duration: 175 },
    { name: "Jolene", artist: "Dolly Parton", duration: 165 },
    { name: "Country Roads", artist: "John Denver", duration: 200 },
  ],
  dance: [
    { name: "One More Time", artist: "Daft Punk", duration: 320 },
    { name: "Sandstorm", artist: "Darude", duration: 225 },
    { name: "Insomnia", artist: "Faithless", duration: 520 },
  ],
  electronic: [
    { name: "Windowlicker", artist: "Aphex Twin", duration: 375 },
    { name: "Midnight City", artist: "M83", duration: 270 },
    { name: "Strobe", artist: "deadmau5", duration: 630 },
  ],
  "fitness-workout": [
    { name: "Stronger", artist: "Kanye West", duration: 312 },
    { name: "Titanium", artist: "David Guetta", duration: 245 },
    { name: "Eye of the Tiger", artist: "Survivor", duration: 245 },
  ],
  "hip-hop-rap": [
    { name: "N.Y. State of Mind", artist: "Nas", duration: 276 },
    { name: "Lose Yourself", artist: "Eminem", duration: 326 },
    { name: "HUMBLE.", artist: "Kendrick Lamar", duration: 177 },
  ],
  industrial: [
    { name: "Head Like a Hole", artist: "Nine Inch Nails", duration: 270 },
    { name: "Du Hast", artist: "Rammstein", duration: 256 },
    { name: "Dragula", artist: "Rob Zombie", duration: 212 },
  ],
};

export const getFallbackTracks = (rawGenre: string, rawSubgenre: string) =>
  fallbackTracksBySubgenre[rawSubgenre] ??
  fallbackTracksByGenre[rawGenre] ??
  [];
