/**
 * AdGenius Backend Server
 * 
 * Main Express server that orchestrates:
 * - User authentication
 * - Image uploads via Cloudinary
 * - AI Engine API proxying
 * - Project/Brand management via MongoDB
 */

import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import { v2 as cloudinary } from 'cloudinary';

// Route imports
import uploadRoutes from './routes/upload.js';
import aiRoutes from './routes/ai.js';
import projectRoutes from './routes/projects.js';
import brandRoutes from './routes/brands.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ============================================
// MIDDLEWARE
// ============================================

app.use(cors());
app.use(express.json({ limit: '50mb' }));

// ============================================
// DATABASE CONNECTION
// ============================================

const connectDB = async () => {
    try {
        if (process.env.MONGODB_URI) {
            await mongoose.connect(process.env.MONGODB_URI);
            console.log('📦 MongoDB connected');
        } else {
            console.log('⚠️  MongoDB URI not configured - running without database');
        }
    } catch (error) {
        console.error('MongoDB connection error:', error);
    }
};

// ============================================
// CLOUDINARY CONFIGURATION
// ============================================

if (process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
    console.log('☁️  Cloudinary configured');
}

// ============================================
// ROUTES
// ============================================

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        service: 'AdGenius Backend',
        version: '1.0.0',
        timestamp: new Date().toISOString()
    });
});

// API Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/brands', brandRoutes);

// ============================================
// ERROR HANDLING
// ============================================

app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({
        error: 'Internal server error',
        message: err.message
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Endpoint not found' });
});

// ============================================
// START SERVER
// ============================================

const startServer = async () => {
    await connectDB();

    app.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 AdGenius Backend                                     ║
║   Running on http://localhost:${PORT}                        ║
║                                                           ║
║   Routes:                                                 ║
║   • /api/upload    - Image upload & processing            ║
║   • /api/ai        - AI generation endpoints              ║
║   • /api/projects  - Project management                   ║
║   • /api/brands    - Brand guidelines                     ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
    `);
    });
};

startServer();

export default app;
