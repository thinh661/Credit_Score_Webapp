import React, { useState } from 'react';
import axios from 'axios';
import './style/style.css';
import logo from './f88-white-logo.svg';

function CreditScorePrediction() {
  const [formData, setFormData] = useState({
    LOAN: '',
    MORTDUE: '',
    VALUE: '',
    REASON: 'Other reason', 
    JOB: 'Other', 
    YOJ: '',
    DEROG: '',
    DELINQ: '',
    CLAGE: '',
    NINQ: '',
    CLNO: '',
    DEBTINC: ''
  });

  const [result, setResult] = useState(null);
  const [message, setMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Submitting form data:', formData); 
  
    const formDataToSend = { ...formData };
  
    Object.keys(formDataToSend).forEach((key) => {
      if (formDataToSend[key] === '') {
        formDataToSend[key] = null;
      }
    });
  
    try {
      const response = await axios.post('http://localhost:5000/predict', formDataToSend);
      console.log('API response:', response.data); 
      setResult(response.data.credit_score);
      setMessage('');
      setShowNotification(true); // Hiển thị thông báo khi dự đoán thành công
    } catch (error) {
      console.error('Error during API call:', error);
      setMessage('Có lỗi xảy ra khi dự đoán. Vui lòng thử lại.');
    }
  };

  const handleApproveLoan = () => {
    // Xử lý khi người dùng chọn Duyệt khoản vay
    alert('Bạn đã duyệt khoản vay!');
    setShowNotification(false); // Đóng box thông báo khi xử lý lựa chọn
  };

  const handleRejectLoan = () => {
    // Xử lý khi người dùng chọn Từ chối khoản vay
    alert('Bạn đã từ chối khoản vay.');
    setShowNotification(false); // Đóng box thông báo khi xử lý lựa chọn
  };

  const handleCloseNotification = () => {
    setShowNotification(false); // Đóng box thông báo khi click vào nút đóng (X)
  };

  return (
    <div className="overlay-container">
      {/* Đoạn mã HTML mới */}
      <div className="logo">
      <img src={logo} alt="F88 Logo" />
      </div>

      <div className="slogan-box">
        Vay tiền ngay
      </div>

      <div className="separator"></div>
      {/* Kết thúc đoạn mã HTML mới */}

      <div className="container">
        <h1 className="title">Điểm Tín Dụng</h1>
        <form className="form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="LOAN">LOAN</label>
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
            <label htmlFor="MORTDUE">MORTDUE</label>
            <input
              type="text"
              id="MORTDUE"
              name="MORTDUE"
              value={formData.MORTDUE}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="VALUE">VALUE</label>
            <input
              type="text"
              id="VALUE"
              name="VALUE"
              value={formData.VALUE}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="REASON">REASON</label>
            <select
              id="REASON"
              name="REASON"
              value={formData.REASON}
              onChange={handleChange}
            >
              <option value="DebtCon">DebtCon</option>
              <option value="HomeImp">HomeImp</option>
              <option value="Other reason">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="JOB">JOB</label>
            <select
              id="JOB"
              name="JOB"
              value={formData.JOB}
              onChange={handleChange}
            >
              <option value="Mgr">Mgr</option>
              <option value="Office">Office</option>
              <option value="Other">Other</option>
              <option value="ProfExe">ProfExe</option>
              <option value="Sales">Sales</option>
              <option value="Self">Self</option>
            </select>
          </div>
          <div className="form-group">
            <label htmlFor="YOJ">YOJ</label>
            <input
              type="text"
              id="YOJ"
              name="YOJ"
              value={formData.YOJ}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="DEROG">DEROG</label>
            <input
              type="text"
              id="DEROG"
              name="DEROG"
              value={formData.DEROG}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="DELINQ">DELINQ</label>
            <input
              type="text"
              id="DELINQ"
              name="DELINQ"
              value={formData.DELINQ}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="CLAGE">CLAGE</label>
            <input
              type="text"
              id="CLAGE"
              name="CLAGE"
              value={formData.CLAGE}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="NINQ">NINQ</label>
            <input
              type="text"
              id="NINQ"
              name="NINQ"
              value={formData.NINQ}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="CLNO">CLNO</label>
            <input
              type="text"
              id="CLNO"
              name="CLNO"
              value={formData.CLNO}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="DEBTINC">DEBTINC</label>
            <input
              type="text"
              id="DEBTINC"
              name="DEBTINC"
              value={formData.DEBTINC}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="submit-button">Kiểm Tra</button>
        </form>
        {message && <p>{message}</p>}
      </div>

      {result && showNotification && (
        <div className="notification-box show">
          <span className="close-button" onClick={handleCloseNotification}>&times;</span>
          <h2>Kết Quả</h2>
          <p>Điểm tín dụng: {result}</p>
          <div className="button-group">
            <button className="action-button" onClick={handleApproveLoan}>Từ chối khoản vay</button>
            <button className="action-button" onClick={handleRejectLoan}>Duyệt khoản vay</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditScorePrediction;
