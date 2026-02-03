This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
ls → se filer
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

## Udvikling (dev server)

man skal kun køre `npm run dev` en gang!! pr. arbejdssession. Når den kører:

- hold terminalen åben
- lav aendringer i filer (farver, routes, komponenter)
- siden opdaterer automatisk (hot reload) eller ved en normal refresh

Hvis man får fejlen `EADDRINUSE: address already in use` på port 3000, betyder det at dev-serveren allerede kører:

```bash
lsof -i :3000
```

Stop den proces der bruger porten (eller genbrug den åbne fane paa http://localhost:3000).

## Seneste ændringer (kort)

- Last.fm tag API virker nu (læser både `toptracks` og `tracks`).
- `@/data/...` import fix (ingen `@/app/...` alias-fejl).
- “Mouse” → “House” i subgenre + tag-map.
- Ny side: `/loved` (Min liste fra Last.fm uden login).
- YouTube‑afspiller + `youtube-map` til faste video‑ID’er.
- Fallback cover‑billeder i `public/covers/`.

## Login og sikkerhed (crypto)

- I Spotify‑login laver jeg en tilfældig `state` med `crypto.randomBytes(16)`.
- Den sendes med til Spotify, og jeg tjekker at den matcher i `/api/auth/callback` før login godkendes.
- Det beskytter mod CSRF (Cross‑Site Request Forgery), hvor en anden side prøver at få min browser til at logge ind uden at jeg selv har startet det.
- I Last.fm callback laver jeg en MD5‑signatur med `crypto.createHash("md5")`, fordi Last.fm kræver en signeret `auth.getSession` request.
- Det handler ikke om “for mange login‑forsøg”, men om at login‑flowet er sikkert og kan valideres.

## Proxy (login-gate)

- Jeg bruger `proxy.ts` (som Brian viste) til at køre kode før requesten er færdig.
- Her tjekker jeg cookie og sender til `/login`, hvis man ikke er logget ind.

## OAuth (meget tydeligt)

- Spotify‑login er **OAuth 2.0 Authorization Code Flow** (redirect → code + state → token‑exchange i `/api/auth/callback`).
- Last.fm bruger deres WebAuth + signeret `auth.getSession` (MD5), ikke OAuth 2.0.
- Flowet er: redirect til udbyderen → brugeren accepterer → callback → vi får tokens → gemmer i cookies → redirect tilbage til appen.
- Det er derfor login ikke er et almindeligt brugernavn/kodeord i appen, men en OAuth‑godkendelse.

## Kilder

- https://nodejs.org/api/crypto.html
- https://developer.spotify.com/documentation/web-api/tutorials/code-flow
- https://www.last.fm/api/webauth
- https://owasp.org/www-community/attacks/csrf

## Terminal kommandoer

- `ls` → se filer
- `cd` → skift mappe
- `npm run dev` → kør projektet
- `rm -rf .next` → ryd lock og cache

Hvis port 3000 er optaget:

```bash
lsof -i :3000
kill <PID>
rm -f .next/dev/lock
```

`kill <PID>` → Find PID og kør kommandoen.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
