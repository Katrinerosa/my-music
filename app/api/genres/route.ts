import { NextResponse } from "next/server";
import { genres as localGenres } from "@/app/data/genres";

type DeezerGenre = {
  id: string;
  name: string;
  picture: string;
  picture_small: string;
  picture_medium: string;
  picture_big: string;
  picture_xl: string;
  type: string;
};

const normalize = (value: string) =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "");

const aliasToLocalName: Record<string, string> = {
  raphiphop: "Hip-Hop/Rap",
  kiassisk: "Classical",
  electro: "Electronic",
};

export async function GET() {
  try {
    const response = await fetch("https://api.deezer.com/genre", {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: "Failed to fetch Deezer genres" },
        { status: 502 }
      );
    }

    const payload = (await response.json()) as { data: DeezerGenre[] };
    const localOrder = localGenres.map((genre) => genre.name);
    const localByNormalized = new Map(
      localGenres.map((genre) => [normalize(genre.name), genre.name])
    );

    const matched = payload.data
      .map((genre) => {
        const normalized = normalize(genre.name);
        const localName =
          aliasToLocalName[normalized] ?? localByNormalized.get(normalized);

        if (!localName) return null;

        return {
          ...genre,
          localName,
        };
      })
      .filter((genre): genre is DeezerGenre & { localName: string } => !!genre)
      .sort(
        (a, b) =>
          localOrder.indexOf(a.localName) - localOrder.indexOf(b.localName)
      );

    return NextResponse.json({ data: matched });
  } catch {
    return NextResponse.json(
      { error: "Unexpected error while fetching Deezer genres" },
      { status: 500 }
    );
  }
}
