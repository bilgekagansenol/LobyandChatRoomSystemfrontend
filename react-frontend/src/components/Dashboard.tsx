import React, { useEffect } from 'react';
import { useLobby } from '../contexts/LobbyContext';
import Header from './common/Header';
import LobbyList from './lobby/LobbyList';
import CreateLobbyModal from './lobby/CreateLobbyModal';
import SearchAndFilter from './lobby/SearchAndFilter';

const Dashboard: React.FC = () => {
  const { loadLobbies } = useLobby();

  useEffect(() => {
    // Load lobbies when dashboard mounts (user is already authenticated at this point)
    loadLobbies().catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-dark-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-100 mb-4">Gaming Lobbies</h1>
          <SearchAndFilter />
        </div>
        
        <LobbyList />
        <CreateLobbyModal />
      </div>
    </div>
  );
};

export default Dashboard;