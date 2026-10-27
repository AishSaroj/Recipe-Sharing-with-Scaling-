import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';
import { useAuth } from '../App.jsx';

export default function Auth({ mode }) {
  const reg = mode === 'register';
  const { login } = useAuth(); const nav = useNavigate();
  const [f, setF] = useState({ name: '', email: '', password: '' }); const [err, setErr] = useState('');
  const set = k => e => setF({ ...f, [k]: e.target.value });
  const submit = async e => {
    e.preventDefault(); setErr('');
    try { login(await api(`/auth/${mode}`, { method: 'POST', body: f })); nav('/'); } catch (x) { setErr(x.message); }
  };
  return (
    <form className="panel narrow" onSubmit={submit}>
      <h1>{reg ? 'Create your account' : 'Welcome back'}</h1>
      {reg && <label>Name<input value={f.name} onChange={set('name')} autoComplete="name" required /></label>}
      <label>Email<input type="email" value={f.email} onChange={set('email')} autoComplete="email" required /></label>
      <label>Password<input type="password" value={f.password} onChange={set('password')} minLength={6} autoComplete={reg ? 'new-password' : 'current-password'} required /></label>
      {err && <p className="error" role="alert">{err}</p>}
      <button className="btn">{reg ? 'Sign up' : 'Log in'}</button>
      <p className="muted">{reg ? <>Have an account? <Link to="/login">Log in</Link></> : <>New here? <Link to="/register">Sign up</Link></>}</p>
    </form>
  );
}
