import mongoose from 'mongoose';
const s = new mongoose.Schema({
  recipe: { type: mongoose.Schema.Types.ObjectId, ref: 'Recipe', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, default: '', maxlength: 2000 },
}, { timestamps: true });
s.index({ recipe: 1, user: 1 }, { unique: true }); // one review per user per recipe
export default mongoose.model('Review', s);
