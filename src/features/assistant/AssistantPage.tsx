import React, { useState, useRef } from 'react';
import { Send, Image, X, Loader2 } from 'lucide-react';
import { useAppSelector, useAppDispatch } from '../../hooks';
import { addMessage, setLoading, attachImage } from './assistantSlice';
import { Card, Badge, Button } from '../../components/ui';
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
    <div className="h-[calc(100vh-12rem)] flex flex-col">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Smart Agriculture Assistant</h1>
        <p className="text-sm text-gray-600 mt-1">
          Ask questions about your crops, soil, weather, and more
        </p>
      </div>
      
      {/* Context Bar */}
      {selectedPlot && (
        <Card className="mb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-gray-600">Plot</p>
                <p className="font-semibold text-gray-900">{selectedPlot.plotName}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Crop</p>
                <p className="font-semibold text-gray-900">{selectedPlot.cropType}</p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Soil Moisture</p>
                <p className="font-semibold text-gray-900">
                  {currentSensors?.soilMoisture?.value || '--'}%
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Temperature</p>
                <p className="font-semibold text-gray-900">
                  {currentSensors?.temperature?.value || '--'}°C
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}
      
      {/* Chat Area */}
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full">
              <p className="text-gray-600 mb-6 text-center">
                Start a conversation with your AI assistant
              </p>
              <div className="flex flex-wrap gap-2 justify-center">
                {suggestedQueries.map((query, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => handleSuggestedQuery(query)}
                  >
                    {query}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg px-4 py-3 ${
                      message.sender === 'user'
                        ? 'bg-primary-600 text-white'
                        : 'bg-gray-100 text-gray-900'
                    }`}
                  >
                    {message.imageUrl && (
                      <img
                        src={message.imageUrl}
                        alt="Uploaded"
                        className="rounded-lg mb-2 max-h-48 w-full object-cover"
                      />
                    )}
                    {message.text && <p className="text-sm">{message.text}</p>}
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user' ? 'text-primary-200' : 'text-gray-500'
                      }`}
                    >
                      {new Date(message.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 rounded-lg px-4 py-3">
                    <Loader2 className="h-5 w-5 animate-spin text-gray-600" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
        
        {/* Image Preview */}
        {imagePreview && (
          <div className="px-4 pb-2">
            <div className="relative inline-block">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-20 w-20 object-cover rounded-lg border border-gray-300"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                aria-label="Remove image"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          </div>
        )}
        
        {/* Input Area */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
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
              placeholder="Ask a question..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            />
            <Button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() && !imagePreview}
              variant="primary"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};
