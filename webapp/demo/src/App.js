import React, { useState, useEffect } from 'react';
import Login from './Login';
import Admin1Interface from './Admin1';
import Admin2Interface from './Admin2';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  // ✅ Khôi phục user khi load lại trang
  useEffect(() => {
    const savedUser = localStorage.getItem('loggedInUser');
    if (savedUser) {
      setLoggedInUser(savedUser);
    }
  }, []);

  // ✅ Khi login, lưu user vào localStorage
  const handleLogin = (username) => {
    localStorage.setItem('loggedInUser', username);
    setLoggedInUser(username);
  };

  // ✅ Logout và xóa localStorage
  const handleLogout = () => {
    localStorage.removeItem('loggedInUser');
    setLoggedInUser(null);
  };

  return (
    <div>
      {!loggedInUser && <Login onLogin={handleLogin} />}
      {loggedInUser === 'admin1' && (
        <>
          <Admin1Interface />
        </>
      )}
      {loggedInUser === 'admin2' && (
        <>
          <Admin2Interface />
        </>
      )}
    </div>
  );
}

export default App;

