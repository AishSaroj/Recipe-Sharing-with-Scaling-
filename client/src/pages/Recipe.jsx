import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../App.jsx';
import { scaleIngredient } from '../scale.js';
import { StarInput, Stars } from '../components.jsx';

export default function Recipe() {
  const { id } = useParams(); const { user } = useAuth(); const nav = useNavigate();
  const [r, setR] = useState(null); const [reviews, setReviews] = useState([]);
  const [sv, setSv] = useState('1'); const [err, setErr] = useState('');
  const [rating, setRating] = useState(0); const [comment, setComment] = useState('');

  const refresh = async first => {
    const [a, b] = await Promise.all([api(`/recipes/${id}`), api(`/recipes/${id}/reviews`)]);
    setR(a); setReviews(b); if (first) setSv(String(a.servings));
  };
  useEffect(() => { refresh(true).catch(e => setErr(e.message)); }, [id]);
  useEffect(() => { // prefill the user's existing review
    const mine = reviews.find(v => v.user?._id === user?.id);
    if (mine) { setRating(mine.rating); setComment(mine.comment); }
  }, [reviews, user]);

  if (err) return <p className="error">{err}</p>;
  if (!r) return <p className="muted">Loading…</p>;
  const n = Number(sv); const valid = n > 0;
  const factor = valid ? n / r.servings : 1;
  const isOwner = user && r.author?._id === user.id;
  const mine = reviews.find(v => v.user?._id === user?.id);

  const submit = async e => {
    e.preventDefault(); setErr('');
    try { await api(`/recipes/${id}/reviews`, { method: 'POST', body: { rating, comment } }); await refresh(); } catch (x) { setErr(x.message); }
  };
  const removeReview = async () => { await api(`/recipes/${id}/reviews`, { method: 'DELETE' }); setRating(0); setComment(''); refresh(); };
  const removeRecipe = async () => { if (confirm('Delete this recipe and its reviews?')) { await api(`/recipes/${id}`, { method: 'DELETE' }); nav('/'); } };

  return (
    <article className="recipe">
      <header>
        <h1>{r.title}</h1>
        <p className="lede">{r.description}</p>
        <p className="meta">By {r.author?.name} · Prep {r.prepMinutes} min · Cook {r.cookMinutes} min</p>
        <Stars value={r.ratingAvg} count={r.ratingCount} />
        {r.tags.length > 0 && <p>{r.tags.map(t => <span className="tag" key={t}>{t}</span>)}</p>}
        {isOwner && <p><Link className="btn ghost" to={`/recipes/${id}/edit`}>Edit</Link> <button className="btn ghost danger" onClick={removeRecipe}>Delete</button></p>}
      </header>

      <div className="cols">
        <section className="measure" aria-label="Ingredients">
          <div className="scaler">
            <span>Servings</span>
            <button aria-label="Fewer servings" onClick={() => setSv(String(Math.max(1, Math.ceil(n) - 1)))}>−</button>
            <input type="number" min="1" step="1" value={sv} onChange={e => setSv(e.target.value)} aria-label="Servings" />
            <button aria-label="More servings" onClick={() => setSv(String((Math.floor(n) || 0) + 1))}>+</button>
          </div>
          <p className="muted small">{valid ? (factor === 1 ? `As written, serves ${r.servings}` : `Scaled ×${Math.round(factor * 100) / 100} from ${r.servings}`) : 'Enter a number of servings'}
            {factor !== 1 && <> · <button className="link" onClick={() => setSv(String(r.servings))}>Reset</button></>}</p>
          <ul>
            {r.ingredients.map((i, k) => {
              const s = scaleIngredient(i, factor);
              return <li key={k}><span className="qty">{s.qty} {s.unit}</span><span>{i.name}{i.note && <em>, {i.note}</em>}</span></li>;
            })}
          </ul>
        </section>
        <section aria-label="Method">
          <ol className="steps">{r.steps.map((s, k) => <li key={k}>{s}</li>)}</ol>
        </section>
      </div>

      <section className="reviews">
        <h2>Reviews</h2>
        {user && !isOwner && (
          <form onSubmit={submit} className="panel">
            <strong>{mine ? 'Update your review' : 'Rate this recipe'}</strong>
            <StarInput value={rating} onChange={setRating} />
            <textarea rows="3" placeholder="What did you change? How did it turn out?" value={comment} onChange={e => setComment(e.target.value)} />
            <div><button className="btn" disabled={!rating}>{mine ? 'Save review' : 'Post review'}</button>
              {mine && <button type="button" className="link danger" onClick={removeReview}>Delete my review</button>}</div>
          </form>
        )}
        {!user && <p className="muted"><Link to="/login">Log in</Link> to rate and review.</p>}
        {!reviews.length && <p className="muted">No reviews yet.</p>}
        {reviews.map(v => (
          <div className="review" key={v._id}>
            <strong>{v.user?.name}</strong> <Stars value={v.rating} count={0} />
            {v.comment && <p>{v.comment}</p>}
          </div>
        ))}
      </section>
    </article>
  );
}
