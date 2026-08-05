import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import movieRoutes from './routes/movies.js';
dotenv.config();
const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000' }));
app.use(express.json());
// Load our movie routes endpoint
app.use('/api/movies', movieRoutes);
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Video Backend Server running securely on port ${PORT}`);
});
//# sourceMappingURL=server.js.map