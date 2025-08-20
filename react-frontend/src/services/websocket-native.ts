class NativeWebSocketService {
  private socket: WebSocket | null = null;
  private currentLobbyId: number | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private eventHandlers: Map<string, ((data: any) => void)[]> = new Map();

  connect(lobbyId: number, token: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.socket && this.socket.readyState === WebSocket.OPEN && this.currentLobbyId === lobbyId) {
        resolve();
        return;
      }

      this.disconnect();

      // Test different WebSocket URL formats for Django Channels
      const possibleUrls = [
        `ws://localhost:8001/ws/lobby/${lobbyId}/`,
        `ws://localhost:8001/ws/chat/${lobbyId}/`,
        `ws://localhost:8001/lobby/${lobbyId}/`,
        `ws://localhost:8001/chat/${lobbyId}/`
      ];
      
      console.log('Attempting WebSocket connection to lobby:', lobbyId);
      console.log('Trying URLs:', possibleUrls);
      
      // Try the first URL for now
      const wsUrl = possibleUrls[0];
      console.log('WebSocket URL:', wsUrl);
      
      try {
        this.socket = new WebSocket(wsUrl);
        
        this.socket.onopen = () => {
          console.log('WebSocket connected to lobby:', lobbyId);
          this.currentLobbyId = lobbyId;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.socket.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            this.handleMessage(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        this.socket.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.currentLobbyId = null;
          
          if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
            setTimeout(() => {
              this.reconnectAttempts++;
              this.connect(lobbyId, token);
            }, 2000 * this.reconnectAttempts);
          }
        };

        this.socket.onerror = (error) => {
          console.error('WebSocket error:', error);
          console.error('Failed to connect to:', wsUrl);
          console.error('Make sure Django Channels is properly configured');
          reject(new Error(`WebSocket connection failed to ${wsUrl}`));
        };

      } catch (error) {
        reject(error);
      }
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.close(1000, 'Client disconnect');
      this.socket = null;
      this.currentLobbyId = null;
    }
  }

  private handleMessage(data: any): void {
    const { type, ...payload } = data;
    const handlers = this.eventHandlers.get(type);
    if (handlers) {
      handlers.forEach(handler => handler(payload));
    }
  }

  on(event: string, callback: (data: any) => void): void {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event)!.push(callback);
  }

  off(event: string, callback?: (data: any) => void): void {
    if (!callback) {
      this.eventHandlers.delete(event);
      return;
    }
    
    const handlers = this.eventHandlers.get(event);
    if (handlers) {
      const index = handlers.indexOf(callback);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }

  emit(event: string, data: any): void {
    if (this.socket && this.socket.readyState === WebSocket.OPEN) {
      const message = JSON.stringify({ type: event, ...data });
      this.socket.send(message);
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
    return this.socket?.readyState === WebSocket.OPEN;
  }

  getCurrentLobbyId(): number | null {
    return this.currentLobbyId;
  }
}

export default new NativeWebSocketService();