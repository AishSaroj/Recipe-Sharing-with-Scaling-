import jwt from 'jsonwebtoken';
export const sign = u => jwt.sign({ id: u._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
export function auth(req, res, next) {
  try {
    req.userId = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET).id;
    next();
  } catch { res.status(401).json({ error: 'Log in to continue' }); }
}
export const wrap = fn => (req, res, next) => fn(req, res, next).catch(next);
export const bad = (msg, status = 400) => { const e = new Error(msg); e.status = status; throw e; };
