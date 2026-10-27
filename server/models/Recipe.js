import mongoose from 'mongoose';
export const UNITS = ['', 'g', 'kg', 'ml', 'l', 'tsp', 'tbsp', 'cup', 'oz', 'lb', 'pinch'];
const ingredient = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  quantity: { type: Number, required: true, min: 0 },   // amount for the recipe's base servings
  unit: { type: String, enum: UNITS, default: '' },
  note: { type: String, default: '', trim: true },        // e.g. "finely chopped"
}, { _id: false });
export default mongoose.model('Recipe', new mongoose.Schema({
  title: { type: String, required: true, trim: true, maxlength: 120 },
  description: { type: String, default: '', maxlength: 1000 },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  servings: { type: Number, required: true, min: 1, max: 1000 },
  prepMinutes: { type: Number, default: 0, min: 0 },
  cookMinutes: { type: Number, default: 0, min: 0 },
  tags: [String],
  ingredients: { type: [ingredient], validate: v => v.length > 0 },
  steps: { type: [String], validate: v => v.length > 0 },
  ratingAvg: { type: Number, default: 0 },
  ratingCount: { type: Number, default: 0 },
}, { timestamps: true }));
