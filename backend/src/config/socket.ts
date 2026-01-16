import { Server as HttpServer } from 'http';
import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';

let io: Server | null = null;

interface AuthenticatedSocket extends Socket {
    userId?: string;
    organizationId?: string;
}

interface JwtPayload {
    userId: string;
    organizationId?: string;
}

/**
 * Initialize Socket.io server with JWT authentication
 */
export function initializeSocket(httpServer: HttpServer): Server {
    io = new Server(httpServer, {
        cors: {
            origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
            credentials: true,
        },
    });

    // Authentication middleware
    io.use((socket: AuthenticatedSocket, next) => {
        const token = socket.handshake.auth.token;

        if (!token) {
            return next(new Error('Authentication required'));
        }

        try {
            const decoded = jwt.verify(
                token,
                process.env.JWT_ACCESS_SECRET || 'access-secret'
            ) as JwtPayload;

            socket.userId = decoded.userId;
            socket.organizationId = decoded.organizationId;
            next();
        } catch (error) {
            next(new Error('Invalid token'));
        }
    });

    // Connection handling
    io.on('connection', (socket: AuthenticatedSocket) => {
        console.log(`🔌 User connected: ${socket.userId}`);

        // Join organization room for scoped broadcasts
        if (socket.organizationId) {
            socket.join(`org:${socket.organizationId}`);
            console.log(`   Joined room: org:${socket.organizationId}`);
        }

        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.userId}`);
        });
    });

    console.log('🔌 Socket.io initialized');
    return io;
}

/**
 * Get the Socket.io server instance
 */
export function getIO(): Server | null {
    return io;
}

/**
 * Emit event to all users in an organization
 */
export function emitToOrganization(organizationId: string, event: string, data: any): void {
    if (io) {
        io.to(`org:${organizationId}`).emit(event, data);
    }
}
