import React from 'react';
import { useLobby } from '../../contexts/LobbyContext';
import { useAuth } from '../../contexts/AuthContext';

const SearchAndFilter: React.FC = () => {
  const { searchQuery, filters, setSearchQuery, setFilters } = useLobby();
  const { user } = useAuth();

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handlePublicFilter = (value: boolean | null) => {
    setFilters({ is_public: value });
  };

  const handleStatusFilter = (value: string | null) => {
    setFilters({ status: value });
  };

  return (
    <div className="flex flex-col md-flex-row gap-4 items-center justify-between">
      <div className="flex flex-col md-flex-row gap-4 flex-1">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search lobbies..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="input-field w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <select
            value={filters.is_public === null ? '' : filters.is_public.toString()}
            onChange={(e) => handlePublicFilter(e.target.value === '' ? null : e.target.value === 'true')}
            className="input-field"
          >
            <option value="">All Lobbies</option>
            <option value="true">Public</option>
            <option value="false">Private</option>
          </select>
          
          <select
            value={filters.status || ''}
            onChange={(e) => handleStatusFilter(e.target.value || null)}
            className="input-field"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_game">In Game</option>
            <option value="closed">Closed</option>
          </select>
        </div>
      </div>
      
      {user?.is_premium && (
        <button
          onClick={() => alert('Create lobby modal to be implemented')}
          className="btn-premium"
        >
          Create Lobby
        </button>
      )}
    </div>
  );
};

export default SearchAndFilter;