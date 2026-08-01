import { io, Socket } from 'socket.io-client';

class SocketService {
  public socket: Socket | null = null;

  connect() {
    const userStr = localStorage.getItem('user');
    if (!userStr) return;
    
    let token = '';
    try {
      const user = JSON.parse(userStr);
      // Retrieve the token from wherever it is stored
      token = localStorage.getItem('token') || user.token || '';
    } catch(e) {}

    if (!token) return;

    if (this.socket) {
      this.socket.disconnect();
    }

    this.socket = io('http://localhost:3000', {
      auth: {
        token: token
      }
    });

    this.socket.on('connect', () => {
      console.log('Connected to socket server:', this.socket?.id);
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from socket server');
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  on(event: string, callback: (data: any) => void) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

const socketService = new SocketService();
export default socketService;
