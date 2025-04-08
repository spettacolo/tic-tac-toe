// server.js
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config({ path: './.env.local' });

const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, 'users.json');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*' }
});

const PORT = process.env.PORT || 3001;

// Stato dei giochi per ogni codice invito (in memoria)
const games = {};

// Condizioni vincenti per il Tris
const winningConditions = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

let users = [];

function register(req, res) {
  const { username, password } = req.body;
  // Logica per registrare l'utente nel database
  // Implementiamo la registrazione in tutto e per tutto senza simulazioni, salvando i dati in un file JSON
  if (!username || !password) {
    return res.status(400).json({ message: 'Username e password sono obbligatori.' });
  }
  if (users.some(user => user.username === username)) {
    return res.status(409).json({ message: 'Username già esistente.' });
  }
  // Aggiungi l'utente all'array users
  users.push({ username, password });
  // Salva l'array users nel file JSON
  fs.writeFileSync(filePath, JSON.stringify(users, null, 2), 'utf8', (err) => {
    if (err) {
      console.error('Errore durante il salvataggio degli utenti:', err);
      return res.status(500).json({ message: 'Errore durante il salvataggio degli utenti.' });
    }
  });
  // Invia una risposta di successo
  res.status(200).json({ message: 'Registrazione avvenuta con successo!' });
}

function login(req, res) {
  const { username, password } = req.body;
  // Logica per il login dell'utente
  // Controlla se l'utente esiste e se la password è corretta
  const user = users.find(user => user.username === username && user.password === password);
  if (!user) {
    return res.status(401).json({ message: 'Username o password errati.' });
  }
  // Invia una risposta di successo
  res.status(200).json({ message: 'Login avvenuto con successo!' });
}

function checkResult(board) {
  for (const condition of winningConditions) {
    const [a, b, c] = condition;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return true;
    }
  }
  return false;
}

io.on('connection', (socket) => {
  console.log('Utente connesso:', socket.id);

  socket.on('joinGame', ({ inviteCode }) => {
    console.log(`Socket ${socket.id} entra nella stanza ${inviteCode}`);
    socket.join(inviteCode);

    if (!games[inviteCode]) {
      games[inviteCode] = {
        board: Array(9).fill(''),
        currentPlayer: 'X',
        gameActive: false, // In attesa del secondo giocatore
        message: 'In attesa di un avversario...',
        players: [],
        playerSymbols: {} // Mappa socket.id -> simbolo ('X' o 'O')
      };
    }
    const game = games[inviteCode];

    // Aggiungi il giocatore solo se la stanza non ha già 2 giocatori
    if (!game.players.includes(socket.id) && game.players.length < 2) {
      game.players.push(socket.id);
      // Assegna il simbolo in base all'ordine di ingresso
      if (game.players.length === 1) {
        game.playerSymbols[socket.id] = 'X';
      } else if (game.players.length === 2) {
        game.playerSymbols[socket.id] = 'O';
      }
    } else if (!game.playerSymbols[socket.id]) {
      // Se più di 2 utenti si uniscono, li considera come spettatori
      game.playerSymbols[socket.id] = 'S'; // 'S' per spectator
    }

    // Avvia il gioco solo se ci sono almeno 2 giocatori
    if (game.players.length >= 2) {
      game.gameActive = true;
      game.message = `Turno di: ${game.currentPlayer}`;
    }
    io.to(inviteCode).emit('updateGame', game);
  });

  socket.on('makeMove', ({ index, inviteCode }) => {
    const game = games[inviteCode];
    if (!game || !game.gameActive) return;

    // Verifica che il socket che invia la mossa abbia il turno
    const playerSymbol = game.playerSymbols[socket.id];
    if (playerSymbol !== game.currentPlayer) return;
    if (game.board[index] !== '') return;

    game.board[index] = playerSymbol;
    if (checkResult(game.board)) {
      game.message = `Il giocatore ${playerSymbol} ha vinto!`;
      game.gameActive = false;
    } else if (!game.board.includes('')) {
      game.message = 'Pareggio!';
      game.gameActive = false;
    } else {
      // Passa il turno all'altro giocatore
      game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
      game.message = `Turno di: ${game.currentPlayer}`;
    }
    io.to(inviteCode).emit('updateGame', game);
  });

  socket.on('resetGame', ({ inviteCode }) => {
    const game = games[inviteCode];
    if (!game) return;
    // Consenti il reset solo se la partita è terminata
    // e solo al giocatore con il simbolo "X" (host)
    if (game.gameActive) return;
    if (game.playerSymbols[socket.id] !== 'X') return;
    
    game.board = Array(9).fill('');
    game.currentPlayer = 'X';
    game.gameActive = game.players.length >= 2;
    game.message = game.gameActive ? 'Turno di: X' : 'In attesa di un avversario...';
    io.to(inviteCode).emit('updateGame', game);
  });

  socket.on('chatMessage', ({ inviteCode, message }) => {
    io.to(inviteCode).emit('chatMessage', message);
  });

  socket.on('disconnect', () => {
    console.log('Utente disconnesso:', socket.id);
    for (const inviteCode in games) {
      const game = games[inviteCode];
      const index = game.players.indexOf(socket.id);
      if (index !== -1) {
        game.players.splice(index, 1);
        delete game.playerSymbols[socket.id];
        game.gameActive = false;
        game.message = 'In attesa di un avversario...';
        io.to(inviteCode).emit('updateGame', game);
      }
    }
  });
});

server.listen(PORT, () => {
  console.log(`Server in esecuzione sulla porta ${PORT}`);
});
