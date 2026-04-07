import React, { useState, useRef } from 'react';
import { Send, X, Loader2, Plus, Mic, Sparkles, Map, TrendingUp, Droplets, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { addMessage, setLoading, attachImage } from './assistantSlice';
import { generateAIResponse, delay } from '../../services/mockData';
import type { ChatMessage } from '../../types';

interface SuggestionCard {
  title: string;
  desc: string;
  query: string;
  icon: React.ReactNode;
  color: string;
}

const suggestionCards: SuggestionCard[] = [
  {
    title: 'Soil Moisture',
    desc: 'Why is my field moisture low today?',
    query: 'Can you analyze my current soil moisture readings and check if they are optimal?',
    icon: <Droplets size={20} />,
    color: 'bg-blue-50 text-blue-600 border-blue-100'
  },
  {
    title: 'Crop Advisory',
    desc: 'Explain today\'s pest and health advisory.',
    query: 'Explain the latest agricultural advisory for my current crop cycle.',
    icon: <Info size={20} />,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-100'
  },
  {
    title: 'Irrigation Plan',
    desc: 'Should I irrigate based on the forecast?',
    query: 'Give me a recommended irrigation schedule based on today\'s weather and soil data.',
    icon: <Map size={20} />,
    color: 'bg-amber-50 text-amber-600 border-amber-100'
  },
  {
    title: 'Market Trends',
    desc: 'Check daily rates and market forecast.',
    query: 'What are the current market prices and 7-day price trends for my crop?',
    icon: <TrendingUp size={20} />,
    color: 'bg-purple-50 text-purple-600 border-purple-100'
  }
];

export const AssistantPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { messages, loading } = useAppSelector((state) => state.assistant);
  const { user } = useAppSelector((state: any) => state.auth);
  const { isSidebarCollapsed } = useAppSelector((state) => state.ui);

  const [inputMessage, setInputMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  React.useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        dispatch(attachImage(file));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview(null);
    dispatch(attachImage(null));
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !imagePreview) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: inputMessage,
      imageUrl: imagePreview || undefined,
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(userMessage));
    setInputMessage('');
    setImagePreview(null);
    dispatch(attachImage(null));

    dispatch(setLoading(true));
    await delay(1200);

    const aiResponse: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      sender: 'ai',
      text: generateAIResponse(userMessage.text || ''),
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(aiResponse));
    dispatch(setLoading(false));
  };

  const handleSuggestedQuery = (query: string) => {
    setInputMessage(query);
  };

  const firstName = user?.name ? user.name.split(' ')[0] : 'Farmer';

  return (
    <div className="flex flex-col min-h-[calc(100vh-8rem)] relative pb-32">
      {/* Background Glows (Gemini Style) - Higher Z Index but behind content */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-purple-200/40 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-emerald-200/40 blur-[120px] rounded-full animate-pulse" />
      </div>

      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 flex-1 flex flex-col relative z-10">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="greeting"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex-1 flex flex-col justify-center py-12"
            >
              <div className="text-center sm:text-left mb-16">
                <h1 className="text-5xl sm:text-7xl font-bold tracking-tight mb-4">
                  <span className="bg-gradient-to-r from-indigo-500 via-purple-500 to-rose-500 bg-clip-text text-transparent">
                    Hello, {firstName}
                  </span>
                </h1>
                <p className="text-2xl sm:text-4xl font-medium text-slate-400 leading-tight">
                  How can I help you today?
                </p>
              </div>

              {/* Suggestion Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl">
                {suggestionCards.map((card, idx) => (
                  <motion.button
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 + idx * 0.05 }}
                    onClick={() => handleSuggestedQuery(card.query)}
                    className="p-5 text-left bg-white/60 backdrop-blur-sm border border-slate-200 shadow-sm hover:shadow-md rounded-2xl transition-all group flex flex-col h-full"
                  >
                    <div className={`p-2.5 rounded-xl border mb-4 w-fit ${card.color} group-hover:scale-110 transition-transform`}>
                      {card.icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-bold text-slate-900 text-sm mb-1">{card.title}</p>
                      <p className="text-[12px] text-slate-500 font-medium leading-relaxed">{card.desc}</p>
                    </div>
                    <Plus size={16} className="mt-4 text-slate-300 ml-auto group-hover:text-slate-800 transition-colors" />
                  </motion.button>
                ))}
              </div>
            </motion.div>
          ) : (
            <div className="pt-8 space-y-12 pb-12">
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-4 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'ai' && (
                    <div className="h-10 w-10 flex-shrink-0 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                      <Sparkles className="h-5 w-5 text-indigo-500" />
                    </div>
                  )}
                  <div className={`max-w-[85%] sm:max-w-[70%] ${message.sender === 'user' ? 'text-right' : 'text-left'}`}>
                    <div className={`px-5 py-3.5 rounded-[2rem] inline-block ${message.sender === 'user' 
                      ? 'bg-slate-100 text-slate-800 rounded-tr-sm' 
                      : 'bg-white/40 backdrop-blur-sm border border-slate-200 text-slate-800 rounded-tl-sm'
                    }`}>
                      {message.imageUrl && (
                        <img
                          src={message.imageUrl}
                          alt="Uploaded"
                          className="rounded-2xl mb-3 max-h-64 sm:max-h-80 w-full object-cover shadow-sm border border-black/5 home-card-img"
                        />
                      )}
                      <p className="text-[15px] sm:text-16px leading-relaxed whitespace-pre-wrap">
                        {message.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
              {loading && (
                <div className="flex gap-4 items-start">
                  <div className="h-10 w-10 flex-shrink-0 bg-white border border-slate-200 rounded-full flex items-center justify-center shadow-sm">
                    <Sparkles className="h-5 w-5 text-indigo-500" />
                  </div>
                  <div className="bg-white/40 backdrop-blur-sm border border-slate-100 shadow-sm rounded-[2rem] rounded-tl-sm px-6 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-indigo-500" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-1" />
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Floating Pill Input Bar - Side-aware */}
      <div className={`fixed bottom-0 right-0 bg-gradient-to-t from-white via-white/80 to-transparent pt-10 pb-8 px-4 z-40 transition-all duration-300 ${isSidebarCollapsed ? 'left-20' : 'left-64'}`}>
        <div className="max-w-4xl mx-auto">
          {imagePreview && (
            <div className="mb-4 relative inline-block animate-in slide-in-from-bottom-2 duration-300">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-28 w-28 object-cover rounded-2xl border-4 border-white shadow-xl"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-3 -right-3 p-1.5 bg-slate-900 text-white rounded-full hover:bg-rose-500 shadow-md transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="relative group">
            <div className={`flex items-center gap-2 bg-[#f0f4f9] border border-transparent shadow-sm rounded-full p-2 pl-4 transition-all focus-within:bg-white focus-within:shadow-xl focus-within:border-slate-300 min-h-[64px]`}>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-full transition-all"
                title="Upload image"
              >
                <Plus size={24} />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageSelect}
                className="hidden"
              />
              
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                placeholder="Enter a prompt here"
                className="flex-1 bg-transparent border-none focus:ring-0 outline-none text-[16px] text-slate-800 placeholder:text-slate-500 ml-2"
              />

              <div className="flex items-center gap-1.5 pr-2">
                <button className="p-2.5 text-slate-500 hover:text-indigo-600 hover:bg-white rounded-full transition-all hidden sm:flex">
                  <Mic size={24} />
                </button>
                <button
                  onClick={handleSendMessage}
                  disabled={!inputMessage.trim() && !imagePreview}
                  className="p-3 bg-indigo-600 text-white rounded-full shadow-lg hover:bg-indigo-700 disabled:opacity-30 disabled:shadow-none transition-all"
                >
                  <Send size={20} className={loading ? 'animate-pulse' : ''} />
                </button>
              </div>
            </div>
            
            <p className="text-[11px] text-slate-400 text-center mt-3 font-medium">
              FMS Pro Assistant can make mistakes. Check important information.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
