import React, { useState } from 'react';
import { LobbyMembership } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { useLobby } from '../../contexts/LobbyContext';
import apiService from '../../services/api';

interface ModerationModalProps {
  member: LobbyMembership;
  onClose: () => void;
}

const ModerationModal: React.FC<ModerationModalProps> = ({ member, onClose }) => {
  const [action, setAction] = useState<'kick' | 'ban' | 'unban' | 'promote' | 'demote' | 'transfer' | ''>('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { currentLobby, loadLobbyDetails } = useLobby();

  if (!currentLobby) return null;

  const userMembership = currentLobby.participants?.find(m => m.user.id === user?.id);
  const isOwner = userMembership?.role === 'owner';
  const isModerator = userMembership?.role === 'moderator';

  const canKick = (isOwner || isModerator) && member.role !== 'owner';
  const canBan = (isOwner || isModerator) && member.role !== 'owner';
  const canPromote = isOwner && member.role === 'member';
  const canDemote = isOwner && member.role === 'moderator';
  const canTransfer = isOwner && member.role !== 'owner';
  const canUnban = (isOwner || isModerator) && member.is_banned;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!action || loading) return;

    setLoading(true);
    try {
      switch (action) {
        case 'kick':
          await apiService.kickUser(currentLobby.id, member.user.id, reason);
          break;
        case 'ban':
          await apiService.banUser(currentLobby.id, member.user.id, reason);
          break;
        case 'unban':
          await apiService.unbanUser(currentLobby.id, member.user.id);
          break;
        case 'promote':
          await apiService.addModerator(currentLobby.id, member.user.id);
          break;
        case 'demote':
          await apiService.removeModerator(currentLobby.id, member.user.id);
          break;
        case 'transfer':
          if (window.confirm(`Are you sure you want to transfer ownership to ${member.user.username}? This action cannot be undone.`)) {
            await apiService.transferOwnership(currentLobby.id, member.user.id);
          } else {
            setLoading(false);
            return;
          }
          break;
      }

      // Reload lobby details to reflect changes
      await loadLobbyDetails(currentLobby.id);
      onClose();
    } catch (error: any) {
      console.error('Moderation action failed:', error);
      alert(error.response?.data?.detail || error.response?.data?.message || 'Action failed');
    } finally {
      setLoading(false);
    }
  };

  const getActionDescription = () => {
    switch (action) {
      case 'kick':
        return 'Remove user from lobby temporarily';
      case 'ban':
        return 'Remove user from lobby permanently';
      case 'unban':
        return 'Allow banned user to rejoin';
      case 'promote':
        return 'Give user moderator privileges';
      case 'demote':
        return 'Remove moderator privileges';
      case 'transfer':
        return 'Transfer lobby ownership to this user';
      default:
        return '';
    }
  };

  const requiresReason = action === 'kick' || action === 'ban';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="card w-full max-w-md">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-gray-100">
            Moderate User: {member.user.username}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-100 text-2xl"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Select Action
            </label>
            <select
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
              className="input-field w-full"
              required
            >
              <option value="">Choose an action...</option>
              {canKick && !member.is_banned && <option value="kick">Kick User</option>}
              {canBan && !member.is_banned && <option value="ban">Ban User</option>}
              {canUnban && <option value="unban">Unban User</option>}
              {canPromote && <option value="promote">Promote to Moderator</option>}
              {canDemote && <option value="demote">Remove Moderator</option>}
              {canTransfer && <option value="transfer">Transfer Ownership</option>}
            </select>
            {action && (
              <p className="text-sm text-gray-400 mt-1">{getActionDescription()}</p>
            )}
          </div>

          {requiresReason && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Reason {action === 'kick' || action === 'ban' ? '(required)' : '(optional)'}
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="input-field w-full"
                rows={3}
                placeholder="Enter reason for this action..."
                required={requiresReason}
              />
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !action || (requiresReason && !reason.trim())}
              className="btn-primary flex-1 disabled:opacity-50"
            >
              {loading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </form>

        <div className="mt-4 p-3 bg-yellow-600 bg-opacity-20 border border-yellow-600 rounded">
          <p className="text-yellow-200 text-sm">
            <strong>Warning:</strong> Moderation actions are logged and may be irreversible. 
            Use responsibly.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ModerationModal;