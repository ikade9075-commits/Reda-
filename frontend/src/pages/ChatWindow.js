import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../styles/ChatWindow.css';

const ChatWindow = ({ conversation, user, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (!conversation) return;

    // Connect socket
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    // Fetch messages
    fetchMessages();

    // Socket events
    newSocket.on('receive_message', (data) => {
      if (data.conversationId === conversation._id) {
        setMessages(prev => [...prev, data]);
      }
    });

    return () => newSocket.close();
  }, [conversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchMessages = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/messages/conversation/${conversation._id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setMessages(response.data);
    } catch (err) {
      console.error('Error fetching messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !socket) return;

    try {
      const messageData = {
        senderId: user.id,
        conversationId: conversation._id,
        text: messageText,
        status: 'sent'
      };

      // Save to DB
      await axios.post(
        'http://localhost:5000/api/messages',
        messageData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      // Emit via socket
      socket.emit('send_message', messageData);
      setMessages(prev => [...prev, messageData]);
      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const getOtherUser = () => {
    if (conversation.isGroup) return conversation;
    return conversation.participants?.find(p => p._id !== user.id);
  };

  const otherUser = getOtherUser();

  return (
    <div className="chat-window-container">
      <div className="chat-header">
        <button className="btn-back" onClick={onBack}>←</button>
        <div className="chat-info">
          <h2>{conversation.name || otherUser?.firstName}</h2>
          <p className="status">🟢 متصل الآن</p>
        </div>
        <div className="chat-actions">
          <button className="btn-icon">☎️</button>
          <button className="btn-icon">📹</button>
          <button className="btn-icon">⋯</button>
        </div>
      </div>

      <div className="messages-area">
        {loading ? (
          <div className="loading">⏳ جاري التحميل...</div>
        ) : messages.length === 0 ? (
          <div className="empty-state">
            <p>لا توجد رسائل بعد</p>
            <small>ابدأ المحادثة الآن! 👋</small>
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={idx}
              className={`message ${msg.senderId === user.id ? 'sent' : 'received'}`}
            >
              <div className="message-content">
                <p>{msg.text}</p>
                {msg.fileUrl && (
                  <div className="message-file">
                    {msg.fileType?.includes('image') && <img src={msg.fileUrl} alt="" />}
                    {msg.fileType?.includes('video') && <video src={msg.fileUrl} />}
                  </div>
                )}
              </div>
              <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString('ar-EG')}</span>
              {msg.senderId === user.id && <span className="message-status">✅</span>}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-area">
        <form onSubmit={handleSendMessage}>
          <div className="input-wrapper">
            <button type="button" className="btn-attachment">📎</button>
            <input
              type="text"
              placeholder="اكتب رسالة..."
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="message-input"
            />
            <button type="button" className="btn-emoji">😊</button>
          </div>
          <button type="submit" className="btn-send" disabled={!messageText.trim()}>
            📤
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow;
