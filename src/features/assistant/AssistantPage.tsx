import React, { useState, useRef } from 'react';
import { Send, Image, X, Loader2, Bot } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { addMessage, setLoading, attachImage } from './assistantSlice';
import { Button } from '../../components/ui';
import { generateAIResponse, delay } from '../../services/mockData';
import type { ChatMessage } from '../../types';

const suggestedQueries = [
  'Why is soil moisture low?',
  'Should I irrigate today?',
  'Explain today\'s advisory',
  'What is the weather forecast?',
];

export const AssistantPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const { messages, loading } = useAppSelector((state) => state.assistant);
  const { plots, selectedPlotId } = useAppSelector((state) => state.plots);
  const { sensorData } = useAppSelector((state) => state.sensors);

  const [inputMessage, setInputMessage] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const selectedPlot = plots.find((p) => p.plotId === selectedPlotId);
  const currentSensors = selectedPlotId ? sensorData[selectedPlotId] : null;

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

    // Create user message
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

    // Simulate AI response
    dispatch(setLoading(true));
    await delay(800);

    const aiResponse: ChatMessage = {
      id: `msg-${Date.now()}-ai`,
      sender: 'ai',
      text: generateAIResponse(inputMessage),
      timestamp: new Date().toISOString(),
    };

    dispatch(addMessage(aiResponse));
    dispatch(setLoading(false));
  };

  const handleSuggestedQuery = (query: string) => {
    setInputMessage(query);
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex flex-col max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Smart AI Assistant</h1>
        <p className="text-sm font-medium text-slate-500 mt-1">
          Instant agricultural intelligence and troubleshooting
        </p>
      </div>

      {/* Context Bar */}
      {selectedPlot && (
        <div className="bg-white/70 backdrop-blur-md border border-gray shadow-sm rounded-2xl p-4 flex flex-wrap items-center gap-6">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Plot</p>
            <p className="font-bold tracking-tight text-slate-900">{selectedPlot.plotName}</p>
          </div>
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Crop</p>
            <p className="font-bold tracking-tight text-slate-900">{selectedPlot.cropType}</p>
          </div>
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Soil Moisture</p>
            <p className="font-bold tracking-tight text-slate-900">
              {currentSensors?.soilMoisture?.value || '--'}%
            </p>
          </div>
          <div className="w-px h-8 bg-slate-200 hidden sm:block"></div>
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-0.5">Temperature</p>
            <p className="font-bold tracking-tight text-slate-900">
              {currentSensors?.temperature?.value || '--'}°C
            </p>
          </div>
        </div>
      )}

      {/* Chat Area */}
      <div className="flex-1 flex flex-col overflow-hidden bg-white/40 backdrop-blur-md border border-gray shadow-lg rounded-3xl relative">
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="h-16 w-16 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-sm">
                <Bot className="h-8 w-8 text-emerald-600" />
              </div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 mb-2">How can I help you today?</h2>
              <p className="text-slate-500 font-medium mb-8 text-center max-w-sm">
                Ask me about optimal irrigation schedules, disease detection, or market price forecasts.
              </p>
              <div className="flex flex-wrap gap-3 justify-center max-w-2xl">
                {suggestedQueries.map((query, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestedQuery(query)}
                    className="px-4 py-2 bg-emerald-50 text-emerald-700 text-sm font-semibold rounded-full border border-transparent hover:border-emerald-300 hover:shadow-sm transition-all duration-200"
                  >
                    {query}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                >
                  {message.sender === 'ai' && (
                    <div className="h-8 w-8 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1 shadow-sm flex-shrink-0">
                      <Bot className="h-4 w-4 text-emerald-600" />
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-5 py-3.5 shadow-sm ${message.sender === 'user'
                      ? 'bg-emerald-600 text-white rounded-tr-sm'
                      : 'bg-white text-slate-800 border border-slate-100 rounded-tl-sm'
                      }`}
                  >
                    {message.imageUrl && (
                      <img
                        src={message.imageUrl}
                        alt="Uploaded"
                        className="rounded-xl mb-3 max-h-48 w-full object-cover shadow-sm border border-black/5"
                      />
                    )}
                    {message.text && <p className="text-[15px] leading-relaxed font-medium">{message.text}</p>}
                    <p
                      className={`text-[10px] uppercase tracking-wider font-bold mt-2 ${message.sender === 'user' ? 'text-emerald-200' : 'text-slate-400'
                        }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="h-8 w-8 bg-emerald-50 border border-emerald-100 rounded-full flex items-center justify-center mr-3 mt-1 shadow-sm flex-shrink-0">
                    <Bot className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-tl-sm px-5 py-4">
                    <Loader2 className="h-5 w-5 animate-spin text-emerald-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input Area */}
        <div className="p-6 bg-white/20 backdrop-blur-md rounded-b-3xl border-t border-gray">
          {imagePreview && (
            <div className="mb-4 relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-24 w-24 object-cover rounded-xl border-2 border-gray shadow-md"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-3 -right-3 p-1.5 bg-rose-500 text-white rounded-full hover:bg-rose-600 shadow-sm transition-colors"
                aria-label="Remove image"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          <div className="flex items-end gap-3 bg-white/80 backdrop-blur-xl border-2 border-gray shadow-md rounded-2xl p-2 transition-all focus-within:ring-2 focus-within:ring-emerald-500/20 focus-within:border-emerald-300">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
              aria-label="Attach image"
            >
              <Image className="h-5 w-5" />
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
              placeholder="Message Smart AI..."
              className="flex-1 px-2 py-3 bg-transparent border-none focus:ring-0 outline-none text-slate-800 placeholder:text-slate-400 font-medium"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() && !imagePreview}
              variant="primary"
              className="rounded-xl px-4 py-3 bg-emerald-600 hover:bg-emerald-700 shadow-sm disabled:opacity-50 disabled:bg-slate-300"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
