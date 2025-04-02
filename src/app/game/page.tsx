// src/game/page.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';

export default function Game() {
  const [board, setBoard] = useState<string[]>(Array(9).fill(''));
  const [currentPlayer, setCurrentPlayer] = useState<string>('X');
  const [gameActive, setGameActive] = useState<boolean>(true);
  const [message, setMessage] = useState<string>(`Turno di: ${currentPlayer}`);

  const winningConditions: number[][] = [
    [0, 1, 2], [3, 4, 5], [6, 7, 8],
    [0, 3, 6], [1, 4, 7], [2, 5, 8],
    [0, 4, 8], [2, 4, 6]
  ];

  const handleCellClick = (index: number) => {
    if (board[index] !== '' || !gameActive) return;

    const newBoard = [...board];
    newBoard[index] = currentPlayer;
    setBoard(newBoard);

    if (checkResult(newBoard)) {
      setMessage(`Il giocatore ${currentPlayer} ha vinto!`);
      setGameActive(false);
    } else if (!newBoard.includes('')) {
      setMessage('Pareggio!');
      setGameActive(false);
    } else {
      const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      setMessage(`Turno di: ${nextPlayer}`);
    }
  };

  const checkResult = (board: string[]): boolean => {
    for (const condition of winningConditions) {
      const [a, b, c] = condition;
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return true;
      }
    }
    return false;
  };

  const resetGame = () => {
    setBoard(Array(9).fill(''));
    setGameActive(true);
    setCurrentPlayer('X');
    setMessage('Turno di: X');
  };

  return (
    <div className="container text-center">
      <h1 className="title">Tic Tac Toe</h1>
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
        <button className="btn btn-primary" onClick={resetGame}>
          Resetta Gioco
        </button>
        <h3 id="message" className="mt-3">{message}</h3>
      </div>
      <Link href="/" className="btn btn-secondary mt-4">Torna alla Home</Link>
      <style jsx>{`
        .title {
          margin-top: 40px;
          margin-bottom: 20px;
          font-family: Arial, sans-serif;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
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
        #message {
          margin-top: 20px;
          font-size: 1.3rem;
          font-family: Arial, sans-serif;
        }
      `}</style>
    </div>
  );
}
