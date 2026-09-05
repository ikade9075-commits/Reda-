import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/ChatList.css';

const ChatList = ({ user, onSelectChat, onLogout }) => {
  const [conversations, setConversations] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewChat, setShowNewChat] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchConversations();
    fetchAllUsers();
  }, [user]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/conversations/user/${user.id}`,
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setConversations(response.data);
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAllUsers = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/users',
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setAllUsers(response.data.filter(u => u._id !== user.id));
    } catch (err) {
      console.error('Error fetching users:', err);
    }
  };

  const handleStartChat = async (userId) => {
    try {
      const response = await axios.post(
        'http://localhost:5000/api/conversations',
        {
          participants: [user.id, userId],
          isGroup: false
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setConversations(prev => [...prev, response.data]);
      setShowNewChat(false);
      onSelectChat(response.data);
    } catch (err) {
      console.error('Error creating conversation:', err);
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="chat-list-container">
      <div className="chat-list-header">
        <div className="user-info">
          <div className="user-avatar">👤</div>
          <div>
            <h2>{user.firstName} {user.lastName}</h2>
            <p className="status">🟢 متصل</p>
          </div>
        </div>
        <button className="btn-logout" onClick={onLogout}>🚪</button>
      </div>

      <div className="search-section">
        <input
          type="text"
          placeholder="🔍 ابحث عن محادثة..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <button className="btn-new-chat" onClick={() => setShowNewChat(!showNewChat)}>
          ➕ جديد
        </button>
      </div>

      {showNewChat && (
        <div className="new-chat-section">
          <h3>اختر جهة اتصال</h3>
          <div className="users-list">
            {allUsers.map(u => (
              <div key={u._id} className="user-item" onClick={() => handleStartChat(u._id)}>
                <div className="user-avatar-small">👤</div>
                <div className="user-details">
                  <h4>{u.firstName} {u.lastName}</h4>
                  <p>{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="conversations-list">
        {loading ? (
          <p className="loading">⏳ جاري التحميل...</p>
        ) : filteredConversations.length === 0 ? (
          <p className="empty">لا توجد محادثات بعد</p>
        ) : (
          filteredConversations.map(conv => (
            <div
              key={conv._id}
              className="conversation-item"
              onClick={() => onSelectChat(conv)}
            >
              <div className="conv-avatar">{conv.isGroup ? '👥' : '👤'}</div>
              <div className="conv-details">
                <h4>{conv.name || conv.participants[0]?.firstName}</h4>
                <p className="last-message">آخر رسالة...</p>
              </div>
              <span className="time">الآن</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ChatList;
