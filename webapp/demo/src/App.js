// App.js
import React, { useState } from 'react';
import Login from './Login';
import Admin1Interface from './Admin1';
import Admin2Interface from './Admin2';

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);

  return (
    <div>
      {!loggedInUser && <Login onLogin={setLoggedInUser} />}
      {loggedInUser === 'admin1' && <Admin1Interface />}
      {loggedInUser === 'admin2' && <Admin2Interface />}
    </div>
  );
}

export default App;
