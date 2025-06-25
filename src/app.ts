import express from 'express';
import cors from 'cors';
import eventRoutes from './routes/event.routes'; 
import userRoutes from './routes/user.routes';
import categoryRoutes from './routes/category.routes'; 
import orderRoutes from './routes/order.routes'; 




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
app.use('/api/categories', categoryRoutes);
app.use('/api/orders', orderRoutes);

export default app;
