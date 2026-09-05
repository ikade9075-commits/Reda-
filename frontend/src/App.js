import React, { useState, useEffect } from 'react';
import Login from './pages/Login';
import ChatList from './pages/ChatList';
import ChatWindow from './pages/ChatWindow';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setSelectedChat(null);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.setAttribute('data-theme', isDarkMode ? 'light' : 'dark');
  };

  if (!user) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className="app-container">
        {selectedChat ? (
          <>
            <ChatList
              user={user}
              onSelectChat={setSelectedChat}
              onLogout={handleLogout}
            />
            <ChatWindow
              conversation={selectedChat}
              user={user}
              onBack={() => setSelectedChat(null)}
            />
          </>
        ) : (
          <ChatList
            user={user}
            onSelectChat={setSelectedChat}
            onLogout={handleLogout}
          />
        )}
      </div>
      <button className="btn-dark-mode" onClick={toggleDarkMode}>
        {isDarkMode ? '☀️' : '🌙'}
      </button>
    </div>
  );
}

export default App;
