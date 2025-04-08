'use client';

import { useEffect, useState, useRef } from 'react';
import Draggable from 'react-draggable';

type ChatPopupProps = {
  socket: any;
  inviteCode: string;
};

export default function ChatPopup({ socket, inviteCode }: ChatPopupProps) {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  // Crea un ref per l'elemento draggabile
  const nodeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!socket) return;

    // Ascolta gli eventi chat dal server
    socket.on('chatMessage', (msg: string) => {
      setMessages((prev) => [...prev, msg]);
      // Se la finestra è chiusa, incrementa il badge dei messaggi non letti
      if (!isOpen) {
        setUnreadCount((prevCount) => prevCount + 1);
      }
    });

    return () => {
      socket.off('chatMessage');
    };
  }, [socket, isOpen]);

  // Invio messaggio
  const sendMessage = () => {
    if (input.trim() === '') return;
    socket.emit('chatMessage', { inviteCode, message: input });
    setInput('');
  };

  // Toggle finestra chat
  const toggleChat = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      // Se la stiamo aprendo, azzera i messaggi non letti
      setUnreadCount(0);
    }
  };

  return (
    <>
      {/* Icona "bubble" */}
      <div
        style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          width: '50px',
          height: '50px',
          backgroundColor: '#007BFF',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          cursor: 'pointer',
          zIndex: 9999,
        }}
        onClick={toggleChat}
      >
        {/* Badge dei messaggi non letti */}
        {unreadCount > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '-5px',
              right: '-5px',
              backgroundColor: 'red',
              borderRadius: '50%',
              color: 'white',
              padding: '3px 6px',
              fontSize: '12px',
            }}
          >
            {unreadCount}
          </div>
        )}
        <span>Chat</span>
      </div>

      {/* Popup chat draggable */}
      {isOpen && (
        <Draggable nodeRef={nodeRef as React.RefObject<HTMLElement>} handle=".chat-drag-handle">
          <div
            ref={nodeRef}
            style={{
              position: 'fixed',
              bottom: '100px',
              right: '20px',
              width: '300px',
              height: '400px',
              backgroundColor: '#fff',
              border: '1px solid #ccc',
              borderRadius: '8px',
              display: 'flex',
              flexDirection: 'column',
              zIndex: 10000,
            }}
          >
            {/* Barra in alto da trascinare */}
            <div
              className="chat-drag-handle"
              style={{
                backgroundColor: '#007BFF',
                color: '#fff',
                padding: '10px',
                cursor: 'move',
                borderTopLeftRadius: '8px',
                borderTopRightRadius: '8px',
              }}
            >
              <strong>Chat</strong>
            </div>

            {/* Area messaggi */}
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '10px',
              }}
            >
              {messages.map((msg, idx) => (
                <div key={idx} style={{ margin: '5px 0' }}>
                  {msg}
                </div>
              ))}
            </div>

            {/* Input per scrivere */}
            <div style={{ display: 'flex', padding: '10px' }}>
              <input
                type="text"
                placeholder="Scrivi un messaggio..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
                style={{
                  flex: 1,
                  padding: '5px',
                  marginRight: '5px',
                }}
              />
              <button onClick={sendMessage}>Invia</button>
            </div>
          </div>
        </Draggable>
      )}
    </>
  );
}
