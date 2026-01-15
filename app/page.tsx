"use client";

import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import Link from "next/link";
import ThemeToggle from "./components/ThemeToggle";
import { genres } from "./data/genres";

type ApiGenre = {
  id: string;
  name: string;
  localName: string;
  picture_medium: string;
};

const GradientMaskIcon = ({
  src,
  size = 20,
}: {
  src: string;
  size?: number;
}) => (
  <span
    aria-hidden="true"
    className="inline-block"
    style={{
      width: `${size}px`,
      height: `${size}px`,
      backgroundImage: "linear-gradient(90deg, #EE0979 0%, #FF6A00 100%)",
      maskImage: `url(${src})`,
      WebkitMaskImage: `url(${src})`,
      maskSize: "contain",
      WebkitMaskSize: "contain",
      maskRepeat: "no-repeat",
      WebkitMaskRepeat: "no-repeat",
      maskPosition: "center",
      WebkitMaskPosition: "center",
    }}
  />
);

const toSlug = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export default function Home() {
  const [openGenre, setOpenGenre] = useState<string | null>(null);
  const [orderedGenres, setOrderedGenres] = useState(genres);
  const [genreImages, setGenreImages] = useState<
    Record<string, string | undefined>
  >({});

  useEffect(() => {
    const loadGenres = async () => {
      try {
        const response = await fetch("/api/genres");
        if (!response.ok) {
          return;
        }
        const payload = (await response.json()) as { data: ApiGenre[] };
        const order = payload.data.map((item) => item.localName);
        if (!order.length) {
          return;
        }
        const imageMap: Record<string, string> = {};
        payload.data.forEach((item) => {
          if (item.picture_medium) {
            imageMap[item.localName] = item.picture_medium;
          }
        });
        setGenreImages(imageMap);
        const orderMap = new Map(order.map((name, index) => [name, index]));
        const nextGenres = [...genres].sort((a, b) => {
          const aIndex = orderMap.get(a.name);
          const bIndex = orderMap.get(b.name);
          if (aIndex === undefined && bIndex === undefined) return 0;
          if (aIndex === undefined) return 1;
          if (bIndex === undefined) return -1;
          return aIndex - bIndex;
        });
        setOrderedGenres(nextGenres);
      } catch {
        // Keep local order if the API is unavailable.
      }
    };

    loadGenres();
  }, []);

  return (
    <main className="mx-auto flex min-h-[1173px] w-full max-w-[600px] flex-col px-6 pb-10 pt-6">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          aria-label="Back"
          className="grid h-8 w-8 place-items-center text-black/70 transition hover:text-black dark:text-white/80 dark:hover:text-white"
        >
          ←
        </button>
        <div className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/70 dark:text-white/70">
          Categories
        </div>
        <button
          type="button"
          aria-label="Search"
          className="grid h-8 w-8 place-items-center text-black/70 transition hover:text-black dark:text-white/80 dark:hover:text-white"
        >
          🔍
        </button>
      </div>

      <div className="mb-[45px] flex items-center justify-between">
        <h1 className="bg-gradient-to-r from-[#EE0979] to-[#FF6A00] bg-clip-text text-[36px] font-bold text-transparent">
          Categories
        </h1>
      </div>

      <div className="space-y-4">
        {orderedGenres.map((genre) => (
          <div
            key={genre.name}
            className={`
              rounded-xl text-[20px] font-bold text-white
              bg-[var(--genre-bg)]
              dark:bg-[var(--genre-bg-dark)]
            `}
            style={
              {
                "--genre-bg": genre.colors.light,
                "--genre-bg-dark": genre.colors.dark,
              } as CSSProperties
            }
          >
            <button
              type="button"
              onClick={() =>
                setOpenGenre((current) =>
                  current === genre.name ? null : genre.name
                )
              }
              className="flex h-[55px] w-full items-center justify-between rounded-xl px-4"
              aria-expanded={openGenre === genre.name}
              aria-controls={`subgenres-${genre.name}`}
            >
              <span>{genre.name}</span>
              <span className="text-white/80">•••</span>
            </button>
            {genre.subgenres?.length && openGenre === genre.name ? (
              <div
                id={`subgenres-${genre.name}`}
                className="mt-2 space-y-1 rounded-lg bg-white/90 px-3 py-2 text-[15px] font-medium text-black dark:bg-black/40 dark:text-white"
                style={
                  genreImages[genre.name]
                    ? {
                        backgroundImage: `linear-gradient(rgba(255,255,255,0.9), rgba(255,255,255,0.9)), url(${genreImages[genre.name]})`,
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                      }
                    : undefined
                }
              >
                {genre.subgenres.map((subgenre) => (
                  <Link
                    key={subgenre}
                    href={`/genre/${toSlug(genre.name)}/${toSlug(subgenre)}`}
                    className="flex items-center justify-between"
                  >
                    <span>{subgenre}</span>
                    <span className="opacity-70">›</span>
                  </Link>
                ))}
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="fixed bottom-0 left-1/2 w-full max-w-[600px] -translate-x-1/2 px-4 pb-4">
        <div className="flex h-[65px] items-center justify-between bg-white px-6 text-[#341931] shadow-[0_-8px_15px_-8px_rgba(0,0,0,0.25),0_-4px_6px_-4px_rgba(0,0,0,0.12)] backdrop-blur dark:bg-[#111625] dark:text-white">
          <button
            type="button"
            aria-label="Browse"
            className="text-[#341931]/70 transition hover:text-[#341931] dark:text-white/70 dark:hover:text-white"
          >
            <GradientMaskIcon src="/puls.svg" />
          </button>
          <button
            type="button"
            aria-label="Favorites"
            className="text-[#341931]/70 transition hover:text-[#341931] dark:text-white/70 dark:hover:text-white"
          >
            <GradientMaskIcon src="/microphone.svg" />
          </button>
          <button
            type="button"
            aria-label="Now Playing"
            className="grid h-9 w-9 place-items-center rounded-full border border-[#FF2E7A] text-[#FF2E7A]"
          >
            <GradientMaskIcon src="/startknap.svg" />
          </button>
          <ThemeToggle />
          <button
            type="button"
            aria-label="Profile"
            className="text-[#341931]/70 transition hover:text-[#341931] dark:text-white/70 dark:hover:text-white"
          >
            <GradientMaskIcon src="/settings.svg" />
          </button>
        </div>
      </div>
    </main>
  );
}
