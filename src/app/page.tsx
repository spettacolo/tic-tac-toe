// src/app/page.tsx
'use client';
import Link from 'next/link';

export default function Home() {
  return (
    <main className="container text-center" style={{ padding: '50px' }}>
      <h1>Benvenuto al Gioco del Tris</h1>
      <p>Premi il pulsante per iniziare a giocare.</p>
      <Link href="/game">
        Inizia il Gioco
      </Link>
      <style jsx>{`
        main {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f0f0f0;
        }
        h1 {
          font-family: Arial, sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 30px;
        }
        a {
          display: inline-block;
          padding: 10px 20px;
          background-color: #0070f3;
          color: #fff;
          text-decoration: none;
          border-radius: 4px;
          transition: background-color 0.2s ease;
        }
        a:hover {
          background-color: #005bb5;
        }
      `}</style>
    </main>
  );
}
