import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../store/authStore';

let socket: Socket | null = null;

/**
 * Initialize Socket.io client connection with auth token
 */
export function connectSocket(): Socket | null {
    const token = useAuthStore.getState().accessToken;

    if (!token) {
        console.warn('No auth token available for socket connection');
        return null;
    }

    if (socket?.connected) {
        return socket;
    }

    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const backendUrl = isLocalhost
        ? window.location.origin
        : 'https://ems-backend-q0vm.onrender.com';

    socket = io(backendUrl, {
        auth: { token },
        transports: ['websocket', 'polling'],
    });

    socket.on('connect', () => {
        console.log('🔌 Socket connected');
    });

    socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
    });

    socket.on('connect_error', (error) => {
        console.error('Socket connection error:', error.message);
    });

    return socket;
}

/**
 * Disconnect socket
 */
export function disconnectSocket(): void {
    if (socket) {
        socket.disconnect();
        socket = null;
    }
}

/**
 * Get current socket instance
 */
export function getSocket(): Socket | null {
    return socket;
}

/**
 * Subscribe to join request events
 */
export function onJoinRequestUpdate(
    onApproved: (data: { requestId: string; userId: string }) => void,
    onRejected: (data: { requestId: string }) => void,
    onNew?: (data: any) => void
): () => void {
    const sock = socket || connectSocket();

    if (!sock) {
        return () => { };
    }

    sock.on('joinRequest:approved', onApproved);
    sock.on('joinRequest:rejected', onRejected);
    if (onNew) {
        sock.on('joinRequest:new', onNew);
    }

    // Return cleanup function
    return () => {
        sock.off('joinRequest:approved', onApproved);
        sock.off('joinRequest:rejected', onRejected);
        if (onNew) {
            sock.off('joinRequest:new', onNew);
        }
    };
}
