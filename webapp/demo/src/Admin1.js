import React, { useState } from 'react';
import './style/style_admin1.css';
import logo from './f88-white-logo.svg';

function LoanApplication() {
  const [formData, setFormData] = useState({
    name: '',
    CCCD: '',
    LOAN: '',
    VALUE: '',
    REASON: '',
    JOB: '',
    YOJ: ''
  });

  const [showMessage, setShowMessage] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);

    setShowMessage(true);
  };

  const closeMessage = () => {
    setShowMessage(false);
  };

  return (
    <div className="overlay-container">
      <div className="logo">
        <img src={logo} alt="F88 Logo" />
      </div>

      <div className="slogan-box">
        Vay tiền ngay
      </div>

      <div className="separator"></div>

      <div className="container">
        <h1 className="title">Nhập Hồ Sơ Vay</h1>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Họ tên</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="CCCD">CCCD</label>
            <input
              type="text"
              id="CCCD"
              name="CCCD"
              value={formData.CCCD}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="LOAN">Khoản vay (LOAN)</label>
            <input
              type="text"
              id="LOAN"
              name="LOAN"
              value={formData.LOAN}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="VALUE">Giá trị tài sản thế chấp (VALUE)</label>
            <input
              type="text"
              id="VALUE"
              name="VALUE"
              value={formData.VALUE}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="REASON">Lý do vay (REASON)</label>
            <input
              type="text"
              id="REASON"
              name="REASON"
              value={formData.REASON}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="JOB">Nghề nghiệp (JOB)</label>
            <input
              type="text"
              id="JOB"
              name="JOB"
              value={formData.JOB}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="YOJ">Số năm công tác (YOJ)</label>
            <input
              type="text"
              id="YOJ"
              name="YOJ"
              value={formData.YOJ}
              onChange={handleChange}
              required
            />
          </div>
          <button type="submit" className="submit-button">Lưu Hồ Sơ</button>
        </form>

        {/* Hộp thoại thông báo */}
        {showMessage && (
          <div className="message-box">
            <span className="close-btn" onClick={closeMessage}>&times;</span>
            <p className="message-title"></p>
            <p>Hồ sơ vay đã được lưu trên hệ thống!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default LoanApplication;
