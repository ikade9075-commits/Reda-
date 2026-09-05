import React, { useState } from 'react';
import axios from 'axios';
import '../styles/Auth.css';

const Login = ({ onLoginSuccess }) => {
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({
    phone: '',
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const endpoint = isSignup ? '/api/auth/register' : '/api/auth/login';
      const response = await axios.post(
        `http://localhost:5000${endpoint}`,
        isSignup 
          ? formData 
          : { phone: formData.phone || formData.email, password: formData.password }
      );

      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
      onLoginSuccess(response.data.user);
    } catch (err) {
      setError(err.response?.data?.error || 'حدث خطأ ما');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1>📱 Reda</h1>
          <p>{isSignup ? 'إنشاء حساب جديد' : 'تسجيل الدخول'}</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <input
                type="text"
                name="firstName"
                placeholder="الاسم الأول"
                value={formData.firstName}
                onChange={handleChange}
                required={isSignup}
              />
              <input
                type="text"
                name="lastName"
                placeholder="الاسم الأخير"
                value={formData.lastName}
                onChange={handleChange}
              />
            </>
          )}

          <input
            type="tel"
            name="phone"
            placeholder="رقم الهاتف (اختياري)"
            value={formData.phone}
            onChange={handleChange}
          />

          <input
            type="email"
            name="email"
            placeholder="البريد الإلكتروني"
            value={formData.email}
            onChange={handleChange}
          />

          <input
            type="password"
            name="password"
            placeholder="كلمة المرور"
            value={formData.password}
            onChange={handleChange}
            required
          />

          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? '⏳ جاري...' : isSignup ? '✅ إنشاء حساب' : '🔑 دخول'}
          </button>
        </form>

        <div className="auth-toggle">
          <p>
            {isSignup ? 'عندك حساب بالفعل؟' : 'ليس عندك حساب؟'}
            <button
              type="button"
              onClick={() => {
                setIsSignup(!isSignup);
                setError('');
              }}
              className="btn-link"
            >
              {isSignup ? 'دخول' : 'إنشاء حساب'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
