import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables from root first, then local if available
dotenv.config({ path: path.join(__dirname, '../../.env') });
dotenv.config();

import authRoutes from './routes/authRoutes';
import orderRoutes from './routes/orderRoutes';
import providerRoutes from './routes/providerRoutes';
import pricingRoutes from './routes/pricingRoutes';
import ratingRoutes from './routes/ratingRoutes';
import { initializeSocketEvents } from './socket/socketHandler';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE'],
  },
});

const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/providers', providerRoutes);
app.use('/api/pricing', pricingRoutes);
app.use('/api/ratings', ratingRoutes);

// Health Check API
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Seed API trigger for testing from the simulator dashboard
import prisma from './prismaClient';
if (process.env.NODE_ENV !== 'production') {
app.post('/api/debug/reset', async (_req, res) => {
  try {
    // Dynamically trigger seed content for direct manual simulator reset
    console.log('[Debug] Resetting database to seed state...');
    await prisma.providerEarning.deleteMany({});
    await prisma.rating.deleteMany({});
    await prisma.order.deleteMany({});
    await prisma.provider.deleteMany({});
    await prisma.user.deleteMany({});

    // Seed defaults
    const user1 = await prisma.user.create({
      data: {
        name: 'Rohan Sharma',
        phone: '9876543210',
        email: 'rohan@example.com',
      },
    });

    await prisma.user.create({
      data: {
        name: 'Priya Patel',
        phone: '9876543211',
        email: 'priya@example.com',
      },
    });

    const p1 = await prisma.provider.create({
      data: {
        name: 'Ramesh Puncture Wala',
        phone: '8888888881',
        aadharNumber: '123456789012',
        vehicleType: 'BIKE',
        skills: ['PUNCTURE', 'SPARK_PLUG', 'CHAIN', 'BRAKE_WIRE'],
        isVerified: true,
        isOnline: true,
        currentLat: 19.0760,
        currentLng: 72.8777,
        rating: 4.8,
        profilePhotoUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=150&h=150&q=80',
      },
    });

    await prisma.provider.create({
      data: {
        name: 'Suresh Battery Expert',
        phone: '8888888882',
        aadharNumber: '223456789012',
        vehicleType: 'BIKE',
        skills: ['BATTERY', 'NOT_STARTING', 'BULB'],
        isVerified: true,
        isOnline: true,
        currentLat: 19.0820,
        currentLng: 72.8820,
        rating: 4.9,
        profilePhotoUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&h=150&q=80',
      },
    });

    res.json({ message: 'Database reset and seeded successfully!', user: user1, provider: p1 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});
}

// Initialize Socket.io events
initializeSocketEvents(io);

// Start server
server.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`   ROADASSIST BACKEND RUNNING ON PORT ${PORT} `);
  console.log(`=========================================`);
});
