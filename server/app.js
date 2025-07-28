import express from 'express';
import cors from 'cors';
import { db } from './config/database.js';
import authRouter from './routes/authRouter.js';
import cartRouter from './routes/cartRouter.js';
import contactRouter from './routes/contactRouter.js';
import ordersRouter from './routes/ordersRouter.js'; // ADD THIS LINE

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRouter);
app.use('/api/cart', cartRouter);
app.use('/api/contact', contactRouter);
app.use('/api/orders', ordersRouter); // ADD THIS LINE

// Test route
app.get('/', (req, res) => {
  res.json({ message: 'Coffee Shop API is running!' });
});

const PORT = process.env.PORT || 5001;

// Database connection and server start
db.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
    return db.sync({ alter: true });
  })
  .then(() => {
    console.log('✅ Database synced');
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
  });

export default app;