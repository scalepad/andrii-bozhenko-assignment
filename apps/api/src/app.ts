import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { loadUser } from './auth.js';
import { errorHandler } from './http.js';
import { authRouter } from './routes/auth.js';
import { listingsRouter } from './routes/listings.js';
import { cartRouter } from './routes/cart.js';
import { ordersRouter } from './routes/orders.js';

export const app = express();
app.use(cors({ origin: process.env.WEB_ORIGIN ?? 'http://localhost:5173', credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());
app.use(loadUser);
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', ordersRouter);
app.use((_req, res) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Route not found' } })
);
app.use(errorHandler);
