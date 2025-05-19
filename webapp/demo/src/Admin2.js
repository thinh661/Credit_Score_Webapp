import React, { useState, useEffect } from 'react';
import './style/style_admin2.css';
import logo from './logo/login-logo.svg';

function LoanDetailModal({ loan, formData, setFormData, onClose, onSave, onApprove, onReject }) {
  if (!loan) return null;

  // fallback nếu formData không có thì dùng loan
  const currentFormData = formData || loan;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const hiddenFields = ['id'];


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
                disabled={key === 'CCCD' || key === 'Trạng thái' || key === 'Score'}
              />
            </div>
          ))}
        </div>

        <div style={{ marginTop: 15, display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
          <button onClick={() => onSave(currentFormData)} style={{ backgroundColor: '#00833E', color: 'white' }}>
            Lưu thay đổi
          </button>

          {loan['Trạng thái'] === 'Chờ duyệt' && (
            <>
              <button onClick={() => onApprove(loan.CCCD)} style={{ backgroundColor: 'green', color: 'white' }}>
                Duyệt
              </button>
              <button onClick={() => onReject(loan.CCCD)} style={{ backgroundColor: 'red', color: 'white' }}>
                Từ chối
              </button>
            </>
          )}
          <button onClick={onClose} style={{ backgroundColor: '#555', color: 'white' }}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}


function FilterLoans({ onFilter }) {
  const [loanType, setLoanType] = React.useState('pending');
  const [scoreMin, setScoreMin] = React.useState('');
  const [scoreMax, setScoreMax] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onFilter(loanType, scoreMin, scoreMax);
  };

  return (
    <div>
      <h1 className="title2">Lọc hồ sơ vay theo điểm</h1>
      <form onSubmit={handleSubmit} className="form-inline2">
        <div className="form-group2">
          <label>Loại hồ sơ:</label>
          <select value={loanType} onChange={e => setLoanType(e.target.value)}>
            <option value="pending">Hồ sơ chờ duyệt</option>
            <option value="approved">Hồ sơ đã duyệt</option>
            <option value="rejected">Hồ sơ đã từ chối</option>
          </select>
        </div>
        <div className="form-group2">
          <label>Điểm từ:</label>
          <input
            type="number"
            value={scoreMin}
            onChange={e => setScoreMin(e.target.value)}
            placeholder="Min"
          />
        </div>
        <div className="form-group2">
          <label>Đến:</label>
          <input
            type="number"
            value={scoreMax}
            onChange={e => setScoreMax(e.target.value)}
            placeholder="Max"
          />
        </div>
        <div className="form-group2">
          <button type="submit">Lọc</button>
        </div>
      </form>
    </div>
  );
}




