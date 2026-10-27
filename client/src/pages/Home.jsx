import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { Stars } from '../components.jsx';

export default function Home() {
  const [q, setQ] = useState(''); const [sort, setSort] = useState('new'); const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], pages: 1 }); const [err, setErr] = useState('');
  useEffect(() => {
    const t = setTimeout(() => api(`/recipes?q=${encodeURIComponent(q)}&sort=${sort}&page=${page}`).then(setData).catch(e => setErr(e.message)), 250);
    return () => clearTimeout(t);
  }, [q, sort, page]);
  return (
    <>
      <h1 className="hero">Cook for two or for twenty.</h1>
      <div className="bar">
        <input type="search" placeholder="Search by dish or ingredient" value={q} onChange={e => { setQ(e.target.value); setPage(1); }} aria-label="Search recipes" />
        <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }} aria-label="Sort">
          <option value="new">Newest</option><option value="top">Top rated</option>
        </select>
      </div>
      {err && <p className="error">{err}</p>}
      {!err && !data.items.length && <p className="muted">No recipes match yet. Try another ingredient, or post the first one.</p>}
      <div className="grid">
        {data.items.map(r => (
          <Link to={`/recipes/${r._id}`} key={r._id} className="card">
            <h2>{r.title}</h2>
            <p className="muted">{r.description.slice(0, 110)}</p>
            <p className="meta">Serves {r.servings} · {r.prepMinutes + r.cookMinutes || '–'} min · by {r.author?.name}</p>
            <Stars value={r.ratingAvg} count={r.ratingCount} />
          </Link>
        ))}
      </div>
      {data.pages > 1 && <div className="pager">
        <button className="btn ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span className="muted">Page {page} of {data.pages}</span>
        <button className="btn ghost" disabled={page >= data.pages} onClick={() => setPage(page + 1)}>Next</button>
      </div>}
    </>
  );
}
