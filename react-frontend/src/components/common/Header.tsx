import React from 'react';
import { useAuth } from '../../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <header className="bg-dark-800 border-b border-gray-700 px-4 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold text-gray-100">Gaming Lobby</h1>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="text-right">
              <p className="text-gray-100 font-medium">{user?.username}</p>
              {user?.is_premium && (
                <span className="text-xs bg-premium-500 text-white px-2 py-1 rounded">
                  Premium
                </span>
              )}
            </div>
            <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
              <span className="text-white font-medium">
                {user?.username?.charAt(0).toUpperCase()}
              </span>
            </div>
          </div>
          
          <button
            onClick={handleLogout}
            className="btn-secondary text-sm px-3 py-1"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;