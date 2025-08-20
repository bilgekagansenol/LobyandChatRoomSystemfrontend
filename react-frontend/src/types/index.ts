export interface User {
  id: number;
  username: string;
  email: string;
  is_premium: boolean;
  created_at: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  access: string;
  refresh: string;
  user: User;
}

export interface RegisterData {
  username: string;
  email: string;
  password: string;
}

export interface LoginData {
  username: string;
  password: string;
}

export interface Lobby {
  id: number;
  name: string;
  owner: User;
  is_public: boolean;
  status: 'open' | 'in_game' | 'closed';
  max_participants: number;
  current_participants_count: number;
  created_at: string;
  updated_at: string;
}

export interface LobbyMembership {
  id: number;
  user: User;
  role: 'owner' | 'moderator' | 'member';
  joined_at: string;
  is_banned: boolean;
}

export interface Message {
  id: number;
  sender: User;
  content: string;
  created_at: string;
  is_deleted: boolean;
}

export interface LobbyDetails extends Lobby {
  participants?: LobbyMembership[];
}

export interface CreateLobbyData {
  name: string;
  is_public: boolean;
  max_participants: number;
}

export interface WebSocketMessage {
  type: 'chat_message' | 'user_joined' | 'user_left' | 'rate_limit_warning';
  message?: Message;
  user?: User;
  data?: any;
}

export interface APIError {
  message: string;
  status: number;
}