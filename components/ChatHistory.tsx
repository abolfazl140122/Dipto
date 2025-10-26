import React, { useRef, useEffect } from 'react';
import type { Message } from '../types';
import { Author } from '../types';
import ChatMessage from './ChatMessage';
import BotIcon from './icons/BotIcon';
import BrainIcon from './icons/BrainIcon';

interface ChatHistoryProps {
  messages: Message[];
  isLoading: boolean;
  isThinking?: boolean;
}

const ChatHistory: React.FC<ChatHistoryProps> = ({ messages, isLoading, isThinking }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  return (
    <div ref={scrollRef} className="flex-grow overflow-y-auto p-4 sm:p-6 space-y-6">
      {messages.map((msg, index) => (
        <ChatMessage key={index} message={msg} />
      ))}
      {isLoading && messages[messages.length - 1]?.author === Author.USER && (
        isThinking ? (
            <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <BotIcon />
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg text-gray-400 text-sm">
                    <BrainIcon />
                    <span>در حال تفکر عمیق...</span>
                </div>
            </div>
        ) : (
            <div className="flex items-start gap-3 animate-pulse">
                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center flex-shrink-0">
                    <BotIcon />
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-150"></div>
                </div>
            </div>
        )
      )}
    </div>
  );
};

export default ChatHistory;