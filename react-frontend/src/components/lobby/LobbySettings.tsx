import React, { useState } from 'react';
import { useLobby } from '../../contexts/LobbyContext';
import { useAuth } from '../../contexts/AuthContext';

const LobbySettings: React.FC = () => {
  const { currentLobby, updateLobby, startGame, closeLobby } = useLobby();
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: currentLobby?.name || '',
    max_participants: currentLobby?.max_participants || 10,
  });

  const userMembership = currentLobby?.participants?.find(m => m.user.id === user?.id);
  const isOwner = userMembership?.role === 'owner';

  if (!currentLobby || !isOwner) {
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'max_participants' ? parseInt(value, 10) : value,
    }));
  };

  const handleSave = async () => {
    try {
      await updateLobby(currentLobby.id, formData);
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update lobby:', error);
    }
  };

  const handleStartGame = async () => {
    try {
      await startGame(currentLobby.id);
    } catch (error) {
      console.error('Failed to start game:', error);
    }
  };

  const handleCloseLobby = async () => {
    if (window.confirm('Are you sure you want to close this lobby?')) {
      try {
        await closeLobby(currentLobby.id);
      } catch (error) {
        console.error('Failed to close lobby:', error);
      }
    }
  };

  return (
    <div className="card mb-4">
      <h3 className="text-lg font-semibold text-gray-100 mb-4">Lobby Settings</h3>
      
      {isEditing ? (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Lobby Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              className="input-field w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Max Participants
            </label>
            <select
              name="max_participants"
              value={formData.max_participants}
              onChange={handleInputChange}
              className="input-field w-full"
            >
              {[2, 4, 6, 8, 10, 12, 16, 20].map(num => (
                <option key={num} value={num}>{num} players</option>
              ))}
            </select>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="btn-primary flex-1"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <button
            onClick={() => setIsEditing(true)}
            className="btn-secondary w-full"
          >
            Edit Settings
          </button>
          
          {currentLobby.status === 'open' && (
            <button
              onClick={handleStartGame}
              className="btn-primary w-full"
            >
              Start Game
            </button>
          )}
          
          <button
            onClick={handleCloseLobby}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg w-full transition-colors"
          >
            Close Lobby
          </button>
        </div>
      )}
    </div>
  );
};

export default LobbySettings;