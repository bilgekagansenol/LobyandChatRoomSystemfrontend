import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLobby } from '../../contexts/LobbyContext';

const CreateLobbyModal: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    is_public: true,
    max_participants: 10,
  });
  const { user } = useAuth();
  const { createLobby, loading } = useLobby();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : 
              name === 'max_participants' ? parseInt(value, 10) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createLobby(formData);
      setIsOpen(false);
      setFormData({ name: '', is_public: true, max_participants: 10 });
    } catch (error) {
      console.error('Failed to create lobby:', error);
    }
  };

  if (!user?.is_premium) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-8 right-8 btn-premium rounded-full w-16 h-16 text-2xl shadow-lg"
      >
        +
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="card w-full max-w-md">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-100">Create New Lobby</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-100 text-2xl"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-2">
                  Lobby Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input-field w-full"
                  placeholder="Enter lobby name"
                />
              </div>

              <div>
                <label htmlFor="max_participants" className="block text-sm font-medium text-gray-300 mb-2">
                  Max Participants
                </label>
                <select
                  id="max_participants"
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

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_public"
                  name="is_public"
                  checked={formData.is_public}
                  onChange={handleInputChange}
                  className="mr-2"
                />
                <label htmlFor="is_public" className="text-sm text-gray-300">
                  Make lobby public
                </label>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-premium flex-1 disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Lobby'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateLobbyModal;