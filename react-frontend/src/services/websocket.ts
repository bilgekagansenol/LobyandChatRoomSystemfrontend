import io from 'socket.io-client';
import { WebSocketMessage } from '../types';

const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'http://localhost:8001';

class WebSocketService {
  private socket: any = null;
  private currentLobbyId: number | null = null;

  connect(lobbyId: number, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.currentLobbyId === lobbyId) {
        resolve();
        return;
      }

      this.disconnect();

      // Django Channels WebSocket URL format
      this.socket = io(WS_BASE_URL, {
        path: `/ws/lobby/${lobbyId}/`,
        auth: {
          token
        },
        transports: ['websocket', 'polling'],
        forceNew: true,
        timeout: 10000
      });

      this.socket.on('connect', () => {
        this.currentLobbyId = lobbyId;
        console.log('WebSocket connected to lobby:', lobbyId);
        resolve();
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', () => {
        console.log('WebSocket disconnected');
        this.currentLobbyId = null;
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.currentLobbyId = null;
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  off(event: string, callback?: (data: any) => void): void {
    if (this.socket) {
      this.socket.off(event, callback);
    }
  }

  emit(event: string, data: any): void {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Specific event handlers
  onNewMessage(callback: (message: any) => void): void {
    this.on('message.new', callback);
  }

  onUserJoined(callback: (user: any) => void): void {
    this.on('user.joined', callback);
  }

  onUserLeft(callback: (user: any) => void): void {
    this.on('user.left', callback);
  }

  onUserKicked(callback: (data: any) => void): void {
    this.on('user.kicked', callback);
  }

  onUserBanned(callback: (data: any) => void): void {
    this.on('user.banned', callback);
  }

  onGameStarted(callback: (data: any) => void): void {
    this.on('game.started', callback);
  }

  onLobbyClosed(callback: (data: any) => void): void {
    this.on('lobby.closed', callback);
  }

  onUserTyping(callback: (data: any) => void): void {
    this.on('user.typing', callback);
  }

  // Emit events
  sendMessage(content: string): void {
    this.emit('message.send', { content });
  }

  sendTyping(isTyping: boolean): void {
    this.emit('user.typing', { typing: isTyping });
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  getCurrentLobbyId(): number | null {
    return this.currentLobbyId;
  }
}

export default new WebSocketService();