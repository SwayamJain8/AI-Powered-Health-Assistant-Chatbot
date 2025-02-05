import React, { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { Heart, Sun, Moon } from 'lucide-react';
import { ChatMessage } from './components/ChatMessage';
import { ChatInput } from './components/ChatInput';
import { ChatState, Message } from './types';
import { GEMINI_API_KEY, HEALTH_CONTEXT } from './config';
import { useTheme } from './context/ThemeContext';

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

function App() {
  const { isDark, toggleTheme } = useTheme();
  const [chatState, setChatState] = useState<ChatState>({
    messages: [],
    isLoading: false,
  });

  const handleSendMessage = async (content: string) => {
    const userMessage: Message = { role: 'user', content };
    
    setChatState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage],
      isLoading: true,
    }));

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const chat = model.startChat({
        history: [],
        generationConfig: {
          maxOutputTokens: 250, // Limiting response length
        },
      });

      const result = await chat.sendMessage(HEALTH_CONTEXT + '\n\n' + content);
      const response = await result.response;
      
      // Create initial bot message
      setChatState(prev => ({
        ...prev,
        messages: [...prev.messages, { role: 'assistant', content: '' }],
      }));

      // Stream the response
      const text = response.text();
      let streamedContent = '';
      for (let i = 0; i < text.length; i++) {
        streamedContent += text[i];
        setChatState(prev => ({
          ...prev,
          messages: prev.messages.map((msg, index) => 
            index === prev.messages.length - 1
              ? { ...msg, content: streamedContent }
              : msg
          ),
        }));
        // Add a small delay to create a typing effect
        await new Promise(resolve => setTimeout(resolve, 20));
      }

      setChatState(prev => ({
        ...prev,
        isLoading: false,
      }));
    } catch (error) {
      console.error('Error:', error);
      setChatState(prev => ({
        ...prev,
        messages: [
          ...prev.messages,
          {
            role: 'assistant',
            content: 'Sorry, I ran into an error. Could you try asking again?',
          },
        ],
        isLoading: false,
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white dark:from-slate-950 dark:to-slate-900 flex flex-col transition-colors duration-200">
      <header className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm shadow-sm sticky top-0 z-10 transition-colors duration-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="text-emerald-600 dark:text-emerald-400" size={24} />
              <h1 className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-blue-600 dark:from-emerald-400 dark:to-blue-400 text-transparent bg-clip-text">
                Health Assistant
              </h1>
            </div>
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="text-emerald-400" size={24} />
              ) : (
                <Moon className="text-emerald-600" size={24} />
              )}
            </button>
          </div>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Your AI-powered health and wellness companion</p>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto bg-white dark:bg-slate-900 shadow-lg dark:shadow-emerald-500/5 my-8 rounded-lg overflow-hidden flex flex-col transition-colors duration-200">
        <div className="flex-1 overflow-y-auto">
          {chatState.messages.length === 0 ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <div className="mb-4">
                <Heart className="w-16 h-16 mx-auto text-emerald-500 dark:text-emerald-400" />
              </div>
              <p className="mb-2 text-lg">👋 Hello! I'm your health assistant.</p>
              <p>Ask me anything about health, fitness, nutrition, or medical advice!</p>
            </div>
          ) : (
            chatState.messages.map((message, index) => (
              <ChatMessage key={index} message={message} />
            ))
          )}
          {chatState.isLoading && (
            <div className="p-4 text-gray-500 dark:text-gray-400 flex items-center gap-2">
              <div className="animate-spin rounded-full h-4 w-4 border-2 border-emerald-500 border-t-transparent"></div>
              Thinking...
            </div>
          )}
        </div>
        
        <ChatInput
          onSend={handleSendMessage}
          disabled={chatState.isLoading}
        />
      </main>
    </div>
  );
}

export default App;