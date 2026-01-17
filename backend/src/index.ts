import dotenv from 'dotenv';
import path from 'path';

// Load environment variables FIRST before any other imports
const envPath = path.join(process.cwd(), '.env');
console.log('📁 Loading .env from:', envPath);
dotenv.config({ path: envPath });
console.log('🔑 MONGODB_URI loaded:', process.env.MONGODB_URI ? 'Yes (Atlas)' : 'No (will use fallback)');

import express from 'express';
import { createServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';

import { connectDB } from './config/database.js';
import { initializeSocket } from './config/socket.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';

// Route imports
import authRoutes from './modules/auth/auth.routes.js';
import organizationRoutes from './modules/organization/organization.routes.js';
import employeeRoutes from './modules/employee/employee.routes.js';
import rbacRoutes from './modules/rbac/rbac.routes.js';
import attendanceRoutes from './modules/attendance/attendance.routes.js';
import correctionRoutes from './modules/attendance/correction.routes.js';
import leaveRoutes from './modules/leave/leave.routes.js';
import blockchainRoutes from './modules/blockchain/blockchain.routes.js';
import joinRequestRoutes from './modules/join-request/join-request.routes.js';
import transferRequestRoutes from './modules/transfer-request/transfer-request.routes.js';
import warningRoutes from './modules/warning/warning.routes.js';

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;

// Serve static files
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Security middleware
app.use(helmet());
app.use(cors({
    origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
    credentials: true,
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message: { error: 'Too many requests, please try again later.' },
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Logging - using 'dev' for concise output
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/organizations', organizationRoutes);
app.use('/api/employees', employeeRoutes);
app.use('/api/rbac', rbacRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/attendance/corrections', correctionRoutes);
app.use('/api/leave', leaveRoutes);
app.use('/api/blockchain', blockchainRoutes);
app.use('/api/join-requests', joinRequestRoutes);
app.use('/api/transfer-requests', transferRequestRoutes);
app.use('/api/warnings', warningRoutes);

// Error handling
app.use(notFound);
app.use(errorHandler);

// Connect to MongoDB and start server
connectDB().then(() => {
    // Initialize Socket.io
    initializeSocket(httpServer);

    httpServer.listen(PORT, () => {
        console.log(`🚀 EMS Backend running on http://localhost:${PORT}`);
        console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
}).catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
});

export default app;
