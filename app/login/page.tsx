import Link from "next/link";
import LastfmStatus from "./status";

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[1173px] w-full max-w-[600px] flex-col bg-[#FF1168] px-8 pb-10 pt-12 text-white">
      <div className="mb-10">
        <Link
          href="/"
          aria-label="Back"
          className="mb-6 inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/30 text-white/90"
        >
          ←
        </Link>
        <h1 className="text-[32px] font-bold">Log In</h1>
        <LastfmStatus />
      </div>

      <div className="space-y-8">
        <label className="block">
          <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-white/80">
            Username
          </div>
          <div className="flex items-center gap-3 border-b border-white/60 pb-3">
            <input
              type="text"
              placeholder="Enter your username"
              className="w-full bg-transparent text-[15px] font-medium text-white placeholder:text-white/70 focus:outline-none"
            />
            <span className="text-white/90">👤</span>
          </div>
        </label>

        <label className="block">
          <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-white/80">
            Password
          </div>
          <div className="flex items-center gap-3 border-b border-white/60 pb-3">
            <input
              type="password"
              placeholder="Enter your password"
              className="w-full bg-transparent text-[15px] font-medium text-white placeholder:text-white/70 focus:outline-none"
            />
            <span className="text-white/90">🔑</span>
          </div>
        </label>
      </div>

      <button
        type="button"
        className="mt-10 rounded-full border border-white/80 py-3 text-[14px] font-bold uppercase tracking-[0.2em]"
      >
        Log In
      </button>

      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-white/15">
          <span className="text-[22px]">🫆</span>
        </div>
        <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/80">
          One-Touch Login
        </div>
      </div>

      <Link
        href="/api/lastfm/auth"
        className="mt-10 inline-flex items-center justify-center text-[12px] font-semibold uppercase tracking-[0.2em] text-white/80"
      >
        Connect Last.fm
      </Link>

      <Link
        href="/api/spotify/auth"
        className="mt-4 inline-flex items-center justify-center text-[12px] font-semibold uppercase tracking-[0.2em] text-white/80"
      >
        Connect Spotify
      </Link>
    </main>
  );
}
