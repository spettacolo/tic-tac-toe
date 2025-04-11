'use client';

import { useEffect, useState, useRef } from 'react';
import Draggable from 'react-draggable';
import styles from './ChatPopup.module.css';

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
      <div className={styles.bubble} onClick={toggleChat}>
        {unreadCount > 0 && <div className={styles.badge}>{unreadCount}</div>}
        Chat
      </div>

      {/* Popup chat draggable */}
      {isOpen && (
        <Draggable nodeRef={nodeRef as React.RefObject<HTMLElement>} handle=".chat-drag-handle">
          <div ref={nodeRef} className={styles.chatWindow}>
            {/* Barra in alto da trascinare */}
            <div className={`${styles.chatHeader} chat-drag-handle`}>
              <strong>Chat</strong>
            </div>

            {/* Area messaggi */}
            <div className={styles.chatBody}>
              {messages.map((msg, idx) => (
                <div key={idx} style={{ margin: '5px 0' }}>
                  {msg}
                </div>
              ))}
            </div>

            {/* Input per scrivere */}
            <div className={styles.chatInputContainer}>
              <input
                type="text"
                placeholder="Scrivi un messaggio..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') sendMessage();
                }}
                className={styles.chatInput}
              />
              <button onClick={sendMessage} className={styles.chatSendButton}>
                Invia
              </button>
            </div>
          </div>
        </Draggable>
      )}
    </>
  );
}
