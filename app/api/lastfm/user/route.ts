import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  const cookieStore = await cookies();
  const user = cookieStore.get("lastfm_user")?.value;

  return NextResponse.json({ user: user ?? null });
}
