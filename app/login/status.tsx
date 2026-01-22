"use client";

import { useEffect, useState } from "react";

export default function LastfmStatus() {
  const [user, setUser] = useState<string | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetch("/api/lastfm/user");
        if (!response.ok) return;
        const payload = (await response.json()) as { user: string | null };
        setUser(payload.user);
      } catch {
        // Ignore user lookup failures.
      }
    };

    loadUser();
  }, []);

  if (!user) return null;

  return (
    <div className="mt-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-white/80">
      Logged in as {user}
    </div>
  );
}
