import React, { useState } from 'react';
const API = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api');
export default function Login({ onLogin }) {
  const [email,setEmail]=useState(''); const [password,setPassword]=useState('');
  async function submit(e){ e.preventDefault();
    const res = await fetch(API + '/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ email, password }) });
    const j = await res.json();
    if (res.ok) onLogin(j.token, j.role);
    else alert(j.error || 'Login failed');
  }
  return (<form onSubmit={submit}>
    <h3>Login</h3>
    <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} /><br/>
    <input type='password' placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} /><br/>
    <button>Login</button>
  </form>);
}
