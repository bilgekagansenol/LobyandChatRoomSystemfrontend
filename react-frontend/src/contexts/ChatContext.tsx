import React, { createContext, useContext, useReducer, useEffect, useCallback, ReactNode } from 'react';
import { Message, User } from '../types';
import apiService from '../services/api';
import websocketService from '../services/websocket-chat';
import { useAuth } from './AuthContext';

interface ChatState {
  messages: Message[];
  loading: boolean;
  error: string | null;
  onlineUsers: User[];
  typingUsers: User[];
  isConnected: boolean;
}

interface ChatContextType extends ChatState {
  loadMessages: (lobbyId: number) => Promise<void>;
  sendMessage: (lobbyId: number, content: string) => Promise<void>;
  deleteMessage: (lobbyId: number, messageId: number) => Promise<void>;
  connectToLobby: (lobbyId: number) => Promise<void>;
  disconnectFromLobby: () => void;
  sendTypingIndicator: (isTyping: boolean) => void;
  clearMessages: () => void;
  clearError: () => void;
}

type ChatAction = 
  | { type: 'LOAD_START' }
  | { type: 'LOAD_MESSAGES_SUCCESS'; payload: Message[] }
  | { type: 'ADD_MESSAGE'; payload: Message }
  | { type: 'DELETE_MESSAGE'; payload: number }
  | { type: 'LOAD_FAILURE'; payload: string }
  | { type: 'SET_ONLINE_USERS'; payload: User[] }
  | { type: 'ADD_TYPING_USER'; payload: User }
  | { type: 'REMOVE_TYPING_USER'; payload: number }
  | { type: 'SET_CONNECTED'; payload: boolean }
  | { type: 'CLEAR_MESSAGES' }
  | { type: 'CLEAR_ERROR' };

const initialState: ChatState = {
  messages: [],
  loading: false,
  error: null,
  onlineUsers: [],
  typingUsers: [],
  isConnected: false,
};

const chatReducer = (state: ChatState, action: ChatAction): ChatState => {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOAD_MESSAGES_SUCCESS':
      return {
        ...state,
        messages: action.payload,
        loading: false,
        error: null,
      };
    case 'ADD_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.payload],
      };
    case 'DELETE_MESSAGE':
      return {
        ...state,
        messages: state.messages.map(msg => 
          msg.id === action.payload ? { ...msg, is_deleted: true } : msg
        ),
      };
    case 'LOAD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'SET_ONLINE_USERS':
      return {
        ...state,
        onlineUsers: action.payload,
      };
    case 'ADD_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.find(u => u.id === action.payload.id) 
          ? state.typingUsers 
          : [...state.typingUsers, action.payload],
      };
    case 'REMOVE_TYPING_USER':
      return {
        ...state,
        typingUsers: state.typingUsers.filter(u => u.id !== action.payload),
      };
    case 'SET_CONNECTED':
      return {
        ...state,
        isConnected: action.payload,
      };
    case 'CLEAR_MESSAGES':
      return {
        ...state,
        messages: [],
        onlineUsers: [],
        typingUsers: [],
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    default:
      return state;
  }
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

interface ChatProviderProps {
  children: ReactNode;
}

export const ChatProvider: React.FC<ChatProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { user } = useAuth();

  useEffect(() => {
    const handleMessage = (data: any) => {
      switch (data.type) {
        case 'chat_message':
          if (data.message) {
            dispatch({ type: 'ADD_MESSAGE', payload: data.message });
          }
          break;
        case 'user_joined':
          if (data.user) {
            dispatch({ type: 'SET_ONLINE_USERS', payload: [...state.onlineUsers, data.user] });
          }
          break;
        case 'user_left':
          if (data.user) {
            dispatch({ type: 'SET_ONLINE_USERS', payload: state.onlineUsers.filter(u => u.id !== data.user.id) });
            dispatch({ type: 'REMOVE_TYPING_USER', payload: data.user.id });
          }
          break;
        case 'rate_limit_warning':
          dispatch({ type: 'LOAD_FAILURE', payload: 'Rate limit exceeded. Please slow down!' });
          break;
        default:
          console.warn('Unknown WebSocket message type:', data.type);
      }
    };

    // Only set up WebSocket handler once
    websocketService.onMessage(handleMessage);
  }, []); // Remove dependency to prevent re-setup

  const loadMessages = useCallback(async (lobbyId: number) => {
    try {
      dispatch({ type: 'LOAD_START' });
      const response = await apiService.getMessages(lobbyId);
      dispatch({ type: 'LOAD_MESSAGES_SUCCESS', payload: response.data.results });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load messages';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
    }
  }, []);

  const sendMessage = useCallback(async (lobbyId: number, content: string) => {
    try {
      // Always use REST API since WebSocket is not configured
      const response = await apiService.sendMessage(lobbyId, content);
      // Add the message to the chat immediately
      dispatch({ type: 'ADD_MESSAGE', payload: response.data });
      // Also reload messages to make sure we have the latest
      await loadMessages(lobbyId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Failed to send message';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  }, [loadMessages]);

  const deleteMessage = async (lobbyId: number, messageId: number) => {
    try {
      await apiService.deleteMessage(lobbyId, messageId);
      dispatch({ type: 'DELETE_MESSAGE', payload: messageId });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to delete message';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const connectToLobby = useCallback(async (lobbyId: number) => {
    try {
      // Temporarily disable WebSocket connection until backend WebSocket is configured
      console.log('WebSocket connection disabled - using REST API only');
      dispatch({ type: 'SET_CONNECTED', payload: false });
      await loadMessages(lobbyId);
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to load chat';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  }, [loadMessages]);

  const disconnectFromLobby = useCallback(() => {
    websocketService.disconnect();
    dispatch({ type: 'SET_CONNECTED', payload: false });
    dispatch({ type: 'CLEAR_MESSAGES' });
  }, []);

  const sendTypingIndicator = (isTyping: boolean) => {
    // Note: Typing indicators not implemented in backend WebSocket yet
    // websocketService.sendTyping(isTyping);
  };

  const clearMessages = () => {
    dispatch({ type: 'CLEAR_MESSAGES' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <ChatContext.Provider
      value={{
        ...state,
        loadMessages,
        sendMessage,
        deleteMessage,
        connectToLobby,
        disconnectFromLobby,
        sendTypingIndicator,
        clearMessages,
        clearError,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};