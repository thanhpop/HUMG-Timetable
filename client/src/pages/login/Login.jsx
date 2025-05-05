// src/pages/Login.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import './Login.css';
import logo from './Pic/logoHumg.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    // Khi mount Login: reset body class rồi thêm login-bg
    document.body.className = 'login-bg';
    return () => {
      // Khi unmount Login: xoá class để không ảnh hưởng page khác
      document.body.className = '';
    };
  }, []);


  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:3001/auth/login', {
        username, password
      });
      // grab the user out of the response
      const user = res.data.user;
      const { vaitro } = user;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('vaitro', vaitro);

      // route based on the actual role
      if (vaitro === 'admin') {
        navigate('/admin');
      } else if (vaitro === 'gv') {
        navigate('/teacher');
      } else {
        navigate('/student');
      }
    } catch (err) {
      setError(
        err.response?.data?.error === 'Sai username hoặc mật khẩu'
          ? 'Sai username hoặc mật khẩu'
          : 'Đăng nhập thất bại'
      );
    }
  };

  return (
    <div className="login-container">
      <div className="header">
        <img src={logo} alt="Logo" className="logo" />
        <h2>Đăng Nhập</h2>
      </div>
      <form onSubmit={handleSubmit}>
        {error && <div className="error-message">{error}</div>}
        <div className="input-group">
          <label>Tên truy cập:</label>
          <input
            type="text" value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label>Mật khẩu:</label>
          <div style={{ position: 'relative' }}>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
            <span
              className="toggle-password"
              onClick={() => setShowPassword(s => !s)}
            >
              {showPassword ? <FaEyeSlash /> : <FaEye />}
            </span>
          </div>
        </div>
        <button type="submit">Đăng nhập</button>
      </form>
    </div>
  );
}
