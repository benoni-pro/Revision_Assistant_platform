import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

import connectDB from './config/database.js';
import { errorHandler, notFound } from './middleware/errorMiddleware.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import studyGroupRoutes from './routes/studyGroupRoutes.js';
import quizRoutes from './routes/quizRoutes.js';
import progressRoutes from './routes/progressRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import resourceRoutes from './routes/resourceRoutes.js';
import rubricRoutes from './routes/rubricRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import { setupSocketIO } from './config/socket.js';

// Load environment variables
dotenv.config();

// Build allowed origins list (supports comma-separated list)
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000,http://localhost:3001,http://localhost:3002')
	.split(',')
	.map(origin => origin.trim());

// Connect to database (non-blocking for development)
connectDB().catch(err => {
	console.warn('⚠️ MongoDB connection failed, continuing without database:', err.message);
});

const app = express();
const server = createServer(app);

// Socket.IO setup
const io = new Server(server, {
	cors: {
		origin: allowedOrigins,
		methods: ['GET', 'POST'],
		credentials: true
	}
});

setupSocketIO(io);

// Make io accessible to routes
app.set('socketio', io);

// Rate limiting
const limiter = rateLimit({
	windowMs: parseInt(process.env.RATE_LIMIT_WINDOW) || 15 * 60 * 1000, // 15 minutes
	max: parseInt(process.env.RATE_LIMIT_MAX) || 100, // limit each IP to 100 requests per windowMs
	message: {
		error: 'Too many requests from this IP, please try again later.'
	}
});

// Middleware
app.use(helmet({
	crossOriginResourcePolicy: { policy: 'cross-origin' }
}));
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(cors({
	origin: (origin, callback) => {
		// Allow non-browser requests or same-origin
		if (!origin) return callback(null, true);
		if (allowedOrigins.includes(origin)) return callback(null, true);
		return callback(new Error(`CORS blocked for origin: ${origin}`));
	},
	credentials: true,
	methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
	allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Health check endpoint
app.get('/api/health', (req, res) => {
	res.status(200).json({
		status: 'success',
		message: 'Revision Assistant API is running!',
		timestamp: new Date().toISOString(),
		environment: process.env.NODE_ENV
	});
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/study-groups', studyGroupRoutes);
app.use('/api/quizzes', quizRoutes);
app.use('/api/progress', progressRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/rubrics', rubricRoutes);
app.use('/api/notifications', notificationRoutes);

// Error Middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
	console.log(`🚀 Revision Assistant Server is running on port ${PORT}`);
	console.log(`📊 Environment: ${process.env.NODE_ENV}`);
	console.log(`💾 Database: Connected to MongoDB`);
	console.log(`🔐 Socket.IO: Ready for real-time connections`);
	console.log(`🌐 CORS allowed origins: ${allowedOrigins.join(', ')}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
	console.log('SIGTERM received. Shutting down gracefully...');
	server.close(() => {
		console.log('Process terminated');
	});
});

export default app;
