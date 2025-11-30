import React, { useState } from 'react';
import Login from './components/Login';
import Signup from './components/Signup';
import Stores from './components/Stores';
const App = () => {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [role, setRole] = useState(localStorage.getItem('role'));
  if (!token) {
    return (
      <div style={{padding:20}}>
        <h2>FullStack Challenge - Demo UI</h2>
        <Signup onSigned={() => {}} />
        <hr />
        <Login onLogin={(t,r)=>{ setToken(t); setRole(r); localStorage.setItem('token',t); localStorage.setItem('role', r); }} />
      </div>
    );
  }
  return (
    <div style={{padding:20}}>
      <h2>Welcome (role: {role})</h2>
      <button onClick={() => { localStorage.clear(); window.location.reload(); }}>Logout</button>
      <Stores token={token} />
    </div>
  );
};
export default App;