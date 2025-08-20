import React, { useState, useRef, useEffect } from 'react';
import { useChat } from '../../contexts/ChatContext';

interface MessageInputProps {
  lobbyId: number;
}

const MessageInput: React.FC<MessageInputProps> = ({ lobbyId }) => {
  const [message, setMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const { sendMessage, sendTypingIndicator } = useChat();
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setMessage(value);

    // Handle typing indicator
    if (value.trim() && !isTyping) {
      setIsTyping(true);
      sendTypingIndicator(true);
    } else if (!value.trim() && isTyping) {
      setIsTyping(false);
      sendTypingIndicator(false);
    }

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set new timeout to stop typing indicator
    if (value.trim()) {
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
        sendTypingIndicator(false);
      }, 2000);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const trimmedMessage = message.trim();
    if (!trimmedMessage) return;

    try {
      // Clear typing indicator
      if (isTyping) {
        setIsTyping(false);
        sendTypingIndicator(false);
      }

      await sendMessage(lobbyId, trimmedMessage);
      setMessage('');
      
      // Focus back to input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    // Cleanup typing timeout on unmount
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      if (isTyping) {
        sendTypingIndicator(false);
      }
    };
  }, [isTyping, sendTypingIndicator]);

  return (
    <form onSubmit={handleSubmit} className="flex space-x-2">
      <textarea
        ref={inputRef}
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        placeholder="Type a message... (Enter to send, Shift+Enter for new line)"
        disabled={false}
        className="input-field flex-1 resize-none min-h-10 max-h-32"
        rows={1}
        style={{
          height: 'auto',
          minHeight: '2.5rem',
        }}
        onInput={(e) => {
          const target = e.target as HTMLTextAreaElement;
          target.style.height = 'auto';
          target.style.height = `${Math.min(target.scrollHeight, 128)}px`;
        }}
      />
      
      <button
        type="submit"
        disabled={!message.trim()}
        className="btn-primary px-4 py-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Send
      </button>
    </form>
  );
};

export default MessageInput;