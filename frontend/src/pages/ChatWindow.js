import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import io from 'socket.io-client';
import '../styles/ChatWindow.css';

const ChatWindow = ({ conversation, user, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!conversation) return;

    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    fetchMessages();

    newSocket.on('receive_message', (data) => {
      if (data.conversationId === conversation._id) {
        setMessages(prev => [...prev, data]);
      }
    });

    newSocket.on('message_deleted', (messageId) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, deleted: true, text: 'تم حذف الرسالة' } : msg
      ));
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

      await axios.post(
        'http://localhost:5000/api/messages',
        messageData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      socket.emit('send_message', messageData);
      setMessages(prev => [...prev, messageData]);
      setMessageText('');
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file || !socket) return;

    setUploadingFile(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(
        'http://localhost:5000/api/messages/upload',
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );

      const messageData = {
        senderId: user.id,
        conversationId: conversation._id,
        text: file.name,
        fileUrl: response.data.fileUrl,
        fileType: response.data.fileType,
        status: 'sent'
      };

      await axios.post(
        'http://localhost:5000/api/messages',
        messageData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      socket.emit('send_message', messageData);
      setMessages(prev => [...prev, messageData]);
    } catch (err) {
      console.error('Error uploading file:', err);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleDeleteMessage = async (messageId) => {
    try {
      await axios.delete(
        `http://localhost:5000/api/messages/${messageId}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      socket.emit('message_deleted', messageId);
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, deleted: true, text: 'تم حذف الرسالة' } : msg
      ));
    } catch (err) {
      console.error('Error deleting message:', err);
    }
  };

  const handleEditMessage = async (messageId) => {
    if (!editText.trim()) return;

    try {
      const response = await axios.put(
        `http://localhost:5000/api/messages/${messageId}`,
        { text: editText },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? response.data : msg
      ));
      setEditingId(null);
      setEditText('');
    } catch (err) {
      console.error('Error editing message:', err);
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
              onMouseEnter={(e) => e.currentTarget.querySelector('.msg-actions')?.classList.add('show')}
              onMouseLeave={(e) => e.currentTarget.querySelector('.msg-actions')?.classList.remove('show')}
            >
              <div className="message-content">
                {editingId === msg._id ? (
                  <div className="edit-mode">
                    <input
                      type="text"
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="edit-input"
                    />
                    <div className="edit-buttons">
                      <button onClick={() => handleEditMessage(msg._id)}>✅</button>
                      <button onClick={() => setEditingId(null)}>❌</button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className={msg.deleted ? 'deleted' : ''}>{msg.text}</p>
                    {msg.fileUrl && (
                      <div className="message-file">
                        {msg.fileType?.includes('image') && <img src={msg.fileUrl} alt="" />}
                        {msg.fileType?.includes('video') && <video src={msg.fileUrl} controls />}
                        {msg.fileType?.includes('audio') && <audio src={msg.fileUrl} controls />}
                        {msg.fileType?.includes('document') && (
                          <a href={msg.fileUrl} target="_blank" rel="noopener noreferrer" className="file-link">
                            📄 {msg.text}
                          </a>
                        )}
                      </div>
                    )}
                    {msg.edited && <small className="edited-label">✏️ تم تعديله</small>}
                  </>
                )}
              </div>
              <span className="message-time">{new Date(msg.createdAt).toLocaleTimeString('ar-EG')}</span>
              {msg.senderId === user.id && <span className="message-status">✅</span>}
              
              {msg.senderId === user.id && !msg.deleted && (
                <div className="msg-actions">
                  <button 
                    className="action-btn edit-btn"
                    onClick={() => {
                      setEditingId(msg._id);
                      setEditText(msg.text);
                    }}
                  >
                    ✏️
                  </button>
                  <button 
                    className="action-btn delete-btn"
                    onClick={() => handleDeleteMessage(msg._id)}
                  >
                    🗑️
                  </button>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="message-input-area">
        <form onSubmit={handleSendMessage}>
          <div className="input-wrapper">
            <button 
              type="button" 
              className="btn-attachment"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingFile}
            >
              📎
            </button>
            <input
              ref={fileInputRef}
              type="file"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
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
        {uploadingFile && <p className="uploading">⏳ جاري التحميل...</p>}
      </div>
    </div>
  );
};

export default ChatWindow;
