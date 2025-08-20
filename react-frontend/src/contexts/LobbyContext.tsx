import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { Lobby, LobbyDetails, CreateLobbyData } from '../types';
import apiService from '../services/api';

interface LobbyState {
  lobbies: Lobby[];
  currentLobby: LobbyDetails | null;
  loading: boolean;
  error: string | null;
  searchQuery: string;
  filters: {
    is_public: boolean | null;
    status: string | null;
  };
}

interface LobbyContextType extends LobbyState {
  loadLobbies: () => Promise<void>;
  loadLobbyDetails: (lobbyId: number) => Promise<void>;
  createLobby: (data: CreateLobbyData) => Promise<Lobby>;
  updateLobby: (lobbyId: number, data: Partial<CreateLobbyData>) => Promise<void>;
  joinLobby: (lobbyId: number) => Promise<void>;
  leaveLobby: (lobbyId: number) => Promise<void>;
  startGame: (lobbyId: number) => Promise<void>;
  closeLobby: (lobbyId: number) => Promise<void>;
  setSearchQuery: (query: string) => void;
  setFilters: (filters: Partial<LobbyState['filters']>) => void;
  clearError: () => void;
  clearCurrentLobby: () => void;
}

type LobbyAction = 
  | { type: 'LOAD_START' }
  | { type: 'LOAD_LOBBIES_SUCCESS'; payload: Lobby[] }
  | { type: 'LOAD_LOBBY_DETAILS_SUCCESS'; payload: LobbyDetails }
  | { type: 'CREATE_LOBBY_SUCCESS'; payload: Lobby }
  | { type: 'UPDATE_LOBBY_SUCCESS'; payload: Lobby }
  | { type: 'LOAD_FAILURE'; payload: string }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_FILTERS'; payload: Partial<LobbyState['filters']> }
  | { type: 'CLEAR_ERROR' }
  | { type: 'CLEAR_CURRENT_LOBBY' };

const initialState: LobbyState = {
  lobbies: [],
  currentLobby: null,
  loading: false,
  error: null,
  searchQuery: '',
  filters: {
    is_public: null,
    status: null,
  },
};

const lobbyReducer = (state: LobbyState, action: LobbyAction): LobbyState => {
  switch (action.type) {
    case 'LOAD_START':
      return {
        ...state,
        loading: true,
        error: null,
      };
    case 'LOAD_LOBBIES_SUCCESS':
      return {
        ...state,
        lobbies: action.payload,
        loading: false,
        error: null,
      };
    case 'LOAD_LOBBY_DETAILS_SUCCESS':
      return {
        ...state,
        currentLobby: action.payload,
        loading: false,
        error: null,
      };
    case 'CREATE_LOBBY_SUCCESS':
      return {
        ...state,
        lobbies: [action.payload, ...state.lobbies],
        loading: false,
        error: null,
      };
    case 'UPDATE_LOBBY_SUCCESS':
      return {
        ...state,
        lobbies: state.lobbies.map(lobby => 
          lobby.id === action.payload.id ? action.payload : lobby
        ),
        currentLobby: state.currentLobby?.id === action.payload.id 
          ? { ...state.currentLobby, ...action.payload }
          : state.currentLobby,
        loading: false,
        error: null,
      };
    case 'LOAD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
      };
    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload,
      };
    case 'SET_FILTERS':
      return {
        ...state,
        filters: {
          ...state.filters,
          ...action.payload,
        },
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null,
      };
    case 'CLEAR_CURRENT_LOBBY':
      return {
        ...state,
        currentLobby: null,
      };
    default:
      return state;
  }
};

const LobbyContext = createContext<LobbyContextType | undefined>(undefined);

interface LobbyProviderProps {
  children: ReactNode;
}

export const LobbyProvider: React.FC<LobbyProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(lobbyReducer, initialState);

  const loadLobbies = useCallback(async () => {
    try {
      dispatch({ type: 'LOAD_START' });
      const params = {
        search: state.searchQuery || undefined,
        is_public: state.filters.is_public ?? undefined,
        status: state.filters.status || undefined,
      };
      const response = await apiService.getLobbies(params);
      dispatch({ type: 'LOAD_LOBBIES_SUCCESS', payload: response.data.results });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load lobbies';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
    }
  }, [state.searchQuery, state.filters.is_public, state.filters.status]);

  const loadLobbyDetails = useCallback(async (lobbyId: number) => {
    try {
      dispatch({ type: 'LOAD_START' });
      const response = await apiService.getLobbyDetails(lobbyId);
      console.log('Lobby details response:', response.data); // Debug log
      console.log('Available fields:', Object.keys(response.data)); // Debug fields
      dispatch({ type: 'LOAD_LOBBY_DETAILS_SUCCESS', payload: response.data });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to load lobby details';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
    }
  }, []);

  const createLobby = async (data: CreateLobbyData): Promise<Lobby> => {
    try {
      dispatch({ type: 'LOAD_START' });
      const response = await apiService.createLobby(data);
      dispatch({ type: 'CREATE_LOBBY_SUCCESS', payload: response.data });
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to create lobby';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const updateLobby = async (lobbyId: number, data: Partial<CreateLobbyData>) => {
    try {
      dispatch({ type: 'LOAD_START' });
      const response = await apiService.updateLobby(lobbyId, data);
      dispatch({ type: 'UPDATE_LOBBY_SUCCESS', payload: response.data });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to update lobby';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const joinLobby = async (lobbyId: number) => {
    try {
      await apiService.joinLobby(lobbyId);
      await loadLobbyDetails(lobbyId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to join lobby';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const leaveLobby = async (lobbyId: number) => {
    try {
      await apiService.leaveLobby(lobbyId);
      dispatch({ type: 'CLEAR_CURRENT_LOBBY' });
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to leave lobby';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const startGame = async (lobbyId: number) => {
    try {
      await apiService.startGame(lobbyId);
      await loadLobbyDetails(lobbyId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to start game';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const closeLobby = async (lobbyId: number) => {
    try {
      await apiService.closeLobby(lobbyId);
      await loadLobbyDetails(lobbyId);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to close lobby';
      dispatch({ type: 'LOAD_FAILURE', payload: errorMessage });
      throw error;
    }
  };

  const setSearchQuery = (query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  };

  const setFilters = (filters: Partial<LobbyState['filters']>) => {
    dispatch({ type: 'SET_FILTERS', payload: filters });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const clearCurrentLobby = () => {
    dispatch({ type: 'CLEAR_CURRENT_LOBBY' });
  };

  // Temporarily disable auto-reload to prevent infinite loops
  // Auto-reload lobbies when search query or filters change - but only if we have lobbies loaded already
  // useEffect(() => {
  //   if (state.lobbies.length > 0) {
  //     loadLobbies().catch(console.error);
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [state.searchQuery, state.filters.is_public, state.filters.status]);

  return (
    <LobbyContext.Provider
      value={{
        ...state,
        loadLobbies,
        loadLobbyDetails,
        createLobby,
        updateLobby,
        joinLobby,
        leaveLobby,
        startGame,
        closeLobby,
        setSearchQuery,
        setFilters,
        clearError,
        clearCurrentLobby,
      }}
    >
      {children}
    </LobbyContext.Provider>
  );
};

export const useLobby = () => {
  const context = useContext(LobbyContext);
  if (context === undefined) {
    throw new Error('useLobby must be used within a LobbyProvider');
  }
  return context;
};