# Ændringer, fejl og status

Dato: 2026-02-01

## Hvad var galt

- Subgenre-sider viste “No tracks found”, selvom Last.fm havde data.
- Årsagen var, at Last.fm svarede med feltet `tracks` i stedet for `toptracks`, og vores API læste kun `toptracks`.
- Alias-importen `@/app/...` pegede forkert pga. `tsconfig` alias (`@/*` → `app/*`), hvilket gav “Module not found”.
- En subgenre var stavet forkert: “Mouse” skulle være “House”.
- Spotify kunne ikke bruges til afspilning uden Premium, og preview gav ingen brugbare links.

## Hvad blev ændret

- Last.fm API: accepterer nu både `toptracks` og `tracks` i svaret.
- Tilføjede `autocorrect=1` og `User-Agent` for mere stabile tag-svar.
- Rettede `Mouse` → `House` i `app/data/genres.ts`.
- Opdaterede tag-map så `house` matches korrekt.
- Rettede import alias fra `@/app/...` til `@/data/...`.
- Tilføjede `/loved` side (Min liste) der henter Loved Tracks direkte fra Last.fm uden login.
- Lagde fallback cover-billeder i `public/covers/` og bruger dem når album-art mangler.
- Lavede YouTube-afspiller: `app/components/TrackPlayer.tsx`.
- Tilføjede YouTube‑map i `app/data/youtube-map.ts` med faste video‑ID’er.
- Subgenre- og loved-sider bruger nu TrackPlayer til videoafspilning.
- README: tilføjede “Terminal kommandoer”.
 - Valgte YouTube-embed til afspilning i stedet for Spotify.

## Hvad virker nu

- `GET /api/lastfm/tracks?tag=classic%20rock` returnerer en liste med tracks.
- Subgenre-sider viser nu tracks (fx Rock Hits → Classic Rock).
- Min liste (/loved) viser Loved Tracks uden login.

## YouTube-videoer (sådan gør man)

For at få en bestemt video på et track:

1) Find YouTube-linket til sangen.
2) Kopiér video-ID’et (det der står efter `v=` i URL’en).
3) Tilføj en linje i `app/data/youtube-map.ts` i formatet:

```ts
"tracknavn|artist": "VIDEO_ID"
```

Eksempel:

```ts
"paint it black|the rolling stones": "O4irXQhgMqg"
```

**Hvorfor en map?**
- man kan kun få metadata (info om sangen) fra Last.fm (ingen video-id).
- Mappen giver os en stabil, manuel kobling mellem “track + artist” og en bestemt YouTube‑video.

**Hvor peger den hen?**
- Mappen bliver brugt af `app/components/TrackPlayer.tsx`.
- Når der findes et ID, embedder:  
  `https://www.youtube.com/embed/<VIDEO_ID>`
- Hvis der ikke findes et ID, falder appen tilbage til YouTube‑søgning.

Hvis der ikke findes et ID, bruger appen automatisk YouTube-søgning.

## Noter / kendte ting

- Last.fm giver ikke lydfiler, kun metadata og billeder.
- Hvis der ses tom liste efter ændringer, ryd cache: `rm -rf .next` og start `npm run dev` igen.

## Login-sikkerhed (crypto)

- Jeg bruger `crypto.randomBytes` til at lave en tilfældig `state` i Spotify-login, og jeg tjekker den i `/api/auth/callback` før login godkendes.
- Det beskytter mod CSRF (Cross‑Site Request Forgery), hvor en anden side prøver at få min browser til at logge ind uden at jeg selv har startet det.
- Jeg bruger `crypto.createHash("md5")` i Last.fm callback til at signere `auth.getSession`, fordi Last.fm kræver en signatur.
- Det handler ikke om “for mange login‑forsøg”, men om at login‑flowet er sikkert og kan valideres.

## Proxy (login-gate)

- Jeg bruger `proxy.ts` (som Brian viste) til at køre kode før requesten er færdig.
- Her tjekker jeg cookie og sender til `/login`, hvis man ikke er logget ind.

## Kilder

- https://nodejs.org/api/crypto.html
- https://developer.spotify.com/documentation/web-api/tutorials/code-flow
- https://www.last.fm/api/webauth
- https://owasp.org/www-community/attacks/csrf

## Brian login vs. min opgave (login/proxy)

**Hvad er middleware (`middleware.ts`)?**
- En fil der kører **før** en request får svar fra serveren.
- Den kan læse cookies, stoppe adgang og lave redirects (fx hvis man ikke er logget ind).
- Det er derfor lærerens eksempel kan stoppe brugere, før siden overhovedet vises.

**Hvad Brian siger i videoen:**
- Brug en `middleware/proxy`‑fil til at tjekke cookies **før** siden returneres.
- Lav login‑flow der returnerer `success/error`.
- Redirect sker enten i action eller i middleware, hvis login er korrekt.

**Hvad jeg gør i stedet i min opgave:**
- Jeg har **ingen `middleware.ts`** der tjekker login eller redirecter.
- Login‑siden er **kun UI** (ingen brugernavn/adgangskode‑action).
- Login sker i stedet via **Last.fm OAuth** (`/api/lastfm/login` → callback → cookies).
- Redirects styres ikke via middleware, men via links/UI.

**Hvorfor min login‑side ikke “loggede ind”:**
- Der bliver ikke sendt data til en action/API, så der sættes **ingen cookie**.
- Uden cookie kan middleware ikke vide om man er logget ind (og der er ingen middleware her).
