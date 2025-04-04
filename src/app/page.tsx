// src/page.tsx
'use client';
import Link from 'next/link';
import { useState } from 'react';

export default function Home() {
  const [inviteCode, setInviteCode] = useState('');

  return (
    <main className="container text-center" style={{ padding: '50px' }}>
      <h1>Welcome to Tic Tac Toe</h1>
      <p>Seleziona una modalità di gioco:</p>
      
      {/* Modalità Locale */}
      <Link href="/game">
        <button className="btn btn-primary">Gioca in locale</button>
      </Link>
      
      {/* Modalità Online */}
      <div className="mt-3">
        <h2>Gioca Online</h2>
        <p>Inserisci un codice invito o creane uno nuovo:</p>
        <input
          type="text"
          placeholder="Codice invito"
          value={inviteCode}
          onChange={(e) => setInviteCode(e.target.value)}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        <Link href={inviteCode ? `/game/online/${inviteCode}` : '#'}>
          <button className="btn btn-success" disabled={!inviteCode}>Unisciti</button>
        </Link>
      </div>

      <style jsx>{`
        main {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background-color: #f0f0f0;
        }
        h1, h2 {
          font-family: Arial, sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
          margin-bottom: 20px;
        }
        p {
          font-size: 1.2rem;
          margin-bottom: 20px;
        }
        .btn {
          padding: 10px 20px;
          margin: 5px;
        }
      `}</style>
    </main>
  );
}
