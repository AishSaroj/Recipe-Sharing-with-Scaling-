import { createContext, useContext, useEffect, useState } from 'react';
import { Link, Route, Routes, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import Home from './pages/Home.jsx';
import Recipe from './pages/Recipe.jsx';
import Editor from './pages/Editor.jsx';
import Auth from './pages/Auth.jsx';

const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

export default function App() {
  const [user, setUser] = useState(null);
  const nav = useNavigate();
  useEffect(() => { if (localStorage.getItem('token')) api('/auth/me').then(setUser).catch(() => localStorage.removeItem('token')); }, []);
  const login = ({ token, user }) => { localStorage.setItem('token', token); setUser(user); };
  const logout = () => { localStorage.removeItem('token'); setUser(null); nav('/'); };
  return (
    <AuthCtx.Provider value={{ user, login }}>
      <header className="top">
        <Link to="/" className="brand">Recipes</Link>
        <nav>
          {user ? <><Link to="/new" className="btn">Post a recipe</Link><span className="muted">{user.name}</span><button className="link" onClick={logout}>Log out</button></>
                : <><Link to="/login">Log in</Link><Link to="/register" className="btn">Sign up</Link></>}
        </nav>
      </header>
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/recipes/:id" element={<Recipe />} />
          <Route path="/new" element={<Editor />} />
          <Route path="/recipes/:id/edit" element={<Editor />} />
          <Route path="/login" element={<Auth mode="login" />} />
          <Route path="/register" element={<Auth mode="register" />} />
        </Routes>
      </main>
    </AuthCtx.Provider>
  );
}
