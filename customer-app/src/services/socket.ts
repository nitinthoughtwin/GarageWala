import { io } from 'socket.io-client';

const BACKEND_URL = 'http://localhost:5000';

export class SocketService {
  /**
   * Connects to backend Socket.io server using verified JWT token for authentication handshake.
   */
  static connect(token: string): any {
    console.log('[Socket] Connecting to production socket gateway...');
    
    return io(BACKEND_URL, {
      auth: {
        token: `Bearer ${token}`,
      },
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
    });
  }
}
