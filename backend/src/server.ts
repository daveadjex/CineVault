import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; // 1. Added auth import link 
import movieRoutes from './routes/movies.js';

dotenv.config();

const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());

// Load Mount Endpoints Routes
app.use('/api/auth', authRoutes);     // 2. Added secure account routing node block
app.use('/api/movies', movieRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 CineVault Backend Server running securely on port ${PORT}`);
});
