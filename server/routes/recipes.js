import { Router } from 'express';
import mongoose from 'mongoose';
import Recipe, { UNITS } from '../models/Recipe.js';
import Review from '../models/Review.js';
import { auth, wrap, bad } from '../middleware/auth.js';
const r = Router();

function clean(b) {
  const ingredients = (b.ingredients || []).map(i => ({
    name: String(i.name || '').trim(), quantity: Number(i.quantity),
    unit: UNITS.includes(i.unit) ? i.unit : '', note: String(i.note || '').trim(),
  })).filter(i => i.name);
  if (!String(b.title || '').trim()) bad('Add a title');
  if (!(Number(b.servings) >= 1)) bad('Servings must be at least 1');
  if (!ingredients.length || ingredients.some(i => !(i.quantity >= 0))) bad('Every ingredient needs a name and a quantity');
  const steps = (b.steps || []).map(s => String(s).trim()).filter(Boolean);
  if (!steps.length) bad('Add at least one step');
  return {
    title: b.title.trim(), description: b.description || '', servings: Number(b.servings),
    prepMinutes: Number(b.prepMinutes) || 0, cookMinutes: Number(b.cookMinutes) || 0,
    tags: (b.tags || []).map(t => String(t).trim().toLowerCase()).filter(Boolean).slice(0, 8),
    ingredients, steps,
  };
}
async function recalc(id) {
  const [a] = await Review.aggregate([{ $match: { recipe: new mongoose.Types.ObjectId(id) } },
    { $group: { _id: null, avg: { $avg: '$rating' }, n: { $sum: 1 } } }]);
  await Recipe.findByIdAndUpdate(id, { ratingAvg: a ? Math.round(a.avg * 10) / 10 : 0, ratingCount: a?.n || 0 });
}
async function owned(req) {
  const rec = await Recipe.findById(req.params.id);
  if (!rec) bad('Recipe not found', 404);
  if (String(rec.author) !== req.userId) bad('Only the author can change this recipe', 403);
  return rec;
}

r.get('/', wrap(async (req, res) => {
  const { q, tag, author, sort = 'new' } = req.query;
  const page = Math.max(1, Number(req.query.page) || 1), limit = 12;
  const filter = {};

  const terms = String(q || '').split(',').map(t => t.trim().replace(/(es|s)$/i, '')).filter(Boolean);
if (terms.length) filter.$and = terms.map(t => {
  const rx = new RegExp(t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
  return { $or: [{ title: rx }, { 'ingredients.name': rx }] };
});

  if (tag) filter.tags = String(tag).toLowerCase();
  if (author) filter.author = author;
  const order = sort === 'top' ? { ratingAvg: -1, ratingCount: -1 } : { createdAt: -1 };
  const [items, total] = await Promise.all([
    Recipe.find(filter).sort(order).skip((page - 1) * limit).limit(limit).populate('author', 'name').select('-steps'),
    Recipe.countDocuments(filter)]);
  res.json({ items, total, pages: Math.ceil(total / limit), page });
}));
r.get('/:id', wrap(async (req, res) => {
  const rec = await Recipe.findById(req.params.id).populate('author', 'name');
  if (!rec) bad('Recipe not found', 404);
  res.json(rec);
}));
r.post('/', auth, wrap(async (req, res) => res.status(201).json(await Recipe.create({ ...clean(req.body), author: req.userId }))));
r.put('/:id', auth, wrap(async (req, res) => { const rec = await owned(req); Object.assign(rec, clean(req.body)); res.json(await rec.save()); }));
r.delete('/:id', auth, wrap(async (req, res) => {
  const rec = await owned(req);
  await Promise.all([rec.deleteOne(), Review.deleteMany({ recipe: rec._id })]);
  res.json({ ok: true });
}));

r.get('/:id/reviews', wrap(async (req, res) =>
  res.json(await Review.find({ recipe: req.params.id }).sort('-createdAt').populate('user', 'name'))));
r.post('/:id/reviews', auth, wrap(async (req, res) => {
  const rec = await Recipe.findById(req.params.id);
  if (!rec) bad('Recipe not found', 404);
  if (String(rec.author) === req.userId) bad("You can't review your own recipe", 403);
  const rating = Number(req.body.rating);
  if (!(rating >= 1 && rating <= 5)) bad('Pick a rating from 1 to 5');
  const rev = await Review.findOneAndUpdate({ recipe: rec._id, user: req.userId },
    { rating, comment: String(req.body.comment || '').slice(0, 2000) }, { upsert: true, new: true, setDefaultsOnInsert: true });
  await recalc(rec._id);
  res.status(201).json(rev);
}));
r.delete('/:id/reviews', auth, wrap(async (req, res) => {
  await Review.deleteOne({ recipe: req.params.id, user: req.userId });
  await recalc(req.params.id);
  res.json({ ok: true });
}));
export default r;
