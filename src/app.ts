import express from 'express';
import cors from 'cors';
import eventRoutes from './routes/event.routes'; // ✅ update path if needed
import userRoutes from './routes/user.routes';




const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.send('✅ Pyop Backend App is running');
});

app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);

export default app;
