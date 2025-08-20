import React, { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLobby } from '../../contexts/LobbyContext';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import Header from '../common/Header';
import LoadingSpinner from '../common/LoadingSpinner';
import ChatWindow from '../chat/ChatWindow';
import MembersList from './MembersList';
import LobbySettings from './LobbySettings';

const LobbyDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { currentLobby, loading, error, loadLobbyDetails, leaveLobby } = useLobby();
  const { connectToLobby, disconnectFromLobby } = useChat();
  const { user } = useAuth();
  
  const lobbyId = parseInt(id || '0', 10);

  useEffect(() => {
    if (lobbyId) {
      loadLobbyDetails(lobbyId);
      connectToLobby(lobbyId).catch(console.error);
    }

    return () => {
      disconnectFromLobby();
    };
  }, [lobbyId, loadLobbyDetails, connectToLobby, disconnectFromLobby]);

  const handleLeaveLobby = async () => {
    try {
      await leaveLobby(lobbyId);
      navigate('/dashboard');
    } catch (error) {
      console.error('Failed to leave lobby:', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header />
        <div className="flex justify-center items-center py-20">
          <LoadingSpinner size="lg" text="Loading lobby..." />
        </div>
      </div>
    );
  }

  if (error || !currentLobby) {
    return (
      <div className="min-h-screen bg-dark-900">
        <Header />
        <div className="container mx-auto px-4 py-8">
          <div className="card text-center">
            <h2 className="text-xl font-bold text-red-400 mb-4">Error</h2>
            <p className="text-gray-400 mb-4">
              {error || 'Lobby not found'}
            </p>
            <button
              onClick={() => navigate('/dashboard')}
              className="btn-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  const userMembership = currentLobby.participants?.find(m => m.user.id === user?.id);
  const isOwner = userMembership?.role === 'owner';
  const isModerator = userMembership?.role === 'moderator';

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col">
      <Header />
      
      <div className="flex-1 flex flex-col lg-flex-row">
        <div className="lg-w-quarter p-4">
          <div className="card mb-4">
            <div className="flex justify-between items-start mb-4">
              <h1 className="text-xl font-bold text-gray-100">{currentLobby.name}</h1>
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                currentLobby.status === 'open' ? 'bg-green-600 text-white' :
                currentLobby.status === 'in_game' ? 'bg-yellow-600 text-white' :
                'bg-red-600 text-white'
              }`}>
                {currentLobby.status.replace('_', ' ').toUpperCase()}
              </span>
            </div>
            
            <div className="space-y-2 text-sm text-gray-400 mb-4">
              <div className="flex justify-between">
                <span>Owner:</span>
                <span className="text-gray-100">{currentLobby.owner.username}</span>
              </div>
              <div className="flex justify-between">
                <span>Players:</span>
                <span className="text-gray-100">
                  {currentLobby.current_participants_count}/{currentLobby.max_participants}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Type:</span>
                <span className="text-gray-100">
                  {currentLobby.is_public ? 'Public' : 'Private'}
                </span>
              </div>
            </div>

            <div className="flex gap-2">
              {!isOwner && (
                <button
                  onClick={handleLeaveLobby}
                  className="btn-secondary flex-1"
                >
                  Leave Lobby
                </button>
              )}
              <button
                onClick={() => navigate('/dashboard')}
                className="btn-secondary flex-1"
              >
                Back
              </button>
            </div>
          </div>

          {(isOwner || isModerator) && <LobbySettings />}
          <MembersList members={currentLobby.participants || []} />
        </div>

        <div className="lg-w-three-quarter flex flex-col">
          <ChatWindow lobbyId={lobbyId} />
        </div>
      </div>
    </div>
  );
};

export default LobbyDetails;