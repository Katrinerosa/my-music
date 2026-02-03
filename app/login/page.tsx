import Link from "next/link";
import LastfmStatus from "./status";

export default async function LoginPage({
  searchParams,
}: {
  searchParams?:
    | { error?: string; from?: string }
    | Promise<{ error?: string; from?: string }>;
}) {
  const resolvedParams = await Promise.resolve(searchParams);
  const showError = Boolean(resolvedParams?.error);
  const from = resolvedParams?.from ?? "/";

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

      {showError ? (
        <div className="mb-6 rounded-xl border border-white/30 bg-white/10 px-4 py-3 text-[13px] text-white/90">
          Forkert brugernavn eller adgangskode.
        </div>
      ) : null}

      <form method="post" action="/api/login" className="space-y-8">
        <input type="hidden" name="from" value={from} />
        <label className="block">
          <div className="mb-2 text-[13px] font-semibold uppercase tracking-[0.18em] text-white/80">
            Username
          </div>
          <div className="flex items-center gap-3 border-b border-white/60 pb-3">
            <input
              type="text"
              name="username"
              placeholder="Enter your username"
              required
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
              name="password"
              placeholder="Enter your password"
              required
              className="w-full bg-transparent text-[15px] font-medium text-white placeholder:text-white/70 focus:outline-none"
            />
            <span className="text-white/90">🔑</span>
          </div>
        </label>

        <button
          type="submit"
          className="mt-12 rounded-full border border-white/80 py-2 text-[14px] font-bold uppercase tracking-[0.2em]"
        >
          Log In
        </button>
      </form>

      <div className="mt-10 flex flex-col items-center gap-3 text-center">
        <div className="grid h-14 w-14 place-items-center rounded-full bg-white/15">
          <span className="text-[22px]">🫆</span>
        </div>
        <div className="text-[13px] font-semibold uppercase tracking-[0.18em] text-white/80">
          One-Touch Login
        </div>
      </div>

      <a
        href="/api/lastfm/login"
        className="mt-10 inline-flex items-center justify-center text-[12px] font-semibold uppercase tracking-[0.2em] text-white/80"
      >
        Connect Last.fm
      </a>

      <a
        href="/api/auth"
        className="mt-4 inline-flex items-center justify-center text-[12px] font-semibold uppercase tracking-[0.2em] text-white/80"
      >
        Connect Spotify
      </a>
    </main>
  );
}
