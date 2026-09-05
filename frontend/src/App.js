import React, { useState, useEffect } from 'react';
import io from 'socket.io-client';
import './App.css';

function App() {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');

  useEffect(() => {
    // Connect to backend
    const newSocket = io('http://localhost:5000');

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Connected to server');
    });

    newSocket.on('receive_message', (data) => {
      setMessages(prev => [...prev, data]);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('❌ Disconnected from server');
    });

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  const sendMessage = (e) => {
    e.preventDefault();
    if (input.trim() && socket) {
      socket.emit('send_message', {
        text: input,
        senderId: 'user1',
        timestamp: new Date()
      });
      setInput('');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>📱 Reda</h1>
        <p>{isConnected ? '🟢 متصل' : '🔴 غير متصل'}</p>
      </header>

      <main className="messages-container">
        {messages.length === 0 ? (
          <p>لا توجد رسائل</p>
        ) : (
          messages.map((msg, idx) => (
            <div key={idx} className="message">
              <strong>{msg.senderId}:</strong> {msg.text}
            </div>
          ))
        )}
      </main>

      <footer className="input-container">
        <form onSubmit={sendMessage}>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="اكتب رسالة..."
            disabled={!isConnected}
          />
          <button type="submit" disabled={!isConnected}>
            إرسال
          </button>
        </form>
      </footer>
    </div>
  );
}

export default App;
