import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/Groups.css';

const Groups = ({ user, onSelectChat }) => {
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [selectedMembers, setSelectedMembers] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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

  const toggleMember = (userId) => {
    setSelectedMembers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleCreateGroup = async (e) => {
    e.preventDefault();
    if (!groupName.trim() || selectedMembers.length < 2) {
      alert('أدخل اسم الجروب واختر على الأقل عضويين');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(
        'http://localhost:5000/api/conversations',
        {
          name: groupName,
          isGroup: true,
          participants: [user.id, ...selectedMembers],
          groupAdmin: user.id
        },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );

      onSelectChat(response.data);
      setShowCreateGroup(false);
      setGroupName('');
      setSelectedMembers([]);
    } catch (err) {
      console.error('Error creating group:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="groups-container">
      <div className="groups-header">
        <h3>👥 إنشاء جروب</h3>
        <button className="btn-close" onClick={() => setShowCreateGroup(false)}>✕</button>
      </div>

      {showCreateGroup && (
        <form onSubmit={handleCreateGroup} className="group-form">
          <input
            type="text"
            placeholder="اسم الجروب"
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            className="group-input"
          />

          <div className="members-selector">
            <p className="members-label">اختر الأعضاء ({selectedMembers.length}):</p>
            <div className="members-list">
              {allUsers.map(u => (
                <label key={u._id} className="member-checkbox">
                  <input
                    type="checkbox"
                    checked={selectedMembers.includes(u._id)}
                    onChange={() => toggleMember(u._id)}
                  />
                  <span className="member-name">{u.firstName} {u.lastName}</span>
                </label>
              ))}
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-create-group">
            {loading ? '⏳ جاري الإنشاء...' : '✅ إنشاء الجروب'}
          </button>
        </form>
      )}

      {!showCreateGroup && (
        <button className="btn-new-group" onClick={() => setShowCreateGroup(true)}>
          + جروب جديد
        </button>
      )}
    </div>
  );
};

export default Groups;
