import React, { useState } from 'react';
import './style/style.css';
import logo from './logo/login-logo.svg';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = () => {
    if ((username === 'admin1' || username === 'admin2') && password === '123') {
      onLogin(username);
    } else {
      alert('Tên đăng nhập hoặc mật khẩu không đúng');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-container">
      <form className="login-card" onSubmit={handleSubmit}>
        <img src={logo} alt="Login Logo" className="login-logo" />
        <h2 className="login-title">Đăng Nhập Hệ Thống</h2>
        <div className="form-group">
          <label htmlFor="username">Tên đăng nhập <span style={{ color: 'red' }}>*</span></label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Mật khẩu <span style={{ color: 'red' }}>*</span></label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit" className="login-button">Đăng Nhập</button>
      </form>
    </div>
  );
}

export default Login;
