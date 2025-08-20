import React from 'react';
import { Message, User } from '../../types';
import MessageItem from './MessageItem';

interface MessageListProps {
  messages: Message[];
  currentUser: User | null;
}

const MessageList: React.FC<MessageListProps> = ({ messages, currentUser }) => {
  if (messages.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <p className="text-gray-400">No messages yet. Start the conversation!</p>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-3 px-2">
      {messages.map((message, index) => (
        <MessageItem
          key={message.id}
          message={message}
          isOwnMessage={message.sender.id === currentUser?.id}
          showAvatar={
            index === 0 || 
            messages[index - 1].sender.id !== message.sender.id
          }
        />
      ))}
    </div>
  );
};

export default MessageList;