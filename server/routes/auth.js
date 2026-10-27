import { Router } from 'express';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { auth, sign, wrap, bad } from '../middleware/auth.js';
const r = Router();
const pub = u => ({ id: u._id, name: u.name, email: u.email });

r.post('/register', wrap(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name?.trim() || !email?.includes('@') || (password || '').length < 6) bad('Enter a name, a valid email and a password of 6+ characters');
  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10) });
  res.status(201).json({ token: sign(user), user: pub(user) });
}));
r.post('/login', wrap(async (req, res) => {
  const user = await User.findOne({ email: String(req.body.email || '').toLowerCase() });
  if (!user || !(await bcrypt.compare(req.body.password || '', user.password))) bad('Email or password is wrong', 401);
  res.json({ token: sign(user), user: pub(user) });
}));
r.get('/me', auth, wrap(async (req, res) => res.json(pub(await User.findById(req.userId)))));
export default r;
