# Ændringer, fejl og status

Dato: 2026-02-01

## Hvad var galt

- Subgenre-sider viste “No tracks found”, selvom Last.fm havde data.
- Årsagen var, at Last.fm svarede med feltet `tracks` i stedet for `toptracks`, og vores API læste kun `toptracks`.
- Alias-importen `@/app/...` pegede forkert pga. `tsconfig` alias (`@/*` → `app/*`), hvilket gav “Module not found”.
- En subgenre var stavet forkert: “Mouse” skulle være “House”.

## Hvad blev ændret

- Last.fm API: accepterer nu både `toptracks` og `tracks` i svaret.
- Tilføjede `autocorrect=1` og `User-Agent` for mere stabile tag-svar.
- Rettede `Mouse` → `House` i `app/data/genres.ts`.
- Opdaterede tag-map så `house` matches korrekt.
- Rettede import alias fra `@/app/...` til `@/data/...`.
- Tilføjede `/loved` side (Min liste) der henter Loved Tracks direkte fra Last.fm uden login.
- Lagde fallback cover-billeder i `public/covers/` og bruger dem når album-art mangler.
- README: tilføjede “Terminal kommandoer”.

## Hvad virker nu

- `GET /api/lastfm/tracks?tag=classic%20rock` returnerer en liste med tracks.
- Subgenre-sider viser nu tracks (fx Rock Hits → Classic Rock).
- Min liste (/loved) viser Loved Tracks uden login.

## Noter / kendte ting

- Last.fm giver ikke lydfiler, kun metadata og billeder.
- Hvis der ses tom liste efter ændringer, ryd cache: `rm -rf .next` og start `npm run dev` igen.
