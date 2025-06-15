import express from 'express';
import cors from 'cors';
import eventRoutes from './routes/event.routes'; // ✅ update path if needed


const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Health check
app.get('/', (_req, res) => {
  res.send('✅ Pyop Backend App is running');
});

app.use('/api/events', eventRoutes);
// Add your routes here
// app.use('/api/events', eventRoutes);

export default app;
