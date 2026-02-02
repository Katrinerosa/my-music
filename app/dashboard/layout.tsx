// app/layout.tsx

export const metadata = {
  title: "Mit Projekt",
  description: "Noget med musik og magi",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="da">
      <head>
        {/* HER  */}
        <meta
          httpEquiv="Content-Security-Policy"
          content="default-src 'self'; form-action 'self' https://www.last.fm"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}