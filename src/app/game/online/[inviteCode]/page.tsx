// src/game/online/[inviteCode]/page.tsx
'use client';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import io from 'socket.io-client';
import Chat from '../../../components/Chat';

let socket: any;

export default function OnlineGame() {
  const params = useParams() as { inviteCode: string };
  const { inviteCode } = params;
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState<string>('X');
  const [gameActive, setGameActive] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('In attesa di un avversario...');

  useEffect(() => {
    // Connetti al server Socket.io (usa l'URL impostato in .env.local oppure localhost)
    socket = io(process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001');

    // Unisci la room in base al codice invito
    socket.emit('joinGame', { inviteCode });

    // Ricevi gli aggiornamenti di gioco dal server
    socket.on('updateGame', (data: { board: string[]; currentPlayer: string; gameActive: boolean; message: string }) => {
      setBoard(data.board);
      setCurrentPlayer(data.currentPlayer);
      setGameActive(data.gameActive);
      setMessage(data.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [inviteCode]);

  const handleCellClick = (index: number) => {
    if (!gameActive || board[index] !== '') return;
    socket.emit('makeMove', { index, player: currentPlayer, inviteCode });
  };

  const resetGame = () => {
    socket.emit('resetGame', { inviteCode });
  };

  return (
    <div className="container text-center">
      <h1>Modalità Online - Codice: {inviteCode}</h1>
      <div className="row mx-auto" style={{ maxWidth: '360px' }}>
        {board.map((cell, index) => (
          <div
            key={index}
            className="col-4 p-0 cell"
            onClick={() => handleCellClick(index)}
          >
            {cell}
          </div>
        ))}
      </div>
      <div className="mt-4">
        <button className="btn btn-primary" onClick={resetGame}>Resetta Gioco</button>
        <h3 id="message" className="mt-3">{message}</h3>
      </div>
      <Chat socket={socket} inviteCode={inviteCode} />
      <style jsx>{`
        .cell {
          height: 120px;
          border: 3px solid #333;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2.5rem;
          font-weight: bold;
          cursor: pointer;
          background-color: #fff;
        }
        .cell:hover {
          background-color: #eee;
        }
      `}</style>
    </div>
  );
}
