import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, Phone, MapPin, AlertCircle } from 'lucide-react';
import { aiAPI, hospitalsAPI } from '../../utils/api';

const UrgentHelp = ({ onNavigate, analysis }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [emergencyHospitals, setEmergencyHospitals] = useState([]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    // Initialize chat with context from analysis
    const welcomeMessage = {
      id: 'welcome',
      type: 'ai',
      content: analysis 
        ? `Hello! I understand you're experiencing symptoms related to ${analysis.predictedDisease}. I'm here to provide guidance and support. How can I help you right now?`
        : "Hello! I'm your urgent care assistant. I'm here to help you with immediate medical concerns. Please describe what you're experiencing.",
      timestamp: new Date()
    };
    setMessages([welcomeMessage]);
  }, [analysis]);

  useEffect(() => {
    // Load emergency hospitals
    loadEmergencyHospitals();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadEmergencyHospitals = async () => {
    try {
      const response = await hospitalsAPI.getHospitals({
        specialty: 'Emergency Medicine',
        limit: 3
      });
      if (response.success) {
        setEmergencyHospitals(response.data.hospitals);
      }
    } catch (error) {
      console.error('Failed to load emergency hospitals:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || loading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setLoading(true);

    try {
      const response = await aiAPI.chatWithAI(inputMessage, analysis?.id);
      if (response.success) {
        setMessages(prev => [...prev, response.data.message]);
      } else {
        throw new Error(response.message || 'Chat failed');
      }
    } catch (error) {
      const errorMessage = {
        id: Date.now().toString(),
        type: 'ai',
        content: "I apologize, but I'm having trouble processing your request right now. If this is a medical emergency, please call 911 or go to the nearest emergency room immediately.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleFindHospitals = () => {
    onNavigate('find-hospitals', { analysis });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Urgent Help Chat</h1>
        <p className="text-lg text-gray-600">
          Get immediate guidance from our AI medical assistant
        </p>
      </div>

      {/* Emergency Notice */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
        <div className="flex items-start space-x-3">
          <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-medium text-red-800 mb-1">Emergency Situations</p>
            <p className="text-red-700">
              If you're experiencing severe chest pain, difficulty breathing, loss of consciousness, 
              severe bleeding, or other life-threatening symptoms, call 911 immediately or go to the nearest emergency room.
            </p>
          </div>
        </div>
        <div className="mt-3 flex space-x-2">
          <button className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors">
            📞 Call 911
          </button>
          <button 
            onClick={handleFindHospitals}
            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            🏥 Find Emergency Rooms
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Chat Messages */}
        <div className="h-96 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex space-x-2 max-w-3xl ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
                <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                  message.type === 'user' ? 'bg-blue-600' : 'bg-green-100'
                }`}>
                  {message.type === 'user' ? (
                    <User className="h-4 w-4 text-white" />
                  ) : (
                    <Bot className="h-4 w-4 text-green-600" />
                  )}
                </div>
                <div className={`rounded-lg p-3 ${
                  message.type === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-900'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className={`text-xs mt-1 ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </p>
                </div>
              </div>
            </div>
          ))}
          
          {loading && (
            <div className="flex justify-start">
              <div className="flex space-x-2 max-w-3xl">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                  <Bot className="h-4 w-4 text-green-600" />
                </div>
                <div className="bg-gray-100 rounded-lg p-3">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <div className="flex space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                rows={2}
              />
            </div>
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || loading}
              className={`px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center ${
                !inputMessage.trim() || loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Nearby Emergency Hospitals */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Nearby Emergency Hospitals</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {emergencyHospitals.map((hospital) => (
            <div key={hospital._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
              <h3 className="font-semibold text-gray-900 mb-2">{hospital.name}</h3>
              <div className="flex items-start space-x-2 mb-2">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-gray-600">{hospital.address}</p>
              </div>
              <div className="flex items-center space-x-2 mb-3">
                <Phone className="h-4 w-4 text-gray-400" />
                <span className="text-sm text-gray-600">{hospital.phone}</span>
              </div>
              <button
                onClick={() => onNavigate('book-appointment', { hospital, analysis })}
                className="w-full px-3 py-2 bg-red-600 text-white text-sm font-medium rounded hover:bg-red-700 transition-colors"
              >
                Get Directions
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UrgentHelp;