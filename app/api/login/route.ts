import { NextResponse } from "next/server";

const SESSION_SECONDS = 30 * 60;

const isValidLogin = (username: string, password: string) => {
  const normalizedUser = username.trim().toLowerCase();
  const normalizedPass = password.trim().toLowerCase();
  return normalizedUser === "admin" && normalizedPass === "jensen";
};

const acceptsJson = (request: Request) =>
  request.headers.get("accept")?.includes("application/json");

const resolveRedirectPath = (value: string | null) => {
  if (!value || !value.startsWith("/")) return "/";
  return value;
};

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const from = resolveRedirectPath(String(formData.get("from") ?? "/"));

  if (!isValidLogin(username, password)) {
    if (acceptsJson(request)) {
      return NextResponse.json(
        { success: false, error: "Forkert brugernavn eller adgangskode." },
        { status: 401 },
      );
    }

    const redirectUrl = new URL("/login", request.url);
    redirectUrl.searchParams.set("error", "1");
    redirectUrl.searchParams.set("from", from);
    return NextResponse.redirect(redirectUrl.toString());
  }

  const response = acceptsJson(request)
    ? NextResponse.json({ success: true, redirectTo: from })
    : NextResponse.redirect(new URL(from, request.url).toString());

  response.cookies.set("ipm_access", username, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "lax",
    maxAge: SESSION_SECONDS,
  });

  return response;
}
