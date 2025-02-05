import React from 'react';
import { Bot, User } from 'lucide-react';
import { Message } from '../types';

interface ChatMessageProps {
  message: Message;
}

export const ChatMessage: React.FC<ChatMessageProps> = ({ message }) => {
  const isBot = message.role === 'assistant';

  return (
    <div className={`flex gap-4 p-4 ${isBot ? 'dark:bg-slate-800/50 bg-emerald-50/50' : ''} transition-colors duration-200`}>
      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isBot ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-blue-100 dark:bg-blue-900/30'}`}>
        {isBot ? (
          <Bot size={20} className="text-emerald-600 dark:text-emerald-400" />
        ) : (
          <User size={20} className="text-blue-600 dark:text-blue-400" />
        )}
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
          {isBot ? 'Health Assistant' : 'You'}
        </p>
        <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{message.content}</p>
      </div>
    </div>
  );
};