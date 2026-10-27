import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../App.jsx';
import { UNITS, parseQty } from '../scale.js';

const blank = { title: '', description: '', servings: 4, prepMinutes: 0, cookMinutes: 0, tags: '',
  ingredients: [{ quantity: '', unit: 'g', name: '', note: '' }], steps: [''] };

export default function Editor() {
  const { id } = useParams(); const nav = useNavigate(); const { user } = useAuth();
  const [f, setF] = useState(blank); const [err, setErr] = useState('');
  useEffect(() => {
    if (id) api(`/recipes/${id}`).then(r => setF({ ...r, tags: r.tags.join(', ') })).catch(e => setErr(e.message));
  }, [id]);
  if (!user && !localStorage.getItem('token')) return <p className="muted">Log in to post a recipe.</p>;

  const set = k => e => setF({ ...f, [k]: e.target.value });
  const setIng = (i, k, v) => setF({ ...f, ingredients: f.ingredients.map((x, j) => j === i ? { ...x, [k]: v } : x) });
  const setStep = (i, v) => setF({ ...f, steps: f.steps.map((x, j) => j === i ? v : x) });

  const submit = async e => {
    e.preventDefault(); setErr('');
    const ingredients = f.ingredients.filter(i => i.name.trim()).map(i => ({ ...i, quantity: parseQty(i.quantity) }));
    if (ingredients.some(i => isNaN(i.quantity))) return setErr('Quantities must be numbers like 2, 0.5 or 1/2');
    try {
      const body = { ...f, ingredients, tags: f.tags.split(',') };
      const r = await api(id ? `/recipes/${id}` : '/recipes', { method: id ? 'PUT' : 'POST', body });
      nav(`/recipes/${r._id}`);
    } catch (x) { setErr(x.message); }
  };

  return (
    <form className="panel editor" onSubmit={submit}>
      <h1>{id ? 'Edit recipe' : 'Post a recipe'}</h1>
      <label>Title<input value={f.title} onChange={set('title')} required /></label>
      <label>Description<textarea rows="2" value={f.description} onChange={set('description')} /></label>
      <div className="row">
        <label>Serves<input type="number" min="1" value={f.servings} onChange={set('servings')} required /></label>
        <label>Prep (min)<input type="number" min="0" value={f.prepMinutes} onChange={set('prepMinutes')} /></label>
        <label>Cook (min)<input type="number" min="0" value={f.cookMinutes} onChange={set('cookMinutes')} /></label>
      </div>
      <label>Tags (comma separated)<input value={f.tags} onChange={set('tags')} placeholder="vegetarian, dinner" /></label>

      <fieldset>
        <legend>Ingredients <span className="muted small">for {f.servings || '…'} servings</span></legend>
        {f.ingredients.map((i, k) => (
          <div className="ing" key={k}>
            <input placeholder="Qty" aria-label="Quantity" value={i.quantity} onChange={e => setIng(k, 'quantity', e.target.value)} />
            <select aria-label="Unit" value={i.unit} onChange={e => setIng(k, 'unit', e.target.value)}>
              {UNITS.map(u => <option key={u} value={u}>{u || 'whole'}</option>)}
            </select>
            <input placeholder="Ingredient" aria-label="Ingredient" value={i.name} onChange={e => setIng(k, 'name', e.target.value)} />
            <input placeholder="Note (optional)" aria-label="Note" value={i.note} onChange={e => setIng(k, 'note', e.target.value)} />
            <button type="button" className="link danger" aria-label="Remove ingredient" onClick={() => setF({ ...f, ingredients: f.ingredients.filter((_, j) => j !== k) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn ghost" onClick={() => setF({ ...f, ingredients: [...f.ingredients, { quantity: '', unit: 'g', name: '', note: '' }] })}>Add ingredient</button>
      </fieldset>

      <fieldset>
        <legend>Method</legend>
        {f.steps.map((s, k) => (
          <div className="stepRow" key={k}>
            <textarea rows="2" aria-label={`Step ${k + 1}`} value={s} onChange={e => setStep(k, e.target.value)} />
            <button type="button" className="link danger" onClick={() => setF({ ...f, steps: f.steps.filter((_, j) => j !== k) })}>Remove</button>
          </div>
        ))}
        <button type="button" className="btn ghost" onClick={() => setF({ ...f, steps: [...f.steps, ''] })}>Add step</button>
      </fieldset>

      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn">{id ? 'Save changes' : 'Publish recipe'}</button>
    </form>
  );
}
