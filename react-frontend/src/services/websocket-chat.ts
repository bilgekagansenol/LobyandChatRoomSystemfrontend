import { WebSocketMessage } from '../types';

const WS_BASE_URL = process.env.REACT_APP_WS_URL || 'ws://127.0.0.1:8001';

class ChatWebSocketService {
  private socket: WebSocket | null = null;
  private currentLobbyId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;

  connect(lobbyId: number, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.currentLobbyId === lobbyId) {
        resolve();
        return;
      }

      this.disconnect();

      const wsUrl = `${WS_BASE_URL}/ws/chat/${lobbyId}/?token=${token}`;
      this.socket = new WebSocket(wsUrl);
      this.currentLobbyId = lobbyId;

      this.socket.onopen = () => {
        console.log('WebSocket connected to lobby:', lobbyId);
        this.reconnectAttempts = 0;
        resolve();
      };

      this.socket.onerror = (error) => {
        console.error('WebSocket connection error:', error);
        reject(error);
      };

      this.socket.onclose = (event) => {
        console.log('WebSocket closed:', event.code, event.reason);
        this.currentLobbyId = null;
        
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          setTimeout(() => {
            this.reconnectAttempts++;
            this.connect(lobbyId, token);
          }, this.reconnectDelay * this.reconnectAttempts);
        }
      };
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Normal closure');
      this.socket = null;
      this.currentLobbyId = null;
      this.reconnectAttempts = 0;
    }
  }

  onMessage(callback: (data: WebSocketMessage) => void): void {
    if (this.socket) {
      this.socket.onmessage = (event) => {
        try {
          const data: WebSocketMessage = JSON.parse(event.data);
          callback(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
    }
  }

  sendMessage(content: string): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = {
        type: 'chat_message',
        message: content
      };
      this.socket.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket is not connected');
    }
  }

  isConnected(): boolean {
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getCurrentLobbyId(): number | null {
    return this.currentLobbyId;
  }
}

const chatWebSocketService = new ChatWebSocketService();
export default chatWebSocketService;