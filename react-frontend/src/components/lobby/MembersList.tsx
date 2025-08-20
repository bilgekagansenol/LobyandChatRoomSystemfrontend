import React, { useState } from 'react';
import { LobbyMembership } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import ModerationModal from '../moderation/ModerationModal';

interface MembersListProps {
  members: LobbyMembership[];
}

const MembersList: React.FC<MembersListProps> = ({ members }) => {
  const { user } = useAuth();
  const [selectedMember, setSelectedMember] = useState<LobbyMembership | null>(null);
  
  const userMembership = members.find(m => m.user.id === user?.id);
  const canModerate = userMembership?.role === 'owner' || userMembership?.role === 'moderator';

  const getRoleBadge = (role: string) => {
    const baseClasses = 'px-2 py-1 rounded text-xs font-medium';
    switch (role) {
      case 'owner':
        return `${baseClasses} bg-premium-500 text-white`;
      case 'moderator':
        return `${baseClasses} bg-primary-600 text-white`;
      default:
        return `${baseClasses} bg-gray-600 text-white`;
    }
  };

  const handleMemberClick = (member: LobbyMembership) => {
    if (canModerate && member.user.id !== user?.id) {
      setSelectedMember(member);
    }
  };

  return (
    <>
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-100 mb-4">
          Members ({members.length})
        </h3>
        
        <div className="space-y-2">
          {members.map((member) => (
            <div
              key={member.id}
              className={`flex items-center justify-between p-2 rounded ${
                canModerate && member.user.id !== user?.id
                  ? 'hover:bg-dark-800 cursor-pointer'
                  : ''
              }`}
              onClick={() => handleMemberClick(member)}
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {member.user.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="text-gray-100 font-medium">{member.user.username}</p>
                  {member.user.is_premium && (
                    <span className="text-xs text-premium-400">Premium</span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <span className={getRoleBadge(member.role)}>
                  {member.role.charAt(0).toUpperCase() + member.role.slice(1)}
                </span>
                {member.is_banned && (
                  <span className="px-2 py-1 bg-red-600 text-white rounded text-xs">
                    Banned
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
        
        {canModerate && (
          <div className="mt-4 p-2 bg-dark-900 rounded text-xs text-gray-400">
            Click on a member to access moderation options
          </div>
        )}
      </div>

      {selectedMember && (
        <ModerationModal
          member={selectedMember}
          onClose={() => setSelectedMember(null)}
        />
      )}
    </>
  );
};

export default MembersList;