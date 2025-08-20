// Mock WebSocket service for testing without Django Channels
class MockWebSocketService {
  private currentLobbyId: number | null = null;
  private eventHandlers: Map<string, ((data: any) => void)[]> = new Map();
  private connected = false;

  connect(lobbyId: number, token: string): Promise<void> {
    return new Promise((resolve) => {
      console.log('Mock WebSocket: Connecting to lobby:', lobbyId);
      this.currentLobbyId = lobbyId;
      this.connected = true;
      
      // Simulate connection success after 1 second
      setTimeout(() => {
        console.log('Mock WebSocket: Connected successfully');
        resolve();
      }, 1000);
    });
  }

  disconnect(): void {
    console.log('Mock WebSocket: Disconnecting');
    this.currentLobbyId = null;
    this.connected = false;
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
    console.log('Mock WebSocket: Emitting event:', event, data);
    // Mock: Don't actually send anything, just log
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
    console.log('Mock WebSocket: Sending message:', content);
    // Mock: Could simulate receiving the message back
    setTimeout(() => {
      const handlers = this.eventHandlers.get('message.new');
      if (handlers) {
        const mockMessage = {
          id: Date.now(),
          sender: { id: 1, username: 'You', is_premium: false },
          content,
          created_at: new Date().toISOString(),
          is_deleted: false
        };
        handlers.forEach(handler => handler(mockMessage));
      }
    }, 100);
  }

  sendTyping(isTyping: boolean): void {
    console.log('Mock WebSocket: Typing indicator:', isTyping);
  }

  isConnected(): boolean {
    return this.connected;
  }

  getCurrentLobbyId(): number | null {
    return this.currentLobbyId;
  }
}

const mockWebSocketService = new MockWebSocketService();
export default mockWebSocketService;