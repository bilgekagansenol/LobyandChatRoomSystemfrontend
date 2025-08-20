import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { 
  AuthResponse, 
  LoginData, 
  RegisterData, 
  User, 
  Lobby, 
  LobbyDetails, 
  CreateLobbyData, 
  Message 
} from '../types';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8001/api';

console.log('API_BASE_URL configured as:', API_BASE_URL);

class APIService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('access_token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const refreshToken = localStorage.getItem('refresh_token');
            if (refreshToken) {
              const response = await this.refreshToken(refreshToken);
              localStorage.setItem('access_token', response.data.access);
              return this.api(originalRequest);
            }
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }

        return Promise.reject(error);
      }
    );
  }

  // Authentication - Correct URLs from backend routing
  async register(data: RegisterData): Promise<AxiosResponse<{ user: User }>> {
    console.log('Making register API call');
    return this.api.post('/auth/register/', data);
  }

  async login(data: LoginData): Promise<AxiosResponse<AuthResponse>> {
    console.log('Making login API call');
    return this.api.post('/auth/login/', data);
  }

  async refreshToken(refreshToken: string): Promise<AxiosResponse<{ access: string }>> {
    console.log('Making refresh token API call');
    return this.api.post('/auth/refresh/', { refresh: refreshToken });
  }

  // User Profile
  async getCurrentUser(): Promise<AxiosResponse<User>> {
    return this.api.get('/me/');
  }

  async updateProfile(data: { email: string }): Promise<AxiosResponse<User>> {
    return this.api.patch('/me/', data);
  }

  // Lobby Management
  async getLobbies(params?: {
    search?: string;
    is_public?: boolean;
    status?: string;
  }): Promise<AxiosResponse<{ count: number; next: string | null; previous: string | null; results: Lobby[] }>> {
    return this.api.get('/lobbies/', { params });
  }

  async getLobbyDetails(lobbyId: number): Promise<AxiosResponse<LobbyDetails>> {
    return this.api.get(`/lobbies/${lobbyId}/`);
  }

  async createLobby(data: CreateLobbyData): Promise<AxiosResponse<Lobby>> {
    return this.api.post('/lobbies/', data);
  }

  async updateLobby(lobbyId: number, data: Partial<CreateLobbyData>): Promise<AxiosResponse<Lobby>> {
    return this.api.patch(`/lobbies/${lobbyId}/`, data);
  }

  // Lobby Actions
  async joinLobby(lobbyId: number): Promise<AxiosResponse<{ message: string; membership: { role: string; joined_at: string } }>> {
    return this.api.post(`/lobbies/${lobbyId}/join/`);
  }

  async leaveLobby(lobbyId: number): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/lobbies/${lobbyId}/leave/`);
  }

  async startGame(lobbyId: number): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/lobbies/${lobbyId}/start/`);
  }

  async closeLobby(lobbyId: number): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/lobbies/${lobbyId}/close/`);
  }

  // Moderation
  async kickUser(lobbyId: number, userId: number, reason: string): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/lobbies/${lobbyId}/kick/`, { user_id: userId, reason });
  }

  async banUser(lobbyId: number, userId: number, reason: string): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/lobbies/${lobbyId}/ban/`, { user_id: userId, reason });
  }

  async unbanUser(lobbyId: number, userId: number): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/lobbies/${lobbyId}/unban/`, { user_id: userId });
  }

  async addModerator(lobbyId: number, userId: number): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/lobbies/${lobbyId}/add_moderator/`, { user_id: userId });
  }

  async removeModerator(lobbyId: number, userId: number): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/lobbies/${lobbyId}/remove_moderator/`, { user_id: userId });
  }

  async transferOwnership(lobbyId: number, userId: number): Promise<AxiosResponse<{ message: string }>> {
    return this.api.post(`/lobbies/${lobbyId}/transfer_ownership/`, { user_id: userId });
  }

  // Messages - Backend uses nested ViewSet routing
  async getMessages(lobbyId: number, page?: number): Promise<AxiosResponse<{ count: number; next: string | null; previous: string | null; results: Message[] }>> {
    const params = page ? { page } : {};
    return this.api.get(`/lobbies/${lobbyId}/messages/`, { params });
  }

  async sendMessage(lobbyId: number, content: string): Promise<AxiosResponse<Message>> {
    console.log(`Sending message to lobby ${lobbyId}`);
    return this.api.post(`/lobbies/${lobbyId}/messages/`, { content });
  }

  async deleteMessage(lobbyId: number, messageId: number): Promise<AxiosResponse> {
    console.log(`Deleting message ${messageId} from lobby ${lobbyId}`);
    return this.api.delete(`/lobbies/${lobbyId}/messages/${messageId}/`);
  }
}

const apiService = new APIService();
export default apiService;