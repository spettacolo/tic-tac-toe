import './globals.css';

export const metadata = {
  title: 'Tic Tac Toe con Next.js e TypeScript',
  description: 'Gioco del Tris sviluppato con Next.js e TypeScript',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <head>
        <link
          rel="stylesheet"
          href="https://stackpath.bootstrapcdn.com/bootstrap/4.5.2/css/bootstrap.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
