import React, { useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';
import { useAuth } from '../../contexts/AuthContext';
import { useLobby } from '../../contexts/LobbyContext';
import MessageList from './MessageList';
import MessageInput from './MessageInput';
import LoadingSpinner from '../common/LoadingSpinner';

interface ChatWindowProps {
  lobbyId: number;
}

const ChatWindow: React.FC<ChatWindowProps> = ({ lobbyId }) => {
  const { messages, loading, error, typingUsers, isConnected } = useChat();
  const { user } = useAuth();
  const { currentLobby } = useLobby();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (!isConnected && loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <LoadingSpinner size="lg" text="Loading chat..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="card text-center max-w-md">
          <h3 className="text-lg font-semibold text-red-400 mb-2">Chat Error</h3>
          <p className="text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="card flex-1 flex flex-col">
        <div className="border-b border-gray-700 pb-4 mb-4">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold text-gray-100">Chat</h2>
            <div className="flex items-center space-x-4 text-sm text-gray-400">
              <span>{currentLobby?.current_participants_count || 0} online</span>
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-yellow-500'}`} />
            </div>
          </div>
          
          {typingUsers.length > 0 && (
            <div className="text-sm text-gray-400 mt-2">
              {typingUsers.map(u => u.username).join(', ')} 
              {typingUsers.length === 1 ? ' is' : ' are'} typing...
            </div>
          )}
        </div>

        <div className="flex-1 overflow-hidden">
          <MessageList messages={messages} currentUser={user} />
          <div ref={messagesEndRef} />
        </div>
        
        <div className="mt-4 pt-4 border-t border-gray-700 flex-shrink-0">
          <MessageInput lobbyId={lobbyId} />
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;