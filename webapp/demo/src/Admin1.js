import React, { useState, useEffect } from 'react';
import './style/style_admin1.css';
import logo from './logo/login-logo.svg';
import Papa from 'papaparse';

function LoanDetailModal({ loan, formData, setFormData, onClose, onSave, onApprove, onReject }) {
  if (!loan) return null;

  // fallback nếu formData không có thì dùng loan
  const currentFormData = formData || loan;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const hiddenFields = ['id', 'name'];


  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Chi tiết hồ sơ: {loan.name || 'Không tên'}</h2>

        <div className="loan-fields">
          {Object.entries(loan)
            .filter(([key]) => !hiddenFields.includes(key))
            .map(([key]) => (
              <div key={key} style={{ marginBottom: '8px' }}>
                <label>{key}:</label>
                <input
                  name={key}
                  value={currentFormData[key] ?? ''}
                  onChange={handleChange}
                  disabled={true}
                />
              </div>
          ))}
        </div>

        <div style={{ marginTop: 15, display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ backgroundColor: '#555', color: 'white' }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

function LoanApplication() {
  // Dữ liệu nhập hồ sơ vay (tab input)
  const [formData, setFormData] = useState({
    name: '',
    CCCD: '',
    LOAN: '',
    VALUE: '',
    MORTDUE: '',
    YOJ: '',
    DEROG: '',
    DELINQ: '',
    CLAGE: '',
    NINQ: '',
    CLNO: '',
    DEBTINC: '',
    REASON: '',
    JOB: ''
  });
  const [showMessage, setShowMessage] = useState(false);

  const [csvData, setCsvData] = useState(null);
  const [selectedFileName, setSelectedFileName] = useState('');
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLoanDetail, setSelectedLoanDetail] = useState(null);
  const [editFormData, setEditFormData] = useState(null);


  // Dữ liệu nhập điểm tín dụng (tab score) riêng biệt
  const [formDataScore, setFormDataScore] = useState({
    LOAN: '',
    MORTDUE: '',
    VALUE: '',
    YOJ: '',
    DEROG: '',
    DELINQ: '',
    CLAGE: '',
    NINQ: '',
    CLNO: '',
    DEBTINC: '',
    REASON: '',
    JOB: ''
  });
  const [scoreResult, setScoreResult] = useState(null);
  const [scoreError, setScoreError] = useState(null);

  // Chức năng chọn tab
  const [selectedFunction, setSelectedFunction] = useState('input');

  // Xử lý thay đổi input tab nhập hồ sơ
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const openDetailModal = async (id) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/loan_detail_by_id/${id}`);
      if (!res.ok) throw new Error('Không tìm thấy chi tiết hồ sơ');
      const data = await res.json();

      if (!data || data.length === 0) throw new Error('Hồ sơ rỗng');

      setSelectedLoanDetail(data);
      setEditFormData(data);
      setDetailModalVisible(true);
    } catch (error) {
      alert(error.message);
    }
  };

  useEffect(() => {
    if (selectedLoanDetail) {
      setEditFormData(selectedLoanDetail);
    }
  }, [selectedLoanDetail]);

  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowMessage(false);

    if (!formData.name || !formData.CCCD || !formData.LOAN || !formData.VALUE) {
      alert("Vui lòng nhập đầy đủ các trường: Họ tên, CCCD, Khoản vay và Giá trị tài sản.");
      return;
    }

    try {
      const response = await fetch('http://127.0.0.1:5000/add_loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.error || 'Đã xảy ra lỗi khi gửi hồ sơ.');
      } else {
        setShowMessage(true);
        console.log('Hồ sơ đã lưu:', data);
        setFormData({
          name: '',
          CCCD: '',
          LOAN: '',
          VALUE: '',
          REASON: '',
          JOB: '',
          YOJ: ''
        });
      }
    } catch (err) {
      alert('Lỗi kết nối tới máy chủ!');
      console.error(err);
    }
  };


  const closeMessage = () => {
    setShowMessage(false);
    setScoreError(null);
    setScoreResult(null);
  };

  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    window.location.reload();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setSelectedFileName(file.name); // hiển thị tên file

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        setCsvData(results.data); // lưu lại dữ liệu
        setShowMessage(false);    // ẩn thông báo cũ nếu có
      },
      error: function (err) {
        console.error('Lỗi khi đọc CSV:', err);
        alert('Không thể đọc file CSV.');
      },
    });
  };

  const handleConfirmUpload = async () => {
    if (!csvData || csvData.length === 0) {
      alert("Chưa có dữ liệu để tải lên.");
      return;
    }

    // Gán ID tự động ở FE nếu cần (hoặc có thể để BE làm)
    const recordsWithId = csvData.map(row => ({
      ...row,
      // id: crypto.randomUUID(),  // tạo id nếu bạn muốn làm ở FE, hoặc bỏ dòng này nếu để BE làm
    }));

    try {
      const response = await fetch('http://127.0.0.1:5000/upload_loans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(recordsWithId),
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.error || 'Tải hồ sơ thất bại.');
      } else {
        setShowMessage(true);
        setCsvData(null);
        setSelectedFileName('');
      }
    } catch (err) {
      alert('Lỗi kết nối đến server.');
      console.error(err);
    }
  };





  // Xử lý thay đổi input tab tính điểm tín dụng
  const handleChangeScore = (e) => {
    setFormDataScore({
      ...formDataScore,
      [e.target.name]: e.target.value,
    });
  };

  // Gửi dữ liệu lên API /predict để lấy điểm tín dụng
  const handleScoreSubmit = async (e) => {
    e.preventDefault();
    setScoreError(null);
    setScoreResult(null);

    try {
      // Ép kiểu đúng dữ liệu
      const payload = {
        LOAN: Number(formDataScore.LOAN),
        MORTDUE: Number(formDataScore.MORTDUE),
        VALUE: Number(formDataScore.VALUE),
        YOJ: Number(formDataScore.YOJ),
        DEROG: Number(formDataScore.DEROG),
        DELINQ: Number(formDataScore.DELINQ),
        CLAGE: Number(formDataScore.CLAGE),
        NINQ: Number(formDataScore.NINQ),
        CLNO: Number(formDataScore.CLNO),
        DEBTINC: Number(formDataScore.DEBTINC),
        REASON: formDataScore.REASON,
        JOB: formDataScore.JOB
      };

      const response = await fetch('http://127.0.0.1:5000/predict', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        setScoreError(data.error || 'Lỗi khi gọi API chấm điểm');
      } else {
        setScoreResult(data);
      }
    } catch (err) {
      console.error(err); // Thêm dòng này để debug rõ lỗi
      setScoreError('Lỗi kết nối server');
    }
  };


  const [loanData, setLoanData] = useState([]);
  const [loanType, setLoanType] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [loading, setLoading] = useState(false);

  const fetchLoans = async (type) => {
    setLoading(true);
    try {
      const response = await fetch(`http://127.0.0.1:5000/${type}_loans`);
      const data = await response.json();
      setLoanData(data);
    } catch (err) {
      console.error('Lỗi khi lấy dữ liệu hồ sơ:', err);
      setLoanData([]);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (selectedFunction === 'view') {
      fetchLoans(loanType);
    }
  }, [selectedFunction, loanType]);


  return (
    <div className="overlay-container">
      {/* Logo */}
      <div className="logo">
        <img src={logo} alt="F88 Logo" />
      </div>

      {/* Nút chức năng + Đăng xuất */}
      <div className="function-bar">
        <div className="function-group">
          <button
            className={selectedFunction === 'input' ? 'active' : ''}
            onClick={() => setSelectedFunction('input')}
          >
            Nhập hồ sơ vay
          </button>
          <button
            className={selectedFunction === 'upload' ? 'active' : ''}
            onClick={() => setSelectedFunction('upload')}
          >
            Tải lên hồ sơ
          </button>
          <button
            className={selectedFunction === 'view' ? 'active' : ''}
            onClick={() => setSelectedFunction('view')}
          >
            Xem hồ sơ
          </button>
          <button
            className={selectedFunction === 'score' ? 'active' : ''}
            onClick={() => setSelectedFunction('score')}
          >
            Tính điểm tín dụng
          </button>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>

      <div className="separator"></div>

      {/* Tab nhập hồ sơ vay */}
      {selectedFunction === 'input' && (
        <div className="container">
          <h1 className="title">Nhập Hồ Sơ Vay</h1>
          <form className="form" onSubmit={handleSubmit}>
            {/* giữ nguyên các input */}
            <div className="form-group">
              <label htmlFor="name">Họ tên <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="CCCD">CCCD <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="CCCD"
                name="CCCD"
                value={formData.CCCD}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="LOAN">Khoản vay (LOAN) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="LOAN"
                name="LOAN"
                value={formData.LOAN}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="VALUE">Giá trị tài sản thế chấp (VALUE) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="VALUE"
                name="VALUE"
                value={formData.VALUE}
                onChange={handleChange}
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
              />
            </div>
            <div className="form-group">
              <label htmlFor="MORTDUE">Nợ thế chấp còn lại (MORTDUE)</label>
              <input
                type="number"
                id="MORTDUE"
                name="MORTDUE"
                value={formData.MORTDUE}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="DEROG">Số lần bị ghi nhận xấu (DEROG)</label>
              <input
                type="number"
                id="DEROG"
                name="DEROG"
                value={formData.DEROG}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="DELINQ">Số lần thanh toán trễ (DELINQ)</label>
              <input
                type="number"
                id="DELINQ"
                name="DELINQ"
                value={formData.DELINQ}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="CLAGE">Tuổi tài khoản tín dụng lâu nhất (CLAGE)</label>
              <input
                type="number"
                id="CLAGE"
                name="CLAGE"
                value={formData.CLAGE}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="NINQ">Số lần tra cứu tín dụng gần đây (NINQ)</label>
              <input
                type="number"
                id="NINQ"
                name="NINQ"
                value={formData.NINQ}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="CLNO">Tổng số tài khoản tín dụng (CLNO)</label>
              <input
                type="number"
                id="CLNO"
                name="CLNO"
                value={formData.CLNO}
                onChange={handleChange}
              />
            </div>
            <div className="form-group">
              <label htmlFor="DEBTINC">Tỉ lệ nợ / thu nhập (DEBTINC)</label>
              <input
                type="number"
                step="0.1"
                id="DEBTINC"
                name="DEBTINC"
                value={formData.DEBTINC}
                onChange={handleChange}
              />
            </div>
            <button type="submit" className="submit-button">Lưu Hồ Sơ</button>
          </form>
          

          {showMessage && (
            <div className="message-box">
              <span className="close-btn" onClick={closeMessage}>&times;</span>
              <p>Hồ sơ vay đã được lưu trên hệ thống!</p>
            </div>
          )}
        </div>
      )}

      {/* Tab tải lên hồ sơ */}
      {selectedFunction === 'upload' && (
        <div className="upload-section">
          <h1 className="title">Tải lên Hồ Sơ Vay (CSV File)</h1>
          <div className="file-upload-wrapper">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => handleFileUpload(e)}
              className="custom-file-input"
            />
          </div>


          {selectedFileName ? (
            <p className="file-name">Đã chọn: <strong>{selectedFileName}</strong></p>
          ) : (
            <p className="file-name">Chưa chọn file nào</p>
          )}


          {csvData && (
            <button className="confirm-upload-button" onClick={handleConfirmUpload}>
              Xác nhận tải lên
            </button>
          )}

          {showMessage && (
            <div className="message-box">
              <span className="close-btn" onClick={closeMessage}>&times;</span>
              <p>Hồ sơ vay từ file CSV đã được xử lý thành công!</p>
            </div>
          )}
        </div>
      )}



      {/* Tab xem hồ sơ */}
      {selectedFunction === 'view' && (
        <div className="container2">
          <h1 className="title2">Danh sách hồ sơ</h1>

          <div className="form-inline2">
            <div className="form-group2">
              <label htmlFor="loanTypeSelect">Chọn loại hồ sơ:</label>
              <select
                id="loanTypeSelect"
                value={loanType}
                onChange={(e) => setLoanType(e.target.value)}
              >
                <option value="pending">Hồ sơ chờ duyệt</option>
                <option value="approved">Hồ sơ đã duyệt</option>
                <option value="rejected">Hồ sơ đã từ chối</option>
              </select>
            </div>
          </div>

          {loading ? (
            <p>Đang tải dữ liệu...</p>
          ) : loanData.length === 0 ? (
            <p>Không có hồ sơ nào.</p>
          ) : (
            <div className="data-table2">
              <table>
                <thead>
                  <tr>
                    <th>CCCD</th>
                    <th>LOAN</th>
                    <th>Score</th>
                    <th>Trạng thái</th>
                    <th>VALUE</th>
                    <th>Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {loanData.map((item, index) => (
                    <tr key={index}>
                      <td>{item.CCCD}</td>
                      <td>{item.LOAN}</td>
                      <td>{item.Score}</td>
                      <td>{item['Trạng thái']}</td>
                      <td>{item.VALUE}</td>
                      <td>
                        <button onClick={() => openDetailModal(item.id)}>Xem chi tiết</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {detailModalVisible && selectedLoanDetail && (
        <LoanDetailModal
          loan={selectedLoanDetail}
          formData={editFormData}
          setFormData={setEditFormData}
          onClose={() => setDetailModalVisible(false)}
        />
      )}


      {/* Tab tính điểm tín dụng */}
      {selectedFunction === 'score' && (
        <div className="container">
          <h1 className="title">Tính điểm tín dụng</h1>
          <form className="form" onSubmit={handleScoreSubmit}>
            {/* Các input tương ứng với model cần */}
            <div className="form-group">
              <label htmlFor="LOAN">Khoản vay (LOAN) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                id="LOAN"
                name="LOAN"
                value={formDataScore.LOAN}
                onChange={handleChangeScore}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="MORTDUE">Nợ chưa trả (MORTDUE) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                id="MORTDUE"
                name="MORTDUE"
                value={formDataScore.MORTDUE}
                onChange={handleChangeScore}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="VALUE">Giá trị tài sản thế chấp (VALUE) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                id="VALUE"
                name="VALUE"
                value={formDataScore.VALUE}
                onChange={handleChangeScore}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="YOJ">Số năm công tác (YOJ) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                id="YOJ"
                name="YOJ"
                value={formDataScore.YOJ}
                onChange={handleChangeScore}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="DEROG">Số lần vi phạm tín dụng (DEROG) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                id="DEROG"
                name="DEROG"
                value={formDataScore.DEROG}
                onChange={handleChangeScore}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="DELINQ">Số lần trễ hạn (DELINQ) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                id="DELINQ"
                name="DELINQ"
                value={formDataScore.DELINQ}
                onChange={handleChangeScore}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="CLAGE">Thời gian tín dụng lâu nhất (CLAGE) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                id="CLAGE"
                name="CLAGE"
                value={formDataScore.CLAGE}
                onChange={handleChangeScore}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="NINQ">Số lượng hỏi tín dụng (NINQ) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                id="NINQ"
                name="NINQ"
                value={formDataScore.NINQ}
                onChange={handleChangeScore}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="CLNO">Số lượng tín dụng (CLNO) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                id="CLNO"
                name="CLNO"
                value={formDataScore.CLNO}
                onChange={handleChangeScore}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="DEBTINC">Tỉ lệ nợ trên thu nhập (DEBTINC) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="number"
                step="0.1"
                id="DEBTINC"
                name="DEBTINC"
                value={formDataScore.DEBTINC}
                onChange={handleChangeScore}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="REASON">Lý do vay (REASON) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="REASON"
                name="REASON"
                value={formDataScore.REASON}
                onChange={handleChangeScore}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="JOB">Nghề nghiệp (JOB) <span style={{ color: 'red' }}>*</span></label>
              <input
                type="text"
                id="JOB"
                name="JOB"
                value={formDataScore.JOB}
                onChange={handleChangeScore}
                required
              />
            </div>

            <button type="submit" className="submit-button">Chấm điểm</button>
          </form>

          {scoreResult && (
            <div className="message-box">
              <span className="close-btn" onClick={closeMessage}>&times;</span>
              <p><strong>Điểm tín dụng:</strong> {scoreResult.credit_score}</p>
            </div>
          )}

          {scoreError && (
            <div className="message-box error">
              <span className="close-btn" onClick={closeMessage}>&times;</span>
              <p>{scoreError}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default LoanApplication;
