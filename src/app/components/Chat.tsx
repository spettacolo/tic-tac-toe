// src/components/Chat.tsx
'use client';
import { useEffect, useState } from 'react';

type ChatProps = {
  socket: any;
  inviteCode: string;
};

export default function Chat({ socket, inviteCode }: ChatProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState<string>('');

  useEffect(() => {
    if (!socket) return;

    socket.on('chatMessage', (msg: string) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => {
      socket.off('chatMessage');
    };
  }, [socket]);

  const sendMessage = () => {
    if (input.trim() === '') return;
    socket.emit('chatMessage', { inviteCode, message: input });
    setInput('');
  };

  return (
    <div className="chat-container mt-4">
      <h4>Chat in tempo reale</h4>
      <div className="chat-box" style={{ height: '200px', overflowY: 'scroll', border: '1px solid #ccc', padding: '10px' }}>
        {messages.map((msg, i) => (
          <div key={i} className="chat-message">{msg}</div>
        ))}
      </div>
      <div className="mt-2">
        <input
          type="text"
          placeholder="Scrivi un messaggio..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
          style={{ width: '80%', padding: '5px' }}
        />
        <button onClick={sendMessage} style={{ padding: '5px 10px', marginLeft: '5px' }}>Invia</button>
      </div>
    </div>
  );
}
