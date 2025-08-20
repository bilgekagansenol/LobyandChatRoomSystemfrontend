import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Lobby } from '../../types';
import { useLobby } from '../../contexts/LobbyContext';

interface LobbyCardProps {
  lobby: Lobby;
}

const LobbyCard: React.FC<LobbyCardProps> = ({ lobby }) => {
  const navigate = useNavigate();
  const { joinLobby } = useLobby();


  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    switch (status) {
      case 'open':
        return `${baseClasses} bg-green-600 text-white`;
      case 'in_game':
        return `${baseClasses} bg-yellow-600 text-white`;
      case 'closed':
        return `${baseClasses} bg-red-600 text-white`;
      default:
        return `${baseClasses} bg-gray-600 text-white`;
    }
  };

  const handleJoinClick = async () => {
    try {
      console.log('Attempting to join lobby:', lobby.id);
      await joinLobby(lobby.id);
      console.log('Successfully joined lobby:', lobby.id);
      navigate(`/lobby/${lobby.id}`);
    } catch (error: any) {
      console.error('Failed to join lobby:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status
      });
      alert(`Failed to join lobby: ${error.response?.data?.message || error.message}`);
    }
  };

  const handleViewClick = () => {
    navigate(`/lobby/${lobby.id}`);
  };

  return (
    <div className="card hover:border-primary-500 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-semibold text-gray-100 truncate">{lobby.name}</h3>
        <span className={getStatusBadge(lobby.status)}>
          {lobby.status.replace('_', ' ').toUpperCase()}
        </span>
      </div>
      
      <div className="space-y-2 mb-4 text-sm text-gray-400">
        <div className="flex justify-between">
          <span>Owner:</span>
          <span className="text-gray-100">{lobby.owner.username}</span>
        </div>
        
        <div className="flex justify-between">
          <span>Players:</span>
          <span className="text-gray-100">
            {lobby.current_participants_count}/{lobby.max_participants}
          </span>
        </div>
        
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="text-gray-100">
            {lobby.is_public ? 'Public' : 'Private'}
          </span>
        </div>
      </div>
      
      <div className="flex gap-2">
        {lobby.status === 'open' && (
          <button
            onClick={handleJoinClick}
            className="btn-primary flex-1"
          >
            Join
          </button>
        )}
        <button
          onClick={handleViewClick}
          className="btn-secondary flex-1"
        >
          View
        </button>
      </div>
    </div>
  );
};

export default LobbyCard;