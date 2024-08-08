import React, { useState, useEffect } from 'react';
import './style/style_admin2.css';
import logo from './f88-white-logo.svg';

const LoanApproval2 = () => {
  const [cccd2, setCCCD2] = useState('');
  const [data2, setData2] = useState(null);
  const [error2, setError2] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null); // State để lưu thông tin khoản vay đã chọn

  useEffect(() => {
    const fetchRandomData2 = async () => {
      try {
        const response = await fetch('http://127.0.0.1:5000/get_random_20');
        if (response.ok) {
          const text = await response.text();
          if (text.trim()) {
            let result;
            try {
              result = JSON.parse(text);
            } catch (parseError) {
              setError2('Dữ liệu trả về không hợp lệ');
              setData2(null);
              return;
            }

            const cleanedResult = result.map(item => {
              return Object.fromEntries(
                Object.entries(item).map(([key, value]) => [key, (value === 'NaN' || value === undefined) ? null : value])
              );
            });
            setData2(cleanedResult);
            setError2(null);
          } else {
            setError2('Dữ liệu trả về không hợp lệ');
            setData2(null);
          }
        } else {
          setError2('Không tìm thấy thông tin khoản vay');
          setData2(null);
        }
      } catch (error) {
        setError2(`Đã xảy ra lỗi: ${error.message}`);
        setData2(null);
      }
    };

    fetchRandomData2();
  }, []);

  const handleSubmit2 = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`http://localhost:5000/get_by_cccd/${cccd2}`);
      if (response.ok) {
        const text = await response.text();
        if (text.trim()) {
          let result;
          try {
            result = JSON.parse(text);
          } catch (parseError) {
            setError2('Dữ liệu trả về không hợp lệ');
            setData2(null);
            return;
          }

          const cleanedResult = result.map(item => {
            return Object.fromEntries(
              Object.entries(item).map(([key, value]) => [key, (value === 'NaN' || value === undefined) ? null : value])
            );
          });
          setData2(cleanedResult);
          setError2(null);
        } else {
          setError2('Dữ liệu trả về không hợp lệ');
          setData2(null);
        }
      } else {
        setError2('Không tìm thấy thông tin khoản vay');
        setData2(null);
      }
    } catch (error) {
      setError2(`Đã xảy ra lỗi: ${error.message}`);
      setData2(null);
    }
  };

  const handleChange2 = (e) => {
    setCCCD2(e.target.value);
  };

  const handleRowClick = (loanData) => {
    setSelectedLoan(loanData);
  };

  const handleCloseModal = () => {
    setSelectedLoan(null);
  };

  const handleApprove = () => {
    // Logic để duyệt khoản vay
    console.log('Duyệt khoản vay:', selectedLoan);
    setSelectedLoan(null);
  };

  const handleReject = () => {
    // Logic để từ chối khoản vay
    console.log('Từ chối khoản vay:', selectedLoan);
    setSelectedLoan(null);
  };

  return (
    <div className="overlay-container2">
      <div className="header2">
        <div className="logo2">
          <img src={logo} alt="Logo" />
        </div>
        <div className="slogan-box2">VAY TIỀN</div>
      </div>
      <div className="separator2"></div>
      <div className="container2">
        <h1 className="title2">THÔNG TIN KHOẢN VAY</h1>
        <form onSubmit={handleSubmit2} className="form-inline2">
          <div className="form-group2">
            <label htmlFor="cccd2">Nhập CCCD:</label>
            <input
              type="text"
              id="cccd2"
              value={cccd2}
              onChange={handleChange2}
              required
            />
            <button type="submit">Tìm kiếm</button>
          </div>
        </form>
        {error2 && <div className="error2">{error2}</div>}
        {data2 && (
          <div className="data-table2">
            <table>
              <thead>
                <tr>
                  <th>HDV</th>
                  <th>Tên</th>
                  <th>CCCD</th>
                  <th>Score</th>
                  <th>LOAN</th>
                  <th>VALUE</th>
                  <th>MORTDUE</th>
                  <th>REASON</th>
                  <th>JOB</th>
                  <th>YOJ</th>
                  <th>CLAGE</th>
                  <th>CLNO</th>
                  <th>DEBTINCT</th>
                  <th>DELINQ</th>
                  <th>DEROG</th>
                  <th>NINQ</th>
                  <th>Prob</th>
                  <th>BAD</th>
                </tr>
              </thead>
              <tbody>
                {data2.map((item, index) => (
                  <tr key={index} onClick={() => handleRowClick(item)}>
                    <td>{item.HDV}</td>
                    <td>{item.Tên}</td>
                    <td>{item.CCCD}</td>
                    <td>{item.Score}</td>
                    <td>{item.LOAN}</td>
                    <td>{item.VALUE}</td>
                    <td>{item.MORTDUE}</td>
                    <td>{item.REASON}</td>
                    <td>{item.JOB}</td>
                    <td>{item.YOJ}</td>
                    <td>{item.CLAGE}</td>
                    <td>{item.CLNO}</td>
                    <td>{item.DEBTINCT}</td>
                    <td>{item.DELINQ}</td>
                    <td>{item.DEROG}</td>
                    <td>{item.NINQ}</td>
                    <td>{item.Prob}</td>
                    <td>{item.BAD}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {selectedLoan && (
          <div className="modal2">
            <div className="modal-content2">
              <div className="modal-header2">
                <h2>Thông tin chi tiết</h2>
                <button className="close-button2" onClick={handleCloseModal}>×</button>
              </div>
              <table className="info-table2">
                <tbody>
                  {Object.entries(selectedLoan).filter(([key]) => key !== 'Prob').map(([key, value]) => (
                    <tr key={key}>
                      <td><strong>{key}:</strong></td>
                      <td>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="modal-buttons2">
                <button onClick={handleApprove}>Duyệt khoản vay</button>
                <button onClick={handleReject}>Từ chối khoản vay</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoanApproval2;
