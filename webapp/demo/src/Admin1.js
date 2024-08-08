import React, { useState } from 'react';
import axios from 'axios';
import './style/style_admin1.css';
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
  const [value, setValue] = useState(null);
  const [message, setMessage] = useState('');
  const [showNotification, setShowNotification] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateLoanSuggestion = (creditScore, value) => {

    const numericValue = parseFloat(value);
  if (isNaN(numericValue)) {
    return 'Giá trị không hợp lệ';
  }

    if (creditScore < 600) {
      return `Đề xuất Khoản vay: ${value * 0.8}`;
    } else if (creditScore >= 600 && creditScore <= 699) {
      return `Đề xuất Khoản vay: ${value * 0.9}`;
    } else if (creditScore >= 700 && creditScore <= 749) {
      return `Đề xuất Khoản vay: ${value}`;
    } else if (creditScore >= 750) {
      return `Đề xuất Khoản vay: ${value * 1.1}`;
    }
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
      setValue(response.data.value);
      setMessage('');
      setShowNotification(true);
    } catch (error) {
      console.error('Error during API call:', error);
      setMessage('Có lỗi xảy ra khi dự đoán. Vui lòng thử lại.');
    }
  };

  const handleApproveLoan = () => {
    alert('Bạn đã duyệt khoản vay!');
    setShowNotification(false);
  };

  const handleRejectLoan = () => {
    alert('Bạn đã từ chối khoản vay.');
    setShowNotification(false);
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
  };

  const getSegmentClass = (score) => {
    if (score >= 300 && score <= 639) return 'bad';
    if (score >= 640 && score <= 699) return 'fair';
    if (score >= 700 && score <= 749) return 'good';
    if (score >= 750 && score <= 850) return 'excellent';
    return '';
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
          <div className="score-segment-bar">
            <div className="segment bad">
              Bad
              <span>300-639</span>
            </div>
            <div className="segment fair">
              Fair
              <span>640-699</span>
            </div>
            <div className="segment good">
              Good
              <span>700-749</span>
            </div>
            <div className="segment excellent">
              Excellent
              <span>750-850</span>
            </div>
          </div>
          <p>Điểm Tín Dụng: <strong>{result}</strong></p>
          <p>{calculateLoanSuggestion(result,value)}</p>
          
          
          <div className="actions">
            <button className="action-button" onClick={handleRejectLoan}>Từ chối Khoản vay</button>
            <button className="action-button" onClick={handleApproveLoan}>Duyệt Khoản vay</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default CreditScorePrediction;
