import express from 'express';
import router from './routes/userRouter.js';

const app = express();
app.use(express.json());
app.use('/api/users', router);