const LoanApproval2 = () => {
  const [cccd2, setCCCD2] = useState('');
  const [data2, setData2] = useState(null);
  const [error2, setError2] = useState(null);
  const [selectedLoan, setSelectedLoan] = useState(null);
  const [formData, setFormData] = useState({});
  // Chức năng chọn tab
  const [selectedFunction, setSelectedFunction] = useState('input');

  const [loanData, setLoanData] = useState([]);
  const [loanType, setLoanType] = useState('pending'); // 'pending', 'approved', 'rejected'
  const [loading, setLoading] = useState(false);
  // const [searchType, setSearchType] = useState('cccd');
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError] = useState(null);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedLoanDetail, setSelectedLoanDetail] = useState(null);
  const [editFormData, setEditFormData] = useState(null);


  const [filterResults, setFilterResults] = useState([]);
  const [filterLoading, setFilterLoading] = useState(false);




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




  const closeDetailModal = () => {
    setDetailModalVisible(false);
    setSelectedLoanDetail(null);
  };



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
    if (selectedLoanDetail) {
      setEditFormData(selectedLoanDetail);
    }
  }, [selectedLoanDetail]);


  useEffect(() => {
    if (selectedFunction === 'view') {
      fetchLoans(loanType);
    }
  }, [selectedFunction, loanType]);

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


  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    window.location.reload();
  };

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    setSearchResult(null);
    setSearchError(null);

    if (!searchValue.trim()) {
      setSearchError('Vui lòng nhập số CCCD');
      return;
    }

    try {
      const endpoint = `http://127.0.0.1:5000/get_by_cccd/${searchValue}`;

      const res = await fetch(endpoint);
      const data = await res.json();

      if (!res.ok) {
        setSearchError(data.error || 'Không tìm thấy hồ sơ');
      } else {
        setSearchResult(data);
      }
    } catch (err) {
      setSearchError('Lỗi khi kết nối tới server');
    }
  };

  
  const handleSaveDetail = async (updatedData) => {
    try {
      const res = await fetch(`http://127.0.0.1:5000/update_loan/${updatedData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData),
      });
      if (!res.ok) throw new Error('Lưu hồ sơ thất bại');
      alert('Cập nhật hồ sơ thành công');
      setDetailModalVisible(false);
      fetchLoans(loanType);
    } catch (error) {
      alert(error.message);
    }
  };

  const handleApprove = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/review_loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedLoanDetail.id, decision: 'approve' }),
      });
      if (!res.ok) throw new Error('Duyệt hồ sơ thất bại');
      alert('Duyệt hồ sơ thành công');
      setDetailModalVisible(false);
      fetchLoans(loanType);
    } catch (error) {
      alert(error.message);
    }
  };


  const handleReject = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/review_loan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: selectedLoanDetail.id, decision: 'reject' }),
      });
      if (!res.ok) throw new Error('Từ chối hồ sơ thất bại');
      alert('Từ chối hồ sơ thành công');
      setDetailModalVisible(false);
      fetchLoans(loanType);
    } catch (error) {
      alert(error.message);
    }
  };


  const handleFilter = async (loanType, scoreMin, scoreMax) => {
    setFilterLoading(true);
    try {
      const params = new URLSearchParams({
        loan_type: loanType,
        score_min: scoreMin,
        score_max: scoreMax,
      });
      const res = await fetch(`http://127.0.0.1:5000/filter_loans?${params.toString()}`);
      if (!res.ok) throw new Error('Lấy dữ liệu lọc thất bại');
      const data = await res.json();
      setFilterResults(data);
    } catch (err) {
      alert(err.message);
      setFilterResults([]);
    }
    setFilterLoading(false);
  };


  const [statsData, setStatsData] = useState([]);

  useEffect(() => {
    if (selectedFunction === 'stats') {
      fetchStats();
    }
  }, [selectedFunction]);

  const fetchStats = async () => {
    try {
      const res = await fetch('http://127.0.0.1:5000/loan_stats');
      const data = await res.json();
      const formatted = Object.entries(data).map(([key, value]) => ({ name: key, value }));
      setStatsData(formatted);
    } catch (err) {
      console.error('Lỗi khi lấy thống kê:', err);
    }
  };


  return (
    <div className="overlay-container2">
      {/* Logo */}
      <div className="logo">
        <img src={logo} alt="F88 Logo" />
      </div>

      {/* Nút chức năng + Đăng xuất */}
      <div className="function-bar">
        <div className="function-group">
          <button
            className={selectedFunction === 'view' ? 'active' : ''}
            onClick={() => setSelectedFunction('view')}
          >
            Xem hồ sơ vay
          </button>

          <button
            className={selectedFunction === 'filter' ? 'active' : ''}
            onClick={() => setSelectedFunction('filter')}
          >
            Lọc hồ sơ vay
          </button>

          <button
            className={selectedFunction === 'search' ? 'active' : ''}
            onClick={() => setSelectedFunction('search')}
          >
            Tìm kiếm hồ sơ vay
          </button>
        </div>

        <button className="logout-button" onClick={handleLogout}>
          Đăng xuất
        </button>
      </div>

      <div className="separator2"></div>

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
          onSave={handleSaveDetail}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}

      {/* Tab lọc hồ sơ */}
      {selectedFunction === 'filter' && (
        <div className="container2">
          <FilterLoans onFilter={handleFilter} />

          {filterLoading ? (
            <p>Đang tải dữ liệu...</p>
          ) : filterResults.length === 0 ? (
            <p>Không có hồ sơ phù hợp.</p>
          ) : (
            <div className="data-table2">
              <table>
                <thead>
                  <tr>
                    <th>CCCD</th>
                    <th>HDV</th>
                    <th>LOAN</th>
                    <th>Score</th>
                    <th>Tên</th>
                    <th>VALUE</th>
                    <th>Tác vụ</th>
                  </tr>
                </thead>
                <tbody>
                  {filterResults.map((item, index) => (
                    <tr key={index}>
                      <td>{item.CCCD}</td>
                      <td>{item.HDV}</td>
                      <td>{item.LOAN}</td>
                      <td>{item.Score}</td>
                      <td>{item['Tên']}</td>
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



      {/* Tab tìm kiếm hồ sơ */}
      {selectedFunction === 'search' && (
        <div className="container2">
          <h1 className="title2">Tìm kiếm hồ sơ vay</h1>
          <form onSubmit={handleSearchSubmit} className="form-inline2">

            <div className="form-group2">
              <label htmlFor="searchValue">Nhập số CCCD: </label>
              <input
                type="text"
                id="searchValue"
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                required
              />
              <button type="submit">Tìm kiếm</button>
            </div>
          </form>

          {searchError && (
            <div className="message-box error">
              <span className="close-btn" onClick={() => setSearchError(null)}>&times;</span>
              <p>{searchError}</p>
            </div>
          )}
          
          {searchResult && searchResult.length > 0 && (
            <div className="data-table2">
              <table>
                <thead>
                  <tr>
                    {Object.keys(searchResult[0])
                      .filter((key) => key !== 'id') // Bỏ cột id
                      .map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                    <th>Tác vụ</th> {/* Thêm cột tác vụ */}
                  </tr>
                </thead>
                <tbody>
                  {searchResult.map((record, index) => (
                    <tr key={index}>
                      {Object.entries(record)
                        .filter(([key]) => key !== 'id') // Bỏ cột id
                        .map(([_, val], idx) => (
                          <td key={idx}>{val}</td>
                        ))}
                      <td>
                        <button onClick={() => openDetailModal(record.id)}>Xem chi tiết</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}


        </div>
      )}
    </div>
  );
};

export default LoanApproval2;
