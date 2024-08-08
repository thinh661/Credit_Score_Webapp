import React, { useState } from 'react';
import './style/style.css';
import logo from './f88-white-logo.svg';

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

  return (
    <div className="login-container1">
      <div className="header1">
        <img src={logo} alt="F88 Logo" className="logo1" />
        <div className="slogan-box1">Vay tiền ngay</div>
        <div className="separator1"></div>
      </div>
      <div className="login-content1">
        <h1 className="title1">Đăng Nhập</h1>
        <div className="form-group1">
          <label>Tên đăng nhập</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className="form-group1">
          <label>Mật khẩu</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button onClick={handleLogin} className="submit-button1">Đăng Nhập</button>
      </div>
    </div>
  );
}

export default Login;
