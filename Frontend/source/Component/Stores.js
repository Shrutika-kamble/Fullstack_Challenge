import React, { useEffect, useState } from 'react';
const API = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:4000/api');
export default function Stores({ token }) {
  const [stores,setStores] = useState([]);
  const [q,setQ] = useState('');
  useEffect(()=>{ fetchStores(); },[]);
  async function fetchStores() {
    const res = await fetch(API + '/stores', { headers: token ? { Authorization: 'Bearer ' + token } : {} });
    const j = await res.json();
    setStores(j);
  }
  async function rate(storeId, value) {
    const res = await fetch(API + '/stores/' + storeId + '/rate', { method:'POST', headers:{'Content-Type':'application/json', Authorization:'Bearer ' + token}, body: JSON.stringify({ rating: value })});
    const j = await res.json();
    if (!res.ok) alert(j.error || 'Error'); else fetchStores();
  }
  return (<div>
    <h3>Stores</h3>
    <input placeholder='Search name/address' value={q} onChange={e=>setQ(e.target.value)} />
    <button onClick={async ()=>{ const res=await fetch(API + '/stores?q='+encodeURIComponent(q), { headers: token? { Authorization: 'Bearer ' + token } : {} }); const j=await res.json(); setStores(j); }}>Search</button>
    <ul>
      {stores.map(s => (<li key={s.id}>
        <strong>{s.name}</strong> — {s.address} — Avg: {s.averageRating ? s.averageRating.toFixed(2) : 'N/A'} — Your: {s.userRating || 'N/A'}
        <div>
          {[1,2,3,4,5].map(n=> (<button key={n} onClick={()=>rate(s.id,n)}>{n}</button>))}
        </div>
      </li>))}
    </ul>
  </div>);
}
