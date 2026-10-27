import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import authRoutes from './routes/auth.js';
import recipeRoutes from './routes/recipes.js';

const app = express();
app.use(cors());
app.use(express.json({ limit: '200kb' }));
app.use('/api/auth', authRoutes);
app.use('/api/recipes', recipeRoutes);
app.use((err, req, res, next) => {
  const status = err.name === 'CastError' ? 404 : err.code === 11000 ? 409 : err.status || 500;
  res.status(status).json({ error: err.code === 11000 ? 'Already exists' : err.message });
});

await mongoose.connect(process.env.MONGO_URI);
app.listen(process.env.PORT || 5000, () => console.log('API ready'));
