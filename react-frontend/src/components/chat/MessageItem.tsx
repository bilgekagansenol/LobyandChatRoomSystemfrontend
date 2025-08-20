import React, { useState } from 'react';
import { Message } from '../../types';
import { useChat } from '../../contexts/ChatContext';

interface MessageItemProps {
  message: Message;
  isOwnMessage: boolean;
  showAvatar: boolean;
}

const MessageItem: React.FC<MessageItemProps> = ({ message, isOwnMessage, showAvatar }) => {
  const { deleteMessage } = useChat();
  const [showActions, setShowActions] = useState(false);

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleDeleteMessage = async () => {
    if (window.confirm('Are you sure you want to delete this message?')) {
      try {
        // Extract lobby ID from current URL or context
        const lobbyId = parseInt(window.location.pathname.split('/').pop() || '0');
        await deleteMessage(lobbyId, message.id);
      } catch (error) {
        console.error('Failed to delete message:', error);
      }
    }
  };

  if (message.is_deleted) {
    return (
      <div className="flex items-center text-gray-500 text-sm italic">
        <span>Message deleted</span>
      </div>
    );
  }

  return (
    <div 
      className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'} group`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className={`flex max-w-xs lg:max-w-md ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'}`}>
        {showAvatar && (
          <div className={`w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center flex-shrink-0 ${
            isOwnMessage ? 'ml-2' : 'mr-2'
          }`}>
            <span className="text-white text-sm font-medium">
              {message.sender.username.charAt(0).toUpperCase()}
            </span>
          </div>
        )}
        
        <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
          {showAvatar && (
            <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <span className="text-sm font-medium text-gray-100">
                {message.sender.username}
              </span>
              {message.sender.is_premium && (
                <span className="text-xs bg-premium-500 text-white px-1 rounded">Premium</span>
              )}
              <span className="text-xs text-gray-400">{formatTime(message.created_at)}</span>
            </div>
          )}
          
          <div className={`relative px-4 py-2 rounded-lg ${
            isOwnMessage 
              ? 'bg-primary-600 text-white' 
              : 'bg-gray-700 text-gray-100'
          }`}>
            <p className="break-words">{message.content}</p>
            
            {showActions && isOwnMessage && (
              <button
                onClick={handleDeleteMessage}
                className="absolute -top-2 -right-2 w-6 h-6 bg-red-600 text-white rounded-full text-xs hover:bg-red-700 opacity-0 group-hover-opacity-100 transition-colors"
              >
                ×
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageItem;