import React, { useState } from 'react';
const API = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api');
export default function Signup({ onSigned }) {
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [address,setAddress]=useState(''); const [password,setPassword]=useState('');
  async function submit(e){ e.preventDefault();
    const res = await fetch(API + '/auth/signup', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ name,email,address,password }) });
    const j = await res.json();
    if (res.ok) { alert('Signup success'); if (onSigned) onSigned(); } else alert(j.error || 'Signup failed');
  }
  return (<form onSubmit={submit}>
    <h3>Signup (Name must be 20-60 chars)</h3>
    <input placeholder='Full name' value={name} onChange={e=>setName(e.target.value)} /><br/>
    <input placeholder='Email' value={email} onChange={e=>setEmail(e.target.value)} /><br/>
    <input placeholder='Address' value={address} onChange={e=>setAddress(e.target.value)} /><br/>
    <input type='password' placeholder='Password' value={password} onChange={e=>setPassword(e.target.value)} /><br/>
    <button>Signup</button>
  </form>);
}
