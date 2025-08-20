import React from 'react';
import { useLobby } from '../../contexts/LobbyContext';
import LoadingSpinner from '../common/LoadingSpinner';
import LobbyCard from './LobbyCard';

const LobbyList: React.FC = () => {
  const { lobbies, loading, error } = useLobby();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" text="Loading lobbies..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="card text-center">
        <h3 className="text-lg font-semibold text-red-400 mb-2">Error</h3>
        <p className="text-gray-400">{error}</p>
      </div>
    );
  }

  if (lobbies.length === 0) {
    return (
      <div className="card text-center">
        <h3 className="text-lg font-semibold text-gray-100 mb-2">No Lobbies Found</h3>
        <p className="text-gray-400">No lobbies match your search criteria.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md-grid-cols-2 lg-grid-cols-3 gap-6">
      {lobbies.map((lobby) => (
        <LobbyCard key={lobby.id} lobby={lobby} />
      ))}
    </div>
  );
};

export default LobbyList;