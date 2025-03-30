import { io, Socket } from 'socket.io-client';
import { Platform } from 'react-native';

// Get server URL from environment variables
const envSocketUrl = process.env.EXPO_PUBLIC_SOCKET_URL;
console.log('Socket server URL:', envSocketUrl);

export type Session = {
  name: string;
  hostId: string;
  state: 'white' | 'black';
  sessionId?: string;
};

class SocketService {
  private socket: Socket | null = null;
  private static instance: SocketService;

  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public connect(): void {
    if (!this.socket) {
      this.socket = io(envSocketUrl);
      console.log('Socket connection initialized');
      
      // Setup connection event to request session list
      const socket = this.socket; // Store reference to avoid null check issues
      socket.on('connect', () => {
        console.log('Socket connected, requesting session list');
        socket.emit('getSessionList');
      });
    }
  }

  public disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      console.log('Socket disconnected');
    }
  }

  public createSession(sessionName: string, callback: (session: { sessionId: string, name: string }) => void): void {
    if (this.socket) {
      this.socket.emit('createSession', sessionName);
      this.socket.once('sessionCreated', callback);
    }
  }

  public deleteSession(sessionId: string): void {
    if (this.socket) {
      this.socket.emit('deleteSession', sessionId);
    }
  }

  public joinSession(sessionId: string): void {
    if (this.socket) {
      this.socket.emit('joinSession', sessionId);
    }
  }

  public toggleLight(sessionId: string, state: 'white' | 'black'): void {
    if (this.socket) {
      this.socket.emit('toggleLight', { sessionId, state });
    }
  }

  public requestSessionList(): void {
    if (this.socket) {
      this.socket.emit('getSessionList');
    }
  }

  public onSessionList(callback: (sessions: Session[]) => void) {
    if (this.socket) {
      const r = this.socket.on('sessionList', callback);
      return () => {
        r.removeListener('sessionList', callback);
      }
    }
    return () => {}
  }

  public onUpdateState(callback: (state: 'white' | 'black') => void) {
    if (this.socket) {
      const r = this.socket.on('updateState', callback);
      return () => {
        r.removeListener('updateState', callback);
      }
    }
    return () => {}
  }

  public removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  public getSocket(): Socket | null {
    return this.socket;
  }
}

export default SocketService.getInstance(); 